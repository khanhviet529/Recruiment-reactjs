import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Table, Button, Space, Tag, Input, Select, Card, Modal, message } from 'antd';
import { SearchOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

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
      const response = await axios.get(`http://localhost:5000/applications`, {
        params: {
          employerId: user.id,
          status: filters.status !== 'all' ? filters.status : undefined,
          q: filters.search || undefined,
          jobId: filters.jobId !== 'all' ? filters.jobId : undefined,
          _sort: 'appliedAt',
          _order: 'desc'
        }
      });
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
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
      await axios.put(`http://localhost:5000/applications/${applicationId}/status`, {
        status: newStatus
      });
      message.success('Cập nhật trạng thái thành công');
      fetchApplications();
    } catch (error) {
      console.error('Error updating application status:', error);
      message.error('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const showConfirm = (applicationId, newStatus) => {
    const statusText = {
      'interviewing': 'mời phỏng vấn',
      'offered': 'đề nghị công việc',
      'hired': 'tuyển dụng',
      'rejected': 'từ chối'
    }[newStatus];

    Modal.confirm({
      title: 'Xác nhận thay đổi trạng thái',
      content: `Bạn có chắc chắn muốn ${statusText} ứng viên này?`,
      onOk: () => handleStatusUpdate(applicationId, newStatus)
    });
  };

  const columns = [
    {
      title: 'Ứng viên',
      dataIndex: 'candidateName',
      key: 'candidateName',
      render: (text, record) => (
        <Link to={`/employer/applications/${record.id}`}>{text}</Link>
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
      render: (_, record) => {
        const actions = {
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
        };

        const availableActions = actions[record.status] || [];

        return (
          <Space size="middle">
            <Link to={`/employer/applications/${record.id}`}>
              <Button type="link" icon={<EyeOutlined />}>Xem</Button>
            </Link>
            {availableActions.map(action => (
              <Button
                key={action.status}
                type={action.type === 'danger' ? 'link' : 'primary'}
                danger={action.type === 'danger'}
                onClick={() => showConfirm(record.id, action.status)}
              >
                {action.text}
              </Button>
            ))}
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
          <Space size="large">
            <Select
              defaultValue="all"
              style={{ width: 120 }}
              onChange={handleStatusChange}
            >
              <Option value="all">Tất cả</Option>
              <Option value="pending">Chờ xử lý</Option>
              <Option value="reviewing">Đang xem xét</Option>
              <Option value="interviewing">Phỏng vấn</Option>
              <Option value="offered">Đã đề nghị</Option>
              <Option value="hired">Đã tuyển</Option>
              <Option value="rejected">Từ chối</Option>
            </Select>

            <Select
              defaultValue="all"
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
