import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import {
  Button,
  Spin,
  Typography,
  Alert,
  Tag,
  Card,
  Divider,
  Drawer,
  Modal,
  message
} from 'antd';
import {
  EnvironmentOutlined,
  BankOutlined,
  DollarOutlined,
  CalendarOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  SendOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  FilePdfOutlined
} from '@ant-design/icons';
import ApplicationForm from '../components/candidate/Applications/ApplicationForm';

const { Title, Paragraph, Text } = Typography;

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [job, setJob] = useState(null);
  const [employer, setEmployer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Application states
  const [applyDrawerVisible, setApplyDrawerVisible] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [applicationSuccessVisible, setApplicationSuccessVisible] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching job with ID:', id);
        
        // Fetch job details
        const jobResponse = await axios.get(`http://localhost:5000/jobs/${id}`);
        console.log('Job data:', jobResponse.data);
        setJob(jobResponse.data);

        // Fetch employer details
        if (jobResponse.data.employerId) {
          try {
            const employerResponse = await axios.get(`http://localhost:5000/employers?userId=${jobResponse.data.employerId}`);
            console.log('Employer data:', employerResponse.data);
            // Fix: Handle array response properly
            if (employerResponse.data && employerResponse.data.length > 0) {
              setEmployer(employerResponse.data[0]);
            } else {
              setEmployer(null);
            }
          } catch (empError) {
            console.warn('Could not fetch employer data:', empError);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching job data:', err);
        setError('Không thể tải thông tin công việc');
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Enhanced apply handler with full logic
  const handleApply = async () => {
    console.log('=== APPLY BUTTON CLICKED ===');
    console.log('User object:', user);
    console.log('Job ID:', id);
    console.log('Is authenticated:', isAuthenticated);
    
    if (!isAuthenticated || !user) {
      console.log('User not logged in, showing login modal');
      setLoginModalVisible(true);
      return;
    }
    
    console.log('User is logged in, user ID:', user.id);
    console.log('Checking application status...');
    
    // Check application status
    try {
      const applicationsResponse = await axios.get(`http://localhost:5000/applications?candidateId=${user.id}&jobId=${id}`);
      console.log('Applications API response:', applicationsResponse);
      const applications = applicationsResponse.data || [];
      console.log('All applications for this job:', applications);
      
      // If no applications, allow applying
      if (applications.length === 0) {
        console.log('No existing applications, opening application form');
        console.log('Setting applyDrawerVisible to true...');
        setApplyDrawerVisible(true);
        console.log('ApplyDrawerVisible should now be true');
        return;
      }
      
      // Check for withdrawn vs active applications
      const withdrawnApplications = applications.filter(app => app.status === 'withdrawn');
      const activeApplications = applications.filter(app => app.status !== 'withdrawn');
      
      console.log('Withdrawn applications:', withdrawnApplications);
      console.log('Active applications:', activeApplications);
      
      if (activeApplications.length > 0) {
        // If has active application, show status message
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
        setHasApplied(true);
      } else {
        // Only withdrawn applications, allow reapplying
        console.log('Only withdrawn applications found, opening application form');
        console.log('Setting applyDrawerVisible to true...');
        setApplyDrawerVisible(true);
        console.log('ApplyDrawerVisible should now be true');
      }
    } catch (error) {
      console.error('Error checking application status:', error);
      console.log('Error details:', error.response || error.message || error);
      
      // If error checking applications, still allow applying
      console.log('Due to error, allowing application anyway');
      setApplyDrawerVisible(true);
      
      message.warning('Không thể kiểm tra trạng thái ứng tuyển. Bạn vẫn có thể ứng tuyển.');
    }
  };

  // Handle application success
  const handleApplicationSuccess = () => {
    setApplyDrawerVisible(false);
    setApplicationSuccessVisible(true);
    setHasApplied(true);
  };
  
  // Handle login redirect
  const handleLoginRedirect = () => {
    setLoginModalVisible(false);
    navigate('/auth/login', {
      state: { from: `/jobs/${id}`, message: 'Vui lòng đăng nhập để ứng tuyển công việc này' }
    });
  };

  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return 'Thỏa thuận';
    if (salary.min && salary.max) {
      return `${salary.min.toLocaleString()} - ${salary.max.toLocaleString()} ${salary.currency || 'VND'}`;
    }
    return `${(salary.min || salary.max).toLocaleString()} ${salary.currency || 'VND'}`;
  };

  // Safe render for arrays
  const renderList = (items, title) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return (
        <Card title={title} style={{ marginBottom: 16 }}>
          <Text type="secondary">Không có thông tin</Text>
        </Card>
      );
    }

    return (
      <Card title={title} style={{ marginBottom: 16 }}>
        <ul>
          {items.map((item, index) => (
            <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      </Card>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Đang tải thông tin công việc...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '50px' }}>
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          action={
            <Button onClick={() => navigate('/jobs')} type="primary">
              Quay lại danh sách công việc
            </Button>
          }
        />
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ padding: '50px' }}>
        <Alert
          message="Không tìm thấy công việc"
          description="Công việc này có thể đã bị xóa hoặc không tồn tại."
          type="warning"
          showIcon
          action={
            <Button onClick={() => navigate('/jobs')} type="primary">
              Quay lại danh sách công việc
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div className="container">
        {/* Job Header */}
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <Title level={2}>{job.title || 'Tiêu đề công việc'}</Title>
              {employer && (
                <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                  {employer.companyName}
                </Text>
              )}
              <div style={{ margin: '10px 0' }}>
                <Tag icon={<EnvironmentOutlined />}>
                  {job.location || 'Không xác định'} {job.isRemote && "(Remote)"}
                </Tag>
                <Tag icon={<BankOutlined />}>
                  {job.jobType || 'Không xác định'}
                </Tag>
                <Tag icon={<DollarOutlined />}>
                  {formatSalary(job.salary)}
                </Tag>
                {job.isUrgent && (
                  <Tag color="red" icon={<ClockCircleOutlined />}>
                    Tuyển gấp
                  </Tag>
                )}
              </div>
              {job.applicationDeadline && (
                <div style={{ marginTop: 10 }}>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  <Text>Hạn nộp: {new Date(job.applicationDeadline).toLocaleDateString('vi-VN')}</Text>
                </div>
              )}
              {job.skills && Array.isArray(job.skills) && job.skills.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  {job.skills.slice(0, 5).map((skill, index) => (
                    <Tag key={index} color="blue">
                      {skill}
                    </Tag>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Button
                type="primary"
                size="large"
                icon={<SendOutlined />}
                onClick={handleApply}
              >
                Ứng tuyển ngay
              </Button>
            </div>
          </div>
        </Card>

        {/* Job Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          {/* Main content */}
          <div>
            {/* Description */}
            <Card title={<><FileTextOutlined /> Mô tả công việc</>} style={{ marginBottom: 16 }}>
              <Paragraph>
                <div dangerouslySetInnerHTML={{ __html: job.description || 'Không có mô tả' }} />
              </Paragraph>
            </Card>

            {/* Requirements */}
            {renderList(job.requirements, <><InfoCircleOutlined /> Yêu cầu công việc</>)}

            {/* Benefits */}
            {renderList(job.benefits, <><CheckCircleOutlined /> Quyền lợi</>)}

            {/* Responsibilities (if exists) */}
            {job.responsibilities && renderList(job.responsibilities, <><CheckCircleOutlined /> Trách nhiệm công việc</>)}
          </div>

          {/* Sidebar */}
          <div>
            <Card title="Thông tin ứng tuyển">
              <div style={{ marginBottom: 12 }}>
                <Text strong>Số lượng tuyển: </Text>
                <Text>{job.positions || 1} người</Text>
              </div>
              <div style={{ marginBottom: 12 }}>
                <Text strong>Cấp bậc: </Text>
                <Text>{job.experienceLevel || "Không xác định"}</Text>
              </div>
              <div style={{ marginBottom: 12 }}>
                <Text strong>Kinh nghiệm: </Text>
                <Text>{job.minExperienceYears || 0} năm</Text>
              </div>
              <div style={{ marginBottom: 12 }}>
                <Text strong>Học vấn: </Text>
                <Text>{job.educationLevel || "Không yêu cầu"}</Text>
              </div>
              <Divider />
              <Button type="primary" block icon={<SendOutlined />} onClick={handleApply}>
                Ứng tuyển ngay
              </Button>
            </Card>

            {employer && (
              <Card title="Thông tin công ty" style={{ marginTop: 16 }}>
                <div style={{ textAlign: 'center', marginBottom: 12 }}>
                  {employer.logo && (
                    <img 
                      src={employer.logo} 
                      alt={employer.companyName}
                      style={{ width: 60, height: 60, borderRadius: 8 }}
                    />
                  )}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>{employer.companyName}</Text>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary">{employer.industry || "Không có thông tin ngành nghề"}</Text>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary">{employer.companySize || "Không có thông tin quy mô"}</Text>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Application Drawer */}
      <Drawer
        title={`Ứng tuyển cho: ${job?.title}`}
        placement="right"
        width={720}
        onClose={() => setApplyDrawerVisible(false)}
        open={applyDrawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
      >
        {console.log('Drawer render - applyDrawerVisible:', applyDrawerVisible)}
        {console.log('Passing jobId to ApplicationForm:', id, 'Type:', typeof id)}
        <ApplicationForm 
          jobId={id}
          jobTitle={job?.title}
          companyName={employer?.companyName}
          questions={job?.questions || []}
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
        <div style={{ textAlign: 'center' }}>
          <FilePdfOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
          <p>Đơn ứng tuyển và CV của bạn đã được gửi thành công!</p>
          <p>Bạn có thể theo dõi trạng thái đơn ứng tuyển trong trang quản lý của mình.</p>
        </div>
      </Modal>
    </div>
  );
};

export default JobDetail; 