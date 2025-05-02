import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Table, Button, Space, Tag, Input, Select, Card, Modal, message, Tooltip, Badge } from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ClockCircleOutlined,
  RedoOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

const ApplicationsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    jobId: 'all'
  });
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState({});
  const [filterSummary, setFilterSummary] = useState({});

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [filters]);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/jobs`, {
        params: {
          employerId: user.id
        }
      });
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      // First, get all jobs for this employer
      const jobsResponse = await axios.get(`http://localhost:5000/jobs`, {
        params: {
          employerId: user.id
        }
      });
      
      const employerJobs = jobsResponse.data;
      const employerJobIds = employerJobs.map(job => job.id);
      setJobs(employerJobs);
      
      // Now get applications for these jobs
      const response = await axios.get(`http://localhost:5000/applications`, {
        params: {
          ...(employerJobIds.length > 0 ? { jobId: employerJobIds } : {}),
          status: filters.status !== 'all' ? filters.status : undefined,
          q: filters.search || undefined,
          ...(filters.jobId !== 'all' ? { jobId: filters.jobId } : {}),
          _sort: 'appliedAt',
          _order: 'desc'
        }
      });

      const applications = response.data;
      
      // Get unique candidate IDs
      const candidateIds = [...new Set(applications.map(app => app.candidateId))];
      
      // Fetch candidate info for all applications
      const candidatesData = {};
      await Promise.all(
        candidateIds.map(async (candidateId) => {
          try {
            const candidateResponse = await axios.get(`http://localhost:5000/candidates?userId=${candidateId}`);
            candidatesData[candidateId] = candidateResponse.data;
          } catch (err) {
            console.error(`Error fetching candidate ${candidateId}:`, err);
            candidatesData[candidateId] = { firstName: 'Unknown', lastName: 'Candidate' };
          }
        })
      );
      
      setCandidates(candidatesData);
      
      // Get status summary
      const statusCounts = applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {});
      
      setFilterSummary({
        total: applications.length,
        ...statusCounts
      });
      
      // Map applications with candidate names and job titles
      const mappedApplications = applications.map(app => {
        const candidate = candidatesData[app.candidateId] || { firstName: 'Unknown', lastName: 'Candidate' };
        const job = jobs.find(j => j.id === app.jobId) || { title: `Vị trí #${app.jobId}` };
        
        return {
          ...app,
          candidateName: `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || `Ứng viên #${app.candidateId}`,
          jobTitle: job.title || `Vị trí #${app.jobId}`,
          appliedDate: app.appliedAt || app.createdAt,
          hasNotes: app.notes && app.notes.length > 0,
          recentActivity: app.updatedAt || app.appliedAt,
          reapplied: app.reappliedAt ? true : false
        };
      });
      
      setApplications(mappedApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      message.error('Không thể tải danh sách ứng viên');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (status) => {
    setFilters(prev => ({ ...prev, status }));
  };

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleJobChange = (jobId) => {
    setFilters(prev => ({ ...prev, jobId }));
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      const now = new Date().toISOString();
      
      // Get current application data
      const applicationResponse = await axios.get(`http://localhost:5000/applications/${applicationId}`);
      const currentApplication = applicationResponse.data;
      
      // Update with stage history
      const updatedApplication = {
        ...currentApplication,
        status: newStatus,
        updatedAt: now,
        stageHistory: [
          ...(currentApplication.stageHistory || []),
          {
            stage: newStatus === 'rejected' ? 'rejected' : (newStatus === 'reviewing' ? 2 : newStatus === 'interviewing' ? 3 : newStatus === 'offered' ? 4 : newStatus === 'hired' ? 5 : 1),
            enteredAt: now,
            exitedAt: null,
            notes: `Trạng thái được thay đổi thành ${newStatus} bởi nhà tuyển dụng`
          }
        ]
      };
      
      // If changing from withdrawn to reviewing, add reappliedAt field
      if (currentApplication.status === 'withdrawn' && newStatus === 'reviewing') {
        updatedApplication.reappliedAt = now;
      }
      
      await axios.put(`http://localhost:5000/applications/${applicationId}`, updatedApplication);
      
      message.success('Cập nhật trạng thái thành công');
      fetchApplications();
    } catch (error) {
      console.error('Error updating application status:', error);
      message.error('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const showConfirm = (applicationId, newStatus, appStatus) => {
    const statusText = {
      'reviewing': 'xem xét',
      'interviewing': 'mời phỏng vấn',
      'offered': 'đề nghị công việc',
      'hired': 'tuyển dụng',
      'rejected': 'từ chối'
    }[newStatus];
    
    const isReturning = appStatus === 'withdrawn' && newStatus === 'reviewing';
    const confirmTitle = isReturning 
      ? 'Khôi phục đơn đã rút' 
      : 'Xác nhận thay đổi trạng thái';
    
    const confirmContent = isReturning 
      ? 'Ứng viên này đã rút hồ sơ trước đây. Bạn có muốn khôi phục đơn ứng tuyển và chuyển sang trạng thái "Đang xem xét"?'
      : `Bạn có chắc chắn muốn ${statusText} ứng viên này?`;

    Modal.confirm({
      title: confirmTitle,
      content: confirmContent,
      onOk: () => handleStatusUpdate(applicationId, newStatus)
    });
  };

  const columns = [
    {
      title: 'Ứng viên',
      dataIndex: 'candidateName',
      key: 'candidateName',
      render: (text, record) => (
        <Link to={`/employer/applications/${record.id}`}>
          {text} 
          {record.reapplied && (
            <Tooltip title="Đã nộp lại sau khi rút">
              <Badge color="blue" style={{ marginLeft: 8 }} />
            </Tooltip>
          )}
        </Link>
      ),
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
          'rejected': { color: 'error', text: 'Từ chối', icon: <CloseCircleOutlined /> },
          'withdrawn': { color: 'default', text: 'Đã rút hồ sơ', icon: <CloseCircleOutlined /> }
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
      title: 'Hoạt động gần nhất',
      dataIndex: 'recentActivity',
      key: 'recentActivity',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => {
        let actions;
        
        if (record.status === 'withdrawn') {
          // For withdrawn applications, allow restoring to reviewing
          actions = [
            { status: 'reviewing', text: 'Khôi phục', type: 'primary', icon: <RedoOutlined /> }
          ];
        } else {
          // For other statuses, show regular action flow
          actions = {
            'pending': [
              { status: 'reviewing', text: 'Xem xét', type: 'primary' },
              { status: 'rejected', text: 'Từ chối', type: 'danger' }
            ],
            'reviewing': [
              { status: 'interviewing', text: 'Mời phỏng vấn', type: 'primary' },
              { status: 'rejected', text: 'Từ chối', type: 'danger' }
            ],
            'interviewing': [
              { status: 'offered', text: 'Đề nghị', type: 'primary' },
              { status: 'rejected', text: 'Từ chối', type: 'danger' }
            ],
            'offered': [
              { status: 'hired', text: 'Tuyển dụng', type: 'primary' },
              { status: 'rejected', text: 'Từ chối', type: 'danger' }
            ]
          }[record.status] || [];
        }

        return (
          <Space size="middle">
            <Link to={`/employer/applications/${record.id}`}>
              <Button type="link" icon={<EyeOutlined />}>Xem</Button>
            </Link>
            {actions && actions.map(action => (
              <Button
                key={action.status}
                type={action.type === 'danger' ? 'link' : 'primary'}
                danger={action.type === 'danger'}
                icon={action.icon}
                onClick={() => showConfirm(record.id, action.status, record.status)}
              >
                {action.text}
              </Button>
            ))}
            {record.hasNotes && (
              <Tooltip title="Có ghi chú">
                <InfoCircleOutlined style={{ color: '#1890ff' }} />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="employer-applications-page">
      <div className="page-header mb-4">
        <h2>Quản lý ứng viên</h2>
      </div>

      <Card className="mb-4">
        <div className="filters">
          <Space size="large" wrap>
            <Select
              value={filters.status}
              style={{ width: 120 }}
              onChange={handleStatusChange}
            >
              <Option value="all">Tất cả ({filterSummary.total || 0})</Option>
              <Option value="pending">Chờ xử lý ({filterSummary.pending || 0})</Option>
              <Option value="reviewing">Đang xem xét ({filterSummary.reviewing || 0})</Option>
              <Option value="interviewing">Phỏng vấn ({filterSummary.interviewing || 0})</Option>
              <Option value="offered">Đã đề nghị ({filterSummary.offered || 0})</Option>
              <Option value="hired">Đã tuyển ({filterSummary.hired || 0})</Option>
              <Option value="rejected">Từ chối ({filterSummary.rejected || 0})</Option>
              <Option value="withdrawn">Đã rút hồ sơ ({filterSummary.withdrawn || 0})</Option>
            </Select>

            <Select
              value={filters.jobId}
              style={{ width: 200 }}
              onChange={handleJobChange}
            >
              <Option value="all">Tất cả vị trí</Option>
              {jobs.map(job => (
                <Option key={job.id} value={job.id}>{job.title}</Option>
              ))}
            </Select>

            <Search
              placeholder="Tìm kiếm ứng viên"
              allowClear
              onSearch={handleSearch}
              style={{ width: 300 }}
            />
          </Space>
        </div>
      </Card>

      <Table
        columns={columns}
        dataSource={applications}
        rowKey="id"
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng số ${total} đơn ứng tuyển`
        }}
      />
    </div>
  );
};

export default ApplicationsPage;
