import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  List, 
  Button, 
  Typography, 
  Spin, 
  Alert, 
  Timeline,
  Divider,
  Collapse,
  Badge
} from 'antd';
import { 
  UserOutlined, 
  FileTextOutlined, 
  TeamOutlined, 
  SolutionOutlined,
  RiseOutlined,
  DollarOutlined,
  BellOutlined,
  CheckCircleOutlined,
  MessageOutlined,
  ReloadOutlined,
  DownOutlined,
  RightOutlined,
  CalendarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Item: TimelineItem } = Timeline;
const { Panel } = Collapse;

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    users: {
      total: 0,
      employers: 0,
      candidates: 0,
      growthRate: 0
    },
    jobs: {
      total: 0,
      active: 0,
      growthRate: 0
    },
    applications: {
      total: 0,
      pending: 0,
      interviewing: 0,
      growthRate: 0
    },
    messages: {
      total: 0,
      unread: 0
    }
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [expandedItems, setExpandedItems] = useState({
    years: {},
    months: {},
    days: {}
  });
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all data in parallel
      const [
        usersResponse, 
        jobsResponse, 
        applicationsResponse, 
        messagesResponse
      ] = await Promise.all([
        axios.get('http://localhost:5000/users'),
        axios.get('http://localhost:5000/jobs'),
        axios.get('http://localhost:5000/applications'),
        axios.get('http://localhost:5000/messages')
      ]);
      
      // Process users data - loại bỏ admin
      const allUsers = usersResponse.data || [];
      const users = allUsers.filter(user => user.role !== 'admin');
      const employers = users.filter(user => user.role === 'employer').length;
      const candidates = users.filter(user => user.role === 'applicant').length;
      
      // Calculate user growth (compare current month with previous month)
      const userGrowthRate = calculateGrowthRate(users, 'createdAt');
      
      // Process jobs data
      const jobs = jobsResponse.data || [];
      const activeJobs = jobs.filter(job => job.status === 'active').length;
      const jobGrowthRate = calculateGrowthRate(jobs, 'postedAt');
      
      // Process applications data
      const applications = applicationsResponse.data || [];
      const pendingApplications = applications.filter(app => 
        app.status === 'applied' || app.status === 'reviewing'
      ).length;
      const interviewingApplications = applications.filter(app => 
        app.status === 'interviewing'
      ).length;
      const applicationGrowthRate = calculateGrowthRate(applications, 'appliedAt');
      
      // Process messages data
      const messages = messagesResponse.data || [];
      const unreadMessages = messages.filter(msg => !msg.read).length;
      
      // Set statistics
      setStats({
        users: {
          total: users.length,
          employers,
          candidates,
          growthRate: userGrowthRate
        },
        jobs: {
          total: jobs.length,
          active: activeJobs,
          growthRate: jobGrowthRate
        },
        applications: {
          total: applications.length,
          pending: pendingApplications,
          interviewing: interviewingApplications,
          growthRate: applicationGrowthRate
        },
        messages: {
          total: messages.length,
          unread: unreadMessages
        }
      });
      
      // Gather recent activities
      const activities = [];
      
      // Recent user registrations (excluding admins)
      const recentUsers = [...users]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      
      recentUsers.forEach(user => {
        activities.push({
          id: `user-${user.id}`,
          content: `${user.fullName || user.email} đã đăng ký tài khoản mới`,
          userType: user.role,
          timestamp: user.createdAt,
          type: 'user_registration'
        });
      });
      
      // Recent job postings
      const recentJobs = [...jobs]
        .sort((a, b) => new Date(b.postedAt || b.createdAt) - new Date(a.postedAt || a.createdAt))
        .slice(0, 5);
      
      recentJobs.forEach(job => {
        // Find employer name for this job
        const employer = allUsers.find(user => user.id === job.employerId);
        activities.push({
          id: `job-${job.id}`,
          content: `${employer?.fullName || 'Một nhà tuyển dụng'} đã đăng tin tuyển dụng "${job.title}"`,
          userType: 'employer',
          timestamp: job.postedAt || job.createdAt,
          type: 'job_posting'
        });
      });
      
      // Recent applications
      const recentApplications = [...applications]
        .sort((a, b) => new Date(b.appliedAt || b.createdAt) - new Date(a.appliedAt || a.createdAt))
        .slice(0, 5);
      
      recentApplications.forEach(app => {
        const candidate = allUsers.find(user => user.id === app.candidateId);
        const job = jobs.find(job => job.id === app.jobId);
        
        activities.push({
          id: `app-${app.id}`,
          content: `${candidate?.fullName || 'Một ứng viên'} đã ứng tuyển vào vị trí "${job?.title || 'Unknown'}"`,
          userType: 'candidate',
          timestamp: app.appliedAt || app.createdAt,
          type: 'application'
        });
      });
      
      // Sort all activities by timestamp (newest first)
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10); // Get top 10 most recent activities
      
      setRecentActivities(sortedActivities);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Không thể tải dữ liệu bảng điều khiển. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to calculate growth rate
  const calculateGrowthRate = (data, dateField) => {
    // Current month data
    const currentMonth = moment().startOf('month');
    const lastMonth = moment().subtract(1, 'months').startOf('month');
    
    const currentMonthData = data.filter(item => 
      moment(item[dateField] || item.createdAt).isAfter(currentMonth)
    ).length;
    
    const lastMonthData = data.filter(item => 
      moment(item[dateField] || item.createdAt).isBetween(lastMonth, currentMonth)
    ).length;
    
    if (lastMonthData === 0) {
      return currentMonthData > 0 ? 100 : 0; // If last month had 0, and we have data now, that's 100% growth
    }
    
    return ((currentMonthData - lastMonthData) / lastMonthData * 100).toFixed(1);
  };
  
  // Format the relative time
  const formatRelativeTime = (timestamp) => {
    const time = moment(timestamp);
    return time.fromNow();
  };
  
  // Prepare initial expansion state after fetching data
  useEffect(() => {
    if (recentActivities.length > 0) {
      initializeExpandedState();
    }
  }, [recentActivities]);
  
  // Initialize expanded state based on most recent data
  const initializeExpandedState = () => {
    const mostRecentActivity = [...recentActivities].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    )[0];
    
    if (mostRecentActivity) {
      const date = moment(mostRecentActivity.timestamp);
      const yearKey = date.format('YYYY');
      const monthKey = date.format('YYYY-MM');
      const dayKey = date.format('YYYY-MM-DD');
      
      setExpandedItems({
        years: { [yearKey]: true },
        months: { [monthKey]: true },
        days: { [dayKey]: true }
      });
    }
  };
  
  // Format date for grouping
  const formatDate = (timestamp) => {
    const date = moment(timestamp);
    const today = moment().startOf('day');
    const yesterday = moment().subtract(1, 'day').startOf('day');
    
    if (date.isSame(today, 'day')) {
      return 'Hôm nay';
    } else if (date.isSame(yesterday, 'day')) {
      return 'Hôm qua';
    } else {
      return date.format('DD/MM/YYYY');
    }
  };
  
  // Hierarchical grouping of activities
  const groupActivitiesHierarchically = (activities) => {
    const hierarchy = {};
    
    activities.forEach(activity => {
      const date = moment(activity.timestamp);
      const year = date.format('YYYY');
      const month = date.format('MM');
      const day = date.format('DD');
      const dayKey = date.format('YYYY-MM-DD');
      
      // Create year level if not exists
      if (!hierarchy[year]) {
        hierarchy[year] = {
          label: `Năm ${year}`,
          key: year,
          months: {}
        };
      }
      
      // Create month level if not exists
      if (!hierarchy[year].months[month]) {
        hierarchy[year].months[month] = {
          label: `Tháng ${month}/${year}`,
          key: `${year}-${month}`,
          days: {}
        };
      }
      
      // Create day level if not exists
      const dayLabel = formatDate(activity.timestamp);
      if (!hierarchy[year].months[month].days[day]) {
        hierarchy[year].months[month].days[day] = {
          label: dayLabel,
          key: dayKey,
          activities: []
        };
      }
      
      // Add activity to the day
      hierarchy[year].months[month].days[day].activities.push(activity);
    });
    
    return hierarchy;
  };
  
  // Handle toggling expansion for different levels
  const toggleExpand = (level, key) => {
    setExpandedItems(prev => ({
      ...prev,
      [level]: {
        ...prev[level],
        [key]: !prev[level][key]
      }
    }));
  };
  
  // Check if an item is expanded
  const isExpanded = (level, key) => {
    return !!expandedItems[level][key];
  };
  
  // Get appropriate icon for activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_registration':
        return <UserOutlined style={{ color: '#1890ff' }} />;
      case 'job_posting':
        return <FileTextOutlined style={{ color: '#52c41a' }} />;
      case 'application':
        return <SolutionOutlined style={{ color: '#faad14' }} />;
      default:
        return <BellOutlined style={{ color: '#722ed1' }} />;
    }
  };
  
  // Get appropriate color for growth trend
  const getGrowthColor = (value) => {
    if (parseFloat(value) > 0) return '#52c41a';  // positive - green
    if (parseFloat(value) < 0) return '#f5222d';  // negative - red
    return '#faad14'; // zero - yellow
  };
  
  // Get appropriate icon for growth trend
  const getGrowthIcon = (value) => {
    if (parseFloat(value) >= 0) return <RiseOutlined />;
    return <RiseOutlined rotate={180} />;
  };
  
  return (
    <div className="admin-dashboard-page">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>Bảng điều khiển</Title>
        
        <Button 
          type="primary" 
          icon={<ReloadOutlined />} 
          onClick={fetchDashboardData}
          loading={loading}
        >
          Làm mới
        </Button>
      </div>
      
      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tổng người dùng"
                  value={stats.users.total}
                  prefix={<UserOutlined />}
                  suffix={
                    <Text type="secondary" style={{ fontSize: '0.8em' }}>
                      <span style={{ color: getGrowthColor(stats.users.growthRate) }}>
                        {getGrowthIcon(stats.users.growthRate)} {stats.users.growthRate}%
                      </span>
                    </Text>
                  }
                />
                <Text type="secondary">
                  {stats.users.employers} nhà tuyển dụng, {stats.users.candidates} ứng viên
                </Text>
              </Card>
            </Col>
            
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tin tuyển dụng"
                  value={stats.jobs.total}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                  suffix={
                    <Text type="secondary" style={{ fontSize: '0.8em' }}>
                      <span style={{ color: getGrowthColor(stats.jobs.growthRate) }}>
                        {getGrowthIcon(stats.jobs.growthRate)} {stats.jobs.growthRate}%
                      </span>
                    </Text>
                  }
                />
                <Text type="secondary">
                  {stats.jobs.active} tin đang hoạt động
                </Text>
              </Card>
            </Col>
            
            <Col span={6}>
              <Card>
                <Statistic
                  title="Đơn ứng tuyển"
                  value={stats.applications.total}
                  prefix={<SolutionOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                  suffix={
                    <Text type="secondary" style={{ fontSize: '0.8em' }}>
                      <span style={{ color: getGrowthColor(stats.applications.growthRate) }}>
                        {getGrowthIcon(stats.applications.growthRate)} {stats.applications.growthRate}%
                      </span>
                    </Text>
                  }
                />
                <Text type="secondary">
                  {stats.applications.pending} đang chờ, {stats.applications.interviewing} đang phỏng vấn
                </Text>
              </Card>
            </Col>
            
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tin nhắn hỗ trợ"
                  value={stats.messages.total}
                  prefix={<MessageOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
                <Text type="secondary">
                  {stats.messages.unread} tin nhắn chưa đọc
                </Text>
              </Card>
            </Col>
          </Row>
          
          <Row gutter={16}>
            {/* Recent Activities */}
            <Col span={16}>
              <Card title="Hoạt động gần đây" style={{ minHeight: 500, overflow: 'auto' }}>
                {recentActivities.length > 0 ? (
                  <div className="timeline-tree">
                    {Object.values(groupActivitiesHierarchically(recentActivities)).map(year => {
                      const yearExpanded = isExpanded('years', year.key);
                      const totalActivitiesInYear = Object.values(year.months).reduce((total, month) => 
                        total + Object.values(month.days).reduce((t, day) => 
                          t + day.activities.length, 0), 0
                      );
                      
                      return (
                        <div key={year.key} className="year-group" style={{ marginBottom: 16 }}>
                          {/* Year header */}
                          <div 
                            className="year-header" 
                            onClick={() => toggleExpand('years', year.key)}
                            style={{ 
                              cursor: 'pointer',
                              padding: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              fontWeight: 'bold',
                              backgroundColor: '#fafafa',
                              borderRadius: '4px',
                              marginBottom: yearExpanded ? 8 : 0
                            }}
                          >
                            {yearExpanded ? 
                              <DownOutlined style={{ marginRight: 8 }} /> : 
                              <RightOutlined style={{ marginRight: 8 }} />
                            }
                            <Text strong style={{ fontSize: '16px' }}>{year.label}</Text>
                            <Badge count={totalActivitiesInYear} style={{ marginLeft: 8, backgroundColor: '#52c41a' }} />
                          </div>
                          
                          {yearExpanded && (
                            <div className="months-container" style={{ marginLeft: 20 }}>
                              {Object.values(year.months).map(month => {
                                const monthExpanded = isExpanded('months', month.key);
                                const totalActivitiesInMonth = Object.values(month.days).reduce((total, day) => 
                                  total + day.activities.length, 0
                                );
                                
                                return (
                                  <div key={month.key} className="month-group" style={{ marginBottom: 12 }}>
                                    {/* Month header */}
                                    <div 
                                      className="month-header" 
                                      onClick={() => toggleExpand('months', month.key)}
                                      style={{ 
                                        cursor: 'pointer',
                                        padding: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        fontWeight: 'bold',
                                        backgroundColor: '#f0f0f0',
                                        borderRadius: '4px',
                                        marginBottom: monthExpanded ? 8 : 0
                                      }}
                                    >
                                      {monthExpanded ? 
                                        <DownOutlined style={{ marginRight: 8 }} /> : 
                                        <RightOutlined style={{ marginRight: 8 }} />
                                      }
                                      <Text strong>{month.label}</Text>
                                      <Badge count={totalActivitiesInMonth} style={{ marginLeft: 8, backgroundColor: '#1890ff' }} />
                                    </div>
                                    
                                    {monthExpanded && (
                                      <div className="days-container" style={{ marginLeft: 20 }}>
                                        {Object.values(month.days).map(day => {
                                          const dayExpanded = isExpanded('days', day.key);
                                          
                                          return (
                                            <div key={day.key} className="day-group" style={{ marginBottom: 8 }}>
                                              {/* Day header */}
                                              <div 
                                                className="day-header" 
                                                onClick={() => toggleExpand('days', day.key)}
                                                style={{ 
                                                  cursor: 'pointer',
                                                  padding: '6px',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  fontWeight: 'bold',
                                                  backgroundColor: '#e6f7ff',
                                                  borderRadius: '4px',
                                                  marginBottom: dayExpanded ? 8 : 0
                                                }}
                                              >
                                                {dayExpanded ? 
                                                  <DownOutlined style={{ marginRight: 8 }} /> : 
                                                  <RightOutlined style={{ marginRight: 8 }} />
                                                }
                                                <CalendarOutlined style={{ marginRight: 8 }} />
                                                <Text strong>{day.label}</Text>
                                                <Badge count={day.activities.length} style={{ marginLeft: 8 }} />
                                              </div>
                                              
                                              {dayExpanded && (
                                                <Timeline style={{ margin: '8px 0 16px 24px' }}>
                                                  {day.activities.map(activity => (
                                                    <TimelineItem 
                                                      key={activity.id} 
                                                      dot={getActivityIcon(activity.type)}
                                                    >
                                                      <div>
                                                        <Text strong>{activity.content}</Text>
                                                        <div>
                                                          <ClockCircleOutlined style={{ fontSize: '12px', marginRight: 4 }} />
                                                          <Text type="secondary">{moment(activity.timestamp).format('HH:mm')}</Text>
                                                        </div>
                                                      </div>
                                                    </TimelineItem>
                                                  ))}
                                                </Timeline>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Text type="secondary">Không có hoạt động nào gần đây</Text>
                  </div>
                )}
              </Card>
            </Col>
            
            {/* Quick Actions */}
            <Col span={8}>
              <Card title="Tác vụ nhanh" style={{ marginBottom: 24 }}>
                <List
                  size="large"
                  bordered={false}
                  dataSource={[
                    { icon: <UserOutlined />, text: 'Quản lý người dùng', link: '/admin/users' },
                    { icon: <FileTextOutlined />, text: 'Quản lý tin tuyển dụng', link: '/admin/jobs' },
                    { icon: <MessageOutlined />, text: 'Xem tin nhắn hỗ trợ', link: '/admin/messages' },
                    { icon: <CheckCircleOutlined />, text: 'Duyệt tin tuyển dụng mới', link: '/admin/jobs' },
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <Button 
                        type="link" 
                        icon={item.icon}
                        href={item.link}
                        style={{ textAlign: 'left', width: '100%' }}
                      >
                        {item.text}
                      </Button>
                    </List.Item>
                  )}
                />
              </Card>
              
              <Card title="Thống kê tháng này">
                <Statistic
                  title="Tin tuyển dụng mới"
                  value={calculateMonthlyStats(stats.jobs)}
                  suffix="tin"
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<RiseOutlined />}
                  style={{ marginBottom: 16 }}
                />
                
                <Statistic
                  title="Ứng viên đăng ký mới"
                  value={calculateMonthlyStats(stats.users, 'candidates')}
                  suffix="người"
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<TeamOutlined />}
                  style={{ marginBottom: 16 }}
                />
                
                <Statistic
                  title="Đơn ứng tuyển mới"
                  value={calculateMonthlyStats(stats.applications)}
                  suffix="đơn"
                  valueStyle={{ color: '#722ed1' }}
                  prefix={<SolutionOutlined />}
                />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

// Helper function to calculate monthly statistics
const calculateMonthlyStats = (statObject, subField = null) => {
  const currentMonth = moment().startOf('month');
  const growth = parseFloat(statObject.growthRate || 0);
  
  // We don't have the exact monthly count, so we'll estimate based on growth rate
  // and current total - this is a simple approximation
  const total = subField ? statObject[subField] : statObject.total;
  
  // Assuming the growth percentage represents roughly the percentage of items added this month
  return Math.round((growth / 100) * total);
};

export default AdminDashboardPage;
