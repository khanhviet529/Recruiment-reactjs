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
  CloseCircleOutlined
} from '@ant-design/icons';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0,
    interviewsScheduled: 0,
    hiredCandidates: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, applicationsRes] = await Promise.all([
          axios.get(`http://localhost:5000/employers/${user.id}/stats`),
          axios.get(`http://localhost:5000/employers/${user.id}/applications?limit=5`)
        ]);
        
        setStats(statsRes.data);
        setRecentApplications(applicationsRes.data);
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
            <Button type="primary" icon={<FileOutlined />}>
              Đăng tin tuyển dụng
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
