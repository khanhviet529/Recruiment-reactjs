import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import {
  Button,
  Spin,
  Typography,
  Alert,
  Tag,
  Card,
  Divider
} from 'antd';
import {
  EnvironmentOutlined,
  BankOutlined,
  DollarOutlined,
  CalendarOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  SendOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const JobDetailSimple = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [job, setJob] = useState(null);
  const [employer, setEmployer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch job details
        const jobResponse = await axios.get(`http://localhost:5000/jobs/${id}`);
        setJob(jobResponse.data);

        // Fetch employer details
        if (jobResponse.data.employerId) {
          const employerResponse = await axios.get(`http://localhost:5000/employers?userId=${jobResponse.data.employerId}`);
          setEmployer(employerResponse.data[0] || null);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching job data:', err);
        setError('Không thể tải thông tin công việc');
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate('/auth/login', {
        state: { from: `/jobs/${id}`, message: 'Vui lòng đăng nhập để ứng tuyển công việc này' }
      });
      return;
    }
    // Handle application logic here
  };

  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return 'Thỏa thuận';
    if (salary.min && salary.max) {
      return `${salary.min.toLocaleString()} - ${salary.max.toLocaleString()} ${salary.currency || 'VND'}`;
    }
    return `${(salary.min || salary.max).toLocaleString()} ${salary.currency || 'VND'}`;
  };

  // Safe render for arrays
  const renderList = (items, title) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return (
        <Card title={title} style={{ marginBottom: 16 }}>
          <Text type="secondary">Không có thông tin</Text>
        </Card>
      );
    }

    return (
      <Card title={title} style={{ marginBottom: 16 }}>
        <ul>
          {items.map((item, index) => (
            <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      </Card>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Đang tải thông tin công việc...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '50px' }}>
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          action={
            <Button onClick={() => navigate('/jobs')} type="primary">
              Quay lại danh sách công việc
            </Button>
          }
        />
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ padding: '50px' }}>
        <Alert
          message="Không tìm thấy công việc"
          description="Công việc này có thể đã bị xóa hoặc không tồn tại."
          type="warning"
          showIcon
          action={
            <Button onClick={() => navigate('/jobs')} type="primary">
              Quay lại danh sách công việc
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div className="container">
        {/* Job Header */}
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <Title level={2}>{job.title}</Title>
              {employer && (
                <Text strong style={{ fontSize: '16px', color: '#4f46e5' }}>
                  {employer.companyName}
                </Text>
              )}
              <div style={{ margin: '10px 0' }}>
                <Tag icon={<EnvironmentOutlined />}>
                  {job.location} {job.isRemote && "(Remote)"}
                </Tag>
                <Tag icon={<BankOutlined />}>
                  {job.jobType}
                </Tag>
                <Tag icon={<DollarOutlined />}>
                  {formatSalary(job.salary)}
                </Tag>
                {job.isUrgent && (
                  <Tag color="red" icon={<ClockCircleOutlined />}>
                    Tuyển gấp
                  </Tag>
                )}
              </div>
              {job.applicationDeadline && (
                <div style={{ marginTop: 10 }}>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  <Text>Hạn nộp: {new Date(job.applicationDeadline).toLocaleDateString('vi-VN')}</Text>
                </div>
              )}
            </div>
            <div>
              <Button
                type="primary"
                size="large"
                icon={<SendOutlined />}
                onClick={handleApply}
              >
                Ứng tuyển ngay
              </Button>
            </div>
          </div>
        </Card>

        {/* Job Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          {/* Main content */}
          <div>
            {/* Description */}
            <Card title={<><FileTextOutlined /> Mô tả công việc</>} style={{ marginBottom: 16 }}>
              <Paragraph>
                <div dangerouslySetInnerHTML={{ __html: job.description || 'Không có mô tả' }} />
              </Paragraph>
            </Card>

            {/* Requirements */}
            {renderList(job.requirements, <><InfoCircleOutlined /> Yêu cầu công việc</>)}

            {/* Benefits */}
            {renderList(job.benefits, <><CheckCircleOutlined /> Quyền lợi</>)}

            {/* Responsibilities (if exists) */}
            {job.responsibilities && renderList(job.responsibilities, <><CheckCircleOutlined /> Trách nhiệm công việc</>)}
          </div>

          {/* Sidebar */}
          <div>
            <Card title="Thông tin ứng tuyển">
              <div style={{ marginBottom: 12 }}>
                <Text strong>Số lượng tuyển: </Text>
                <Text>{job.positions || 1} người</Text>
              </div>
              <div style={{ marginBottom: 12 }}>
                <Text strong>Cấp bậc: </Text>
                <Text>{job.experienceLevel || "Không xác định"}</Text>
              </div>
              <div style={{ marginBottom: 12 }}>
                <Text strong>Kinh nghiệm: </Text>
                <Text>{job.minExperienceYears || 0} năm</Text>
              </div>
              <div style={{ marginBottom: 12 }}>
                <Text strong>Học vấn: </Text>
                <Text>{job.educationLevel || "Không yêu cầu"}</Text>
              </div>
              <Divider />
              <Button type="primary" block icon={<SendOutlined />} onClick={handleApply}>
                Ứng tuyển ngay
              </Button>
            </Card>

            {employer && (
              <Card title="Thông tin công ty" style={{ marginTop: 16 }}>
                <div style={{ textAlign: 'center', marginBottom: 12 }}>
                  {employer.logo && (
                    <img 
                      src={employer.logo} 
                      alt={employer.companyName}
                      style={{ width: 60, height: 60, borderRadius: 8 }}
                    />
                  )}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>{employer.companyName}</Text>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary">{employer.industry || "Không có thông tin ngành nghề"}</Text>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary">{employer.companySize || "Không có thông tin quy mô"}</Text>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailSimple; 