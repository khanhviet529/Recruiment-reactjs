import React from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Divider, Tag, Progress } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined,
  RiseOutlined,
  TrophyOutlined,
  StarOutlined,
  BankOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;

const ReportPreview = ({ 
  statsData, 
  applicationStats, 
  topEmployers, 
  topJobs, 
  timeToFillData,
  conversionData 
}) => {
  // Chuẩn bị dữ liệu cho bảng trạng thái đơn ứng tuyển
  const getApplicationStatsData = () => {
    if (!applicationStats?.labels || !applicationStats?.datasets?.[0]?.data) {
      return [];
    }
    
    const totalApps = applicationStats.datasets[0].data.reduce((sum, val) => sum + (val || 0), 0) || 1;
    
    return applicationStats.labels.map((label, idx) => {
      const count = applicationStats.datasets[0].data[idx] || 0;
      const percentage = ((count / totalApps) * 100).toFixed(1);
      
      return {
        key: idx,
        status: label,
        count: count,
        percentage: parseFloat(percentage)
      };
    });
  };

  const applicationStatsColumns = [
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div 
            style={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              backgroundColor: getStatusColor(record.key),
              marginRight: 8 
            }}
          />
          {text}
        </div>
      )
    },
    {
      title: 'Số lượng',
      dataIndex: 'count',
      key: 'count',
      align: 'center',
      render: (count) => <Text strong>{count}</Text>
    },
    {
      title: 'Tỷ lệ',
      dataIndex: 'percentage',
      key: 'percentage',
      align: 'center',
      render: (percentage) => (
        <div>
          <Text strong>{percentage}%</Text>
          <Progress 
            percent={percentage} 
            size="small" 
            showInfo={false}
            strokeColor={getStatusColor(Math.floor(percentage / 20))}
          />
        </div>
      )
    }
  ];

  const employerColumns = [
    {
      title: 'Xếp hạng',
      key: 'rank',
      width: 80,
      align: 'center',
      render: (_, record, index) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {index < 3 ? (
            <TrophyOutlined style={{ 
              color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
              fontSize: 16 
            }} />
          ) : (
            <Text strong>{index + 1}</Text>
          )}
        </div>
      )
    },
    {
      title: 'Tên công ty',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <Text strong>{name}</Text>
    },
    {
      title: 'Số tin đăng',
      dataIndex: 'jobs',
      key: 'jobs',
      align: 'center',
      render: (jobs) => <Tag color="blue">{jobs}</Tag>
    },
    {
      title: 'Đơn ứng tuyển',
      dataIndex: 'applications',
      key: 'applications',
      align: 'center',
      render: (applications) => <Tag color="green">{applications}</Tag>
    }
  ];

  const jobColumns = [
    {
      title: 'Xếp hạng',
      key: 'rank',
      width: 80,
      align: 'center',
      render: (_, record, index) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {index < 3 ? (
            <StarOutlined style={{ 
              color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
              fontSize: 16 
            }} />
          ) : (
            <Text strong>{index + 1}</Text>
          )}
        </div>
      )
    },
    {
      title: 'Tiêu đề công việc',
      dataIndex: 'title',
      key: 'title',
      render: (title) => <Text strong>{title}</Text>
    },
    {
      title: 'Công ty',
      dataIndex: 'company',
      key: 'company'
    },
    {
      title: 'Đơn ứng tuyển',
      dataIndex: 'applications',
      key: 'applications',
      align: 'center',
      render: (applications) => <Tag color="orange">{applications}</Tag>
    }
  ];

  const getStatusColor = (index) => {
    const colors = ['#4f46e5', '#ffffff', '#ffffff', '#e11d48', '#6366f1'];
    return colors[index % colors.length];
  };

  const getGrowthIcon = (growth) => {
    return growth > 0 ? <RiseOutlined style={{ color: '#ffffff' }} /> : null;
  };

  const overviewStats = [
    {
      title: 'Tong nguoi dung',
      value: statsData?.users?.total || 0,
      icon: <UserOutlined />,
      color: '#4f46e5',
      growth: statsData?.users?.growth || 0
    },
    {
      title: 'Nha tuyen dung',
      value: statsData?.users?.employers || 0,
      icon: <BankOutlined />,
      color: '#ffffff',
      growth: statsData?.employers?.growth || 0
    },
    {
      title: 'Tin tuyen dung',
      value: statsData.jobs?.total || 0,
      icon: <FileTextOutlined />,
      color: '#059669',
      growth: statsData.jobs?.growth || 0
    },
    {
      title: 'Don ung tuyen',
      value: statsData.jobs?.applications || 0,
      icon: <CheckCircleOutlined />,
      color: '#fa541c',
      growth: statsData.jobs?.growth || 0
    }
  ];

  // Tạo gợi ý cải thiện
  const improvementSuggestions = () => {
    const suggestions = [];
    const avgApplicationsPerJob = statsData?.jobs?.total > 0 ? 
      (statsData.jobs.applications / statsData.jobs.total).toFixed(1) : 0;

    if ((statsData?.users?.growth || 0) < 5) {
      suggestions.push('• Trien khai chien dich quang ba he thong');
      suggestions.push('• Phan tich nguyen nhan tang truong cham');
    }

    if (avgApplicationsPerJob < 5) {
      suggestions.push('• Tang cuong kiem duyet chat luong tin dang');
      suggestions.push('• Huong dan nha tuyen dung toi uu tin dang');
    }

    if (timeToFillData?.average > 30) {
      suggestions.push('• Toi uu hoa giao dien va trai nghiem nguoi dung');
      suggestions.push('• Cai thien thuat toan goi y viec lam');
    }

    suggestions.push('• Thiet lap he thong canh bao va giam sat');
    suggestions.push('• Phat trien tinh nang moi dua tren phan hoi');
    suggestions.push('• Tang cuong bao mat va hieu suat he thong');

    return suggestions;
  };

  return (
    <div className="report-preview" style={{ padding: '24px', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <Card style={{ marginBottom: 24, textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Title level={2} style={{ color: 'white', margin: 0 }}>
          BÁO CÁO TUYỂN DỤNG
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
          Ngày báo cáo: {moment().format('DD/MM/YYYY HH:mm')}
        </Text>
      </Card>

      {/* Thống kê tổng quan */}
      <Card title="📊 TỔNG QUAN THỐNG KÊ" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          {overviewStats.map((stat, index) => (
            <Col span={6} key={index}>
              <Card hoverable style={{ textAlign: 'center', border: `2px solid ${stat.color}` }}>
                {stat.icon}
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  suffix={getGrowthIcon(stat.growth)}
                />
                <Text type="secondary">
                  {stat.growth > 0 ? `Tăng trưởng: ${stat.growth}%` : ''}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Trạng thái đơn ứng tuyển */}
      <Card title="📈 TRẠNG THÁI ĐƠN ỨNG TUYỂN" style={{ marginBottom: 24 }}>
        <Table
          columns={applicationStatsColumns}
          dataSource={getApplicationStatsData()}
          pagination={false}
          size="middle"
        />
      </Card>

      <Row gutter={16}>
        {/* Nhà tuyển dụng hàng đầu */}
        <Col span={12}>
          <Card title="🏆 NHÀ TUYỂN DỤNG HÀNG ĐẦU" style={{ marginBottom: 24 }}>
            <Table
              columns={employerColumns}
              dataSource={topEmployers?.slice(0, 5) || []}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>

        {/* Tin tuyển dụng hàng đầu */}
        <Col span={12}>
          <Card title="⭐ TIN TUYỂN DỤNG HÀNG ĐẦU" style={{ marginBottom: 24 }}>
            <Table
              columns={jobColumns}
              dataSource={topJobs?.slice(0, 5) || []}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>

      {/* Phân tích hiệu suất */}
      <Card title="💡 PHÂN TÍCH & GỢI Ý" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Title level={4}>Hiệu suất tuyển dụng</Title>
            <div style={{ marginBottom: 16 }}>
              {improvementSuggestions().map((suggestion, index) => (
                <Tag key={index} color="success">
                  {suggestion}
                </Tag>
              ))}
            </div>
          </Col>

          <Col span={12}>
            <Title level={4}>Gợi ý cải thiện</Title>
            <div>
              {statsData.users?.growth < 5 && (
                <Paragraph>
                  <Text>• Tăng cường marketing để thu hút người dùng mới</Text>
                </Paragraph>
              )}
              
              {(() => {
                const avgApps = statsData.jobs?.total > 0 ? 
                  (statsData.jobs.applications / statsData.jobs.total) : 0;
                
                if (avgApps < 5) {
                  return (
                    <>
                      <Paragraph>
                        <Text>• Cải thiện mô tả công việc để hấp dẫn hơn</Text>
                      </Paragraph>
                      <Paragraph>
                        <Text>• Xem xét lại yêu cầu công việc có phù hợp</Text>
                      </Paragraph>
                    </>
                  );
                }
                return null;
              })()}

              {timeToFillData?.average > 30 && (
                <>
                  <Paragraph>
                    <Text>• Rút ngắn quy trình đánh giá hồ sơ</Text>
                  </Paragraph>
                  <Paragraph>
                    <Text>• Tăng tốc độ phản hồi với ứng viên</Text>
                  </Paragraph>
                </>
              )}

              {(statsData.users?.growth >= 5 && 
                (statsData.jobs?.total > 0 ? (statsData.jobs.applications / statsData.jobs.total) >= 5 : true) &&
                (!timeToFillData?.average || timeToFillData.average <= 30)) && (
                <Paragraph>
                  <Text strong style={{ color: '#059669' }}>
                    • Các chỉ số đang ở mức tốt, tiếp tục duy trì
                  </Text>
                </Paragraph>
              )}
            </div>
          </Col>
        </Row>
      </Card>

      {/* Footer */}
      <Card style={{ textAlign: 'center', backgroundColor: '#f0f2f5' }}>
        <Text type="secondary">
          Hệ thống quản lý tuyển dụng - Báo cáo được tạo tự động
        </Text>
      </Card>
    </div>
  );
};

export default ReportPreview; 