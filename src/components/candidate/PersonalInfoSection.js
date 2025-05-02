import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Card, Button, Row, Col, Form as AntForm, Input, DatePicker, Select, Radio } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { message } from 'antd';
import moment from 'moment';

const { TextArea } = Input;
const { Option } = Select;

const personalInfoSchema = Yup.object({
  fullName: Yup.string().required('Họ tên là bắt buộc'),
  email: Yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
  phone: Yup.string().required('Số điện thoại là bắt buộc'),
  address: Yup.string().required('Địa chỉ là bắt buộc'),
  dateOfBirth: Yup.mixed().required('Ngày sinh là bắt buộc'),
  gender: Yup.string().required('Giới tính là bắt buộc'),
  maritalStatus: Yup.string().required('Tình trạng hôn nhân là bắt buộc'),
  nationality: Yup.string().required('Quốc tịch là bắt buộc'),
  summary: Yup.string().required('Tóm tắt bản thân là bắt buộc'),
});

const PersonalInfoSection = ({ candidate, setCandidate }) => {
  const [editMode, setEditMode] = useState(false);

  const initialValues = {
    firstName: candidate?.firstName || '',
    lastName: candidate?.lastName || '',
    gender: candidate?.gender || 'male',
    dateOfBirth: candidate?.dateOfBirth ? moment(candidate.dateOfBirth) : null,
    nationality: candidate?.nationality || '',
    maritalStatus: candidate?.maritalStatus || 'single',
    email: candidate?.email || '',
    phone: candidate?.phone || '',
    address: candidate?.address || '',
    city: candidate?.city || '',
    country: candidate?.country || '',
    socialLinks: candidate?.socialLinks || [
      { platform: 'linkedin', url: '' },
      { platform: 'facebook', url: '' },
      { platform: 'github', url: '' }
    ]
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('Vui lòng nhập họ'),
    lastName: Yup.string().required('Vui lòng nhập tên'),
    gender: Yup.string().required('Vui lòng chọn giới tính'),
    dateOfBirth: Yup.mixed().required('Vui lòng chọn ngày sinh'),
    nationality: Yup.string().required('Vui lòng nhập quốc tịch'),
    maritalStatus: Yup.string().required('Vui lòng chọn tình trạng hôn nhân'),
    email: Yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
    phone: Yup.string().required('Vui lòng nhập số điện thoại'),
    address: Yup.string().required('Vui lòng nhập địa chỉ'),
    city: Yup.string().required('Vui lòng nhập thành phố'),
    country: Yup.string().required('Vui lòng nhập quốc gia'),
    socialLinks: Yup.array().of(
      Yup.object().shape({
        platform: Yup.string().required('Vui lòng chọn nền tảng'),
        url: Yup.string().url('URL không hợp lệ').required('Vui lòng nhập URL')
      })
    )
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Create a new object that maintains all existing candidate data while updating personal info
      const updatedCandidate = {
        ...candidate,
        firstName: values.firstName,
        lastName: values.lastName,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
        nationality: values.nationality,
        maritalStatus: values.maritalStatus,
        email: values.email,
        phone: values.phone,
        address: values.address,
        city: values.city,
        country: values.country,
        socialLinks: values.socialLinks
      };

      const response = await axios.put(`http://localhost:5000/candidates/${candidate.id}`, updatedCandidate);
      setCandidate(response.data);
      message.success('Cập nhật thông tin thành công');
    } catch (error) {
      console.error('Error updating personal info:', error);
      message.error('Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title="Thông tin cá nhân" className="mb-4">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, isSubmitting }) => (
          <Form>
            <Row gutter={16}>
              <Col span={12}>
                <AntForm.Item
                  label="Họ"
                  validateStatus={touched.firstName && errors.firstName ? 'error' : ''}
                  help={touched.firstName && errors.firstName}
                >
                  <Field name="firstName" as={Input} />
                </AntForm.Item>
              </Col>
              <Col span={12}>
                <AntForm.Item
                  label="Tên"
                  validateStatus={touched.lastName && errors.lastName ? 'error' : ''}
                  help={touched.lastName && errors.lastName}
                >
                  <Field name="lastName" as={Input} />
                </AntForm.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <AntForm.Item
                  label="Giới tính"
                  validateStatus={touched.gender && errors.gender ? 'error' : ''}
                  help={touched.gender && errors.gender}
                >
                  <Field name="gender">
                    {({ field }) => (
                      <Radio.Group {...field}>
                        <Radio value="male">Nam</Radio>
                        <Radio value="female">Nữ</Radio>
                        <Radio value="other">Khác</Radio>
                      </Radio.Group>
                    )}
                  </Field>
                </AntForm.Item>
              </Col>
              <Col span={8}>
                <AntForm.Item
                  label="Ngày sinh"
                  validateStatus={touched.dateOfBirth && errors.dateOfBirth ? 'error' : ''}
                  help={touched.dateOfBirth && errors.dateOfBirth}
                >
                  <Field name="dateOfBirth">
                    {({ field, form }) => (
                      <DatePicker
                        value={field.value}
                        onChange={(date) => form.setFieldValue('dateOfBirth', date)}
                        style={{ width: '100%' }}
                      />
                    )}
                  </Field>
                </AntForm.Item>
              </Col>
              <Col span={8}>
                <AntForm.Item
                  label="Quốc tịch"
                  validateStatus={touched.nationality && errors.nationality ? 'error' : ''}
                  help={touched.nationality && errors.nationality}
                >
                  <Field name="nationality" as={Input} />
                </AntForm.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <AntForm.Item
                  label="Tình trạng hôn nhân"
                  validateStatus={touched.maritalStatus && errors.maritalStatus ? 'error' : ''}
                  help={touched.maritalStatus && errors.maritalStatus}
                >
                  <Field name="maritalStatus">
                    {({ field }) => (
                      <Select {...field} style={{ width: '100%' }}>
                        <Option value="single">Độc thân</Option>
                        <Option value="married">Đã kết hôn</Option>
                        <Option value="divorced">Ly hôn</Option>
                        <Option value="widowed">Góa</Option>
                      </Select>
                    )}
                  </Field>
                </AntForm.Item>
              </Col>
              <Col span={8}>
                <AntForm.Item
                  label="Email"
                  validateStatus={touched.email && errors.email ? 'error' : ''}
                  help={touched.email && errors.email}
                >
                  <Field name="email" as={Input} />
                </AntForm.Item>
              </Col>
              <Col span={8}>
                <AntForm.Item
                  label="Số điện thoại"
                  validateStatus={touched.phone && errors.phone ? 'error' : ''}
                  help={touched.phone && errors.phone}
                >
                  <Field name="phone" as={Input} />
                </AntForm.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <AntForm.Item
                  label="Địa chỉ"
                  validateStatus={touched.address && errors.address ? 'error' : ''}
                  help={touched.address && errors.address}
                >
                  <Field name="address" as={Input} />
                </AntForm.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <AntForm.Item
                  label="Thành phố"
                  validateStatus={touched.city && errors.city ? 'error' : ''}
                  help={touched.city && errors.city}
                >
                  <Field name="city" as={Input} />
                </AntForm.Item>
              </Col>
              <Col span={12}>
                <AntForm.Item
                  label="Quốc gia"
                  validateStatus={touched.country && errors.country ? 'error' : ''}
                  help={touched.country && errors.country}
                >
                  <Field name="country" as={Input} />
                </AntForm.Item>
              </Col>
            </Row>

            <FieldArray name="socialLinks">
              {({ push, remove }) => (
                <div>
                  <h4>Liên kết mạng xã hội</h4>
                  {values.socialLinks.map((link, index) => (
                    <Row gutter={16} key={index} className="mb-2">
                      <Col span={8}>
                        <Field name={`socialLinks.${index}.platform`}>
                          {({ field }) => (
                            <Select {...field} style={{ width: '100%' }}>
                              <Option value="linkedin">LinkedIn</Option>
                              <Option value="facebook">Facebook</Option>
                              <Option value="github">GitHub</Option>
                              <Option value="twitter">Twitter</Option>
                            </Select>
                          )}
                        </Field>
                      </Col>
                      <Col span={14}>
                        <Field name={`socialLinks.${index}.url`} as={Input} />
                      </Col>
                      <Col span={2}>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(index)}
                        />
                      </Col>
                    </Row>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => push({ platform: '', url: '' })}
                    icon={<PlusOutlined />}
                  >
                    Thêm liên kết
                  </Button>
                </div>
              )}
            </FieldArray>

            <AntForm.Item className="mt-4">
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                Lưu thông tin
              </Button>
            </AntForm.Item>
          </Form>
        )}
      </Formik>
    </Card>
  );
};

export default PersonalInfoSection; 