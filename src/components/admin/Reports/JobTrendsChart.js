import React, { useRef, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Radio, 
  Tag, 
  Tooltip, 
  Alert,
  Empty,
  Button,
  Pagination
} from 'antd';
import { Chart } from 'react-chartjs-2';
import { DownloadOutlined } from '@ant-design/icons';
import { setChartRef } from './ChartExporter';

const { Title, Text, Paragraph } = Typography;

const JobTrendsChart = ({ 
  jobChartData, 
  statsData, 
  timeFrame, 
  onTimeFrameChange,
  onExportChart,
  chartRef
}) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}`;
          },
          footer: function(tooltipItems) {
            const tooltipItem = tooltipItems[0];
            const label = tooltipItem.label;
            const growthRate = jobChartData.growthRates?.jobs?.[label] || 0;
            const conversionRate = jobChartData.conversionRates?.[label] || 0;
            
            let result = '';
            if (growthRate !== 0) {
              result += `Tăng trưởng: ${growthRate >= 0 ? '+' : ''}${growthRate}%\n`;
            }
            if (conversionRate !== 0) {
              result += `Tỷ lệ chuyển đổi: ${conversionRate}%`;
            }
            return result;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      },
      x: {
        ticks: {
          autoSkip: true,
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  // Pagination for metrics
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 5;
  
  const paginatedRates = (rates) => {
    if (!rates) return [];
    
    const entries = Object.entries(rates);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return entries.slice(startIndex, endIndex);
  };
  
  const jobGrowthRates = paginatedRates(jobChartData.growthRates?.jobs);
  const conversionRates = paginatedRates(jobChartData.conversionRates);
  
  const totalItems = jobChartData.growthRates?.jobs 
    ? Object.keys(jobChartData.growthRates.jobs).length 
    : 0;

  // Create a local ref to maintain chart node reference
  const chartContainerRef = useRef(null);
  
  // Update the chart ref when the component renders
  useEffect(() => {
    // If parent provided a ref, update it
    if (chartRef && chartContainerRef.current) {
      setChartRef(chartRef, chartContainerRef.current);
    }
  }, [chartRef, chartContainerRef.current]);

  return (
    <div className="job-trends-chart">
      <div className="chart-header d-flex justify-content-between align-items-center mb-2">
        <Title level={4}>Xu hướng đăng tin và ứng tuyển</Title>
        <div className="chart-actions">
          <Button 
            icon={<DownloadOutlined />} 
            size="small"
            onClick={onExportChart}
            style={{ marginRight: 8 }}
          >
            Xuất biểu đồ
          </Button>
        </div>
      </div>
      
      <div className="chart-toolbar mb-2">
        <Radio.Group value={timeFrame} onChange={onTimeFrameChange} buttonStyle="solid">
          <Radio.Button value="daily">Ngày</Radio.Button>
          <Radio.Button value="weekly">Tuần</Radio.Button>
          <Radio.Button value="monthly">Tháng</Radio.Button>
          <Radio.Button value="yearly">Năm</Radio.Button>
        </Radio.Group>
      </div>
      
      {jobChartData.labels.length > 0 ? (
        <>
          <div style={{ height: 300 }} ref={chartContainerRef}>
            <Chart type="line" data={jobChartData} options={chartOptions} />
          </div>
          
          {/* Context annotations and insights */}
          <div className="chart-insights mt-3">
            {jobChartData.annotations && jobChartData.annotations.length > 0 && (
              <div className="chart-annotations mb-2">
                <Text strong>Điểm đáng chú ý:</Text>
                <div className="annotation-list" style={{ maxHeight: 150, overflowY: 'auto', padding: '8px 0' }}>
                  {jobChartData.annotations.map((annotation, idx) => (
                    <div key={idx} className="annotation-item" style={{ marginBottom: 8 }}>
                      <Tag color={annotation.isIncrease ? 'green' : 'volcano'}>
                        {annotation.period}
                      </Tag>
                      {annotation.isFirst ? (
                        <Text>Lần đầu ghi nhận với {annotation.value} đơn ứng tuyển</Text>
                      ) : (
                        <Text>
                          {annotation.isIncrease ? 'Tăng' : 'Giảm'} <Text strong>{Math.abs(annotation.changePercent)}%</Text> so với kỳ trước
                          ({annotation.value} đơn)
                        </Text>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          
            <Row gutter={16} className="growth-metrics">
              <Col span={12}>
                <Card size="small" title="Tỷ lệ tăng trưởng tin tuyển dụng">
                  {jobGrowthRates.length > 0 ? (
                    <>
                      <ul className="growth-list" style={{ maxHeight: 150, overflowY: 'auto', padding: 0 }}>
                        {jobGrowthRates.map(([period, rate], idx) => (
                          <li key={idx} style={{ marginBottom: 5, listStyleType: 'none', padding: '3px 0' }}>
                            <Text>{period}: </Text>
                            <Text type={rate >= 0 ? 'success' : 'danger'}>
                              {rate >= 0 ? '+' : ''}{rate}%
                              {Math.abs(rate) > 10 && (
                                <Tooltip title={rate > 0 ? 'Tăng trưởng đáng kể' : 'Sụt giảm đáng kể'}>
                                  <Tag color={rate > 10 ? 'green' : rate < -10 ? 'red' : 'orange'} style={{marginLeft: 8}}>
                                    {rate > 10 ? 'Tăng mạnh' : rate < -10 ? 'Giảm mạnh' : 'Đáng chú ý'}
                                  </Tag>
                                </Tooltip>
                              )}
                            </Text>
                          </li>
                        ))}
                      </ul>
                      {totalItems > pageSize && (
                        <Pagination 
                          simple 
                          current={currentPage} 
                          total={totalItems} 
                          pageSize={pageSize} 
                          onChange={setCurrentPage}
                          size="small"
                          style={{ marginTop: 8 }}
                        />
                      )}
                    </>
                  ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không đủ dữ liệu" />
                  )}
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Tỷ lệ chuyển đổi (Ứng tuyển/Lượt xem)">
                  {conversionRates.length > 0 ? (
                    <>
                      <ul className="conversion-list" style={{ maxHeight: 150, overflowY: 'auto', padding: 0 }}>
                        {conversionRates.map(([period, rate], idx) => (
                          <li key={idx} style={{ marginBottom: 5, listStyleType: 'none', padding: '3px 0' }}>
                            <Text>{period}: </Text>
                            <Text type={parseFloat(rate) >= 5 ? 'success' : parseFloat(rate) >= 2 ? 'warning' : 'danger'}>
                              {rate}%
                            </Text>
                            {parseFloat(rate) >= 10 && <Tag color="green" style={{marginLeft: 8}}>Xuất sắc</Tag>}
                            {parseFloat(rate) < 2 && <Tag color="red" style={{marginLeft: 8}}>Cần cải thiện</Tag>}
                          </li>
                        ))}
                      </ul>
                      {Object.keys(jobChartData.conversionRates).length > pageSize && (
                        <Pagination 
                          simple 
                          current={currentPage} 
                          total={Object.keys(jobChartData.conversionRates).length} 
                          pageSize={pageSize} 
                          onChange={setCurrentPage}
                          size="small"
                          style={{ marginTop: 8 }}
                        />
                      )}
                    </>
                  ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không đủ dữ liệu" />
                  )}
                </Card>
              </Col>
            </Row>
            
            <div className="summary-insights mt-3">
              <Alert 
                type="info"
                message="Phân tích tuyển dụng" 
                description={
                  <>
                    <Paragraph>
                      <Text strong>Tổng số tin tuyển dụng: </Text>
                      <Text>{statsData.jobs.total}</Text>
                      <Text> (Đang hoạt động: {statsData.jobs.active}, Tỷ lệ hoạt động: 
                        {statsData.jobs.total > 0 ? (statsData.jobs.active / statsData.jobs.total * 100).toFixed(1) : 0}%)
                      </Text>
                    </Paragraph>
                    
                    <Paragraph>
                      <Text strong>Tỷ lệ tăng trưởng 30 ngày: </Text>
                      <Text type={statsData.jobs.growth >= 0 ? 'success' : 'danger'}>
                        {statsData.jobs.growth >= 0 ? '+' : ''}{statsData.jobs.growth}%
                      </Text>
                    </Paragraph>
                    
                    <Paragraph>
                      <Text strong>Trung bình ứng tuyển/tin: </Text>
                      <Text>
                        {statsData.jobs.total > 0 ? (statsData.jobs.applications / statsData.jobs.total).toFixed(1) : 0}
                      </Text>
                      {statsData.jobs.total > 0 && (statsData.jobs.applications / statsData.jobs.total) > 5 && (
                        <Tag color="green" style={{marginLeft: 8}}>Trên trung bình ngành</Tag>
                      )}
                    </Paragraph>
                    
                    <Paragraph>
                      <Text strong>Đánh giá: </Text>
                      {statsData.jobs.growth > 10 ? (
                        <Text type="success">Hoạt động tuyển dụng sôi nổi.</Text>
                      ) : statsData.jobs.growth > 0 ? (
                        <Text type="success">Hoạt động tuyển dụng ổn định.</Text>
                      ) : (
                        <Text type="warning">Cần thêm các chiến lược kích thích hoạt động đăng tin.</Text>
                      )}
                    </Paragraph>
                  </>
                }
              />
            </div>
          </div>
        </>
      ) : (
        <Empty description="Không có dữ liệu tin tuyển dụng" />
      )}
    </div>
  );
};

export default JobTrendsChart; 