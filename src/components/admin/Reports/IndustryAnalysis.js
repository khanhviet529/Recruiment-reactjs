import React from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Alert,
  Empty,
  Table,
  Tag,
  Collapse,
  Spin,
  Divider
} from 'antd';
import { Chart } from 'react-chartjs-2';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const IndustryAnalysis = ({ 
  industryDistribution,
  timeToFillData,
  applicationStats,
  loading
}) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Spin tip="Đang tải dữ liệu phân tích ngành..." />
      </div>
    );
  }

  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            
            // Find change rate for this industry if available
            const changeRate = industryDistribution.yearOverYearChange?.[context.label] || 0;
            let result = `${label}: ${value}`;
            
            if (changeRate !== 0) {
              result += ` (${changeRate >= 0 ? '+' : ''}${changeRate}% YoY)`;
            }
            
            return result;
          }
        }
      }
    }
  };

  // Get top industries sorted by counts
  const getTopIndustries = () => {
    if (!industryDistribution.labels || !industryDistribution.datasets) {
      return [];
    }
    
    return industryDistribution.labels
      .map((label, index) => ({
        label,
        value: industryDistribution.datasets[0].data[index],
        change: industryDistribution.yearOverYearChange?.[label] || 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };
  
  const topIndustries = getTopIndustries();

  // Chart options for industry distribution
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: false
      }
    }
  };
  
  // Column definitions for the time-to-fill table
  const timeToFillColumns = [
    {
      title: 'Ngành nghề',
      dataIndex: 'industry',
      key: 'industry',
    },
    {
      title: 'Số ngày trung bình',
      dataIndex: 'averageDays',
      key: 'averageDays',
      sorter: (a, b) => a.averageDays - b.averageDays,
      render: (days) => (
        <span>
          {days} ngày
          {days <= 15 && <Tag color="green" style={{marginLeft: 8}}>Nhanh</Tag>}
          {days > 30 && <Tag color="orange" style={{marginLeft: 8}}>Chậm</Tag>}
        </span>
      ),
    }
  ];

  return (
    <div className="industry-analysis">
      <Title level={4}>Phân tích theo ngành nghề</Title>
      
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Thời gian tuyển dụng theo ngành">
            {timeToFillData.byIndustry?.length > 0 ? (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Table 
                  columns={timeToFillColumns} 
                  dataSource={timeToFillData.byIndustry}
                  rowKey="industry"
                  pagination={false}
                  size="small"
                />
              </div>
            ) : (
              <Empty description="Không có dữ liệu thời gian tuyển dụng theo ngành" />
            )}
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="Phân bố đơn ứng tuyển theo trạng thái">
            {applicationStats.datasets[0].data.some(value => value > 0) ? (
              <div style={{ height: 250 }}>
                <Chart type="pie" data={applicationStats} options={pieChartOptions} />
              </div>
            ) : (
              <Empty description="Không có dữ liệu phân bố đơn ứng tuyển" />
            )}
          </Card>
        </Col>
      </Row>
      
      <Divider />
      
      <Row>
        <Col span={24}>
          <Card title="Đánh giá thị trường lao động">
            <div style={{ padding: '10px 0' }}>
              <Text strong>Thời gian tuyển dụng trung bình: </Text>
              <Text>
                {timeToFillData.average} ngày
                {timeToFillData.average <= 20 && <Tag color="green" style={{marginLeft: 8}}>Hiệu quả</Tag>}
                {timeToFillData.average > 30 && <Tag color="orange" style={{marginLeft: 8}}>Cần cải thiện</Tag>}
              </Text>
            </div>
            
            <div style={{ padding: '10px 0' }}>
              <Text strong>Gợi ý: </Text>
              {timeToFillData.average <= 20 ? (
                <Text>Quy trình tuyển dụng hiện tại khá hiệu quả. Tiếp tục duy trì và tối ưu quy trình sàng lọc.</Text>
              ) : timeToFillData.average <= 30 ? (
                <Text>Thời gian tuyển dụng ở mức trung bình. Xem xét rút ngắn quy trình phê duyệt.</Text>
              ) : (
                <Text>Thời gian tuyển dụng khá dài. Cần xem xét lại quy trình đánh giá và sắp xếp lịch phỏng vấn.</Text>
              )}
            </div>
          </Card>
        </Col>
      </Row>
      
      <div className="industry-summary mt-3">
        <Alert
          type="info"
          message="Đánh giá theo ngành nghề"
          description={
            <Collapse ghost className="analysis-collapse">
              <Panel header="Chi tiết phân tích ngành nghề" key="1">
                <Paragraph>
                  <Text>Ngành có tỷ lệ tăng trưởng cao nhất: </Text>
                  {Object.entries(industryDistribution.yearOverYearChange || {})
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 1)
                    .map(([industry, change]) => (
                      <Text key={industry} strong>
                        {industry} ({change > 0 ? '+' : ''}{change}%)
                      </Text>
                    ))
                  }
                  
                  <br />
                  <Text>Ngành có thời gian tuyển dụng ngắn nhất: </Text>
                  {timeToFillData.byIndustry && timeToFillData.byIndustry
                    .sort((a, b) => a.averageDays - b.averageDays)
                    .slice(0, 1)
                    .map(item => (
                      <Text key={item.industry} strong>
                        {item.industry} ({item.averageDays} ngày)
                      </Text>
                    ))
                  }
                  
                  <br />
                  <Text>Nhận xét: </Text>
                  <Text>
                    {timeToFillData.average > 30 
                      ? "Thời gian tuyển dụng đang khá dài, cần cải thiện quy trình tuyển dụng để giảm thời gian hoàn thành." 
                      : "Thời gian tuyển dụng đang ở mức hợp lý, nhưng vẫn có thể tối ưu hóa thêm."}
                  </Text>
                  
                  <br />
                  <Text>Gợi ý cải thiện: </Text>
                  {timeToFillData.average > 30 ? (
                    <ul style={{ paddingLeft: 20 }}>
                      <li>Cải thiện quy trình sàng lọc ban đầu</li>
                      <li>Rút ngắn thời gian đánh giá hồ sơ</li>
                      <li>Tối ưu quy trình phỏng vấn</li>
                    </ul>
                  ) : (
                    <ul style={{ paddingLeft: 20 }}>
                      <li>Duy trì hiệu suất hiện tại</li>
                      <li>Tập trung vào chất lượng tuyển dụng</li>
                    </ul>
                  )}
                </Paragraph>
              </Panel>
            </Collapse>
          }
        />
      </div>
    </div>
  );
};

export default IndustryAnalysis; 