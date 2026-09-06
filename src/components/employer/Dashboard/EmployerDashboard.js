import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Card, Row, Col, Statistic, List, Button, Tag, Avatar, Typography, Spin, Alert, Progress, Tooltip } from 'antd';
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
  BellOutlined,
  PlusOutlined,
  BarChartOutlined,
  RiseOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import moment from 'moment';

const { Title, Text } = Typography;

const EmployerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalJobs: 0,
      activeJobs: 0,
      totalApplications: 0,
      newApplications: 0,
      interviewsScheduled: 0,
      hiredCandidates: 0,
      companProfileCompleteness: 0
    },
    recentJobs: [],
    recentApplications: [],
    upcomingMeetings: [],
    topPerformingJobs: [],
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

      // Fetch jobs for current employer
      const jobsResponse = await axios.get(`http://localhost:5000/jobs?employerId=${user.id}`);
      const jobs = jobsResponse.data || [];

      // Fetch all applications for employer's jobs
      const applicationsResponse = await axios.get('http://localhost:5000/applications');
      const allApplications = applicationsResponse.data || [];
      
      // Filter applications for this employer's jobs
      const jobIds = jobs.map(job => job.id);
      const employerApplications = allApplications.filter(app => jobIds.includes(app.jobId));

      // Calculate statistics
      const stats = {
        totalJobs: jobs.length,
        activeJobs: jobs.filter(job => job.status === 'active').length,
        totalApplications: employerApplications.length,
        newApplications: employerApplications.filter(app => 
          app.status === 'applied' && 
          moment(app.appliedAt).isAfter(moment().subtract(7, 'days'))
        ).length,
        interviewsScheduled: employerApplications.filter(app => app.status === 'interviewing').length,
        hiredCandidates: employerApplications.filter(app => 
          app.status === 'hired' || app.status === 'accepted'
        ).length,
        companyProfileCompleteness: calculateCompanyProfileCompleteness()
      };

      // Get recent jobs (last 5)
      const recentJobs = jobs
        .sort((a, b) => new Date(b.postedAt || b.createdAt) - new Date(a.postedAt || a.createdAt))
        .slice(0, 5);

      // Get recent applications (last 10)
      const recentApplications = employerApplications
        .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
        .slice(0, 10);

      // Fetch upcoming meetings
      const meetingsResponse = await axios.get(`http://localhost:5000/meetings`);
      const allMeetings = meetingsResponse.data || [];
      const upcomingMeetings = allMeetings
        .filter(meeting => {
          const isOrganizer = meeting.organizerId === user.id;
          const isFuture = new Date(meeting.startTime) > new Date();
          return isOrganizer && isFuture;
        })
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        .slice(0, 5);

      // Calculate top performing jobs
      const topPerformingJobs = jobs
        .map(job => {
          const jobApplications = employerApplications.filter(app => app.jobId === job.id);
          return {
            ...job,
            applicationCount: jobApplications.length,
            hiredCount: jobApplications.filter(app => 
              app.status === 'hired' || app.status === 'accepted'
            ).length
          };
        })
        .sort((a, b) => b.applicationCount - a.applicationCount)
        .slice(0, 5);

      setDashboardData({
        stats,
        recentJobs,
        recentApplications,
        upcomingMeetings,
        topPerformingJobs,
        recentActivities: generateRecentActivities(employerApplications, upcomingMeetings, recentJobs)
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const calculateCompanyProfileCompleteness = () => {
    if (!user) return 0;
    
    let completedFields = 0;
    const totalFields = 8;

    if (user.companyName) completedFields++;
    if (user.email) completedFields++;
    if (user.phone) completedFields++;
    if (user.logo) completedFields++;
    if (user.description) completedFields++;
    if (user.industry) completedFields++;
    if (user.website) completedFields++;
    if (user.location) completedFields++;

    return Math.round((completedFields / totalFields) * 100);
  };

  const generateRecentActivities = (applications, meetings, jobs) => {
    const activities = [];

    // Add recent applications
    applications.slice(0, 3).forEach(app => {
      activities.push({
        id: `app-${app.id}`,
        type: 'application',
        title: 'Đơn ứng tuyển mới',
        description: `${app.candidateName || 'Ứng viên'} đã ứng tuyển vào vị trí: ${app.jobTitle || 'N/A'}`,
        time: app.appliedAt,
        icon: <FileOutlined style={{ color: '#4f46e5' }} />
      });
    });

    // Add upcoming meetings
    meetings.slice(0, 2).forEach(meeting => {
      activities.push({
        id: `meeting-${meeting.id}`,
        type: 'meeting',
        title: 'Phỏng vấn sắp tới',
        description: meeting.title,
        time: meeting.startTime,
        icon: <VideoCameraOutlined style={{ color: '#059669' }} />
      });
    });

    // Add recent job postings
    jobs.slice(0, 2).forEach(job => {
      activities.push({
        id: `job-${job.id}`,
        type: 'job',
        title: 'Tin tuyển dụng mới',
        description: `Đã đăng tin tuyển dụng: ${job.title}`,
        time: job.postedAt || job.createdAt,
        icon: <PlusOutlined style={{ color: '#6366f1' }} />
      });
    });

    return activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 8);
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
      'applied': 'Mới ứng tuyển',
      'reviewing': 'Đang xem xét',
      'interviewing': 'Phỏng vấn',
      'hired': 'Đã tuyển',
      'accepted': 'Đã chấp nhận',
      'rejected': 'Đã từ chối'
    };
    return texts[status] || status;
  };

  const getJobStatusColor = (status) => {
    const colors = {
      'active': 'green',
      'paused': 'orange',
      'closed': 'red',
      'draft': 'blue'
    };
    return colors[status] || 'default';
  };

  const getJobStatusText = (status) => {
    const texts = {
      'active': 'Đang tuyển',
      'paused': 'Tạm dừng',
      'closed': 'Đã đóng',
      'draft': 'Bản nháp'
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
    <div className="employer-dashboard">
      {/* Welcome Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          Chào mừng, {user?.companyName || user?.email}!
        </Title>
        <Text type="secondary">
          Quản lý hoạt động tuyển dụng của công ty bạn
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tin tuyển dụng"
              value={dashboardData.stats.totalJobs}
              prefix={<FileOutlined />}
              valueStyle={{ color: '#4f46e5' }}
            />
            <Text type="secondary">
              {dashboardData.stats.activeJobs} đang hoạt động
            </Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng ứng tuyển"
              value={dashboardData.stats.totalApplications}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#059669' }}
            />
            <Text type="secondary">
              {dashboardData.stats.newApplications} mới trong tuần
            </Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đang phỏng vấn"
              value={dashboardData.stats.interviewsScheduled}
              prefix={<VideoCameraOutlined />}
              valueStyle={{ color: '#6366f1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã tuyển dụng"
              value={dashboardData.stats.hiredCandidates}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#059669' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Company Profile Completeness */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="Độ hoàn thiện hồ sơ công ty" extra={<Link to="/employer/profile">Cập nhật hồ sơ</Link>}>
            <Progress
              percent={dashboardData.stats.companyProfileCompleteness}
              status={dashboardData.stats.companyProfileCompleteness < 100 ? 'active' : 'success'}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
            <Text type="secondary">
              Hồ sơ công ty hoàn thiện {dashboardData.stats.companyProfileCompleteness}% sẽ thu hút nhiều ứng viên chất lượng hơn
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="Tác vụ nhanh">
            <Row gutter={16}>
              <Col span={6}>
                <Link to="/employer/jobs/new">
                  <Button type="primary" icon={<PlusOutlined />} size="large" style={{ width: '100%' }}>
                    Đăng tin tuyển dụng
                  </Button>
                </Link>
              </Col>
              <Col span={6}>
                <Link to="/employer/applications">
                  <Button icon={<UserOutlined />} size="large" style={{ width: '100%' }}>
                    Xem ứng viên
                  </Button>
                </Link>
              </Col>
              <Col span={6}>
                <Link to="/employer/meetings/create">
                  <Button icon={<VideoCameraOutlined />} size="large" style={{ width: '100%' }}>
                    Tạo phỏng vấn
                  </Button>
                </Link>
              </Col>
              <Col span={6}>
                <Link to="/employer/reports">
                  <Button icon={<BarChartOutlined />} size="large" style={{ width: '100%' }}>
                    Xem báo cáo
                  </Button>
                </Link>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* Recent Applications */}
        <Col span={12}>
          <Card 
            title="Đơn ứng tuyển gần đây" 
            extra={<Link to="/employer/applications">Xem tất cả</Link>}
            style={{ minHeight: 400 }}
          >
            {dashboardData.recentApplications.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={dashboardData.recentApplications}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Link to={`/employer/applications/${item.id}`}>
                        <Button type="link" icon={<EyeOutlined />}>
                          Xem
                        </Button>
                      </Link>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={item.candidateName || 'Ứng viên'}
                      description={
                        <div>
                          <Text type="secondary">{item.jobTitle || 'Vị trí công việc'}</Text>
                          <br />
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
                <UserOutlined style={{ fontSize: 48, color: '#cbd5e1' }} />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">Chưa có đơn ứng tuyển nào</Text>
                </div>
                <Button type="primary" style={{ marginTop: 16 }}>
                  <Link to="/employer/jobs/new">Đăng tin tuyển dụng</Link>
                </Button>
              </div>
            )}
          </Card>
        </Col>

        {/* Recent Jobs */}
        <Col span={12}>
          <Card 
            title="Tin tuyển dụng gần đây" 
            extra={<Link to="/employer/jobs">Xem tất cả</Link>}
            style={{ minHeight: 400 }}
          >
            {dashboardData.recentJobs.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={dashboardData.recentJobs}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Link to={`/employer/jobs/${item.id}`}>
                        <Button type="link" icon={<EyeOutlined />}>
                          Xem
                        </Button>
                      </Link>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<FileOutlined />} />}
                      title={item.title}
                      description={
                        <div>
                          <Tag color={getJobStatusColor(item.status)}>
                            {getJobStatusText(item.status)}
                          </Tag>
                          <br />
                          <Text type="secondary">
                            Đăng {moment(item.postedAt || item.createdAt).fromNow()}
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
                  <Text type="secondary">Chưa có tin tuyển dụng nào</Text>
                </div>
                <Button type="primary" style={{ marginTop: 16 }}>
                  <Link to="/employer/jobs/new">Đăng tin đầu tiên</Link>
                </Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Top Performing Jobs */}
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="Tin tuyển dụng nổi bật" extra={<Link to="/employer/reports">Xem báo cáo</Link>}>
            {dashboardData.topPerformingJobs.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={dashboardData.topPerformingJobs}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<TrophyOutlined />} style={{ backgroundColor: '#d97706' }} />}
                      title={item.title}
                      description={
                        <div>
                          <Text strong>{item.applicationCount}</Text> ứng viên • 
                          <Text strong style={{ color: '#059669' }}> {item.hiredCount}</Text> đã tuyển
                          <br />
                          <Progress 
                            percent={item.applicationCount > 0 ? (item.hiredCount / item.applicationCount * 100) : 0} 
                            size="small" 
                            showInfo={false}
                          />
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <BarChartOutlined style={{ fontSize: 48, color: '#cbd5e1' }} />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">Chưa có dữ liệu thống kê</Text>
                </div>
              </div>
            )}
          </Card>
        </Col>

        {/* Upcoming Meetings */}
        <Col span={12}>
          <Card title="Phỏng vấn sắp tới" extra={<Link to="/employer/meetings">Xem tất cả</Link>}>
            {dashboardData.upcomingMeetings.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={dashboardData.upcomingMeetings}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Link to={`/employer/meetings/${item.id}`}>
                        <Button type="primary" icon={<VideoCameraOutlined />} size="small">
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
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <VideoCameraOutlined style={{ fontSize: 48, color: '#cbd5e1' }} />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">Chưa có phỏng vấn nào</Text>
                </div>
                <Button type="primary" style={{ marginTop: 16 }}>
                  <Link to="/employer/meetings/create">Tạo phỏng vấn</Link>
                </Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>

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

export default EmployerDashboard;


