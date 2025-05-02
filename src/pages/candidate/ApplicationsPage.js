import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Table, Tag, Button, Card, Input, DatePicker, Select, Space, message } from 'antd';
import { 
  EyeOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined 
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;

const ApplicationsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    keyword: '',
    status: '',
    dateRange: null
  });

  useEffect(() => {
    fetchApplications();
  }, [user, pagination.current, pagination.pageSize, filters]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        userId: user.id
      };
      
      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.status) params.status = filters.status;
      if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
        params.startDate = filters.dateRange[0].format('YYYY-MM-DD');
        params.endDate = filters.dateRange[1].format('YYYY-MM-DD');
      }
      
      // For development, fetch mock data if API doesn't exist yet
      try {
        const response = await axios.get('http://localhost:5000/applications', { params });
        
        setApplications(response.data.items);
        setPagination({
          ...pagination,
          total: response.data.total
        });
      } catch (apiError) {
        console.warn('Using mock data for applications:', apiError);
        
        // Mock data
        const mockApplications = Array(20).fill(null).map((_, index) => ({
          id: index + 1,
          jobId: 100 + index,
          jobTitle: `${['Frontend Developer', 'Backend Developer', 'Full Stack Engineer', 'UI/UX Designer', 'DevOps Engineer'][index % 5]} (${index + 1})`,
          companyName: `${['TechCorp', 'Digital Solutions', 'Web Masters', 'IT Innovations', 'Code Factory'][index % 5]}`,
          location: `${['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Nha Trang', 'Cần Thơ'][index % 5]}`,
          appliedDate: moment().subtract(index % 30, 'days').format(),
          status: ['pending', 'reviewing', 'interviewing', 'rejected', 'hired'][index % 5],
          salary: `${(index % 10 + 10) * 1000000} - ${(index % 10 + 15) * 1000000} VND`
        }));
        
        // Filter mock data based on filters
        let filteredData = [...mockApplications];
        
        if (filters.keyword) {
          const keyword = filters.keyword.toLowerCase();
          filteredData = filteredData.filter(app => 
            app.jobTitle.toLowerCase().includes(keyword) || 
            app.companyName.toLowerCase().includes(keyword)
          );
        }
        
        if (filters.status) {
          filteredData = filteredData.filter(app => app.status === filters.status);
        }
        
        if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
          const startDate = filters.dateRange[0].startOf('day');
          const endDate = filters.dateRange[1].endOf('day');
          
          filteredData = filteredData.filter(app => {
            const appDate = moment(app.appliedDate);
            return appDate.isSameOrAfter(startDate) && appDate.isSameOrBefore(endDate);
          });
        }
        
        // Pagination calculation for mock data
        const startIndex = (pagination.current - 1) * pagination.pageSize;
        const endIndex = startIndex + pagination.pageSize;
        const paginatedData = filteredData.slice(startIndex, endIndex);
        
        setApplications(paginatedData);
        setPagination({
          ...pagination,
          total: filteredData.length
        });
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      message.error('Không thể tải danh sách ứng tuyển');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    });
  };

  const handleSearch = (value) => {
    setFilters({
      ...filters,
      keyword: value
    });
    setPagination({
      ...pagination,
      current: 1 // Reset to first page when searching
    });
  };

  const handleStatusChange = (value) => {
    setFilters({
      ...filters,
      status: value
    });
    setPagination({
      ...pagination,
      current: 1
    });
  };

  const handleDateRangeChange = (dates) => {
    setFilters({
      ...filters,
      dateRange: dates
    });
    setPagination({
      ...pagination,
      current: 1
    });
  };

  const columns = [
    {
      title: 'Vị trí',
      dataIndex: 'jobTitle',
      key: 'jobTitle',
      render: (text, record) => (
        <Link to={`/jobs/${record.jobId}`}>{text}</Link>
      ),
    },
    {
      title: 'Công ty',
      dataIndex: 'companyName',
      key: 'companyName',
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Mức lương',
      dataIndex: 'salary',
      key: 'salary',
    },
    {
      title: 'Ngày ứng tuyển',
      dataIndex: 'appliedDate',
      key: 'appliedDate',
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.appliedDate).unix() - moment(b.appliedDate).unix(),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          'pending': { color: 'warning', text: 'Chờ xử lý', icon: <ClockCircleOutlined /> },
          'reviewing': { color: 'processing', text: 'Đang xem xét', icon: <EyeOutlined /> },
          'interviewing': { color: 'blue', text: 'Phỏng vấn', icon: <ClockCircleOutlined /> },
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
      filters: [
        { text: 'Chờ xử lý', value: 'pending' },
        { text: 'Đang xem xét', value: 'reviewing' },
        { text: 'Phỏng vấn', value: 'interviewing' },
        { text: 'Đã đề nghị', value: 'offered' },
        { text: 'Đã tuyển', value: 'hired' },
        { text: 'Từ chối', value: 'rejected' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Link to={`/candidate/applications/${record.id}`}>
          <Button type="primary" icon={<EyeOutlined />} size="small">
            Chi tiết
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="candidate-applications-page">
      <h1 className="mb-4">Lịch sử ứng tuyển</h1>
      
      <Card className="mb-4">
        <Space style={{ width: '100%' }} direction="vertical" size="middle">
          <div className="d-flex justify-content-between flex-wrap">
            <div style={{ marginRight: 16, marginBottom: 16, flexGrow: 1, maxWidth: 300 }}>
              <Input.Search 
                placeholder="Tìm kiếm vị trí, công ty..." 
                allowClear 
                onSearch={handleSearch}
                style={{ width: '100%' }}
              />
            </div>
            
            <div style={{ marginRight: 16, marginBottom: 16, width: 200 }}>
              <Select
                placeholder="Trạng thái"
                style={{ width: '100%' }}
                allowClear
                onChange={handleStatusChange}
              >
                <Option value="pending">Chờ xử lý</Option>
                <Option value="reviewing">Đang xem xét</Option>
                <Option value="interviewing">Phỏng vấn</Option>
                <Option value="offered">Đã đề nghị</Option>
                <Option value="hired">Đã tuyển</Option>
                <Option value="rejected">Từ chối</Option>
              </Select>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <RangePicker 
                onChange={handleDateRangeChange}
                placeholder={['Từ ngày', 'Đến ngày']}
              />
            </div>
          </div>
        </Space>
      </Card>
      
      <Card>
        <Table
          columns={columns}
          dataSource={applications}
          rowKey="id"
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

export default ApplicationsPage; 