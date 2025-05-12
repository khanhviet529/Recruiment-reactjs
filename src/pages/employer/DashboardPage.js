import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Statistic, Table, Button } from 'antd';
import {
  FileOutlined,
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0,
    interviewsScheduled: 0,
    hiredCandidates: 0,
    upcomingMeetings: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Thử lấy dữ liệu từ API
        try {
          // Lấy dữ liệu về nhà tuyển dụng
          const employerResponse = await axios.get(`http://localhost:5000/employers?userId=${user.id}`);
          const employer = employerResponse.data[0];
          
          if (employer) {
            // Lấy tin tuyển dụng của nhà tuyển dụng
            const jobsResponse = await axios.get(`http://localhost:5000/jobs?employerId=${employer.id}`);
            const jobs = jobsResponse.data || [];
            
            // Lấy đơn ứng tuyển cho các công việc của nhà tuyển dụng
            const jobIds = jobs.map(job => job.id);
            let applications = [];
            
            if (jobIds.length > 0) {
              // Lấy tất cả đơn ứng tuyển
              const allApplicationsResponse = await axios.get(`http://localhost:5000/applications`);
              // Lọc ra các đơn ứng tuyển thuộc về công việc của nhà tuyển dụng
              applications = allApplicationsResponse.data.filter(app => jobIds.includes(app.jobId)) || [];
            }
            
            // Lấy thông tin cuộc họp sắp tới
            const now = new Date().toISOString();
            const meetingsResponse = await axios.get(`http://localhost:5000/meetings`);
            const allMeetings = meetingsResponse.data || [];
            
            // Lọc cuộc họp liên quan đến nhà tuyển dụng này
            const employerMeetings = allMeetings.filter(meeting => 
              meeting.participants.some(p => p.userId === user.id && p.userType === 'employer')
            );
            
            // Đếm số cuộc họp sắp tới
            const upcomingMeetings = employerMeetings.filter(meeting => 
              meeting.startTime > now
            ).length;
            
            // Lấy 5 đơn ứng tuyển gần đây nhất
            const recentApplications = await Promise.all(
              applications.slice(0, 5).map(async (app) => {
                try {
                  // Lấy thông tin công việc
                  const job = jobs.find(j => j.id === app.jobId) || {};
                  
                  // Lấy thông tin ứng viên
                  const candidateResponse = await axios.get(`http://localhost:5000/candidates?id=${app.candidateId}`);
                  const candidate = candidateResponse.data[0] || {};
                  
                  // Lấy thông tin user của ứng viên
                  const userResponse = await axios.get(`http://localhost:5000/users?id=${candidate.userId}`);
                  const userCandidate = userResponse.data[0] || {};
                  
                  return {
                    id: app.id,
                    candidateId: app.candidateId,
                    candidateName: `${candidate.firstName || ''} ${candidate.lastName || ''}`,
                    jobId: app.jobId,
                    jobTitle: job.title || 'Không xác định',
                    appliedDate: app.appliedAt || app.createdAt,
                    status: app.status || 'pending'
                  };
                } catch (error) {
                  console.error('Error processing application:', error);
                  return {
                    id: app.id,
                    candidateId: app.candidateId,
                    candidateName: 'Unknown',
                    jobId: app.jobId,
                    jobTitle: 'Unknown',
                    appliedDate: app.appliedAt || app.createdAt,
                    status: app.status || 'pending'
                  };
                }
              })
            );
            
            // Cập nhật thống kê
            setStats({
              totalJobs: jobs.length,
              activeJobs: jobs.filter(job => job.status === 'active').length,
              totalApplications: applications.length,
              newApplications: applications.filter(app => app.status === 'applied').length,
              interviewsScheduled: applications.filter(app => app.status === 'interviewing').length,
              hiredCandidates: applications.filter(app => app.status === 'hired').length,
              upcomingMeetings: upcomingMeetings
            });
            
            setRecentApplications(recentApplications);
          }
        } catch (error) {
          console.error('Error fetching data from API:', error);
          // Fallback to mock data if API fails
          setStats({
            totalJobs: 5,
            activeJobs: 3,
            totalApplications: 12,
            newApplications: 4,
            interviewsScheduled: 2,
            hiredCandidates: 1,
            upcomingMeetings: 2
          });
          
          setRecentApplications([
            {
              id: 1,
              candidateName: 'Nguyễn Văn A',
              jobTitle: 'Frontend Developer',
              appliedDate: new Date().toISOString(),
              status: 'pending'
            },
            {
              id: 2,
              candidateName: 'Trần Thị B',
              jobTitle: 'UX Designer',
              appliedDate: new Date().toISOString(),
              status: 'interviewing'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.id) {
      fetchDashboardData();
    }
  }, [user]);

  const columns = [
    {
      title: 'Ứng viên',
      dataIndex: 'candidateName',
      key: 'candidateName',
    },
    {
      title: 'Vị trí',
      dataIndex: 'jobTitle',
      key: 'jobTitle',
    },
    {
      title: 'Ngày nộp',
      dataIndex: 'appliedDate',
      key: 'appliedDate',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          'pending': { color: 'warning', text: 'Chờ xử lý' },
          'reviewing': { color: 'processing', text: 'Đang xem xét' },
          'interviewing': { color: 'info', text: 'Phỏng vấn' },
          'offered': { color: 'success', text: 'Đã đề nghị' },
          'hired': { color: 'success', text: 'Đã tuyển' },
          'rejected': { color: 'error', text: 'Từ chối' }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <span className={`text-${config.color}`}>{config.text}</span>;
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Link to={`/employer/applications/${record.id}`}>
          <Button type="link">Xem chi tiết</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="employer-dashboard">
      <div className="dashboard-header mb-4">
        <h2>Bảng điều khiển</h2>
        <div className="quick-actions">
          <Link to="/employer/jobs/new">
            <Button type="primary" icon={<FileOutlined />} className="me-2">
              Đăng tin tuyển dụng
            </Button>
          </Link>
          <Link to="/employer/meetings/create">
            <Button type="primary" icon={<VideoCameraOutlined />}>
              Tạo cuộc họp
            </Button>
          </Link>
        </div>
      </div>

      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Tổng số tin tuyển dụng"
              value={stats.totalJobs}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Tin đang hoạt động"
              value={stats.activeJobs}
              prefix={<FileOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Tổng số đơn ứng tuyển"
              value={stats.totalApplications}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Đơn mới"
              value={stats.newApplications}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Lịch phỏng vấn"
              value={stats.interviewsScheduled}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Ứng viên đã tuyển"
              value={stats.hiredCandidates}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Cuộc họp sắp tới"
              value={stats.upcomingMeetings || 0}
              prefix={<VideoCameraOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div className="statistic-footer">
              <Link to="/employer/meetings">Xem lịch họp</Link>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title="Đơn ứng tuyển gần đây"
        extra={<Link to="/employer/applications">Xem tất cả</Link>}
      >
        <Table
          columns={columns}
          dataSource={recentApplications}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default DashboardPage;
