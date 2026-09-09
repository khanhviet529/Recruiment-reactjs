import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Table, Tag, Button } from 'antd';
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
      
      // Lấy thông tin ứng viên trước để biết candidateId
      const candidateResponse = await axios.get(`http://localhost:5000/candidates?userId=${user.id}`);
      if (candidateResponse.data && candidateResponse.data.length > 0) {
        const candidateId = candidateResponse.data[0].id;
        
        // Đơn ứng tuyển được lưu theo users.id (không phải candidates.id)
        const applicationsResponse = await axios.get(`http://localhost:5000/applications?candidateId=${user.id}`);
        const applications = applicationsResponse.data || [];
        
        // Lấy thông tin chi tiết của mỗi công việc đã ứng tuyển để hiển thị
        const processedApplications = await Promise.all(applications.slice(0, 5).map(async (app) => {
          try {
            const jobResponse = await axios.get(`http://localhost:5000/jobs/${app.jobId}`);
            const job = jobResponse.data;
            
            // Lấy thông tin công ty
            // jobs.employerId chinh la users.id nen phai tim bang ?userId=
            const employerResponse = await axios.get(`http://localhost:5000/employers?userId=${job.employerId}`);
            const employer = employerResponse.data?.[0] || {};
            
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
          },
          {
            id: 3,
            jobId: 103,
            jobTitle: 'React Developer',
            companyName: 'Web Masters',
            appliedDate: '2023-06-20T00:00:00.000Z',
            status: 'rejected'
          }
        ]);
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

  const TILES = [
    { label: 'Đã ứng tuyển', value: stats.totalApplications, icon: <FileOutlined />,
      hint: 'Tổng số đơn bạn đã gửi' },
    { label: 'Đang chờ xử lý', value: stats.pendingApplications, icon: <ClockCircleOutlined />,
      hint: 'Nhà tuyển dụng chưa xem' },
    { label: 'Vào vòng đánh giá', value: stats.interviewApplications, icon: <TeamOutlined />,
      hint: 'Đang ở vòng phỏng vấn / đánh giá' },
    { label: 'Đã được nhận', value: stats.acceptedApplications, icon: <CheckCircleOutlined />,
      hint: 'Đơn được chấp nhận' },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Bảng điều khiển</h1>
          <p className="page-desc">Theo dõi tình trạng các đơn ứng tuyển của bạn</p>
        </div>
        <div className="page-actions">
          <Link to="/jobs"><Button type="primary">Tìm việc làm</Button></Link>
          <Link to="/candidate/applications"><Button>Xem tất cả đơn</Button></Link>
        </div>
      </div>

      <div className="stat-grid">
        {TILES.map((t) => (
          <div className="stat-tile" key={t.label}>
            <div className="stat-tile__label">{t.icon} {t.label}</div>
            <div className="stat-tile__value">{t.value}</div>
            <div className="stat-tile__hint">{t.hint}</div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel__head">
          <h2 className="panel__title">Đơn ứng tuyển gần đây</h2>
          <Link to="/candidate/applications">Xem tất cả</Link>
        </div>
        <div className="table-wrap">
          <Table
            columns={columns}
            dataSource={recentApplications}
            rowKey="id"
            loading={loading}
            pagination={false}
            locale={{ emptyText: 'Bạn chưa gửi đơn ứng tuyển nào' }}
          />
        </div>
      </div>
    </>
  );
};

export default CandidateDashboardPage;
