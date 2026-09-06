import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Card, Row, Col, Statistic, Progress, List, Button, Tag, Avatar, Typography, Spin, Alert } from 'antd';
import {
  FileOutlined,
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  VideoCameraOutlined,
  StarOutlined,
  TrophyOutlined,
  BellOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import moment from 'moment';

const { Title, Text } = Typography;

const CandidateDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalApplications: 0,
      pendingApplications: 0,
      interviewApplications: 0,
      acceptedApplications: 0,
      rejectedApplications: 0,
      profileCompleteness: 0
    },
    recentApplications: [],
    recommendedJobs: [],
    upcomingMeetings: [],
    recentActivities: []
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch applications for current candidate
      const applicationsResponse = await axios.get(`http://localhost:5000/applications?candidateId=${user.id}`);
      const applications = applicationsResponse.data || [];

      // Calculate application statistics
      const stats = {
        totalApplications: applications.length,
        pendingApplications: applications.filter(app => app.status === 'applied' || app.status === 'reviewing').length,
        interviewApplications: applications.filter(app => app.status === 'interviewing').length,
        acceptedApplications: applications.filter(app => app.status === 'hired' || app.status === 'accepted').length,
        rejectedApplications: applications.filter(app => app.status === 'rejected').length,
        profileCompleteness: calculateProfileCompleteness()
      };

      // Get recent applications (last 5)
      const recentApplications = applications
        .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
        .slice(0, 5);

      // Fetch recommended jobs (sample implementation)
      const jobsResponse = await axios.get('http://localhost:5000/jobs?status=active&_limit=5');
      const recommendedJobs = jobsResponse.data || [];

      // Fetch upcoming meetings
      const meetingsResponse = await axios.get(`http://localhost:5000/meetings`);
      const allMeetings = meetingsResponse.data || [];
      const upcomingMeetings = allMeetings
        .filter(meeting => {
          const participants = meeting.participants || [];
          const isParticipant = participants.some(p => p.userId === user.id);
          const isFuture = new Date(meeting.startTime) > new Date();
          return isParticipant && isFuture;
        })
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        .slice(0, 3);

      setDashboardData({
        stats,
        recentApplications,
        recommendedJobs,
        upcomingMeetings,
        recentActivities: generateRecentActivities(applications, upcomingMeetings)
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileCompleteness = () => {
    if (!user) return 0;
    
    let completedFields = 0;
    const totalFields = 10;

    if (user.firstName) completedFields++;
    if (user.lastName) completedFields++;
    if (user.email) completedFields++;
    if (user.phone) completedFields++;
    if (user.avatar) completedFields++;
    if (user.headline) completedFields++;
    if (user.summary) completedFields++;
    if (user.skills && user.skills.length > 0) completedFields++;
    if (user.experience && user.experience.length > 0) completedFields++;
    if (user.education && user.education.length > 0) completedFields++;

    return Math.round((completedFields / totalFields) * 100);
  };

  const generateRecentActivities = (applications, meetings) => {
    const activities = [];

    // Add recent applications
    applications.slice(0, 3).forEach(app => {
      activities.push({
        id: `app-${app.id}`,
        type: 'application',
        title: 'Ứng tuyển mới',
        description: `Đã ứng tuyển vào vị trí: ${app.jobTitle || 'N/A'}`,
        time: app.appliedAt,
        icon: <FileOutlined style={{ color: '#4f46e5' }} />
      });
    });

    // Add upcoming meetings
    meetings.forEach(meeting => {
      activities.push({
        id: `meeting-${meeting.id}`,
        type: 'meeting',
        title: 'Phỏng vấn sắp tới',
        description: meeting.title,
        time: meeting.startTime,
        icon: <VideoCameraOutlined style={{ color: '#059669' }} />
      });
    });

    return activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5);
  };

  const getStatusColor = (status) => {
    const colors = {
      'applied': 'blue',
      'reviewing': 'orange',
      'interviewing': 'purple',
      'hired': 'green',
      'accepted': 'green',
      'rejected': 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      'applied': 'Đã ứng tuyển',
      'reviewing': 'Đang xem xét',
      'interviewing': 'Phỏng vấn',
      'hired': 'Được tuyển',
      'accepted': 'Đã chấp nhận',
      'rejected': 'Bị từ chối'
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" tip="Đang tải dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
        style={{ margin: '20px 0' }}
      />
    );
  }

  return (
    <div className="candidate-dashboard">
      {/* Welcome Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          Chào mừng trở lại, {user?.firstName || user?.email}!
        </Title>
        <Text type="secondary">
          Đây là tổng quan về hoạt động tuyển dụng của bạn
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng đơn ứng tuyển"
              value={dashboardData.stats.totalApplications}
              prefix={<FileOutlined />}
              valueStyle={{ color: '#4f46e5' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đang chờ xử lý"
              value={dashboardData.stats.pendingApplications}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#d97706' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Phỏng vấn"
              value={dashboardData.stats.interviewApplications}
              prefix={<VideoCameraOutlined />}
              valueStyle={{ color: '#6366f1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Được chấp nhận"
              value={dashboardData.stats.acceptedApplications}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#059669' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Profile Completeness */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="Độ hoàn thiện hồ sơ" extra={<Link to="/candidate/profile">Cập nhật hồ sơ</Link>}>
            <Progress
              percent={dashboardData.stats.profileCompleteness}
              status={dashboardData.stats.profileCompleteness < 100 ? 'active' : 'success'}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
            <Text type="secondary">
              Hồ sơ hoàn thiện {dashboardData.stats.profileCompleteness}% sẽ giúp bạn có cơ hội được tuyển cao hơn
            </Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* Recent Applications */}
        <Col span={12}>
          <Card 
            title="Đơn ứng tuyển gần đây" 
            extra={<Link to="/candidate/applications">Xem tất cả</Link>}
            style={{ minHeight: 400 }}
          >
            {dashboardData.recentApplications.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={dashboardData.recentApplications}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Link to={`/candidate/applications/${item.id}`}>
                        <Button type="link" icon={<EyeOutlined />}>
                          Xem
                        </Button>
                      </Link>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<FileOutlined />} />}
                      title={item.jobTitle || 'Vị trí công việc'}
                      description={
                        <div>
                          <Tag color={getStatusColor(item.status)}>
                            {getStatusText(item.status)}
                          </Tag>
                          <br />
                          <Text type="secondary">
                            {moment(item.appliedAt).fromNow()}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <FileOutlined style={{ fontSize: 48, color: '#cbd5e1' }} />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">Chưa có đơn ứng tuyển nào</Text>
                </div>
                <Button type="primary" style={{ marginTop: 16 }}>
                  <Link to="/candidate/jobs">Tìm việc làm</Link>
                </Button>
              </div>
            )}
          </Card>
        </Col>

        {/* Recommended Jobs */}
        <Col span={12}>
          <Card 
            title="Việc làm đề xuất" 
            extra={<Link to="/candidate/jobs">Xem thêm</Link>}
            style={{ minHeight: 400 }}
          >
            {dashboardData.recommendedJobs.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={dashboardData.recommendedJobs}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Link to={`/candidate/jobs/${item.id}`}>
                        <Button type="link" icon={<EyeOutlined />}>
                          Xem
                        </Button>
                      </Link>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={item.title}
                      description={
                        <div>
                          <Text type="secondary">{item.companyName}</Text>
                          <br />
                          <Tag color="blue">{item.jobType}</Tag>
                          {item.salary && (
                            <Tag color="green">{item.salary.min} - {item.salary.max} {item.salary.currency}</Tag>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <StarOutlined style={{ fontSize: 48, color: '#cbd5e1' }} />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">Chưa có đề xuất nào</Text>
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Upcoming Meetings */}
      {dashboardData.upcomingMeetings.length > 0 && (
        <Row gutter={16} style={{ marginTop: 24 }}>
          <Col span={24}>
            <Card title="Phỏng vấn sắp tới" extra={<Link to="/candidate/meetings">Xem tất cả</Link>}>
              <List
                itemLayout="horizontal"
                dataSource={dashboardData.upcomingMeetings}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Link to={`/candidate/meetings/${item.id}`}>
                        <Button type="primary" icon={<VideoCameraOutlined />}>
                          Tham gia
                        </Button>
                      </Link>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<VideoCameraOutlined />} style={{ backgroundColor: '#059669' }} />}
                      title={item.title}
                      description={
                        <div>
                          <Text type="secondary">
                            {moment(item.startTime).format('DD/MM/YYYY HH:mm')}
                          </Text>
                          <br />
                          <Text type="secondary">{item.description}</Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Recent Activities */}
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Hoạt động gần đây">
            {dashboardData.recentActivities.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={dashboardData.recentActivities}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={item.icon}
                      title={item.title}
                      description={
                        <div>
                          {item.description}
                          <br />
                          <Text type="secondary">
                            {moment(item.time).fromNow()}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <BellOutlined style={{ fontSize: 48, color: '#cbd5e1' }} />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">Chưa có hoạt động nào</Text>
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CandidateDashboard;


