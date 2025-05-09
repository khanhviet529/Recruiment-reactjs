import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Empty, Tooltip } from 'antd';
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
  Modal,
  List,
  Avatar,
  Space,
  Tabs,
  Popconfirm
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
  FileDoneOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  RedoOutlined,
  FileOutlined,
  FilePdfOutlined,
  CloseOutlined,
  MailOutlined,
  PhoneOutlined,
  MessageOutlined,
  BankOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  SendOutlined
} from '@ant-design/icons';
import moment from 'moment';
import parse from 'html-react-parser';
import ApplicationStatus from '../../components/candidate/Applications/ApplicationStatus';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;

const ApplicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [application, setApplication] = useState(null);
  const [job, setJob] = useState(null);
  const [employer, setEmployer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [reapplyModalVisible, setReapplyModalVisible] = useState(false);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [processingAction, setProcessingAction] = useState(false);
  const [pdfPreviewVisible, setPdfPreviewVisible] = useState(false);
  const [withdrawConfirmVisible, setWithdrawConfirmVisible] = useState(false);
  const [advancedWithdrawModalVisible, setAdvancedWithdrawModalVisible] = useState(false);

  useEffect(() => {
    if (id && user && user.id) {
      fetchApplicationDetail();
    }
  }, [id, user]);

  const fetchApplicationDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get application details
      const applicationResponse = await axios.get(`http://localhost:5000/applications/${id}`);
      
      if (!applicationResponse.data) {
        setError('Không tìm thấy thông tin ứng tuyển');
        setLoading(false);
        return;
      }
      
      const appData = applicationResponse.data;
      
      // Check if this application belongs to the current user
      if (appData.candidateId != user.id) {
        setError('Bạn không có quyền xem đơn ứng tuyển này');
        setLoading(false);
        return;
      }
      
      setApplication(appData);
      
      // Get job details
      const jobResponse = await axios.get(`http://localhost:5000/jobs/${appData.jobId}`);
      if (!jobResponse.data) {
        setError('Không tìm thấy thông tin công việc');
        setLoading(false);
        return;
      }
      
      const jobData = jobResponse.data;
      setJob(jobData);
      
      // Get employer details
      const employerResponse = await axios.get(`http://localhost:5000/employers?userId=${jobData.employerId}`);
      if (!employerResponse.data) {
        console.warn(`Employer not found for ID: ${jobData.employerId}`);
      } else {
        setEmployer(employerResponse.data);
      }
      
      // Check for similar jobs
      try {
        if (jobData.categoryIds && jobData.categoryIds.length > 0) {
          const categoryParams = jobData.categoryIds.map(id => `categoryIds=${id}`).join('&');
          const similarJobsResponse = await axios.get(`http://localhost:5000/jobs?${categoryParams}&_limit=3`);
          setSimilarJobs(similarJobsResponse.data.filter(j => j.id !== jobData.id));
        } else {
          setSimilarJobs([]);
        }
      } catch (err) {
        console.error('Error fetching similar jobs:', err);
        setSimilarJobs([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching application details:', err);
      setError('Không thể tải thông tin ứng tuyển. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const canWithdrawApplication = (status) => {
    // Các trạng thái mà ứng viên có thể rút hồ sơ
    const withdrawableStatuses = ['pending', 'reviewing'];
    
    // Các trạng thái cần xác nhận đặc biệt
    const advancedWithdrawStatuses = ['interviewing'];
    
    // Các trạng thái không thể rút
    const nonWithdrawableStatuses = ['offered', 'hired', 'rejected', 'withdrawn'];
    
    if (withdrawableStatuses.includes(status)) {
      return 'normal'; // Có thể rút bình thường
    } else if (advancedWithdrawStatuses.includes(status)) {
      return 'advanced'; // Cần xác nhận đặc biệt
    } else if (nonWithdrawableStatuses.includes(status)) {
      return 'denied'; // Không thể rút
    }
    
    return 'denied'; // Mặc định không cho phép
  };

  const handleWithdrawClick = () => {
    const withdrawType = canWithdrawApplication(application.status);
    
    if (withdrawType === 'normal') {
      setWithdrawModalVisible(true);
    } else if (withdrawType === 'advanced') {
      setAdvancedWithdrawModalVisible(true);
    } else {
      message.error('Không thể rút hồ sơ ở trạng thái hiện tại.');
    }
  };

  const handleWithdraw = async () => {
    try {
      setProcessingAction(true);
      
      // Update application status
      await axios.patch(`http://localhost:5000/applications/${id}`, {
        status: 'withdrawn',
        stageHistory: [
          ...(application.stageHistory || []),
          {
            stage: 'withdrawn',
            enteredAt: new Date().toISOString(),
            exitedAt: null,
            notes: "Ứng viên đã rút hồ sơ ứng tuyển"
          }
        ],
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setApplication({
        ...application,
        status: 'withdrawn',
        stageHistory: [
          ...(application.stageHistory || []),
          {
            stage: 'withdrawn',
            enteredAt: new Date().toISOString(),
            exitedAt: null,
            notes: "Ứng viên đã rút hồ sơ ứng tuyển"
          }
        ],
        updatedAt: new Date().toISOString()
      });
      
      message.success('Đã rút hồ sơ ứng tuyển thành công');
      setWithdrawModalVisible(false);
      setAdvancedWithdrawModalVisible(false);
    } catch (error) {
      console.error('Error withdrawing application:', error);
      message.error('Có lỗi xảy ra khi rút hồ sơ ứng tuyển');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleReapply = async () => {
    try {
      setProcessingAction(true);

      // Check if application deadline has passed
      const applicationDeadline = new Date(job.applicationDeadline);
      const now = new Date();
      
      if (applicationDeadline < now) {
        message.error('Thời hạn ứng tuyển đã kết thúc. Không thể nộp lại hồ sơ.');
        setReapplyModalVisible(false);
        setProcessingAction(false);
        return;
      }
      
      // Kiểm tra xem đã có đơn ứng tuyển hoạt động nào khác cho công việc này không
      const checkResponse = await axios.get(`http://localhost:5000/applications?candidateId=${user.id}&jobId=${application.jobId}`);
      const activeApplications = checkResponse.data.filter(app => app.id !== id && app.status !== 'withdrawn');
      
      if (activeApplications.length > 0) {
        message.error('Bạn đã có đơn ứng tuyển khác cho công việc này. Không thể nộp lại hồ sơ.');
        setReapplyModalVisible(false);
        setProcessingAction(false);
        return;
      }
      
      // Update application status back to pending
      await axios.patch(`http://localhost:5000/applications/${id}`, {
        status: 'pending',
        currentStage: 1,
        stageHistory: [
          ...(application.stageHistory || []),
          {
            stage: 1,
            enteredAt: new Date().toISOString(),
            exitedAt: null,
            notes: "Ứng viên đã nộp lại hồ sơ ứng tuyển"
          }
        ],
        updatedAt: new Date().toISOString(),
        reappliedAt: new Date().toISOString()
      });
      
      // Update local state
      setApplication({
        ...application,
        status: 'pending',
        currentStage: 1,
        stageHistory: [
          ...(application.stageHistory || []),
          {
            stage: 1,
            enteredAt: new Date().toISOString(),
            exitedAt: null,
            notes: "Ứng viên đã nộp lại hồ sơ ứng tuyển"
          }
        ],
        updatedAt: new Date().toISOString(),
        reappliedAt: new Date().toISOString()
      });
      
      message.success('Đã nộp lại hồ sơ ứng tuyển thành công. Hồ sơ của bạn đang được xem xét.');
      setReapplyModalVisible(false);
    } catch (error) {
      console.error('Error reapplying:', error);
      message.error('Có lỗi xảy ra khi nộp lại hồ sơ ứng tuyển');
    } finally {
      setProcessingAction(false);
    }
  };

  const navigateToJobDetail = () => {
    navigate(`/jobs/${job.id}`);
  };

  const navigateToJobDetailForReapply = () => {
    // Add a query parameter to indicate user wants to reapply
    navigate(`/jobs/${job.id}?reapply=true`);
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

  const renderTimelineItems = () => {
    const timeline = [];
    
    // Application submitted
    timeline.push({
      date: application.appliedAt,
      status: 'applied',
      title: 'Đã nộp hồ sơ',
      description: 'Bạn đã nộp đơn ứng tuyển thành công'
    });
    
    // Process each stage in stageHistory except the first one which is application submission
    if (application.stageHistory && application.stageHistory.length > 0) {
      application.stageHistory.forEach((stage, index) => {
        // Skip first entry if it's just the initial application
        if (index === 0 && stage.stage === 1) return;
        
        const stageConfig = {
          1: { status: 'applied', title: 'Đã nộp hồ sơ' },
          2: { status: 'reviewing', title: 'Đang xem xét' },
          3: { status: 'interviewing', title: 'Phỏng vấn' },
          4: { status: 'offered', title: 'Đã đề nghị' },
          5: { status: 'hired', title: 'Đã tuyển' },
          'rejected': { status: 'rejected', title: 'Từ chối' },
          'withdrawn': { status: 'withdrawn', title: 'Đã rút hồ sơ' }
        };
        
        const stageInfo = stageConfig[stage.stage] || 
                          { status: 'default', title: `Giai đoạn ${stage.stage}` };
        
        timeline.push({
          date: stage.enteredAt,
          status: stageInfo.status,
          title: stageInfo.title,
          description: stage.notes || ''
        });
      });
    }
    
    // If the application has been reapplied, add that to the timeline
    if (application.reappliedAt) {
      timeline.push({
        date: application.reappliedAt,
        status: 'applied',
        title: 'Đã nộp lại hồ sơ',
        description: 'Bạn đã nộp lại đơn ứng tuyển'
      });
    }
    
    // Add interviews to timeline
    if (application.interviews && application.interviews.length > 0) {
      application.interviews.forEach(interview => {
        timeline.push({
          date: interview.scheduledAt,
          status: 'interviewing',
          title: interview.title || 'Phỏng vấn',
          description: `${interview.isOnline ? 'Phỏng vấn online' : 'Phỏng vấn trực tiếp'}: ${interview.notes || ''}`
        });
      });
    }
    
    // Sort timeline by date
    timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return timeline.map((item, index) => renderTimelineItem(item, index));
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
  
  const formatSalary = (salary) => {
    if (!salary) return 'N/A';
    if (salary.isHidden) return 'Thương lượng';
    return `${salary.min} - ${salary.max} ${salary.currency}/${salary.period}`;
  };
  
  const handlePdfPreview = () => {
    if (application?.resume?.url || application?.resumeUrl) {
      // Open resume URL in a new tab
      window.open(application?.resume?.url || application?.resumeUrl, '_blank');
    } else {
      message.error('Không tìm thấy CV của bạn');
    }
  };

  const renderActionButtons = () => {
    // Kiểm tra khả năng rút hồ sơ
    const withdrawStatus = application ? canWithdrawApplication(application.status) : 'denied';
    const canWithdraw = withdrawStatus === 'normal' || withdrawStatus === 'advanced';
    
    return (
      <Space direction="vertical" className="w-100">
        {/* View Job button */}
        <Button 
          type="primary" 
          icon={<EyeOutlined />} 
          onClick={navigateToJobDetail}
          block
        >
          Xem tin tuyển dụng
        </Button>
        
        {/* View Resume button */}
        <Button 
          icon={<FilePdfOutlined />} 
          onClick={handlePdfPreview}
          disabled={!application?.resume?.url && !application?.resumeUrl}
          block
        >
          Xem CV của bạn
        </Button>
        
        {/* Withdraw application button */}
        {application && application.status !== 'withdrawn' && 
          application.status !== 'rejected' && 
          application.status !== 'hired' && 
          canWithdraw && (
          <Button 
            danger 
            icon={<CloseOutlined />}
            onClick={handleWithdrawClick}
            block
          >
            Rút hồ sơ ứng tuyển
          </Button>
        )}

        {/* Hiển thị thông tin nếu không thể rút hồ sơ */}
        {application && application.status !== 'withdrawn' && 
          application.status !== 'rejected' && 
          application.status !== 'hired' && 
          !canWithdraw && (
          <Tooltip title="Bạn không thể rút hồ sơ ở trạng thái hiện tại">
            <Button 
              danger 
              icon={<CloseOutlined />}
              disabled
              block
            >
              Không thể rút hồ sơ
            </Button>
          </Tooltip>
        )}
        
        {/* Reapply buttons */}
        {application && application.status === 'withdrawn' && (
          <>
            <Button 
              type="dashed" 
              icon={<RedoOutlined />}
              onClick={() => setReapplyModalVisible(true)}
              block
            >
              Nộp lại hồ sơ ứng tuyển
            </Button>
            
            <Tooltip title="Đến trang chi tiết công việc để ứng tuyển lại với CV mới">
              <Button
                type="link"
                icon={<SendOutlined />}
                onClick={navigateToJobDetailForReapply}
                block
              >
                Ứng tuyển với CV mới
              </Button>
            </Tooltip>
          </>
        )}
      </Space>
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

  if (!application || !job) {
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
              src={employer?.logo || "https://via.placeholder.com/150"} 
              alt={employer?.companyName} 
              style={{ maxWidth: '100%', maxHeight: 120, objectFit: 'contain' }} 
            />
          </Col>
          <Col xs={24} md={18}>
            <Title level={3}>{job.title}</Title>
            <Title level={5} type="secondary" style={{ marginTop: 0 }}>{employer?.companyName}</Title>
            
            <Row gutter={[16, 8]} className="mt-3">
              <Col xs={24} sm={12} md={8}>
                <Text><EnvironmentOutlined /> {job.location}</Text>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text><DollarOutlined /> {formatSalary(job.salary)}</Text>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text><CalendarOutlined /> Nộp hồ sơ: {moment(application.appliedAt).format('DD/MM/YYYY')}</Text>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text><TeamOutlined /> {job.jobType}</Text>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text><FileDoneOutlined /> {job.workType || (job.isRemote ? 'Remote' : 'Tại văn phòng')}</Text>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div>Trạng thái: {renderStatusTag(application.status)}</div>
              </Col>
            </Row>
            
            {application.status === 'withdrawn' && (
              <Alert 
                message="Bạn đã rút hồ sơ ứng tuyển này" 
                description={
                  <>
                    {new Date(job.applicationDeadline) > new Date() ? 
                      "Bạn vẫn có thể nộp lại hồ sơ ứng tuyển trước khi hết hạn nộp đơn." : 
                      "Thời hạn nộp đơn đã kết thúc. Bạn không thể nộp lại hồ sơ ứng tuyển cho vị trí này."}
                  </>
                } 
                type="warning" 
                showIcon 
                className="mt-3" 
              />
            )}
          </Col>
        </Row>
      </Card>
      
      <Row gutter={16}>
        <Col xs={24} md={16}>
          <Card title="Thông tin công việc" className="mb-4">
            <div className="mb-4">
              <Title level={5}>Mô tả công việc</Title>
              <Paragraph>{job.description}</Paragraph>
            </div>
            
            <div className="mb-4">
              <Title level={5}>Yêu cầu</Title>
              <ul>
                {job.requirements?.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <Title level={5}>Quyền lợi</Title>
              <ul>
                {job.benefits?.map((benefit, index) => (
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
          
          <Card title="Hồ sơ ứng tuyển của bạn" className="mb-4">
            <Descriptions layout="vertical" column={{ xs: 1, sm: 2 }} bordered>
              <Descriptions.Item label="CV">
                {application.resume?.url || application.resumeUrl ? (
                  <Button 
                    type="link" 
                    icon={<FileTextOutlined />} 
                    onClick={handlePdfPreview}
                  >
                    {application.resume?.name || 'CV của bạn'}
                  </Button>
                ) : (
                  <Text type="secondary">Không có CV đính kèm</Text>
                )}
              </Descriptions.Item>
              
              {application.coverLetter && (
                <Descriptions.Item label="Thư xin việc">
                  <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    {application.coverLetter}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>
            
            {application.answers && application.answers.length > 0 && (
              <>
                <Divider orientation="left">Câu trả lời của bạn</Divider>
                <List
                  itemLayout="vertical"
                  dataSource={application.answers}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<QuestionCircleOutlined />} />}
                        title={item.question}
                        description={null}
                      />
                      <div style={{ marginLeft: 48 }}>{item.answer}</div>
                    </List.Item>
                  )}
                />
              </>
            )}
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card title="Trạng thái ứng tuyển" className="mb-4">
            <div className="text-center mb-4">
              <div style={{ marginBottom: 16 }}>
                {renderStatusTag(application.status)}
              </div>
              
              {renderActionButtons()}
            </div>
            
            <Timeline>
              {renderTimelineItems()}
            </Timeline>
          </Card>
          
          {application.interviews && application.interviews.length > 0 && (
            <Card title="Lịch phỏng vấn" className="mb-4">
              <List
                itemLayout="horizontal"
                dataSource={application.interviews}
                renderItem={interview => (
                  <List.Item>
                    <List.Item.Meta
                      title={interview.title}
                      description={
                        <>
                          <div><CalendarOutlined /> {moment(interview.scheduledAt).format('DD/MM/YYYY HH:mm')}</div>
                          <div><ClockCircleOutlined /> {interview.duration} phút</div>
                          <div><EnvironmentOutlined /> {interview.isOnline ? 'Phỏng vấn online' : interview.location}</div>
                          {interview.notes && <div>{interview.notes}</div>}
                        </>
                      }
                    />
                    <Tag color={interview.status === 'scheduled' ? 'processing' : 'success'}>
                      {interview.status === 'scheduled' ? 'Sắp diễn ra' : 'Đã hoàn thành'}
                    </Tag>
                  </List.Item>
                )}
              />
            </Card>
          )}
          
          <Card title="Công việc tương tự" className="mb-4">
            <div className="similar-jobs">
              {similarJobs.length > 0 ? (
                similarJobs.map((similarJob, index) => (
                  <div 
                    key={similarJob.id} 
                    className="similar-job-item mb-3 pb-3" 
                    style={{ borderBottom: index < similarJobs.length - 1 ? '1px solid #f0f0f0' : 'none' }}
                  >
                    <Title level={5} style={{ marginBottom: 4 }}>
                      {similarJob.title}
                    </Title>
                    <div className="mb-2">
                      <Text type="secondary">{employer?.companyName}</Text>
                    </div>
                    <div className="mb-2">
                      <Tag>{similarJob.location}</Tag>
                      <Tag>{formatSalary(similarJob.salary)}</Tag>
                    </div>
                    <Link to={`/jobs/${similarJob.id}`}>
                      <Button type="link" style={{ padding: 0 }}>
                        Xem chi tiết <ArrowRightOutlined />
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <Empty description="Không có công việc tương tự" />
              )}
            </div>
            
            <div className="text-center mt-3">
              <Link to="/candidate/jobs">
                <Button type="primary">Xem thêm công việc</Button>
              </Link>
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* Withdraw Modal */}
      <Modal
        title="Rút hồ sơ ứng tuyển"
        open={withdrawModalVisible}
        onOk={handleWithdraw}
        onCancel={() => setWithdrawModalVisible(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ danger: true, loading: processingAction }}
        cancelButtonProps={{ disabled: processingAction }}
      >
        <p>Bạn có chắc chắn muốn rút hồ sơ ứng tuyển này không?</p>
        <Alert
          message="Lưu ý"
          description={
            <>
              <p>Khi rút hồ sơ ứng tuyển:</p>
              <ul>
                <li>Nhà tuyển dụng sẽ không xem xét hồ sơ của bạn nữa</li>
                <li>Bạn có thể nộp lại hồ sơ trước khi hết hạn nộp đơn</li>
                <li>Lịch sử ứng tuyển sẽ hiển thị rằng bạn đã rút hồ sơ và nộp lại (nếu có)</li>
              </ul>
            </>
          }
          type="info"
          showIcon
        />
      </Modal>
      
      {/* Reapply Modal */}
      <Modal
        title="Nộp lại hồ sơ ứng tuyển"
        open={reapplyModalVisible}
        onOk={handleReapply}
        onCancel={() => setReapplyModalVisible(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ loading: processingAction }}
        cancelButtonProps={{ disabled: processingAction }}
      >
        <p>Bạn có chắc chắn muốn nộp lại hồ sơ ứng tuyển cho vị trí này không?</p>
        <Alert
          message="Lưu ý"
          description={
            <>
              <p>Khi nộp lại hồ sơ ứng tuyển:</p>
              <ul>
                <li>Hồ sơ của bạn sẽ quay lại trạng thái "Chờ xử lý"</li>
                <li>Nhà tuyển dụng sẽ xem xét lại hồ sơ của bạn</li>
                <li>Lịch sử ứng tuyển của bạn sẽ bao gồm cả các giai đoạn trước</li>
              </ul>
            </>
          }
          type="info"
          showIcon
        />
        <div className="mt-3">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>Thông tin ứng tuyển:</Text>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Vị trí">{job.title}</Descriptions.Item>
              <Descriptions.Item label="Công ty">{employer?.companyName}</Descriptions.Item>
              <Descriptions.Item label="Hạn nộp hồ sơ">
                {moment(job.applicationDeadline).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="CV đã nộp">
                {application.resume?.name || 'CV của bạn'}
              </Descriptions.Item>
            </Descriptions>
          </Space>
        </div>
      </Modal>
      
      {/* Advanced Withdraw Modal for interview stage */}
      <Modal
        title="Cảnh báo: Rút hồ sơ ứng tuyển trong giai đoạn phỏng vấn"
        open={advancedWithdrawModalVisible}
        onCancel={() => setAdvancedWithdrawModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setAdvancedWithdrawModalVisible(false)}>
            Hủy
          </Button>,
          <Button 
            key="withdraw" 
            danger 
            type="primary" 
            loading={processingAction} 
            onClick={handleWithdraw}
          >
            Tôi hiểu và vẫn muốn rút hồ sơ
          </Button>
        ]}
      >
        <Alert
          message="Cảnh báo"
          description="Rút hồ sơ ở giai đoạn này có thể ảnh hưởng tiêu cực đến quá trình ứng tuyển của bạn với công ty này trong tương lai."
          type="warning"
          showIcon
          className="mb-3"
        />
        <p>Bạn đang ở giai đoạn phỏng vấn của quá trình tuyển dụng. Rút hồ sơ vào lúc này:</p>
        <ul>
          <li>Có thể tạo ấn tượng không tốt với nhà tuyển dụng</li>
          <li>Có thể bị đánh dấu là ứng viên không nghiêm túc</li>
          <li>Nhà tuyển dụng đã đầu tư thời gian xem xét và sắp xếp phỏng vấn cho bạn</li>
        </ul>
        <p>Nếu bạn có khó khăn với lịch phỏng vấn, hãy cân nhắc liên hệ trực tiếp với nhà tuyển dụng để điều chỉnh thay vì rút hồ sơ.</p>
        <p><strong>Bạn có chắc chắn muốn rút hồ sơ ứng tuyển này không?</strong></p>
      </Modal>
    </div>
  );
};

export default ApplicationDetailPage; 