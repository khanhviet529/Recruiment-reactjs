import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Select, Input, Switch, Button, Row, Col, Divider, Typography } from 'antd';

const { Option } = Select;
const { Text } = Typography;

const jobPreferencesSchema = Yup.object({
  jobTypes: Yup.array().of(Yup.string()),
  locations: Yup.array().of(Yup.string()),
  industries: Yup.array().of(Yup.string()),
  expectedSalary: Yup.object({
    min: Yup.number().min(0),
    max: Yup.number().min(0),
    currency: Yup.string(),
  }),
  openToRelocate: Yup.boolean(),
  openToRemote: Yup.boolean(),
});

const JobPreferencesSection = ({ candidate, setCandidate }) => {
  const [editMode, setEditMode] = useState(null);
  const [jobTypes, setJobTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobPreferencesData = async () => {
      try {
        setLoading(true);
        // Define mock data in case the API fails
        const mockJobTypes = [
          { id: '1', name: 'Toàn thời gian' },
          { id: '2', name: 'Bán thời gian' },
          { id: '3', name: 'Thực tập' },
          { id: '4', name: 'Freelance' },
          { id: '5', name: 'Hợp đồng' }
        ];
        
        const mockLocations = [
          { id: '1', name: 'Hà Nội' },
          { id: '2', name: 'TP. Hồ Chí Minh' },
          { id: '3', name: 'Đà Nẵng' },
          { id: '4', name: 'Hải Phòng' },
          { id: '5', name: 'Cần Thơ' }
        ];
        
        const mockIndustries = [
          { id: '1', name: 'Công nghệ thông tin' },
          { id: '2', name: 'Tài chính - Ngân hàng' },
          { id: '3', name: 'Marketing' },
          { id: '4', name: 'Giáo dục' },
          { id: '5', name: 'Y tế' }
        ];

        try {
          // Lấy dữ liệu từ API /jobFilters
          const response = await axios.get('http://localhost:5000/jobFilters');
          const responseLocation = await axios.get('http://localhost:5000/locations');
          if (response.data) {
            // Cập nhật state với dữ liệu từ API
            if (response.data.jobTypes) {
              setJobTypes(response.data.jobTypes);
            }
            
            if (response.data.industries) {
              setIndustries(response.data.industries);
            }
            
          } else {
            setJobTypes(mockJobTypes);
            setIndustries(mockIndustries);
          }

          if(responseLocation.data){
            setLocations(responseLocation.data);
          }
          else{
            setLocations(mockLocations);
          }
        } catch (apiError) {
          console.warn('Using mock data for job preferences due to API error:', apiError);
          // Sử dụng dữ liệu mẫu nếu API lỗi
          setJobTypes(mockJobTypes);
          setLocations(mockLocations);
          setIndustries(mockIndustries);
        }
      } catch (error) {
        console.error('Error fetching job preferences data:', error);
        // Fallback to empty arrays if everything fails
        setJobTypes([]);
        setLocations([]);
        setIndustries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobPreferencesData();
  }, []);

  const handleUpdateJobPreferences = async (values) => {
    try {
      const response = await axios.put(`http://localhost:5000/candidates/${candidate.id}`, {
        ...candidate,
        jobPreferences: values,
      });
      setCandidate(response.data);
      setEditMode(null);
    } catch (error) {
      console.error('Error updating job preferences:', error);
    }
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Sở thích công việc</h5>
        <button 
          className="btn btn-sm btn-primary"
          onClick={() => setEditMode('preferences')}
        >
          <i className="bi bi-pencil me-1"></i> Chỉnh sửa
        </button>
      </div>
      <div className="card-body">
        {editMode === 'preferences' ? (
          <Formik
            initialValues={candidate?.jobPreferences || {
              jobTypes: [],
              locations: [],
              industries: [],
              expectedSalary: {
                min: 0,
                max: 0,
                currency: 'USD'
              },
              openToRelocate: false,
              openToRemote: false
            }}
            validationSchema={jobPreferencesSchema}
            onSubmit={handleUpdateJobPreferences}
          >
            {({ isSubmitting, values, setFieldValue }) => (
              <Form>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <div className="mb-3">
                      <label className="form-label">Loại công việc</label>
                      <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Chọn loại công việc"
                        value={values.jobTypes}
                        onChange={(value) => setFieldValue('jobTypes', value)}
                        loading={loading}
                        optionFilterProp="children"
                        showSearch
                        maxTagCount={3}
                        maxTagTextLength={10}
                      >
                        {jobTypes.map(type => (
                          <Option key={type.id} value={type.id}>
                            {type.name}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <div className="mb-3">
                      <label className="form-label">Địa điểm làm việc</label>
                      <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Chọn địa điểm làm việc"
                        value={values.locations}
                        onChange={(value) => setFieldValue('locations', value)}
                        loading={loading}
                        optionFilterProp="children"
                        showSearch
                        maxTagCount={3}
                        maxTagTextLength={10}
                      >
                        {locations.map(location => (
                          <Option key={location.id} value={location.id}>
                            {location.name}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </Col>
                </Row>
                
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <div className="mb-3">
                      <label className="form-label">Ngành nghề</label>
                      <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Chọn ngành nghề"
                        value={values.industries}
                        onChange={(value) => setFieldValue('industries', value)}
                        loading={loading}
                        optionFilterProp="children"
                        showSearch
                        maxTagCount={3}
                        maxTagTextLength={10}
                      >
                        {industries.map(industry => (
                          <Option key={industry.id} value={industry.id}>
                            {industry.name}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <div className="mb-3">
                      <label className="form-label">Mức lương mong muốn</label>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ flex: 1 }}>
                          <Input
                            type="number"
                            placeholder="Tối thiểu"
                            value={values.expectedSalary.min}
                            onChange={(e) => {
                              setFieldValue('expectedSalary.min', Number(e.target.value));
                            }}
                          />
                        </div>
                        <div style={{ flex: 0 }}>-</div>
                        <div style={{ flex: 1 }}>
                          <Input
                            type="number"
                            placeholder="Tối đa"
                            value={values.expectedSalary.max}
                            onChange={(e) => {
                              setFieldValue('expectedSalary.max', Number(e.target.value));
                            }}
                          />
                        </div>
                        <div style={{ flex: 0.5 }}>
                          <Select
                            style={{ width: '100%' }}
                            value={values.expectedSalary.currency}
                            onChange={(value) => setFieldValue('expectedSalary.currency', value)}
                          >
                            <Option value="USD">USD</Option>
                            <Option value="VND">VND</Option>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
                
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <div className="mb-3">
                      <Switch
                        checked={values.openToRelocate}
                        onChange={(checked) => setFieldValue('openToRelocate', checked)}
                      /> <span className="ms-2">Sẵn sàng chuyển địa điểm làm việc</span>
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <div className="mb-3">
                      <Switch
                        checked={values.openToRemote}
                        onChange={(checked) => setFieldValue('openToRemote', checked)}
                      /> <span className="ms-2">Sẵn sàng làm việc từ xa</span>
                    </div>
                  </Col>
                </Row>
                
                <Divider />
                
                <div className="d-flex justify-content-end">
                  <Button 
                    className="me-2" 
                    onClick={() => setEditMode(null)}
                  >
                    Hủy
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={isSubmitting}
                  >
                    Lưu thay đổi
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        ) : (
          <div>
            <Row gutter={[16, 16]} className="mb-3">
              <Col xs={24} md={12}>
                <h6>Loại công việc</h6>
                <p>
                  {candidate?.jobPreferences?.jobTypes?.length > 0
                    ? candidate.jobPreferences.jobTypes
                        .map(id => jobTypes.find(type => type.id === id)?.name)
                        .filter(Boolean)
                        .join(', ')
                    : 'Chưa cập nhật'}
                </p>
              </Col>
              <Col xs={24} md={12}>
                <h6>Địa điểm làm việc</h6>
                <p>
                  {candidate?.jobPreferences?.locations?.length > 0
                    ? candidate.jobPreferences.locations
                        .map(id => locations.find(loc => loc.id === id)?.name)
                        .filter(Boolean)
                        .join(', ')
                    : 'Chưa cập nhật'}
                </p>
              </Col>
            </Row>
            <Row gutter={[16, 16]} className="mb-3">
              <Col xs={24} md={12}>
                <h6>Ngành nghề</h6>
                <p>
                  {candidate?.jobPreferences?.industries?.length > 0
                    ? candidate.jobPreferences.industries
                        .map(id => industries.find(ind => ind.id === id)?.name)
                        .filter(Boolean)
                        .join(', ')
                    : 'Chưa cập nhật'}
                </p>
              </Col>
              <Col xs={24} md={12}>
                <h6>Mức lương mong muốn</h6>
                <p>
                  {candidate?.jobPreferences?.expectedSalary ? 
                    `${candidate.jobPreferences.expectedSalary.min} - ${candidate.jobPreferences.expectedSalary.max} ${candidate.jobPreferences.expectedSalary.currency}` : 
                    'Chưa cập nhật'}
                </p>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <h6>Sẵn sàng chuyển địa điểm</h6>
                <p>{candidate?.jobPreferences?.openToRelocate ? 'Có' : 'Không'}</p>
              </Col>
              <Col xs={24} md={12}>
                <h6>Sẵn sàng làm việc từ xa</h6>
                <p>{candidate?.jobPreferences?.openToRemote ? 'Có' : 'Không'}</p>
              </Col>
            </Row>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobPreferencesSection; 