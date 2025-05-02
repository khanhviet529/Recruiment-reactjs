import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

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

  useEffect(() => {
    const fetchJobPreferencesData = async () => {
      try {
        // Define mock data in case the APIs fail
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
          // Try to fetch real data first
          const [jobTypesRes, locationsRes, industriesRes] = await Promise.all([
            axios.get('http://localhost:5000/job-types'),
            axios.get('http://localhost:5000/locations'),
            axios.get('http://localhost:5000/industries')
          ]);
          
          setJobTypes(jobTypesRes.data);
          setLocations(locationsRes.data);
          setIndustries(industriesRes.data);
        } catch (apiError) {
          console.warn('Using mock data for job preferences due to API error:', apiError);
          // Use mock data if APIs fail
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
            {({ isSubmitting }) => (
              <Form>
                <div className="row mb-3">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Loại công việc</label>
                    <div className="d-flex flex-wrap gap-2">
                      {jobTypes.map(type => (
                        <div key={type.id} className="form-check">
                          <Field 
                            type="checkbox" 
                            name="jobTypes" 
                            value={type.id} 
                            className="form-check-input" 
                            id={`job-type-${type.id}`}
                          />
                          <label className="form-check-label" htmlFor={`job-type-${type.id}`}>
                            {type.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Địa điểm làm việc</label>
                    <div className="d-flex flex-wrap gap-2">
                      {locations.map(location => (
                        <div key={location.id} className="form-check">
                          <Field 
                            type="checkbox" 
                            name="locations" 
                            value={location.id} 
                            className="form-check-input" 
                            id={`location-${location.id}`}
                          />
                          <label className="form-check-label" htmlFor={`location-${location.id}`}>
                            {location.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Ngành nghề</label>
                    <div className="d-flex flex-wrap gap-2">
                      {industries.map(industry => (
                        <div key={industry.id} className="form-check">
                          <Field 
                            type="checkbox" 
                            name="industries" 
                            value={industry.id} 
                            className="form-check-input" 
                            id={`industry-${industry.id}`}
                          />
                          <label className="form-check-label" htmlFor={`industry-${industry.id}`}>
                            {industry.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Mức lương mong muốn</label>
                    <div className="row">
                      <div className="col-6">
                        <Field type="number" name="expectedSalary.min" className="form-control" placeholder="Tối thiểu" />
                      </div>
                      <div className="col-6">
                        <Field type="number" name="expectedSalary.max" className="form-control" placeholder="Tối đa" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <Field as="select" name="expectedSalary.currency" className="form-select">
                        <option value="USD">USD</option>
                        <option value="VND">VND</option>
                      </Field>
                    </div>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="form-check form-switch">
                      <Field 
                        type="checkbox" 
                        name="openToRelocate" 
                        className="form-check-input" 
                        id="relocate"
                      />
                      <label className="form-check-label" htmlFor="relocate">
                        Sẵn sàng chuyển địa điểm làm việc
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-check form-switch">
                      <Field 
                        type="checkbox" 
                        name="openToRemote" 
                        className="form-check-input" 
                        id="remote"
                      />
                      <label className="form-check-label" htmlFor="remote">
                        Sẵn sàng làm việc từ xa
                      </label>
                    </div>
                  </div>
                </div>
                <div className="d-flex justify-content-end">
                  <button type="button" className="btn btn-secondary me-2" onClick={() => setEditMode(null)}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    Lưu thay đổi
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        ) : (
          <div>
            <div className="row mb-3">
              <div className="col-md-6">
                <h6>Loại công việc</h6>
                <p>
                  {candidate?.jobPreferences?.jobTypes?.length > 0
                    ? candidate.jobPreferences.jobTypes
                        .map(id => jobTypes.find(type => type.id === id)?.name)
                        .filter(Boolean)
                        .join(', ')
                    : 'Chưa cập nhật'}
                </p>
              </div>
              <div className="col-md-6">
                <h6>Địa điểm làm việc</h6>
                <p>
                  {candidate?.jobPreferences?.locations?.length > 0
                    ? candidate.jobPreferences.locations
                        .map(id => locations.find(loc => loc.id === id)?.name)
                        .filter(Boolean)
                        .join(', ')
                    : 'Chưa cập nhật'}
                </p>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <h6>Ngành nghề</h6>
                <p>
                  {candidate?.jobPreferences?.industries?.length > 0
                    ? candidate.jobPreferences.industries
                        .map(id => industries.find(ind => ind.id === id)?.name)
                        .filter(Boolean)
                        .join(', ')
                    : 'Chưa cập nhật'}
                </p>
              </div>
              <div className="col-md-6">
                <h6>Mức lương mong muốn</h6>
                <p>
                  {candidate?.jobPreferences?.expectedSalary ? 
                    `${candidate.jobPreferences.expectedSalary.min} - ${candidate.jobPreferences.expectedSalary.max} ${candidate.jobPreferences.expectedSalary.currency}` : 
                    'Chưa cập nhật'}
                </p>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <h6>Sẵn sàng chuyển địa điểm</h6>
                <p>{candidate?.jobPreferences?.openToRelocate ? 'Có' : 'Không'}</p>
              </div>
              <div className="col-md-6">
                <h6>Sẵn sàng làm việc từ xa</h6>
                <p>{candidate?.jobPreferences?.openToRemote ? 'Có' : 'Không'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobPreferencesSection; 