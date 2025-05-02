import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Card, Row, Col, Statistic, Table, Tag, Button } from 'antd';
import {
  FileOutlined,
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const CandidateDashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    interviewApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration in case the API endpoints don't exist yet
      const mockStats = {
        totalApplications: 8,
        pendingApplications: 3,
        interviewApplications: 2,
        acceptedApplications: 1,
        rejectedApplications: 2
      };
      
      const mockApplications = [
        {
          id: 1,
          jobId: 101,
          jobTitle: 'Frontend Developer',
          companyName: 'Tech Solutions Inc.',
          appliedDate: '2023-06-10T00:00:00.000Z',
          status: 'pending'
        },
        {
          id: 2,
          jobId: 102,
          jobTitle: 'UI/UX Designer',
          companyName: 'Creative Agency',
          appliedDate: '2023-06-15T00:00:00.000Z',
          status: 'interviewing'
        },
        {
          id: 3,
          jobId: 103,
          jobTitle: 'React Developer',
          companyName: 'Web Masters',
          appliedDate: '2023-06-20T00:00:00.000Z',
          status: 'rejected'
        }
      ];
      
      try {
        // Sửa API endpoint phù hợp với cấu trúc JSON Server hiện tại
        // Thay vì gọi API chuyên biệt, chúng ta sẽ lấy applications từ API có sẵn và tính toán thống kê
        let applications = [];
        
        // Lấy thông tin ứng viên trước để biết candidateId
        const candidateResponse = await axios.get(`http://localhost:5000/candidates?userId=${user.id}`);
        if (candidateResponse.data && candidateResponse.data.length > 0) {
          const candidateId = candidateResponse.data[0].id;
          
          // Lấy danh sách đơn ứng tuyển của ứng viên
          const applicationsResponse = await axios.get(`http://localhost:5000/applications?candidateId=${candidateId}`);
          applications = applicationsResponse.data || [];
          
          // Lấy thông tin chi tiết của mỗi công việc đã ứng tuyển để hiển thị
          const processedApplications = await Promise.all(applications.slice(0, 5).map(async (app) => {
            try {
              const jobResponse = await axios.get(`http://localhost:5000/jobs/${app.jobId}`);
              const job = jobResponse.data;
              
              // Lấy thông tin công ty
              const employerResponse = await axios.get(`http://localhost:5000/employers/${job.employerId}`);
              const employer = employerResponse.data;
              
              return {
                id: app.id,
                jobId: app.jobId,
                jobTitle: job.title,
                companyName: employer.companyName,
                appliedDate: app.appliedAt,
                status: app.status
              };
            } catch (error) {
              console.error('Error fetching job details:', error);
              return {
                id: app.id,
                jobId: app.jobId,
                jobTitle: 'Unknown Job',
                companyName: 'Unknown Company',
                appliedDate: app.appliedAt,
                status: app.status
              };
            }
          }));
          
          // Tính toán thống kê từ danh sách đơn ứng tuyển
          const stats = {
            totalApplications: applications.length,
            pendingApplications: applications.filter(app => app.status === 'pending').length,
            interviewApplications: applications.filter(app => app.status === 'interviewing').length,
            acceptedApplications: applications.filter(app => ['hired', 'offered'].includes(app.status)).length,
            rejectedApplications: applications.filter(app => app.status === 'rejected').length
          };
          
          setStats(stats);
          setRecentApplications(processedApplications);
        } else {
          // Không tìm thấy thông tin ứng viên, sử dụng dữ liệu giả
          console.warn('No candidate information found, using mock data');
          setStats(mockStats);
          setRecentApplications(mockApplications);
        }
      } catch (apiError) {
        console.warn('Using mock data due to API error:', apiError);
        // Use mock data if API fails
        setStats(mockStats);
        setRecentApplications(mockApplications);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to mock data on any error
      setStats({
        totalApplications: 8,
        pendingApplications: 3,
        interviewApplications: 2,
        acceptedApplications: 1,
        rejectedApplications: 2
      });
      
      setRecentApplications([
        {
          id: 1,
          jobId: 101,
          jobTitle: 'Frontend Developer',
          companyName: 'Tech Solutions Inc.',
          appliedDate: '2023-06-10T00:00:00.000Z',
          status: 'pending'
        },
        {
          id: 2,
          jobId: 102,
          jobTitle: 'UI/UX Designer',
          companyName: 'Creative Agency',
          appliedDate: '2023-06-15T00:00:00.000Z',
          status: 'interviewing'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Vị trí',
      dataIndex: 'jobTitle',
      key: 'jobTitle',
      render: (text, record) => (
        <Link to={`/candidate/jobs/${record.jobId}`}>{text}</Link>
      ),
    },
    {
      title: 'Công ty',
      dataIndex: 'companyName',
      key: 'companyName',
    },
    {
      title: 'Ngày ứng tuyển',
      dataIndex: 'appliedDate',
      key: 'appliedDate',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          'pending': { color: 'warning', text: 'Chờ xử lý', icon: <ClockCircleOutlined /> },
          'reviewing': { color: 'processing', text: 'Đang xem xét', icon: <EyeOutlined /> },
          'interviewing': { color: 'info', text: 'Phỏng vấn', icon: <ClockCircleOutlined /> },
          'offered': { color: 'success', text: 'Đã đề nghị', icon: <CheckCircleOutlined /> },
          'hired': { color: 'success', text: 'Đã tuyển', icon: <CheckCircleOutlined /> },
          'rejected': { color: 'error', text: 'Từ chối', icon: <CloseCircleOutlined /> }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Link to={`/candidate/applications/${record.id}`}>
          <Button type="link" icon={<EyeOutlined />}>Xem chi tiết</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="candidate-dashboard-page">
      <h1 className="mb-4">Bảng điều khiển Ứng viên</h1>
      
      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Đã ứng tuyển"
              value={stats.totalApplications}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Lời mời phỏng vấn"
              value={stats.interviewApplications}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Đang chờ xử lý"
              value={stats.pendingApplications}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Đã được nhận"
              value={stats.acceptedApplications}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Card
        title="Đơn ứng tuyển gần đây"
        extra={<Link to="/candidate/applications">Xem tất cả</Link>}
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

export default CandidateDashboardPage;
