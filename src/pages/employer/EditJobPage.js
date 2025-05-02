import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  DatePicker, 
  InputNumber, 
  Switch, 
  Card, 
  Typography, 
  Divider,
  message,
  Space,
  Row,
  Col
} from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const EditJobPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [experienceLevels, setExperienceLevels] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          jobResponse, 
          locationsResponse, 
          industriesResponse, 
          jobTypesResponse, 
          experienceLevelsResponse
        ] = await Promise.all([
          axios.get(`http://localhost:5000/jobs/${id}`),
          axios.get('http://localhost:5000/locations'),
          axios.get('http://localhost:5000/industries'),
          axios.get('http://localhost:5000/jobTypes'),
          axios.get('http://localhost:5000/experienceLevels')
        ]);

        // Check if job belongs to this employer
        if (jobResponse.data.employerId !== user.id) {
          message.error('Bạn không có quyền chỉnh sửa tin tuyển dụng này');
          navigate('/employer/jobs');
          return;
        }

        setLocations(locationsResponse.data);
        setIndustries(industriesResponse.data);
        setJobTypes(jobTypesResponse.data);
        setExperienceLevels(experienceLevelsResponse.data);

        const job = jobResponse.data;
        
        // Format data for form
        form.setFieldsValue({
          ...job,
          deadline: job.deadline ? moment(job.deadline) : null,
          salary: job.salaryRange ? [job.salaryRange.min, job.salaryRange.max] : [0, 0]
        });
      } catch (error) {
        console.error('Error fetching job data:', error);
        message.error('Có lỗi xảy ra khi tải thông tin công việc');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, form, user.id, navigate]);

  const handleSubmit = async (values) => {
    try {
      setSubmitLoading(true);
      
      // Format data for API
      const jobData = {
        ...values,
        employerId: user.id,
        deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : null,
        salaryRange: {
          min: values.salary[0],
          max: values.salary[1],
          currency: 'VND'
        },
        updatedAt: new Date().toISOString()
      };

      // Remove salary field as it's now in salaryRange
      delete jobData.salary;
      
      await axios.put(`http://localhost:5000/jobs/${id}`, jobData);
      
      message.success('Cập nhật tin tuyển dụng thành công');
      navigate('/employer/jobs');
    } catch (error) {
      console.error('Error updating job:', error);
      message.error('Có lỗi xảy ra khi cập nhật tin tuyển dụng');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="edit-job-page">
      <Card bordered={false}>
        <div className="page-header">
          <Space direction="horizontal" align="center" style={{ marginBottom: 16 }}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/employer/jobs')}
            >
              Quay lại
            </Button>
            <Title level={2} style={{ margin: 0 }}>Chỉnh sửa tin tuyển dụng</Title>
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={loading}
          initialValues={{
            status: true,
            featured: false,
          }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="title"
                label="Tiêu đề công việc"
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề công việc' }]}
              >
                <Input placeholder="Nhập tiêu đề công việc" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="locationId"
                label="Địa điểm"
                rules={[{ required: true, message: 'Vui lòng chọn địa điểm' }]}
              >
                <Select placeholder="Chọn địa điểm">
                  {locations.map(location => (
                    <Option key={location.id} value={location.id}>
                      {location.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="industryId"
                label="Ngành nghề"
                rules={[{ required: true, message: 'Vui lòng chọn ngành nghề' }]}
              >
                <Select placeholder="Chọn ngành nghề">
                  {industries.map(industry => (
                    <Option key={industry.id} value={industry.id}>
                      {industry.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="jobTypeId"
                label="Loại hình công việc"
                rules={[{ required: true, message: 'Vui lòng chọn loại hình công việc' }]}
              >
                <Select placeholder="Chọn loại hình công việc">
                  {jobTypes.map(type => (
                    <Option key={type.id} value={type.id}>
                      {type.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="experienceLevelId"
                label="Kinh nghiệm"
                rules={[{ required: true, message: 'Vui lòng chọn mức kinh nghiệm' }]}
              >
                <Select placeholder="Chọn mức kinh nghiệm">
                  {experienceLevels.map(level => (
                    <Option key={level.id} value={level.id}>
                      {level.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="salary"
                label="Mức lương (VND)"
                rules={[{ required: true, message: 'Vui lòng nhập mức lương' }]}
              >
                <InputNumber.Range
                  placeholder={['Từ', 'Đến']}
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="deadline"
                label="Hạn nộp hồ sơ"
                rules={[{ required: true, message: 'Vui lòng chọn hạn nộp hồ sơ' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn hạn nộp hồ sơ"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Mô tả công việc"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả công việc' }]}
              >
                <TextArea
                  rows={6}
                  placeholder="Nhập mô tả chi tiết về công việc"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="requirements"
                label="Yêu cầu ứng viên"
                rules={[{ required: true, message: 'Vui lòng nhập yêu cầu ứng viên' }]}
              >
                <TextArea
                  rows={6}
                  placeholder="Nhập yêu cầu đối với ứng viên"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="benefits"
                label="Quyền lợi"
                rules={[{ required: true, message: 'Vui lòng nhập quyền lợi ứng viên' }]}
              >
                <TextArea
                  rows={6}
                  placeholder="Nhập quyền lợi dành cho ứng viên"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                valuePropName="checked"
              >
                <Switch checkedChildren="Đang hiển thị" unCheckedChildren="Ẩn" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="featured"
                label="Nổi bật"
                valuePropName="checked"
              >
                <Switch checkedChildren="Có" unCheckedChildren="Không" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={submitLoading}
              size="large"
            >
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditJobPage;
