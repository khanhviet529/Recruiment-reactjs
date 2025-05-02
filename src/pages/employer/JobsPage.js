import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Table, Button, Space, Tag, Input, Select, DatePicker, Card } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const JobsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    dateRange: null
  });

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/jobs`, {
        params: {
          employerId: user.id,
          status: filters.status !== 'all' ? filters.status : undefined,
          q: filters.search || undefined,
          _sort: 'postedAt',
          _order: 'desc'
        }
      });
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
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

  const handleDateRangeChange = (dates) => {
    setFilters(prev => ({ ...prev, dateRange: dates }));
  };

  const handleDeleteJob = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/jobs/${id}`);
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Link to={`/employer/jobs/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'Vị trí',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Ngày đăng',
      dataIndex: 'postedDate',
      key: 'postedDate',
      render: (date) => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Hạn nộp',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (date) => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Số ứng viên',
      dataIndex: 'applicationsCount',
      key: 'applicationsCount',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          'active': { color: 'success', text: 'Đang tuyển' },
          'closed': { color: 'error', text: 'Đã đóng' },
          'draft': { color: 'warning', text: 'Bản nháp' }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Link to={`/employer/jobs/${record.id}/edit`}>
            <Button type="link" icon={<EditOutlined />}>Sửa</Button>
          </Link>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteJob(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="employer-jobs-page">
      <div className="page-header mb-4">
        <h2>Quản lý tin tuyển dụng</h2>
        <Link to="/employer/jobs/new">
          <Button type="primary" icon={<PlusOutlined />}>
            Đăng tin mới
          </Button>
        </Link>
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
              <Option value="active">Đang tuyển</Option>
              <Option value="closed">Đã đóng</Option>
              <Option value="draft">Bản nháp</Option>
            </Select>

            <Search
              placeholder="Tìm kiếm tin tuyển dụng"
              allowClear
              onSearch={handleSearch}
              style={{ width: 300 }}
            />

            <RangePicker
              onChange={handleDateRangeChange}
              format="DD/MM/YYYY"
            />
          </Space>
        </div>
      </Card>

      <Table
        columns={columns}
        dataSource={jobs}
        rowKey="id"
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng số ${total} tin tuyển dụng`
        }}
      />
    </div>
  );
};

export default JobsPage;
