import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import emailjs from '@emailjs/browser';
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
  Form,
  Input,
  Space,
  Tabs,
  List,
  Avatar,
  Badge
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
  MailOutlined,
  PhoneOutlined,
  RedoOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

// Function to format email content for preview
const formatEmailContent = (text) => {
  if (!text) return '';
  return text.split('\n').map((line, i) => (
    <React.Fragment key={i}>
      {line}
      <br />
    </React.Fragment>
  ));
};

const ApplicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [application, setApplication] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [job, setJob] = useState(null);
  const [employer, setEmployer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [emailType, setEmailType] = useState(''); // 'offer', 'reject', etc.
  const [emailForm] = Form.useForm();
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const [processingAction, setProcessingAction] = useState(false);
  const [emailPreviewVisible, setEmailPreviewVisible] = useState(false);
  const emailFormRef = useRef();

  // EmailJS configuration constants
  const SERVICE_ID = 'service_tvwa1o9';
  const TEMPLATE_ID = 'template_enpsglf';
  const PUBLIC_KEY = 'Kdi2J8L4OUPkdE5Fx';
  
  // Initialize EmailJS
  useEffect(() => {
    try {
      emailjs.init(PUBLIC_KEY);
      console.log('EmailJS initialized successfully');
    } catch (error) {
      console.error('Error initializing EmailJS:', error);
      message.error('Không thể khởi tạo dịch vụ email. Một số tính năng có thể không hoạt động.');
    }
  }, []);

  // Test EmailJS connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        // Just checking if the keys are valid
        if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
          console.warn('EmailJS configuration is incomplete');
        }
      } catch (error) {
        console.error('Error testing EmailJS connection:', error);
      }
    };
    
    testConnection();
  }, []);

  useEffect(() => {
    fetchApplicationDetail();
  }, [id]);

  const fetchApplicationDetail = async () => {
    try {
      setLoading(true);
      const applicationResponse = await axios.get(`http://localhost:5000/applications/${id}`);
      const applicationData = applicationResponse.data;
      
      if (!applicationData) {
        setError('Không tìm thấy thông tin đơn ứng tuyển');
        setLoading(false);
        return;
      }
      
      // Get the job first to check ownership
      const jobResponse = await axios.get(`http://localhost:5000/jobs/${applicationData.jobId}`);
      const jobData = jobResponse.data;
      
      if (!jobData) {
        setError('Không tìm thấy thông tin công việc');
        setLoading(false);
        return;
      }
      
      // Check if job belongs to employer
      if (jobData.employerId != user.id) {
        setError('Bạn không có quyền truy cập đơn ứng tuyển này');
        setLoading(false);
        return;
      }
      
      // Get employer data
      const employerResponse = await axios.get(`http://localhost:5000/employers?userId=${jobData.employerId}`);
      
      // Get candidate data - first try by userId
      let candidateData = null;
      try {
        const candidateResponse = await axios.get(`http://localhost:5000/candidates?userId=${applicationData.candidateId}`);
        
        if (candidateResponse.data && candidateResponse.data.length > 0) {
          candidateData = candidateResponse.data[0];
        } else {
          // If not found by userId, try by id directly
          const directResponse = await axios.get(`http://localhost:5000/candidates?id=${applicationData.candidateId}`);
          if (directResponse.data && directResponse.data.length > 0) {
            candidateData = directResponse.data[0];
          }
        }
        
        if (!candidateData) {
          console.warn(`Candidate not found for ID: ${applicationData.candidateId}`);
          candidateData = { 
            firstName: 'Unknown', 
            lastName: 'Candidate',
            id: applicationData.candidateId
          };
        }
      } catch (error) {
        console.error('Error fetching candidate details:', error);
        candidateData = { 
          firstName: 'Unknown', 
          lastName: 'Candidate',
          id: applicationData.candidateId
        };
      }
      
      setApplication(applicationData);
      setCandidate(candidateData);
      setJob(jobData);
      setEmployer(employerResponse.data);
    } catch (error) {
      console.error('Error fetching application details:', error);
      setError('Có lỗi xảy ra khi tải thông tin đơn ứng tuyển');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      'pending': { color: 'warning', text: 'Chờ xử lý', icon: <ClockCircleOutlined /> },
      'reviewing': { color: 'processing', text: 'Đang xem xét', icon: <EyeOutlined /> },
      'interviewing': { color: 'info', text: 'Phỏng vấn', icon: <ClockCircleOutlined /> },
      'offered': { color: 'success', text: 'Đã đề nghị', icon: <CheckCircleOutlined /> },
      'hired': { color: 'success', text: 'Đã tuyển', icon: <CheckCircleOutlined /> },
      'rejected': { color: 'error', text: 'Từ chối', icon: <CloseCircleOutlined /> },
      'withdrawn': { color: 'default', text: 'Đã rút hồ sơ', icon: <CloseCircleOutlined /> }
    };
    const config = statusConfig[status] || { color: 'default', text: status };
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const updateApplicationStatus = async (status) => {
    try {
      setProcessingAction(true);
      const now = new Date().toISOString();
      
      // Create stage number based on status
      const stageMapping = {
        'reviewing': 2,
        'interviewing': 3,
        'offered': 4,
        'hired': 5,
        'rejected': 'rejected',
        'pending': 1,
        'withdrawn': 'withdrawn'
      };
      
      const stageNumber = stageMapping[status] || 1;
      
      const updatedApplication = {
        ...application,
        status,
        currentStage: typeof stageNumber === 'number' ? stageNumber : application.currentStage,
        stageHistory: [
          ...(application.stageHistory || []),
          {
            stage: stageNumber,
            enteredAt: now,
            exitedAt: null,
            notes: `Trạng thái được thay đổi thành "${status}" bởi nhà tuyển dụng`
          }
        ],
        updatedAt: now
      };
      
      // If status is changing from withdrawn to reviewing, add reapplied flag
      if (application.status === 'withdrawn' && status === 'reviewing') {
        updatedApplication.reappliedAt = now;
      }
      
      await axios.patch(`http://localhost:5000/applications/${id}`, updatedApplication);
      
      message.success('Cập nhật trạng thái thành công');
      setApplication(updatedApplication);
      
    } catch (error) {
      console.error('Error updating application status:', error);
      message.error('Có lỗi xảy ra khi cập nhật trạng thái');
    } finally {
      setProcessingAction(false);
      setConfirmModalVisible(false);
    }
  };

  const showEmailModal = (type) => {
    setEmailType(type);
    
    // Set default email content based on type
    const subject = type === 'offer' 
      ? `Thư mời phỏng vấn: ${job?.title}`
      : `Kết quả ứng tuyển: ${job?.title}`;
    
    const currentDate = new Date().toLocaleDateString('vi-VN');
    const companyName = employer?.companyName || 'Công ty chúng tôi';
    const employerName = user.fullName || 'Nhà tuyển dụng';
    const candidateName = `${candidate?.firstName || ''} ${candidate?.lastName || ''}`.trim();
      
    const content = type === 'offer'
      ? `Kính gửi ${candidateName},\n\nChúng tôi vui mừng thông báo rằng hồ sơ của bạn đã được chọn cho vị trí ${job?.title}. Chúng tôi muốn mời bạn tham gia buổi phỏng vấn để thảo luận thêm về vị trí này.\n\nThời gian: [Thời gian phỏng vấn]\nĐịa điểm: [Địa điểm phỏng vấn]\nHình thức: [Trực tiếp/Online]\n\nVui lòng xác nhận sự tham dự của bạn bằng cách trả lời email này.\n\nTrân trọng,\n${employerName}\n${companyName}`
      : `Kính gửi ${candidateName},\n\nCảm ơn bạn đã quan tâm đến vị trí ${job?.title}.\n\nSau khi xem xét kỹ lưỡng hồ sơ của bạn, chúng tôi rất tiếc phải thông báo rằng chúng tôi đã quyết định tiếp tục với các ứng viên khác phù hợp hơn với yêu cầu hiện tại của chúng tôi.\n\nChúng tôi đánh giá cao sự quan tâm của bạn và khuyến khích bạn theo dõi các cơ hội tuyển dụng khác từ công ty chúng tôi trong tương lai.\n\nChúc bạn thành công trong sự nghiệp.\n\nTrân trọng,\n${employerName}\n${companyName}`;
    
    emailForm.setFieldsValue({
      to: candidate?.email,
      subject,
      body: content
    });
    
    setEmailModalVisible(true);
  };

  const handleSendEmail = async (values) => {
    try {
      setProcessingAction(true);
      
      // Show loading message
      const loadingMessage = message.loading('Đang gửi email...', 0);
      
      // Prepare email parameters for EmailJS
      const emailParams = {
        title: values.subject,
        name: user.fullName || employer?.companyName || 'Nhà tuyển dụng',
        email_form: employer?.contactEmail || user.email || 'admin@recruitment.com',
        email_to: values.to,
        time: new Date().toLocaleString('vi-VN'),
        message: values.body,
        to_email: values.to,
        to_name: `${candidate?.firstName || ''} ${candidate?.lastName || 'Ứng viên'}`
      };
      
      console.log('Sending email with params:', emailParams);
      
      try {
        // Send email using EmailJS
        const result = await emailjs.send(
          SERVICE_ID,
          TEMPLATE_ID,
          emailParams,
          PUBLIC_KEY
        );
        
        // Close loading message
        loadingMessage();
        
        console.log('Email sent successfully:', result);
        message.success('Email đã được gửi thành công');
        
        // Create a record of the email sent
        try {
          await axios.post('http://localhost:5000/emails', {
            applicationId: application.id,
            candidateId: application.candidateId,
            employerId: job.employerId,
            jobId: job.id,
            type: emailType,
            subject: values.subject,
            content: values.body,
            sentAt: new Date().toISOString(),
            status: 'sent'
          });
        } catch (recordError) {
          console.error('Error recording email in database:', recordError);
          // Just log the error but don't show message to user
        }
        
        // Update application status based on email type
        if (emailType === 'offer') {
          updateApplicationStatus('interviewing');
        } else if (emailType === 'reject') {
          updateApplicationStatus('rejected');
        }
        
        setEmailModalVisible(false);
      } catch (emailError) {
        // Close loading message
        loadingMessage();
        
        console.error('Error sending email with EmailJS:', emailError);
        
        // For development environment, implement a fallback
        if (process.env.NODE_ENV === 'development') {
          console.log('Development environment detected, simulating email success');
          message.success('Email đã được gửi thành công (giả lập)');
          
          // Update application status based on email type
          if (emailType === 'offer') {
            updateApplicationStatus('interviewing');
          } else if (emailType === 'reject') {
            updateApplicationStatus('rejected');
          }
          
          setEmailModalVisible(false);
          return;
        }
        
        // For production, show the error
        let errorMessage = 'Không thể gửi email. Vui lòng thử lại sau.';
        
        if (emailError.text) {
          errorMessage = `Lỗi gửi email: ${emailError.text}`;
        } else if (emailError.message) {
          errorMessage = `Lỗi gửi email: ${emailError.message}`;
        }
        
        message.error(errorMessage);
      }
    } catch (error) {
      console.error('General error in handleSendEmail:', error);
      message.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setProcessingAction(false);
    }
  };
  
  const showConfirmModal = (action) => {
    setActionToConfirm(action);
    setConfirmModalVisible(true);
  };
  
  const handleConfirmAction = () => {
    if (!actionToConfirm) return;
    
    updateApplicationStatus(actionToConfirm);
  };
  
  const formatSalary = (salary) => {
    if (!salary) return 'Thương lượng';
    if (salary.isHidden) return 'Thương lượng';
    return `${salary.min.toLocaleString()} - ${salary.max.toLocaleString()} ${salary.currency}/${salary.period}`;
  };
  
  const renderApplicationHistory = () => {
    const stages = [];
    
    // First stage is always application submission
    stages.push({
      date: application.appliedAt,
      title: 'Ứng viên nộp đơn',
      description: 'Ứng viên đã nộp đơn ứng tuyển',
      status: 'applied'
    });
    
    // Add all stages from stageHistory
    if (application.stageHistory && application.stageHistory.length > 0) {
      application.stageHistory.forEach(stage => {
        // Skip if it's the initial application stage (already added above)
        if (stage.stage === 1 && stages.length === 1) return;
        
        const stageConfig = {
          1: { title: 'Nộp đơn', status: 'applied' },
          2: { title: 'Xem xét hồ sơ', status: 'reviewing' },
          3: { title: 'Mời phỏng vấn', status: 'interviewing' },
          4: { title: 'Đề nghị công việc', status: 'offered' },
          5: { title: 'Tuyển dụng', status: 'hired' },
          'rejected': { title: 'Từ chối hồ sơ', status: 'rejected' },
          'withdrawn': { title: 'Ứng viên rút hồ sơ', status: 'withdrawn' }
        };
        
        const config = stageConfig[stage.stage] || { title: `Giai đoạn ${stage.stage}`, status: 'default' };
        
        stages.push({
          date: stage.enteredAt,
          title: config.title,
          description: stage.notes || '',
          status: config.status
        });
      });
    }
    
    // If reapplied, add that to history
    if (application.reappliedAt) {
      stages.push({
        date: application.reappliedAt,
        title: 'Ứng viên nộp lại đơn',
        description: 'Ứng viên đã nộp lại đơn ứng tuyển sau khi rút hồ sơ',
        status: 'applied'
      });
    }
    
    // Sort by date
    stages.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Render timeline
    return (
      <Timeline mode="left">
        {stages.map((stage, index) => {
          const statusColor = {
            'applied': 'blue',
            'reviewing': 'processing',
            'interviewing': 'blue',
            'offered': 'green',
            'hired': 'green',
            'rejected': 'red',
            'withdrawn': 'gray'
          }[stage.status] || 'blue';
          
          return (
            <Timeline.Item 
              key={index} 
              color={statusColor} 
              label={moment(stage.date).format('DD/MM/YYYY HH:mm')}
            >
              <div>
                <Text strong>{stage.title}</Text>
                <div>{stage.description}</div>
              </div>
            </Timeline.Item>
          );
        })}
      </Timeline>
    );
  };
  
  const renderActionButtons = () => {
    const actions = [];
    
    // Show different actions based on application status
    if (application.status === 'withdrawn') {
      actions.push(
        <Button 
          key="restore" 
          type="primary" 
          icon={<RedoOutlined />}
          onClick={() => showConfirmModal('reviewing')}
          disabled={processingAction}
        >
          Khôi phục hồ sơ
        </Button>
      );
      
      // Hiển thị thông báo cho nhà tuyển dụng biết ứng viên đã rút hồ sơ
      return (
        <>
          <Alert
            message="Ứng viên đã rút hồ sơ"
            description="Ứng viên này đã chủ động rút hồ sơ ứng tuyển. Bạn có thể khôi phục đơn ứng tuyển này nếu muốn tiếp tục xem xét."
            type="warning"
            showIcon
            className="mb-4"
          />
          <Space>
            {actions}
          </Space>
        </>
      );
    } else if (application.status === 'pending' || application.status === 'reviewing') {
      actions.push(
        <Button 
          key="interview" 
          type="primary" 
          icon={<CheckCircleOutlined />}
          onClick={() => showEmailModal('offer')}
          disabled={processingAction}
        >
          Gửi email mời phỏng vấn
        </Button>,
        <Button 
          key="reject" 
          danger 
          icon={<CloseCircleOutlined />}
          onClick={() => showEmailModal('reject')}
          disabled={processingAction}
        >
          Gửi email từ chối
        </Button>
      );
    } else if (application.status === 'interviewing') {
      actions.push(
        <Button 
          key="offer" 
          type="primary" 
          onClick={() => showConfirmModal('offered')}
          disabled={processingAction}
        >
          Đề nghị công việc
        </Button>,
        <Button 
          key="reject" 
          danger
          onClick={() => showConfirmModal('rejected')}
          disabled={processingAction}
        >
          Từ chối
        </Button>
      );
    } else if (application.status === 'offered') {
      actions.push(
        <Button 
          key="hire" 
          type="primary" 
          onClick={() => showConfirmModal('hired')}
          disabled={processingAction}
        >
          Xác nhận tuyển dụng
        </Button>
      );
    }
    
    return <Space>{actions}</Space>;
  };

  const handleResumePreview = () => {
    // Check if application has resume URL (either in resume.url or resumeUrl field)
    if (application?.resume?.url || application?.resumeUrl) {
      // Open resume URL in a new tab
      window.open(application?.resume?.url || application?.resumeUrl, '_blank');
    } else {
      message.error('Không tìm thấy CV của ứng viên');
    }
  };

  // Preview email function
  const handlePreviewEmail = () => {
    // Validate form fields
    emailForm.validateFields().then(values => {
      setEmailPreviewVisible(true);
    }).catch(error => {
      console.log('Validation failed:', error);
    });
  };

  if (loading) {
    return (
      <Card>
        <Skeleton active />
      </Card>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
        action={
          <Button type="primary" onClick={() => navigate('/employer/applications')}>
            Quay lại
          </Button>
        }
      />
    );
  }

  if (!application || !candidate || !job) {
    return (
      <Alert
        message="Không tìm thấy"
        description="Không tìm thấy thông tin đơn ứng tuyển"
        type="warning"
        showIcon
        action={
          <Button type="primary" onClick={() => navigate('/employer/applications')}>
            Quay lại
          </Button>
        }
      />
    );
  }

  return (
    <div className="application-detail-page">
      <Button 
        type="link" 
        icon={<LeftOutlined />} 
        onClick={() => navigate('/employer/applications')}
        style={{ marginBottom: 16, padding: 0 }}
      >
        Quay lại danh sách
      </Button>

      <Card className="mb-4">
        <Row>
          <Col xs={24} md={18}>
            <Title level={3}>
              Đơn ứng tuyển: {job.title}
            </Title>
            <Paragraph>
              <Space>
                <Text type="secondary">
                  Nộp vào: {moment(application.appliedAt).format('DD/MM/YYYY')}
                </Text>
                {application.reappliedAt && (
                  <Badge 
                    status="processing" 
                    text={`Nộp lại: ${moment(application.reappliedAt).format('DD/MM/YYYY')}`} 
                  />
                )}
              </Space>
            </Paragraph>
          </Col>
          <Col xs={24} md={6} className="text-right">
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              {getStatusTag(application.status)}
            </div>
          </Col>
        </Row>
        
        {application.status === 'withdrawn' && (
          <Alert
            message="Ứng viên đã rút hồ sơ"
            description="Ứng viên này đã rút hồ sơ ứng tuyển. Bạn có thể khôi phục đơn này nếu muốn tiếp tục xem xét."
            type="warning"
            showIcon
            className="mt-3"
          />
        )}
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card title="Thông tin ứng viên" className="mb-4">
            <div className="candidate-info">
              <Title level={4}>{candidate.firstName} {candidate.lastName}</Title>
              {candidate.email && (
                <Paragraph>
                  <MailOutlined className="mr-2" /> {candidate.email}
                </Paragraph>
              )}
              {candidate.phone && (
                <Paragraph>
                  <PhoneOutlined className="mr-2" /> {candidate.phone}
                </Paragraph>
              )}
              {candidate.location && (
                <Paragraph>
                  <EnvironmentOutlined className="mr-2" /> {
                    typeof candidate.location === 'object' ?
                      [
                        candidate.location.address,
                        candidate.location.city,
                        candidate.location.country
                      ].filter(Boolean).join(', ') :
                      candidate.location
                  }
                </Paragraph>
              )}
              
              <Divider />
              
              <div className="candidate-links">
                {(application?.resume?.url || application?.resumeUrl) && (
                  <Button 
                    type="primary" 
                    block 
                    className="mb-3" 
                    icon={<FileTextOutlined />}
                    onClick={handleResumePreview}
                  >
                    {application?.resume?.name || 'Xem CV ứng viên'}
                  </Button>
                )}
                {candidate.id && (
                  <Link to={`/employer/candidates/${candidate.id}`}>
                    <Button block>Xem hồ sơ chi tiết</Button>
                  </Link>
                )}
              </div>
            </div>
          </Card>

          <Card title="Thông tin công việc" className="mb-4">
            <Title level={5}>{job.title}</Title>
            <Paragraph>
              <EnvironmentOutlined /> {job.location ? 
                (typeof job.location === 'object' ? 
                  `${job.location.city || ''}, ${job.location.country || ''}`.replace(/(^,\s*|\s*,\s*$)/g, '') : 
                  job.location
                ) : 'Không có thông tin'}
            </Paragraph>
            <Paragraph>
              <DollarOutlined /> {formatSalary(job.salary)}
            </Paragraph>
            <Paragraph>
              <TeamOutlined /> {job.jobType || 'Không có thông tin'}
            </Paragraph>
            <Paragraph>
              <CalendarOutlined /> Hạn nộp: {moment(job.applicationDeadline).format('DD/MM/YYYY')}
            </Paragraph>
            
            <Divider />
            
            <Link to={`/employer/jobs/${job.id}`}>
              <Button block>Xem chi tiết công việc</Button>
            </Link>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Tabs defaultActiveKey="1">
            <TabPane tab="Thông tin ứng tuyển" key="1">
              {application.coverLetter && (
                <Card title="Thư giới thiệu" className="mb-4">
                  <Paragraph>{application.coverLetter}</Paragraph>
                </Card>
              )}
              
              {application.answers && application.answers.length > 0 && (
                <Card title="Câu trả lời" className="mb-4">
                  <List
                    itemLayout="vertical"
                    dataSource={application.answers}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          title={<Text strong>{item.question}</Text>}
                        />
                        <Paragraph style={{ marginLeft: 24 }}>{item.answer}</Paragraph>
                      </List.Item>
                    )}
                  />
                </Card>
              )}
            </TabPane>
            
            <TabPane tab="Lịch sử ứng tuyển" key="2">
              <Card title="Quá trình xử lý" className="mb-4">
                {renderApplicationHistory()}
              </Card>
            </TabPane>
          </Tabs>

          <Card title="Hành động" className="mb-4">
            {renderActionButtons()}
          </Card>
        </Col>
      </Row>

      {/* Email Modal */}
      <Modal
        title={emailType === 'offer' ? 'Gửi email mời phỏng vấn' : 'Gửi email từ chối'}
        open={emailModalVisible}
        onCancel={() => setEmailModalVisible(false)}
        footer={null}
        width={700}
        maskClosable={!processingAction}
        closable={!processingAction}
      >
        <Form 
          form={emailForm} 
          onFinish={handleSendEmail} 
          layout="vertical"
          ref={emailFormRef}
        >
          <Form.Item name="to" label="Người nhận">
            <Input readOnly />
          </Form.Item>
          <Form.Item 
            name="subject" 
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề email' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item 
            name="body" 
            label="Nội dung"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung email' }]}
          >
            <TextArea rows={12} />
          </Form.Item>
          <Form.Item className="text-right">
            <Space>
              <Button onClick={() => setEmailModalVisible(false)} disabled={processingAction}>Hủy</Button>
              <Button onClick={handlePreviewEmail} disabled={processingAction}>Xem trước</Button>
              <Button type="primary" htmlType="submit" loading={processingAction}>Gửi email</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Email Preview Modal */}
      <Modal
        title="Xem trước email"
        open={emailPreviewVisible}
        onCancel={() => setEmailPreviewVisible(false)}
        footer={[
          <Button key="back" onClick={() => setEmailPreviewVisible(false)}>
            Đóng
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={() => {
              setEmailPreviewVisible(false);
              emailForm.submit();
            }}
          >
            Gửi email
          </Button>,
        ]}
        width={700}
      >
        <div className="email-preview" style={{ padding: '20px', border: '1px solid #eee', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
          <div><strong>Người nhận:</strong> {emailForm.getFieldValue('to')}</div>
          <div style={{ marginTop: '10px' }}><strong>Tiêu đề:</strong> {emailForm.getFieldValue('subject')}</div>
          <Divider />
          <div style={{ marginTop: '10px', whiteSpace: 'pre-wrap' }}>
            {formatEmailContent(emailForm.getFieldValue('body'))}
          </div>
        </div>
      </Modal>
      
      {/* Confirm Action Modal */}
      <Modal
        title="Xác nhận thay đổi trạng thái"
        open={confirmModalVisible}
        onOk={handleConfirmAction}
        onCancel={() => setConfirmModalVisible(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ loading: processingAction }}
        cancelButtonProps={{ disabled: processingAction }}
      >
        {actionToConfirm === 'reviewing' && application.status === 'withdrawn' ? (
          <div>
            <p>Bạn có chắc chắn muốn khôi phục hồ sơ này và chuyển sang trạng thái "Đang xem xét"?</p>
            <Alert
              message="Lưu ý"
              description="Việc khôi phục hồ sơ sẽ được ghi nhận trong lịch sử ứng tuyển và ứng viên sẽ nhận được thông báo về việc hồ sơ của họ đang được xem xét."
              type="info"
              showIcon
            />
          </div>
        ) : (
          <div>
            <p>Bạn có chắc chắn muốn thay đổi trạng thái của đơn ứng tuyển này thành "{
              actionToConfirm === 'interviewing' ? 'Phỏng vấn' :
              actionToConfirm === 'offered' ? 'Đề nghị công việc' :
              actionToConfirm === 'hired' ? 'Tuyển dụng' :
              actionToConfirm === 'rejected' ? 'Từ chối' : actionToConfirm
            }"?</p>
            <Alert
              message="Lưu ý"
              description="Thay đổi này sẽ được ghi nhận trong lịch sử ứng tuyển và có thể không hoàn tác được."
              type="info"
              showIcon
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ApplicationDetailPage; 