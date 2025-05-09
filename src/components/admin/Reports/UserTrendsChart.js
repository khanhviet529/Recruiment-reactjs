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
  Divider,
  Button,
  Pagination
} from 'antd';
import { Chart } from 'react-chartjs-2';
import { RiseOutlined, DownloadOutlined } from '@ant-design/icons';
import { setChartRef } from './ChartExporter';

const { Title, Text, Paragraph } = Typography;

const UserTrendsChart = ({ 
  userChartData, 
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
            const growthRate = userChartData.growthRates?.users?.[label] || 0;
            
            if (growthRate !== 0) {
              return `Tăng trưởng: ${growthRate >= 0 ? '+' : ''}${growthRate}%`;
            }
            return '';
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

  // Pagination for growth metrics
  const [currentPageUsers, setCurrentPageUsers] = React.useState(1);
  const [currentPageEmployers, setCurrentPageEmployers] = React.useState(1);
  const pageSize = 5;
  
  const paginatedUserGrowthRates = () => {
    const rates = userChartData.growthRates?.users;
    if (!rates) return [];
    
    const entries = Object.entries(rates);
    const startIndex = (currentPageUsers - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return entries.slice(startIndex, endIndex);
  };
  
  const paginatedEmployerGrowthRates = () => {
    const rates = userChartData.growthRates?.employers;
    if (!rates) return [];
    
    const entries = Object.entries(rates);
    const startIndex = (currentPageEmployers - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return entries.slice(startIndex, endIndex);
  };
  
  // Tách ra thành hai biến riêng để tránh đồng bộ không mong muốn
  const userGrowthRatesData = paginatedUserGrowthRates();
  const employerGrowthRatesData = paginatedEmployerGrowthRates();
  
  const totalUsersItems = userChartData.growthRates?.users 
    ? Object.keys(userChartData.growthRates.users).length 
    : 0;
    
  const totalEmployersItems = userChartData.growthRates?.employers 
    ? Object.keys(userChartData.growthRates.employers).length 
    : 0;
    
  // Xử lý riêng cho từng phân trang
  const handleUserPageChange = (page) => {
    setCurrentPageUsers(page);
  };
  
  const handleEmployerPageChange = (page) => {
    setCurrentPageEmployers(page);
  };

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
    <div className="user-trends-chart">
      <div className="chart-header d-flex justify-content-between align-items-center mb-2">
        <Title level={4}>Xu hướng đăng ký người dùng</Title>
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
      
      {userChartData.labels.length > 0 ? (
        <>
          <div style={{ height: 300 }} ref={chartContainerRef}>
            <Chart type="line" data={userChartData} options={chartOptions} />
          </div>
          
          {/* Context annotations and insights */}
          <div className="chart-insights mt-3">
            {userChartData.annotations && userChartData.annotations.length > 0 && (
              <div className="chart-annotations mb-2">
                <Text strong>Điểm đáng chú ý:</Text>
                <div className="annotation-list" style={{ maxHeight: 150, overflowY: 'auto', padding: '8px 0' }}>
                  {userChartData.annotations.map((annotation, idx) => (
                    <div key={idx} className="annotation-item" style={{ marginBottom: 8 }}>
                      <Tag color={annotation.isIncrease ? 'green' : 'volcano'}>
                        {annotation.period}
                      </Tag>
                      {annotation.isFirst ? (
                        <Text>Ghi nhận dữ liệu đầu tiên với {annotation.value} người dùng</Text>
                      ) : (
                        <Text>
                          {annotation.isIncrease ? 'Tăng' : 'Giảm'} <Text strong>{Math.abs(annotation.changePercent)}%</Text> so với kỳ trước
                          ({annotation.value} người dùng)
                        </Text>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          
            <Row gutter={16} className="growth-metrics">
              <Col span={12}>
                <Card size="small" title="Tỷ lệ tăng trưởng ứng viên theo kỳ">
                  {userGrowthRatesData.length > 0 ? (
                    <>
                      <ul className="growth-list" style={{ maxHeight: 150, overflowY: 'auto', padding: 0 }}>
                        {userGrowthRatesData.map(([period, rate], idx) => (
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
                      {totalUsersItems > pageSize && (
                        <Pagination 
                          simple 
                          current={currentPageUsers} 
                          total={totalUsersItems} 
                          pageSize={pageSize} 
                          onChange={handleUserPageChange}
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
                <Card size="small" title="Tỷ lệ tăng trưởng nhà tuyển dụng theo kỳ">
                  {employerGrowthRatesData.length > 0 ? (
                    <>
                      <ul className="growth-list" style={{ maxHeight: 150, overflowY: 'auto', padding: 0 }}>
                        {employerGrowthRatesData.map(([period, rate], idx) => (
                          <li key={idx} style={{ marginBottom: 5, listStyleType: 'none', padding: '3px 0' }}>
                            <Text>{period}: </Text>
                            <Text type={rate >= 0 ? 'success' : 'danger'}>
                              {rate >= 0 ? '+' : ''}{rate}%
                              {Math.abs(rate) > 15 && (
                                <Tooltip title={rate > 0 ? 'Tăng trưởng đáng kể' : 'Sụt giảm đáng kể'}>
                                  <Tag color={rate > 15 ? 'green' : rate < -15 ? 'red' : 'orange'} style={{marginLeft: 8}}>
                                    {rate > 15 ? 'Tăng mạnh' : rate < -15 ? 'Giảm mạnh' : 'Đáng chú ý'}
                                  </Tag>
                                </Tooltip>
                              )}
                            </Text>
                          </li>
                        ))}
                      </ul>
                      {totalEmployersItems > pageSize && (
                        <Pagination 
                          simple 
                          current={currentPageEmployers} 
                          total={totalEmployersItems} 
                          pageSize={pageSize} 
                          onChange={handleEmployerPageChange}
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
                message="Phân tích người dùng" 
                description={
                  <>
                    <Paragraph>
                      <Text strong>Tổng số người dùng: </Text>
                      <Text>{statsData.users.total}</Text>
                      <Text> (Ứng viên: {statsData.users.candidates}, Nhà tuyển dụng: {statsData.users.employers})</Text>
                    </Paragraph>
                    
                    <Paragraph>
                      <Text strong>Tỷ lệ tăng trưởng 30 ngày: </Text>
                      <Text type={statsData.users.growth >= 0 ? 'success' : 'danger'}>
                        {statsData.users.growth >= 0 ? '+' : ''}{statsData.users.growth}%
                      </Text>
                    </Paragraph>
                    
                    <Paragraph>
                      <Text strong>Đánh giá: </Text>
                      {statsData.users.growth > 15 ? (
                        <Text type="success">Tăng trưởng mạnh mẽ.</Text>
                      ) : statsData.users.growth > 5 ? (
                        <Text type="success">Tăng trưởng ổn định.</Text>
                      ) : statsData.users.growth > 0 ? (
                        <Text>Tăng trưởng nhẹ, cần thêm chiến lược thu hút người dùng.</Text>
                      ) : (
                        <Text type="danger">Cần kiểm tra lại chiến lược thu hút người dùng.</Text>
                      )}
                    </Paragraph>
                  </>
                }
              />
            </div>
          </div>
        </>
      ) : (
        <Empty description="Không có dữ liệu người dùng" />
      )}
    </div>
  );
};

export default UserTrendsChart; 