import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Table, Tag, Button, Card, Input, DatePicker, Select, Space, message, Empty } from 'antd';
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
  const [jobData, setJobData] = useState({});
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
    if (user && user.id) {
      fetchApplications();
    }
  }, [user, pagination.current, pagination.pageSize, filters]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      // Check if the user is logged in
      if (!user || !user.id) {
        message.error('Vui lòng đăng nhập để xem đơn ứng tuyển của bạn');
        setLoading(false);
        return;
      }

      // Fetch applications for this specific candidate
      const candidateId = user.id;
      const response = await axios.get(`http://localhost:5000/applications?candidateId=${candidateId}`);
      
      if (response.data && response.data.length > 0) {
        // Collect all job IDs to fetch job details
        const jobIds = [...new Set(response.data.map(app => app.jobId))];
        const jobsData = {};
        
        // Fetch job details for each application
        await Promise.all(jobIds.map(async (jobId) => {
          try {
            const jobResponse = await axios.get(`http://localhost:5000/jobs/${jobId}`);
            if (jobResponse.data) {
              // Also fetch employer info
              const employerResponse = await axios.get(`http://localhost:5000/employers/${jobResponse.data.employerId}`);
              
              jobsData[jobId] = {
                ...jobResponse.data,
                employerName: employerResponse.data?.companyName || 'Unknown',
                employerLogo: employerResponse.data?.logo || null
              };
            }
          } catch (err) {
            console.error(`Error fetching job ${jobId}:`, err);
            jobsData[jobId] = { title: `Job #${jobId}`, location: 'Unknown' };
          }
        }));
        
        setJobData(jobsData);
        
        // Format the applications with job data
        const formattedApplications = response.data.map(app => ({
          id: app.id,
          jobId: app.jobId,
          jobTitle: jobsData[app.jobId]?.title || `Job #${app.jobId}`,
          companyName: jobsData[app.jobId]?.employerName || 'Unknown Company',
          companyLogo: jobsData[app.jobId]?.employerLogo || null,
          location: jobsData[app.jobId]?.location || 'Unknown',
          appliedDate: app.appliedAt || new Date().toISOString(),
          status: app.status || 'pending',
          salary: jobsData[app.jobId]?.salary ? 
            (jobsData[app.jobId].salary.isHidden ? 
              'Thương lượng' : 
              `${jobsData[app.jobId].salary.min} - ${jobsData[app.jobId].salary.max} ${jobsData[app.jobId].salary.currency}`) : 
            'N/A'
        }));
        
        // Apply filters
        let filteredData = [...formattedApplications];
        
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
        
        // Apply pagination
        const total = filteredData.length;
        const startIndex = (pagination.current - 1) * pagination.pageSize;
        const endIndex = startIndex + pagination.pageSize;
        const paginatedData = filteredData.slice(startIndex, endIndex);
        
        setApplications(paginatedData);
        setPagination({
          ...pagination,
          total
        });
      } else {
        // No applications found
        setApplications([]);
        setPagination({
          ...pagination,
          total: 0
        });
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      message.error('Không thể tải danh sách ứng tuyển');
      setApplications([]);
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
      filters: [
        { text: 'Chờ xử lý', value: 'pending' },
        { text: 'Đang xem xét', value: 'reviewing' },
        { text: 'Phỏng vấn', value: 'interviewing' },
        { text: 'Đã đề nghị', value: 'offered' },
        { text: 'Đã tuyển', value: 'hired' },
        { text: 'Từ chối', value: 'rejected' },
        { text: 'Đã rút hồ sơ', value: 'withdrawn' },
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
                <Option value="withdrawn">Đã rút hồ sơ</Option>
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
        {applications.length > 0 ? (
          <Table
            columns={columns}
            dataSource={applications}
            rowKey="id"
            pagination={pagination}
            loading={loading}
            onChange={handleTableChange}
          />
        ) : (
          <Empty 
            description={
              <span>
                {loading ? 'Đang tải dữ liệu...' : 'Bạn chưa có đơn ứng tuyển nào'}
              </span>
            }
          />
        )}
      </Card>
    </div>
  );
};

export default ApplicationsPage; 