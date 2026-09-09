import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Table, Button } from 'antd';
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
        
        // Thử lấy dữ liệu từ API
        try {
          // Lấy dữ liệu về nhà tuyển dụng
          const employerResponse = await axios.get(`http://localhost:5000/employers?userId=${user.id}`);
          const employer = employerResponse.data[0];
          
          if (employer) {
            // Lấy tin tuyển dụng của nhà tuyển dụng
            // jobs.employerId luu theo users.id, khong phai employers.id
            const jobsResponse = await axios.get(`http://localhost:5000/jobs?employerId=${user.id}`);
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
              hiredCandidates: applications.filter(app => app.status === 'hired').length
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
            hiredCandidates: 1
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

  const TILES = [
    { label: 'Tin tuyển dụng', value: stats.totalJobs, icon: <FileOutlined />,
      hint: `${stats.activeJobs} tin đang hoạt động` },
    { label: 'Đơn ứng tuyển', value: stats.totalApplications, icon: <UserOutlined />,
      hint: `${stats.newApplications} đơn mới chưa xem` },
    { label: 'Đang đánh giá', value: stats.interviewsScheduled, icon: <ClockCircleOutlined />,
      hint: 'Ứng viên ở vòng phỏng vấn / đánh giá' },
    { label: 'Đã tuyển', value: stats.hiredCandidates, icon: <CheckCircleOutlined />,
      hint: 'Ứng viên đã nhận việc' },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Bảng điều khiển</h1>
          <p className="page-desc">Tổng quan tin tuyển dụng và đơn ứng tuyển của công ty</p>
        </div>
        <div className="page-actions">
          <Link to="/employer/jobs/new">
            <Button type="primary" icon={<FileOutlined />}>Đăng tin tuyển dụng</Button>
          </Link>
          <Link to="/employer/jobs"><Button>Quản lý tin</Button></Link>
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
          <Link to="/employer/applications">Xem tất cả</Link>
        </div>
        <div className="table-wrap">
          <Table
            columns={columns}
            dataSource={recentApplications}
            rowKey="id"
            loading={loading}
            pagination={false}
            locale={{ emptyText: 'Chưa có đơn ứng tuyển nào' }}
          />
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
