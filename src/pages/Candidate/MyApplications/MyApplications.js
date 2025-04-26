import React, { useState, useEffect } from 'react';
import { 
  getApplicationsByCandidate, 
  getApplicationStats,
  withdrawApplication 
} from '../../../services/applicationService';
import { 
  Card, 
  Button, 
  Badge, 
  Modal, 
  message, 
  Timeline, 
  Statistic, 
  Row, 
  Col, 
  Empty,
  Spin,
  Tooltip
} from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  FileSearchOutlined,
  TeamOutlined,
  FileDoneOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import './myApplications.scss';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    interview: 0,
    offered: 0,
    rejected: 0,
    withdrawn: 0,
    hired: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [currentApplication, setCurrentApplication] = useState(null);

  // Get logged in user from localStorage
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const candidateId = user?.candidateId;

  useEffect(() => {
    const fetchData = async () => {
      if (!candidateId) {
        setError('User not found or not logged in as a candidate');
        setLoading(false);
        return;
      }

      try {
        // Fetch applications
        const appResult = await getApplicationsByCandidate(candidateId);
        if (appResult.success) {
          setApplications(appResult.applications);
        } else {
          setError(appResult.error || 'Failed to fetch applications');
        }

        // Fetch stats
        const statsResult = await getApplicationStats(candidateId);
        if (statsResult.success) {
          setStats(statsResult.stats);
        }
      } catch (err) {
        setError('An error occurred while fetching your applications');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [candidateId]);

  // Function to get the status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#faad14'; // warning
      case 'review':
        return '#1890ff'; // processing
      case 'interview':
        return '#722ed1'; // purple
      case 'offered':
        return '#52c41a'; // success
      case 'hired':
        return '#13c2c2'; // cyan
      case 'rejected':
        return '#f5222d'; // error
      case 'withdrawn':
        return '#d9d9d9'; // disabled
      default:
        return '#d9d9d9';
    }
  };

  // Function to get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'review':
        return 'Under Review';
      case 'interview':
        return 'Interview';
      case 'offered':
        return 'Offered';
      case 'hired':
        return 'Hired';
      case 'rejected':
        return 'Rejected';
      case 'withdrawn':
        return 'Withdrawn';
      default:
        return status;
    }
  };

  // Function to get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockCircleOutlined />;
      case 'review':
        return <FileSearchOutlined />;
      case 'interview':
        return <TeamOutlined />;
      case 'offered':
        return <FileDoneOutlined />;
      case 'hired':
        return <CheckCircleOutlined />;
      case 'rejected':
        return <CloseCircleOutlined />;
      case 'withdrawn':
        return <DeleteOutlined />;
      default:
        return <ExclamationCircleOutlined />;
    }
  };

  // Function to handle application withdrawal
  const handleWithdrawApplication = async () => {
    if (!currentApplication) return;

    try {
      setLoading(true);
      const result = await withdrawApplication(currentApplication.id);
      
      if (result.success) {
        // Update the application status in the list
        setApplications(applications.map(app => 
          app.id === currentApplication.id 
            ? { ...app, status: 'withdrawn' } 
            : app
        ));

        // Update stats
        setStats({
          ...stats,
          withdrawn: stats.withdrawn + 1,
          [currentApplication.status]: stats[currentApplication.status] - 1
        });

        message.success('Application withdrawn successfully');
      } else {
        message.error(result.error || 'Failed to withdraw application');
      }
    } catch (err) {
      message.error('An error occurred');
      console.error(err);
    } finally {
      setLoading(false);
      setWithdrawModalVisible(false);
      setCurrentApplication(null);
    }
  };

  // Function to show the withdrawal confirmation modal
  const showWithdrawModal = (application) => {
    setCurrentApplication(application);
    setWithdrawModalVisible(true);
  };

  if (loading) {
    return (
      <div className="my-applications-loading">
        <Spin size="large" />
        <p>Loading your applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-applications-error">
        <ExclamationCircleOutlined />
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="my-applications-container">
      <div className="my-applications-header">
        <h1>My Applications</h1>
        <p>Track the status of your job applications</p>
      </div>

      {applications.length === 0 ? (
        <div className="no-applications">
          <Empty 
            description="You haven't applied to any jobs yet" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
          <Button type="primary" href="/jobs">
            Find Jobs to Apply
          </Button>
        </div>
      ) : (
        <>
          <div className="application-stats">
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={8} md={6} lg={4}>
                <Card>
                  <Statistic 
                    title="Total Applications" 
                    value={stats.total} 
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8} md={6} lg={4}>
                <Card>
                  <Statistic 
                    title="Pending" 
                    value={stats.pending} 
                    valueStyle={{ color: '#faad14' }}
                    prefix={<ClockCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8} md={6} lg={4}>
                <Card>
                  <Statistic 
                    title="Under Review" 
                    value={stats.underReview} 
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<FileSearchOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8} md={6} lg={4}>
                <Card>
                  <Statistic 
                    title="Interviews" 
                    value={stats.interview} 
                    valueStyle={{ color: '#722ed1' }}
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8} md={6} lg={4}>
                <Card>
                  <Statistic 
                    title="Offered" 
                    value={stats.offered} 
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<FileDoneOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8} md={6} lg={4}>
                <Card>
                  <Statistic 
                    title="Rejected" 
                    value={stats.rejected} 
                    valueStyle={{ color: '#f5222d' }}
                    prefix={<CloseCircleOutlined />}
                  />
                </Card>
              </Col>
            </Row>
          </div>

          <div className="applications-list">
            {applications.map((application) => (
              <Card 
                key={application.id} 
                className="application-card"
                title={
                  <div className="application-card-title">
                    <div className="job-title">{application.job.title}</div>
                    <Badge 
                      color={getStatusColor(application.status)} 
                      text={getStatusText(application.status)}
                    />
                  </div>
                }
              >
                <div className="application-card-content">
                  <div className="company-info">
                    <div className="company-logo">
                      {application.job.employer.logo ? (
                        <img src={application.job.employer.logo} alt={application.job.employer.companyName} />
                      ) : (
                        <div className="default-logo">{application.job.employer.companyName.charAt(0)}</div>
                      )}
                    </div>
                    <div className="company-details">
                      <h3>{application.job.employer.companyName}</h3>
                      <p>{application.job.location}</p>
                    </div>
                  </div>

                  <div className="application-timeline">
                    <Timeline>
                      <Timeline.Item 
                        color="green" 
                        dot={<FileDoneOutlined style={{ fontSize: '16px' }} />}
                      >
                        Applied on {new Date(application.created_at).toLocaleDateString()}
                      </Timeline.Item>
                      {application.status !== 'pending' && (
                        <Timeline.Item 
                          color={getStatusColor(application.status)} 
                          dot={getStatusIcon(application.status)}
                        >
                          Status updated to {getStatusText(application.status)} on {new Date(application.updated_at).toLocaleDateString()}
                        </Timeline.Item>
                      )}
                    </Timeline>
                  </div>

                  <div className="application-actions">
                    <Button type="primary" href={`/jobs/${application.jobId}`}>
                      View Job
                    </Button>
                    {(application.status === 'pending' || application.status === 'review') && (
                      <Tooltip title="Withdraw your application">
                        <Button 
                          danger 
                          onClick={() => showWithdrawModal(application)}
                          disabled={loading}
                        >
                          Withdraw
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <Modal
        title="Withdraw Application"
        visible={withdrawModalVisible}
        onOk={handleWithdrawApplication}
        onCancel={() => setWithdrawModalVisible(false)}
        okText="Withdraw"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
        confirmLoading={loading}
      >
        <p>Are you sure you want to withdraw your application for "{currentApplication?.job.title}"?</p>
        <p>This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default MyApplications; 