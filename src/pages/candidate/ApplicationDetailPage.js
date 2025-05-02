import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  Card, 
  Row, 
  Col, 
  Descriptions, 
  Tag, 
  Timeline, 
  Button, 
  Divider, 
  Skeleton, 
  Alert,
  Typography,
  message,
  Modal
} from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LeftOutlined,
  EyeOutlined,
  ArrowRightOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  TeamOutlined,
  CalendarOutlined,
  FileDoneOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;

const ApplicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);

  useEffect(() => {
    fetchApplicationDetail();
  }, [id]);

  const fetchApplicationDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`http://localhost:5000/applications/${id}`);
        setApplication(response.data);
      } catch (apiError) {
        console.warn('Using mock data for application detail:', apiError);
        
        // Mock data for development
        const mockApplication = {
          id: parseInt(id),
          jobId: 100 + parseInt(id),
          jobTitle: `Full Stack Developer`,
          companyName: 'TechCorp Solutions',
          companyLogo: 'https://via.placeholder.com/150',
          location: 'Hà Nội',
          appliedDate: moment().subtract(5, 'days').format(),
          status: ['pending', 'reviewing', 'interviewing', 'offered', 'rejected'][parseInt(id) % 5],
          salary: '15,000,000 - 20,000,000 VND',
          jobType: 'Toàn thời gian',
          workMode: 'Tại văn phòng',
          description: 'Chúng tôi đang tìm kiếm một Full Stack Developer có kinh nghiệm để tham gia vào team phát triển sản phẩm mới...',
          requirements: [
            'Ít nhất 2 năm kinh nghiệm với React và Node.js',
            'Kinh nghiệm với REST API và GraphQL',
            'Thành thạo HTML, CSS, JavaScript',
            'Hiểu biết về database như MongoDB, PostgreSQL',
            'Khả năng làm việc độc lập và theo nhóm'
          ],
          benefits: [
            'Lương cạnh tranh và thưởng theo hiệu suất',
            'Bảo hiểm y tế và xã hội đầy đủ',
            'Chế độ nghỉ phép linh hoạt',
            'Chương trình đào tạo nâng cao kỹ năng',
            'Môi trường làm việc năng động và chuyên nghiệp'
          ],
          timeline: [
            {
              date: moment().subtract(5, 'days').format(),
              status: 'applied',
              title: 'Đã nộp hồ sơ',
              description: 'Bạn đã nộp đơn ứng tuyển thành công'
            },
            {
              date: moment().subtract(3, 'days').format(),
              status: 'reviewing',
              title: 'Đang xem xét',
              description: 'Nhà tuyển dụng đang xem xét hồ sơ của bạn'
            }
          ],
          resume: {
            id: 1,
            name: 'CV_NguyenVanA_Developer.pdf',
            url: '#'
          },
          additionalDocuments: [
            {
              id: 2,
              name: 'Portfolio_NguyenVanA.pdf',
              url: '#'
            }
          ]
        };
        
        // Add more steps to timeline based on status
        if (['interviewing', 'offered', 'rejected', 'hired'].includes(mockApplication.status)) {
          mockApplication.timeline.push({
            date: moment().subtract(1, 'days').format(),
            status: 'interviewing',
            title: 'Mời phỏng vấn',
            description: 'Bạn đã được mời tham gia phỏng vấn'
          });
          
          if (mockApplication.status === 'offered') {
            mockApplication.timeline.push({
              date: moment().format(),
              status: 'offered',
              title: 'Đề nghị làm việc',
              description: 'Nhà tuyển dụng đã gửi đề nghị làm việc cho bạn'
            });
          } else if (mockApplication.status === 'hired') {
            mockApplication.timeline.push({
              date: moment().subtract(1, 'days').format(),
              status: 'offered',
              title: 'Đề nghị làm việc',
              description: 'Nhà tuyển dụng đã gửi đề nghị làm việc cho bạn'
            });
            mockApplication.timeline.push({
              date: moment().format(),
              status: 'hired',
              title: 'Chấp nhận đề nghị',
              description: 'Bạn đã chấp nhận đề nghị làm việc'
            });
          } else if (mockApplication.status === 'rejected') {
            mockApplication.timeline.push({
              date: moment().format(),
              status: 'rejected',
              title: 'Không phù hợp',
              description: 'Rất tiếc, hồ sơ của bạn không phù hợp với vị trí này'
            });
          }
        }
        
        setApplication(mockApplication);
      }
    } catch (error) {
      console.error('Error fetching application detail:', error);
      setError('Không thể tải thông tin ứng tuyển. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      await axios.post(`http://localhost:5000/applications/${id}/withdraw`);
      message.success('Đã rút hồ sơ ứng tuyển thành công');
      
      // Update local state
      setApplication({
        ...application,
        status: 'withdrawn',
        timeline: [
          ...application.timeline,
          {
            date: moment().format(),
            status: 'withdrawn',
            title: 'Rút hồ sơ',
            description: 'Bạn đã rút hồ sơ ứng tuyển'
          }
        ]
      });
      
      setWithdrawModalVisible(false);
    } catch (error) {
      console.error('Error withdrawing application:', error);
      
      // For development, just update the UI
      setApplication({
        ...application,
        status: 'withdrawn',
        timeline: [
          ...application.timeline,
          {
            date: moment().format(),
            status: 'withdrawn',
            title: 'Rút hồ sơ',
            description: 'Bạn đã rút hồ sơ ứng tuyển'
          }
        ]
      });
      
      message.success('Đã rút hồ sơ ứng tuyển thành công');
      setWithdrawModalVisible(false);
    }
  };

  const renderStatusTag = (status) => {
    const statusConfig = {
      'pending': { color: 'warning', text: 'Chờ xử lý', icon: <ClockCircleOutlined /> },
      'reviewing': { color: 'processing', text: 'Đang xem xét', icon: <EyeOutlined /> },
      'interviewing': { color: 'blue', text: 'Phỏng vấn', icon: <ClockCircleOutlined /> },
      'offered': { color: 'success', text: 'Đã đề nghị', icon: <CheckCircleOutlined /> },
      'hired': { color: 'success', text: 'Đã tuyển', icon: <CheckCircleOutlined /> },
      'rejected': { color: 'error', text: 'Từ chối', icon: <CloseCircleOutlined /> },
      'withdrawn': { color: 'default', text: 'Đã rút hồ sơ', icon: <CloseCircleOutlined /> }
    };
    const config = statusConfig[status] || { color: 'default', text: status };
    return (
      <Tag color={config.color} icon={config.icon} style={{ fontSize: '14px', padding: '4px 8px' }}>
        {config.text}
      </Tag>
    );
  };

  const renderTimelineItem = (item, index) => {
    const statusConfig = {
      'applied': { color: 'blue' },
      'reviewing': { color: 'processing' },
      'interviewing': { color: 'orange' },
      'offered': { color: 'green' },
      'hired': { color: 'green' },
      'rejected': { color: 'red' },
      'withdrawn': { color: 'gray' }
    };
    
    return (
      <Timeline.Item 
        key={index} 
        color={statusConfig[item.status]?.color || 'blue'}
      >
        <div>
          <Text strong>{item.title}</Text>
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {moment(item.date).format('DD/MM/YYYY HH:mm')}
            </Text>
          </div>
          <div>{item.description}</div>
        </div>
      </Timeline.Item>
    );
  };

  if (loading) {
    return (
      <div className="container py-4">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <Alert message="Lỗi" description={error} type="error" showIcon />
        <Button 
          type="primary" 
          icon={<LeftOutlined />} 
          style={{ marginTop: 16 }}
          onClick={() => navigate('/candidate/applications')}
        >
          Quay lại
        </Button>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container py-4">
        <Alert 
          message="Không tìm thấy" 
          description="Không tìm thấy thông tin ứng tuyển này." 
          type="warning" 
          showIcon 
        />
        <Button 
          type="primary" 
          icon={<LeftOutlined />} 
          style={{ marginTop: 16 }}
          onClick={() => navigate('/candidate/applications')}
        >
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="application-detail-page">
      <div className="mb-4">
        <Button 
          icon={<LeftOutlined />} 
          onClick={() => navigate('/candidate/applications')}
        >
          Quay lại danh sách
        </Button>
      </div>
      
      <Card className="mb-4">
        <Row gutter={24} align="middle">
          <Col xs={24} md={6} className="text-center">
            <img 
              src={application.companyLogo || "https://via.placeholder.com/150"} 
              alt={application.companyName} 
              style={{ maxWidth: '100%', maxHeight: 120, objectFit: 'contain' }} 
            />
          </Col>
          <Col xs={24} md={18}>
            <Title level={3}>{application.jobTitle}</Title>
            <Title level={5} type="secondary" style={{ marginTop: 0 }}>{application.companyName}</Title>
            
            <Row gutter={[16, 8]} className="mt-3">
              <Col xs={24} sm={12} md={8}>
                <Text><EnvironmentOutlined /> {application.location}</Text>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text><DollarOutlined /> {application.salary}</Text>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text><CalendarOutlined /> Nộp hồ sơ: {moment(application.appliedDate).format('DD/MM/YYYY')}</Text>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text><TeamOutlined /> {application.jobType}</Text>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text><FileDoneOutlined /> {application.workMode}</Text>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div>Trạng thái: {renderStatusTag(application.status)}</div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
      
      <Row gutter={16}>
        <Col xs={24} md={16}>
          <Card title="Thông tin công việc" className="mb-4">
            <div className="mb-4">
              <Title level={5}>Mô tả công việc</Title>
              <Paragraph>{application.description}</Paragraph>
            </div>
            
            <div className="mb-4">
              <Title level={5}>Yêu cầu</Title>
              <ul>
                {application.requirements?.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <Title level={5}>Quyền lợi</Title>
              <ul>
                {application.benefits?.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
            
            <Divider />
            
            <div className="text-center">
              <Link to={`/jobs/${application.jobId}`}>
                <Button type="primary" icon={<EyeOutlined />}>
                  Xem chi tiết công việc
                </Button>
              </Link>
            </div>
          </Card>
          
          <Card title="Hồ sơ ứng tuyển" className="mb-4">
            <Descriptions layout="vertical" column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="CV">
                <Link to={application.resume?.url || '#'}>
                  <Button type="link" icon={<FileDoneOutlined />}>
                    {application.resume?.name || 'Xem CV'}
                  </Button>
                </Link>
              </Descriptions.Item>
              
              {application.additionalDocuments?.length > 0 && (
                <Descriptions.Item label="Tài liệu bổ sung">
                  {application.additionalDocuments.map(doc => (
                    <div key={doc.id}>
                      <Link to={doc.url}>
                        <Button type="link" icon={<FileDoneOutlined />}>
                          {doc.name}
                        </Button>
                      </Link>
                    </div>
                  ))}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card title="Trạng thái ứng tuyển" className="mb-4">
            <div className="text-center mb-4">
              <div style={{ marginBottom: 16 }}>
                {renderStatusTag(application.status)}
              </div>
              
              {['pending', 'reviewing', 'interviewing'].includes(application.status) && (
                <Button 
                  danger 
                  onClick={() => setWithdrawModalVisible(true)}
                >
                  Rút hồ sơ ứng tuyển
                </Button>
              )}
            </div>
            
            <Timeline>
              {application.timeline?.map(renderTimelineItem)}
            </Timeline>
          </Card>
          
          <Card title="Công việc tương tự" className="mb-4">
            <div className="similar-jobs">
              {Array(3).fill(null).map((_, index) => (
                <div key={index} className="similar-job-item mb-3 pb-3" style={{ borderBottom: index < 2 ? '1px solid #f0f0f0' : 'none' }}>
                  <Title level={5} style={{ marginBottom: 4 }}>
                    {['Frontend Developer', 'Web Developer', 'Full Stack Engineer'][index]}
                  </Title>
                  <div className="mb-2">
                    <Text type="secondary">{['ABC Company', 'XYZ Solutions', 'Tech Innovations'][index]}</Text>
                  </div>
                  <div className="mb-2">
                    <Tag>{['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng'][index]}</Tag>
                    <Tag>{['15-20tr', '20-25tr', '18-22tr'][index]}</Tag>
                  </div>
                  <Link to={`/jobs/${200 + index}`}>
                    <Button type="link" style={{ padding: 0 }}>
                      Xem chi tiết <ArrowRightOutlined />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
            <div className="text-center mt-3">
              <Link to="/candidate/jobs">
                <Button type="primary">Xem thêm công việc</Button>
              </Link>
            </div>
          </Card>
        </Col>
      </Row>
      
      <Modal
        title="Rút hồ sơ ứng tuyển"
        open={withdrawModalVisible}
        onOk={handleWithdraw}
        onCancel={() => setWithdrawModalVisible(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn rút hồ sơ ứng tuyển này không?</p>
        <p>Hành động này không thể hoàn tác.</p>
      </Modal>
    </div>
  );
};

export default ApplicationDetailPage; 