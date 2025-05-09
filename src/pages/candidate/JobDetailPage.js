import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  Card, 
  Button, 
  Typography, 
  Tag, 
  Divider, 
  Row, 
  Col, 
  Space, 
  Tooltip, 
  Avatar, 
  List,
  Drawer,
  Skeleton,
  message,
  Modal,
  Alert
} from 'antd';
import {
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  TeamOutlined,
  BankOutlined,
  BookOutlined,
  ExperimentOutlined,
  SendOutlined,
  HeartOutlined,
  HeartFilled,
  ShareAltOutlined,
  FilePdfOutlined,
  SyncOutlined,
  UploadOutlined
} from '@ant-design/icons';
import moment from 'moment';
import parse from 'html-react-parser';
import ApplicationForm from '../../components/candidate/Applications/ApplicationForm';
import CVUploader from '../../components/common/CVUploader';
import { CLOUDINARY_CONFIG } from '../../services/configService';

const { Title, Text, Paragraph } = Typography;

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  
  const [job, setJob] = useState(null);
  const [employer, setEmployer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [applyDrawerVisible, setApplyDrawerVisible] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [applicationSuccessVisible, setApplicationSuccessVisible] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [refreshingStatus, setRefreshingStatus] = useState(false);
  const [isReapplying, setIsReapplying] = useState(false);
  const [quickUploadModalVisible, setQuickUploadModalVisible] = useState(false);
  const [quickUploadCV, setQuickUploadCV] = useState(null);
  const [submittingQuickApplication, setSubmittingQuickApplication] = useState(false);
  
  // Check if the user is trying to reapply
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const reapply = searchParams.get('reapply');
    setIsReapplying(reapply === 'true');
    
    if (reapply === 'true' && user && !loading && job) {
      // Show application drawer immediately if reapplying
      setApplyDrawerVisible(true);
      // Remove the query param to avoid reopening on refresh
      navigate(`/jobs/${id}`, { replace: true });
    }
  }, [location, user, loading, job, id, navigate]);
  
  // Hàm riêng để cập nhật trạng thái ứng tuyển
  const refreshApplicationStatus = async () => {
    if (!user || !user.id) return;
    
    try {
      setRefreshingStatus(true);
      console.log('Refreshing application status for job:', id);
      
      const applicationsResponse = await axios.get(`http://localhost:5000/applications?candidateId=${user.id}&jobId=${id}`);
      const applications = applicationsResponse.data || [];
      console.log('Current applications:', applications);
      
      // Kiểm tra xem có đơn ứng tuyển nào không phải đã rút hồ sơ không
      const withdrawnApplications = applications.filter(app => app.status === 'withdrawn');
      const activeApplications = applications.filter(app => app.status !== 'withdrawn');
      
      console.log('Active applications:', activeApplications);
      console.log('Withdrawn applications:', withdrawnApplications);
      
      if (activeApplications.length > 0) {
        setHasApplied(true);
        console.log('After refresh - Setting hasApplied to TRUE - active application exists');
      } else {
        setHasApplied(false);
        console.log('After refresh - Setting hasApplied to FALSE - no active applications');
      }
    } catch (error) {
      console.error('Error refreshing application status:', error);
    } finally {
      setRefreshingStatus(false);
    }
  };
  
  // Fetch job details and check if saved
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch job details
        const jobResponse = await axios.get(`http://localhost:5000/jobs/${id}`);
        
        if (jobResponse.data) {
          setJob(jobResponse.data);
          
          // Fetch employer details
          const employerResponse = await axios.get(`http://localhost:5000/employers?userId=${jobResponse.data.employerId}`);
          setEmployer(employerResponse.data);
          
          // Check if the user has saved this job
          if (user && user.id) {
            try {
              // First get candidate ID
              const candidateResponse = await axios.get(`http://localhost:5000/candidates?userId=${user.id}`);
              
              if (candidateResponse.data && candidateResponse.data.length > 0) {
                const candidateId = candidateResponse.data[0].id;
                
                // Check if job is saved
                const savedJobsResponse = await axios.get(`http://localhost:5000/savedJobs?candidateId=${candidateId}&jobId=${id}`);
                setIsSaved(savedJobsResponse.data && savedJobsResponse.data.length > 0);
              }
            } catch (error) {
              console.error('Error checking saved job status:', error);
            }
            
            // Check if the user has already applied for this job
            await refreshApplicationStatus();
          }
        } else {
          message.error('Job not found');
          navigate('/jobs');
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
        message.error('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobDetails();
  }, [id, user, navigate]);
  
  // Toggle save job
  const handleToggleSaveJob = async () => {
    if (!user) {
      setLoginModalVisible(true);
      return;
    }
    
    try {
      // First get the candidate ID for current user
      const candidateResponse = await axios.get(`http://localhost:5000/candidates?userId=${user.id}`);
      
      if (!candidateResponse.data || candidateResponse.data.length === 0) {
        message.error('Không tìm thấy thông tin ứng viên');
        return;
      }
      
      const candidateId = candidateResponse.data[0].id;
      
      if (isSaved) {
        // Find saved job entry to delete
        const savedJobResponse = await axios.get(`http://localhost:5000/savedJobs?candidateId=${candidateId}&jobId=${id}`);
        
        if (savedJobResponse.data && savedJobResponse.data.length > 0) {
          // Remove from saved jobs
          await axios.delete(`http://localhost:5000/savedJobs/${savedJobResponse.data[0].id}`);
          message.success('Đã xóa công việc khỏi danh sách đã lưu');
          setIsSaved(false);
        }
      } else {
        // Add to saved jobs
        await axios.post(`http://localhost:5000/savedJobs`, {
          candidateId: candidateId,
          jobId: parseInt(id),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        message.success('Đã lưu công việc thành công');
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error toggling saved job:', error);
      message.error('Không thể cập nhật trạng thái lưu công việc');
    }
  };
  
  const handleManualRefresh = async () => {
    message.info('Đang cập nhật trạng thái ứng tuyển...');
    await refreshApplicationStatus();
    message.success('Đã cập nhật trạng thái ứng tuyển');
  };
  
  // Handle apply button click
  const handleApplyClick = async () => {
    if (!user) {
      setLoginModalVisible(true);
      return;
    }
    
    console.log('Apply button clicked, checking application status...');
    
    // Kiểm tra lại trạng thái ứng tuyển
    try {
      const applicationsResponse = await axios.get(`http://localhost:5000/applications?candidateId=${user.id}&jobId=${id}`);
      const applications = applicationsResponse.data || [];
      console.log('All applications for this job:', applications);
      
      // Nếu không có đơn nào, cho phép ứng tuyển
      if (applications.length === 0) {
        console.log('No existing applications, opening application form');
        setApplyDrawerVisible(true);
        return;
      }
      
      // Kiểm tra xem có đơn ứng tuyển nào không phải đã rút hồ sơ không
      const withdrawnApplications = applications.filter(app => app.status === 'withdrawn');
      const activeApplications = applications.filter(app => app.status !== 'withdrawn');
      
      console.log('Withdrawn applications:', withdrawnApplications);
      console.log('Active applications:', activeApplications);
      
      if (activeApplications.length > 0) {
        // Nếu có đơn ứng tuyển đang hoạt động, hiển thị thông báo chi tiết hơn
        const activeApplication = activeApplications[0];
        const statusText = {
          'pending': 'đang chờ xử lý',
          'reviewing': 'đang được xem xét',
          'interviewing': 'đã được mời phỏng vấn',
          'offered': 'đã được đề nghị việc làm',
          'hired': 'đã được tuyển dụng',
          'rejected': 'đã bị từ chối'
        }[activeApplication.status] || 'đang trong quá trình xử lý';
        
        console.log(`Found active application with status: ${activeApplication.status}, showing message`);
        message.info(`Bạn đã ứng tuyển vị trí này và đơn của bạn ${statusText}. Vui lòng kiểm tra trạng thái ứng tuyển trong trang cá nhân.`);
      } else {
        // Chỉ có đơn đã rút hồ sơ, cho phép ứng tuyển lại
        console.log('Only withdrawn applications found, opening application form');
        setApplyDrawerVisible(true);
      }
    } catch (error) {
      console.error('Error checking application status:', error);
      message.error('Có lỗi xảy ra khi kiểm tra trạng thái ứng tuyển. Vui lòng thử lại sau.');
    }
  };
  
  // Handle application success
  const handleApplicationSuccess = () => {
    setApplyDrawerVisible(false);
    setApplicationSuccessVisible(true);
    setHasApplied(true);
    refreshApplicationStatus();
  };
  
  // Redirect to login
  const handleLoginRedirect = () => {
    setLoginModalVisible(false);
    navigate('/login', { state: { returnUrl: `/jobs/${id}` } });
  };
  
  // Add a quick CV upload handler
  const handleQuickCVUploadSuccess = (result) => {
    if (result && result.url) {
      setQuickUploadCV({
        url: result.url,
        name: result.name || 'CV Document.pdf',
        uploadedAt: new Date().toISOString()
      });
      message.success('CV đã được tải lên thành công');
    }
  };

  const handleQuickApplicationSubmit = async () => {
    if (!quickUploadCV || !quickUploadCV.url) {
      message.error('Vui lòng tải lên CV trước khi ứng tuyển');
      return;
    }

    setSubmittingQuickApplication(true);

    try {
      // Get or verify candidate profile
      let candidateId = user.id;
      
      // Create application data with minimal information
      const applicationData = {
        jobId: parseInt(id),
        candidateId,
        appliedAt: new Date().toISOString(),
        status: 'pending',
        coverLetter: '',
        resume: {
          url: quickUploadCV.url,
          name: quickUploadCV.name || 'CV Document.pdf'
        },
        resumeUrl: quickUploadCV.url,
        answers: [],
        fullName: user.name,
        email: user.email,
        phone: '',
        stageHistory: [
          {
            stage: 1,
            enteredAt: new Date().toISOString(),
            exitedAt: null,
            notes: "Hồ sơ đang chờ xét duyệt (tải lên nhanh)."
          }
        ],
        currentStage: 1,
        updatedAt: new Date().toISOString()
      };

      // Submit application
      await axios.post('http://localhost:5000/applications', applicationData);
      
      setQuickUploadModalVisible(false);
      setQuickUploadCV(null);
      message.success('Nộp đơn ứng tuyển thành công');
      setApplicationSuccessVisible(true);
      setHasApplied(true);
      
      // Refresh application status
      await refreshApplicationStatus();
    } catch (error) {
      console.error('Error submitting quick application:', error);
      message.error('Không thể nộp đơn ứng tuyển. Vui lòng thử lại sau.');
    } finally {
      setSubmittingQuickApplication(false);
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="job-detail-page">
        <Card>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
        <Card className="mt-4">
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      </div>
    );
  }
  
  // Format currency function
  const formatCurrency = (amount, currency = 'VND') => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: currency,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Format salary range
  const formatSalaryRange = () => {
    if (!job.salary) return 'Negotiable';
    
    if (job.salary.isHidden) return 'Negotiable';
    
    return `${formatCurrency(job.salary.min, job.salary.currency)} - ${formatCurrency(job.salary.max, job.salary.currency)} (${job.salary.period})`;
  };
  
  return (
    <div className="job-detail-page">
      {/* Job Header Card */}
      <Card className="mb-4">
        <Row gutter={24} align="middle">
          <Col xs={24} sm={16}>
            <Title level={3} className="mb-2">{job.title}</Title>
            
            <Space className="mb-3">
              {employer && (
                <Text>
                  <BankOutlined /> {employer.companyName}
                </Text>
              )}
              
              <Text>
                <EnvironmentOutlined /> {job.location || 'Remote'}
              </Text>
              
              <Text>
                <DollarOutlined /> {formatSalaryRange()}
              </Text>
            </Space>
            
            <div className="mb-3">
              {job.isUrgent && (
                <Tag color="red" className="me-2">Khẩn cấp</Tag>
              )}
              
              {job.isFeatured && (
                <Tag color="gold" className="me-2">Nổi bật</Tag>
              )}
              
              <Tag color="blue" className="me-2">{job.jobType}</Tag>
              
              <Tag color="default" className="me-2">
                <CalendarOutlined /> Đăng {moment(job.postedAt).fromNow()}
              </Tag>
              
              <Tag color="orange">
                <ClockCircleOutlined /> Hết hạn {moment(job.applicationDeadline).format('DD/MM/YYYY')}
              </Tag>
            </div>
          </Col>
          
          <Col xs={24} sm={8} className="text-end">
            <Space direction="vertical" className="w-100">
              <Space>
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<SendOutlined />} 
                  onClick={handleApplyClick}
                  disabled={hasApplied || moment().isAfter(job.applicationDeadline) || job.status === 'paused'}
                  style={{ flexGrow: 1 }}
                >
                  {hasApplied ? 'Đã ứng tuyển' : job.status === 'paused' ? 'Tạm dừng tuyển dụng' : 'Ứng tuyển ngay'}
                </Button>
                
                <Tooltip title="Làm mới trạng thái ứng tuyển">
                  <Button
                    icon={<SyncOutlined spin={refreshingStatus} />}
                    onClick={handleManualRefresh}
                    disabled={refreshingStatus}
                  />
                </Tooltip>
                
                {!hasApplied && !moment().isAfter(job.applicationDeadline) && job.status !== 'paused' && (
                  <Tooltip title="Tải CV lên nhanh chóng">
                    <Button 
                      type="primary"
                      icon={<UploadOutlined />}
                      onClick={() => user ? setQuickUploadModalVisible(true) : setLoginModalVisible(true)}
                    >
                      Tải CV
                    </Button>
                  </Tooltip>
                )}
              </Space>
              
              <Button 
                type={isSaved ? "default" : "text"} 
                icon={isSaved ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />} 
                onClick={handleToggleSaveJob}
                block
              >
                {isSaved ? 'Đã lưu' : 'Lưu tin'}
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
      
      {/* Application deadline warning */}
      {moment().isAfter(job.applicationDeadline) && (
        <Alert 
          message="Tin tuyển dụng đã hết hạn" 
          description="Thời hạn ứng tuyển cho vị trí này đã kết thúc. Bạn không thể ứng tuyển cho vị trí này nữa."
          type="warning" 
          showIcon
          className="mb-4"
        />
      )}
      
      {/* Paused job warning */}
      {job.status === 'paused' && (
        <Alert 
          message="Tin tuyển dụng đang tạm dừng" 
          description={
            <div>
              <p>Tin tuyển dụng này hiện đang tạm dừng và không nhận đơn ứng tuyển mới.</p>
              {job.pauseReason && (
                <p><strong>Lý do tạm dừng:</strong> {job.pauseReason}</p>
              )}
              <p>Vui lòng kiểm tra lại sau hoặc tìm kiếm các vị trí tương tự.</p>
            </div>
          }
          type="warning" 
          showIcon
          className="mb-4"
        />
      )}
      
      {/* Main Content */}
      <Row gutter={24}>
        <Col xs={24} lg={16}>
          {/* Job Description */}
          <Card title="Mô tả công việc" className="mb-4">
            <div className="rich-text-content">
              {job.description && parse(job.description)}
            </div>
          </Card>
          
          {/* Responsibilities */}
          <Card title="Trách nhiệm" className="mb-4">
            <div className="rich-text-content">
              {job.responsibilities && parse(job.responsibilities)}
            </div>
          </Card>
          
          {/* Requirements */}
          <Card title="Yêu cầu" className="mb-4">
            <div className="rich-text-content">
              {job.requirements && parse(job.requirements)}
            </div>
          </Card>
          
          {/* Benefits */}
          <Card title="Quyền lợi" className="mb-4">
            <div className="rich-text-content">
              {job.benefits && parse(job.benefits)}
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          {/* Job Summary */}
          <Card title="Tóm tắt công việc" className="mb-4">
            <List
              itemLayout="horizontal"
              dataSource={[
                {
                  icon: <EnvironmentOutlined />,
                  title: 'Địa điểm',
                  content: job.location || 'Remote'
                },
                {
                  icon: <DollarOutlined />,
                  title: 'Mức lương',
                  content: formatSalaryRange()
                },
                {
                  icon: <TeamOutlined />,
                  title: 'Loại công việc',
                  content: job.jobType
                },
                {
                  icon: <BookOutlined />,
                  title: 'Kinh nghiệm',
                  content: `${job.minExperienceYears}+ năm`
                },
                {
                  icon: <ExperimentOutlined />,
                  title: 'Học vấn',
                  content: job.educationLevel
                },
                {
                  icon: <CalendarOutlined />,
                  title: 'Ngày đăng',
                  content: moment(job.postedAt).format('DD/MM/YYYY')
                },
                {
                  icon: <ClockCircleOutlined />,
                  title: 'Hạn nộp hồ sơ',
                  content: moment(job.applicationDeadline).format('DD/MM/YYYY')
                }
              ]}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={item.icon}
                    title={item.title}
                    description={item.content}
                  />
                </List.Item>
              )}
            />
          </Card>
          
          {/* Employer Info */}
          {employer && (
            <Card title="Về công ty" className="mb-4">
              <div className="text-center mb-3">
                {employer.logo ? (
                  <Avatar src={employer.logo} size={64} />
                ) : (
                  <Avatar size={64}>{employer.companyName?.charAt(0)}</Avatar>
                )}
                <Title level={4} className="mt-2">{employer.companyName}</Title>
              </div>
              
              <Paragraph ellipsis={{ rows: 4, expandable: true, symbol: 'xem thêm' }}>
                {employer.description || 'Không có mô tả công ty.'}
              </Paragraph>
              
              <Button type="link" block onClick={() => navigate(`/employers/${employer.id}`)}>
                Xem hồ sơ công ty
              </Button>
            </Card>
          )}
          
          {/* Skills & Tags */}
          {job.skills && job.skills.length > 0 && (
            <Card title="Kỹ năng" className="mb-4">
              <div>
                {job.skills.map(skill => (
                  <Tag key={skill} className="mb-1 me-1">{skill}</Tag>
                ))}
              </div>
            </Card>
          )}
        </Col>
      </Row>
      
      {/* Application Drawer */}
      <Drawer
        title={`Ứng tuyển cho: ${job.title}`}
        placement="right"
        width={720}
        onClose={() => setApplyDrawerVisible(false)}
        open={applyDrawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <ApplicationForm 
          jobId={id}
          jobTitle={job.title}
          companyName={employer?.companyName}
          questions={job.questions || []}
          onSuccess={handleApplicationSuccess}
          onCancel={() => setApplyDrawerVisible(false)}
        />
      </Drawer>
      
      {/* Login Modal */}
      <Modal
        title="Yêu cầu đăng nhập"
        open={loginModalVisible}
        onCancel={() => setLoginModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setLoginModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="login" type="primary" onClick={handleLoginRedirect}>
            Đăng nhập
          </Button>
        ]}
      >
        <p>Bạn cần đăng nhập để ứng tuyển công việc này.</p>
      </Modal>
      
      {/* Application Success Modal */}
      <Modal
        title="Đã nộp đơn ứng tuyển!"
        open={applicationSuccessVisible}
        onCancel={() => setApplicationSuccessVisible(false)}
        footer={[
          <Button 
            key="applications" 
            type="primary" 
            onClick={() => {
              setApplicationSuccessVisible(false);
              navigate('/candidate/applications');
            }}
          >
            Xem đơn ứng tuyển của tôi
          </Button>,
          <Button 
            key="close" 
            onClick={() => setApplicationSuccessVisible(false)}
          >
            Đóng
          </Button>
        ]}
      >
        <div className="text-center">
          <FilePdfOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
          <p>Đơn ứng tuyển và CV của bạn đã được gửi thành công!</p>
          <p>Bạn có thể theo dõi trạng thái đơn ứng tuyển trong trang quản lý của mình.</p>
        </div>
      </Modal>
      
      {/* Quick CV Upload Modal */}
      <Modal
        title="Tải CV lên nhanh chóng"
        open={quickUploadModalVisible}
        onCancel={() => setQuickUploadModalVisible(false)}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => setQuickUploadModalVisible(false)}
            disabled={submittingQuickApplication}
          >
            Hủy
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={handleQuickApplicationSubmit}
            loading={submittingQuickApplication}
            disabled={!quickUploadCV}
          >
            Nộp CV và ứng tuyển
          </Button>
        ]}
      >
        <p>Tải lên CV của bạn để ứng tuyển nhanh chóng cho vị trí "{job?.title}".</p>
        <p>Thông tin cá nhân sẽ được lấy từ tài khoản của bạn.</p>
        
        <CVUploader 
          onUploadSuccess={handleQuickCVUploadSuccess}
          onUploadError={() => message.error('Lỗi khi tải CV lên. Vui lòng thử lại.')}
          uploadPreset={CLOUDINARY_CONFIG.uploadPresets.pdf}
          maxSize={10}
          disabled={submittingQuickApplication}
        />
      </Modal>
    </div>
  );
};

export default JobDetailPage;
