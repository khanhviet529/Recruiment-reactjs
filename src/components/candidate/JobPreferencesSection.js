import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Card, Button, Row, Col, Form as AntForm, Select, Input, Switch, Slider } from 'antd';
import { message } from 'antd';

const { Option } = Select;

const jobPreferencesSchema = Yup.object({
  jobTypes: Yup.array().min(1, 'Vui lòng chọn ít nhất một loại công việc'),
  locations: Yup.array().min(1, 'Vui lòng chọn ít nhất một địa điểm'),
  industries: Yup.array().min(1, 'Vui lòng chọn ít nhất một ngành nghề'),
  expectedSalary: Yup.object({
    min: Yup.number().min(0, 'Lương tối thiểu phải lớn hơn 0'),
    max: Yup.number().min(Yup.ref('min'), 'Lương tối đa phải lớn hơn lương tối thiểu'),
    currency: Yup.string().required('Vui lòng chọn đơn vị tiền tệ')
  }),
  openToRelocate: Yup.boolean(),
  openToRemote: Yup.boolean()
});

const JobPreferencesSection = ({ candidate, setCandidate }) => {

  // Track candidate prop changes for proper data display
  useEffect(() => {
    console.log('🔍 JobPreferencesSection - Candidate prop:', candidate);
    if (candidate) {
      console.log('Data count:', candidate.jobPreferences?.length || 0);
    }
  }, [candidate]);  const [editMode, setEditMode] = useState(false);


const initialValues = {
    jobTypes: candidate?.jobPreferences?.jobTypes || [],
    locations: candidate?.jobPreferences?.locations || [],
    industries: candidate?.jobPreferences?.industries || [],
    expectedSalary: {
      min: candidate?.jobPreferences?.expectedSalary?.min || 0,
      max: candidate?.jobPreferences?.expectedSalary?.max || 0,
      currency: candidate?.jobPreferences?.expectedSalary?.currency || 'VND'
    },
    openToRelocate: candidate?.jobPreferences?.openToRelocate || false,
    openToRemote: candidate?.jobPreferences?.openToRemote || false
  };

  const jobTypeOptions = [
    { value: 'fulltime', label: 'Toàn thời gian' },
    { value: 'parttime', label: 'Bán thời gian' },
    { value: 'contract', label: 'Hợp đồng' },
    { value: 'freelance', label: 'Tự do' },
    { value: 'internship', label: 'Thực tập' }
  ];

  const locationOptions = [
    { value: 'hanoi', label: 'Hà Nội' },
    { value: 'hochiminh', label: 'TP. Hồ Chí Minh' },
    { value: 'danang', label: 'Đà Nẵng' },
    { value: 'haiphong', label: 'Hải Phòng' },
    { value: 'cantho', label: 'Cần Thơ' },
    { value: 'remote', label: 'Làm việc từ xa' }
  ];

  const industryOptions = [
    { value: 'technology', label: 'Công nghệ thông tin' },
    { value: 'finance', label: 'Tài chính - Ngân hàng' },
    { value: 'healthcare', label: 'Y tế - Sức khỏe' },
    { value: 'education', label: 'Giáo dục - Đào tạo' },
    { value: 'marketing', label: 'Marketing - Quảng cáo' },
    { value: 'sales', label: 'Kinh doanh - Bán hàng' },
    { value: 'manufacturing', label: 'Sản xuất - Chế tạo' },
    { value: 'retail', label: 'Bán lẻ - Thương mại' }
  ];

  const currencyOptions = [
    { value: 'VND', label: 'VND' },
    { value: 'USD', label: 'USD' }
  ];

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      console.log('🔄 Updating section data...');
      
      // SAFETY CHECK: Get current candidate data first to preserve all fields
      let currentCandidateData = {};
      try {
        const currentResponse = await axios.get(`http://localhost:5000/candidates/${candidate.id}`);
        currentCandidateData = currentResponse.data;
        console.log('📦 Current candidate data:', currentCandidateData);
      } catch (error) {
        console.warn('⚠️ Could not fetch current candidate data, using props:', error);
        currentCandidateData = candidate;
      }
      const updatedCandidate = {
        ...currentCandidateData, // Keep all existing data
        jobPreferences: values
      };

      const response = await axios.put(`http://localhost:5000/candidates/${candidate.id}`, updatedCandidate);
      setCandidate(response.data);
      setEditMode(false);
      message.success('Cập nhật sở thích công việc thành công');
    } catch (error) {
      console.error('Error updating job preferences:', error);
      message.error('Có lỗi xảy ra khi cập nhật sở thích công việc');
    } finally {
      setSubmitting(false);
    }
  };

  if (!editMode) {
    return (
      <Card title="Sở thích công việc" className="mb-4">
        <div className="job-preferences-display">
          <Row gutter={16}>
            <Col span={12}>
              <p><strong>Loại công việc:</strong></p>
              <ul>
                {candidate?.jobPreferences?.jobTypes?.map(type => (
                  <li key={type}>{jobTypeOptions.find(opt => opt.value === type)?.label || type}</li>
                )) || <li>Chưa cập nhật</li>}
              </ul>
            </Col>
            <Col span={12}>
              <p><strong>Địa điểm:</strong></p>
              <ul>
                {candidate?.jobPreferences?.locations?.map(location => (
                  <li key={location}>{locationOptions.find(opt => opt.value === location)?.label || location}</li>
                )) || <li>Chưa cập nhật</li>}
              </ul>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <p><strong>Ngành nghề:</strong></p>
              <ul>
                {candidate?.jobPreferences?.industries?.map(industry => (
                  <li key={industry}>{industryOptions.find(opt => opt.value === industry)?.label || industry}</li>
                )) || <li>Chưa cập nhật</li>}
              </ul>
            </Col>
            <Col span={12}>
              <p><strong>Mức lương mong muốn:</strong></p>
              <p>
                {candidate?.jobPreferences?.expectedSalary?.min || 0} - {candidate?.jobPreferences?.expectedSalary?.max || 0} {candidate?.jobPreferences?.expectedSalary?.currency || 'VND'}
              </p>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <p><strong>Sẵn sàng chuyển chỗ ở:</strong> {candidate?.jobPreferences?.openToRelocate ? 'Có' : 'Không'}</p>
            </Col>
            <Col span={12}>
              <p><strong>Sẵn sàng làm việc từ xa:</strong> {candidate?.jobPreferences?.openToRemote ? 'Có' : 'Không'}</p>
            </Col>
          </Row>
        </div>

        <Button type="primary" onClick={() => setEditMode(true)}>
          Chỉnh sửa sở thích
        </Button>
      </Card>
    );
  }

  return (
    <Card title="Chỉnh sửa sở thích công việc" className="mb-4">
      <Formik
        initialValues={initialValues}
        validationSchema={jobPreferencesSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form>
            <Row gutter={16}>
              <Col span={12}>
                <AntForm.Item label="Loại công việc">
                  <Select
                    mode="multiple"
                    placeholder="Chọn loại công việc"
                    value={values.jobTypes}
                    onChange={(value) => setFieldValue('jobTypes', value)}
                    style={{ width: '100%' }}
                  >
                    {jobTypeOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                  <ErrorMessage name="jobTypes" component="div" className="text-danger" />
                </AntForm.Item>
              </Col>
              <Col span={12}>
                <AntForm.Item label="Địa điểm làm việc">
                  <Select
                    mode="multiple"
                    placeholder="Chọn địa điểm"
                    value={values.locations}
                    onChange={(value) => setFieldValue('locations', value)}
                    style={{ width: '100%' }}
                  >
                    {locationOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                  <ErrorMessage name="locations" component="div" className="text-danger" />
                </AntForm.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <AntForm.Item label="Ngành nghề quan tâm">
                  <Select
                    mode="multiple"
                    placeholder="Chọn ngành nghề"
                    value={values.industries}
                    onChange={(value) => setFieldValue('industries', value)}
                    style={{ width: '100%' }}
                  >
                    {industryOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                  <ErrorMessage name="industries" component="div" className="text-danger" />
                </AntForm.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <AntForm.Item label="Lương tối thiểu">
                  <Input
                    type="number"
                    placeholder="Lương tối thiểu"
                    value={values.expectedSalary.min}
                    onChange={(e) => setFieldValue('expectedSalary.min', Number(e.target.value))}
                  />
                  <ErrorMessage name="expectedSalary.min" component="div" className="text-danger" />
                </AntForm.Item>
              </Col>
              <Col span={8}>
                <AntForm.Item label="Lương tối đa">
                  <Input
                    type="number"
                    placeholder="Lương tối đa"
                    value={values.expectedSalary.max}
                    onChange={(e) => setFieldValue('expectedSalary.max', Number(e.target.value))}
                  />
                  <ErrorMessage name="expectedSalary.max" component="div" className="text-danger" />
                </AntForm.Item>
              </Col>
              <Col span={8}>
                <AntForm.Item label="Đơn vị tiền tệ">
                  <Select
                    value={values.expectedSalary.currency}
                    onChange={(value) => setFieldValue('expectedSalary.currency', value)}
                    style={{ width: '100%' }}
                  >
                    {currencyOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                  <ErrorMessage name="expectedSalary.currency" component="div" className="text-danger" />
                </AntForm.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <AntForm.Item label="Sẵn sàng chuyển chỗ ở">
                  <Switch
                    checked={values.openToRelocate}
                    onChange={(checked) => setFieldValue('openToRelocate', checked)}
                  />
                </AntForm.Item>
              </Col>
              <Col span={12}>
                <AntForm.Item label="Sẵn sàng làm việc từ xa">
                  <Switch
                    checked={values.openToRemote}
                    onChange={(checked) => setFieldValue('openToRemote', checked)}
                  />
                </AntForm.Item>
              </Col>
            </Row>

            <AntForm.Item>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                Lưu thay đổi
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={() => setEditMode(false)}>
                Hủy
              </Button>
            </AntForm.Item>
          </Form>
        )}
      </Formik>
    </Card>
  );
};

export default JobPreferencesSection; 
