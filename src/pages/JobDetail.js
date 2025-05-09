import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import {
  Modal,
  Form,
  Input,
  Upload,
  Button,
  Steps,
  message,
  Divider,
  Typography,
  Space,
  Alert,
  Progress,
  Tooltip
} from 'antd';
import {
  UploadOutlined,
  FormOutlined,
  CheckCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  SendOutlined,
  FilePdfOutlined,
  DeleteOutlined,
  EyeOutlined,
  HeartOutlined,
  HeartFilled
} from '@ant-design/icons';
import '../styles/JobDetail.scss';
import { uploadPDF } from '../services/fileService';
import { CLOUDINARY_CONFIG } from '../services/configService';
import CVUploader from '../components/common/CVUploader';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Step } = Steps;

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [job, setJob] = useState(null);
  const [employer, setEmployer] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);
  const [candidateInfo, setCandidateInfo] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  // Application modal state
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationStep, setApplicationStep] = useState(0);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [applicationError, setApplicationError] = useState(null);
  const [applicationQuestions, setApplicationQuestions] = useState([]);

  // Add these new states for CV upload
  const [cvUploading, setCvUploading] = useState(false);
  const [uploadedCvUrl, setUploadedCvUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch job details
        const jobResponse = await axios.get(`http://localhost:5000/jobs/${id}`);
        setJob(jobResponse.data);

        // Fetch employer details
        const employerResponse = await axios.get(`http://localhost:5000/employers?userId=${jobResponse.data.employerId}`);
        setEmployer(employerResponse.data);

        // Use questions from job data if available
        if (jobResponse.data.questions && jobResponse.data.questions.length > 0) {
          setApplicationQuestions(jobResponse.data.questions);
        } else {
          // Fallback questions if not provided by API
          setApplicationQuestions([
            {
              id: "1",
              question: "Mô tả kinh nghiệm của bạn liên quan đến vị trí này?",
              isRequired: true
            },
            {
              id: "2",
              question: "Tại sao bạn muốn làm việc tại công ty chúng tôi?",
              isRequired: true
            }
          ]);
        }

        // Check if job is saved by user
        if (isAuthenticated && user) {
          try {
            // First get candidateId
            const candidateResponse = await axios.get(`http://localhost:5000/candidates?userId=${user.id}`);

            if (candidateResponse.data && candidateResponse.data.length > 0) {
              const candidateId = candidateResponse.data[0].id;

              // Check saved jobs with candidateId
              const savedJobsResponse = await axios.get(`http://localhost:5000/savedJobs?candidateId=${candidateId}&jobId=${id}`);
              setIsSaved(savedJobsResponse.data && savedJobsResponse.data.length > 0);
            }
          } catch (error) {
            console.error('Error checking if job is saved:', error);
          }
        }

        setLoading(false);
      } catch (err) {
        setError('Không thể tải thông tin công việc');
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isAuthenticated, user]);

  // Fetch candidate information when user changes
  useEffect(() => {
    const fetchCandidateInfo = async () => {
      if (isAuthenticated && user && user.id) {
        try {
          const response = await axios.get(`http://localhost:5000/candidates?userId=${user.id}`);
          if (response.data && response.data.length > 0) {
            setCandidateInfo(response.data[0]);
          }
          // if (user.candidateProfile) { 
          //   setCandidateInfo(user.candidateProfile);
          // } else if (user.role === 'candidate') {
          //   const response = await axios.get(`http://localhost:5000/candidates?userId=${user.id}`);
          //   if (response.data && response.data.length > 0) {
          //     setCandidateInfo(response.data[0]);
          //   }
          // }
        } catch (err) {
          console.error('Error fetching candidate information:', err);
        }
      }
    };

    fetchCandidateInfo();
  }, [isAuthenticated, user]);

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate('/auth/login', {
        state: { from: `/jobs/${id}`, message: 'Vui lòng đăng nhập để ứng tuyển công việc này' }
      });
      return;
    }

    // Check if user already applied
    checkExistingApplication();
  };

  const checkExistingApplication = async () => {
    try {
      if (!user) return;

      const response = await axios.get(`http://localhost:5000/applications?jobId=${id}&candidateId=${user.id}&status_ne=withdrawn`);

      if (response.data && response.data.length > 0) {
        message.info('Bạn đã ứng tuyển vị trí này. Vui lòng kiểm tra trạng thái ứng tuyển trong trang cá nhân.');
        return;
      }

      // No existing application, open the modal
      setShowApplicationModal(true);
    } catch (err) {
      console.error('Error checking application status:', err);
      // If we can't check, still allow applying
      setShowApplicationModal(true);
    }
  };

  const handleApplicationCancel = () => {
    if (applying) return; // Prevent closing while submitting

    setShowApplicationModal(false);
    setApplicationStep(0);
    form.resetFields();
    setFileList([]);
    setApplicationSuccess(false);
    setApplicationError(null);
  };

  // Add handler for CV upload success
  const handleCvUploadSuccess = (result) => {
    console.log('CV Upload success:', result);
    if (result && result.url) {
      setUploadedCvUrl(result.url);
      // Create a file object that mimics what the Upload component would create
      const newFile = {
        uid: '-1',
        name: result.name || 'CV.pdf',
        status: 'done',
        url: result.url,
        originFileObj: null // Mark this as already uploaded
      };
      setFileList([newFile]);
      message.success('CV tải lên thành công');
    }
  };

  // Add handler for CV upload error
  const handleCvUploadError = (error) => {
    console.error('CV upload error:', error);
    message.error(`Không thể tải CV lên: ${error}`);
    setFileList([]);
    setUploadedCvUrl('');
  };

  // Replace the handleFileChange function
  const handleFileChange = (info) => {
    if (info.file.status === 'uploading') {
      setCvUploading(true);
      return;
    }

    if (info.file.status === 'done') {
      setCvUploading(false);
      // Only keep the latest file
      setFileList([info.file]);
    } else if (info.file.status === 'error') {
      setCvUploading(false);
      message.error(`${info.file.name} tải lên thất bại.`);
    } else {
      // Only keep the latest file
      setFileList(info.fileList.slice(-1));
    }
  };

  const handleStepChange = (current) => {
    // Only allow navigating to already completed steps or the current step
    if (current <= applicationStep) {
      setApplicationStep(current);
    }
  };

  const nextStep = async () => {
    try {
      // Validate form fields for the current step
      if (applicationStep === 0) {
        // Validate personal info
        await form.validateFields(['fullName', 'email', 'phone']);
      } else if (applicationStep === 1) {
        // Validate CV upload
        if (fileList.length === 0 && !uploadedCvUrl) {
          message.error('Vui lòng tải lên CV của bạn');
          return;
        }
      } else if (applicationStep === 2) {
        // Validate required questions
        const requiredQuestionIds = applicationQuestions
          .filter(q => q.isRequired)
          .map(q => `question_${q.id}`);

        await form.validateFields(requiredQuestionIds);
      }

      // If validation passes, go to next step
      setApplicationStep(applicationStep + 1);
    } catch (err) {
      // Form validation failed
      console.error('Validation failed:', err);
    }
  };

  const prevStep = () => {
    setApplicationStep(applicationStep - 1);
  };

  const handleSubmitApplication = async () => {
    try {
      const values = await form.validateFields();

      // Don't proceed if no resume uploaded
      if (fileList.length === 0 && !uploadedCvUrl) {
        message.error('Vui lòng tải lên CV của bạn');
        return;
      }

      setApplying(true);
      setApplicationError(null);

      // Check if we already have an uploaded CV URL
      let resumeUrl = uploadedCvUrl;
      let resumeFileName = fileList.length > 0 ? fileList[0].name : 'CV.pdf';

      // If we don't have a URL, upload the file
      if (!resumeUrl && fileList.length > 0 && fileList[0].originFileObj) {
        try {
          const file = fileList[0].originFileObj;
          message.loading('Đang tải CV lên...', 0);

          // Use our uploadPDF service
          const uploadResponse = await uploadPDF(file, (progress) => {
            setUploadProgress(progress);
            console.log(`Upload progress: ${progress}%`);
          });

          message.destroy();

          if (!uploadResponse.success) {
            throw new Error(uploadResponse.error || 'Không thể tải CV lên');
          }

          // Get the secure URL from the response
          resumeUrl = uploadResponse.data.secure_url;
          console.log('CV uploaded successfully:', resumeUrl);
          message.success('Tải CV lên thành công');
        } catch (uploadErr) {
          console.error('CV upload error:', uploadErr);
          message.error('Không thể tải CV lên. Vui lòng thử lại.');
          setApplying(false);
          return;
        }
      }

      // Prepare the answers from the questions
      const answers = applicationQuestions.map(q => ({
        questionId: q.id,
        question: q.question,
        answer: values[`question_${q.id}`] || ''
      }));

      // Log the job ID for debugging
      console.log('Job ID from URL parameter:', id, 'Type:', typeof id);
      
      // Validate job ID
      if (!id) {
        throw new Error('Không tìm thấy ID của công việc');
      }
      
      // Try to parse the job ID in different ways
      let jobId;
      try {
        jobId = parseInt(id);
        if (isNaN(jobId)) {
          jobId = id; // Keep as string if parsing fails
        }
      } catch (error) {
        console.error('Error parsing job ID:', error);
        jobId = id; // Fallback to original value
      }
      
      if (!jobId) {
        throw new Error('Không thể xác định ID của công việc');
      }

      // Create the application object with the real Cloudinary URL
      const application = {
        jobId: jobId,
        candidateId: user.id,
        resume: {
          url: resumeUrl,
          name: resumeFileName
        },
        resumeUrl: resumeUrl, // For backward compatibility
        coverLetter: values.coverLetter,
        answers: answers,
        status: "pending",
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        currentStage: 1,
        stageHistory: [
          {
            stage: 1,
            enteredAt: new Date().toISOString(),
            exitedAt: null,
            notes: "Hồ sơ đang chờ xét duyệt."
          }
        ],
        notes: [],
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Submitting application with job ID:', jobId, 'candidate ID:', user.id);

      // Check if user already has a candidate profile
      let candidateProfile = null;
      try {
        // Validate user ID
        if (!user || !user.id) {
          throw new Error('Không thể xác định ID của ứng viên');
        }

        const candidateResponse = await axios.get(`http://localhost:5000/candidates?userId=${user.id}`);
        if (candidateResponse.data && candidateResponse.data.length > 0) {
          candidateProfile = candidateResponse.data[0];
          
          // Use the candidate ID from the profile
          // if (candidateProfile && candidateProfile.id) {
          //   application.candidateId = candidateProfile.id;
          //   console.log('Using candidate ID from profile:', candidateProfile.id);
          // }
        }
      } catch (err) {
        console.error('Error checking candidate profile:', err);
        if (!application.candidateId) {
          message.error('Không thể xác định thông tin ứng viên. Vui lòng đăng nhập lại.');
          setApplying(false);
          return;
        }
      }

      // If no candidate profile exists, create one
      if (!candidateProfile) {
        try {
          const newCandidate = {
            userId: user.id,
            firstName: values.fullName.split(' ')[0] || '',
            lastName: values.fullName.split(' ').slice(1).join(' ') || '',
            headline: '',
            summary: '',
            phone: values.phone,
            email: values.email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          console.log('Creating new candidate profile:', newCandidate);
          
          const candidateResponse = await axios.post('http://localhost:5000/candidates', newCandidate);
          candidateProfile = candidateResponse.data;
          
          // Update application with the new candidate ID if needed
          if (candidateProfile && candidateProfile.id) {
            application.candidateId = candidateProfile.id;
            console.log('Using newly created candidate ID:', candidateProfile.id);
          }
        } catch (err) {
          console.error('Error creating candidate profile:', err);
          // Continue with submission even if profile creation fails
        }
      }
      
      // Final validation before submission
      if (!application.jobId) {
        throw new Error('Không thể xác định ID của công việc');
      }
      
      if (!application.candidateId) {
        throw new Error('Không thể xác định ID của ứng viên');
      }
      
      console.log('Final application data:', application);
      
      // Post the application to the API
      const response = await axios.post('http://localhost:5000/applications', application);

      if (response.status === 201 || response.status === 200) {
        setApplicationSuccess(true);
        // Move to the success step
        setApplicationStep(3);
      }
    } catch (err) {
      console.error('Error submitting application:', err);
      setApplicationError(err.message || 'Có lỗi xảy ra khi gửi đơn ứng tuyển. Vui lòng thử lại sau.');
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (salary) => {
    if (salary.isHidden) return 'Thương lượng';
    return `${salary.min} - ${salary.max} ${salary.currency}/${salary.period}`;
  };

  // Create full name from candidate profile
  const getFullName = () => {
    if (candidateInfo) {
      return `${candidateInfo.firstName || ''} ${candidateInfo.lastName || ''}`.trim();
    }
    return user?.fullName || '';
  };

  // Add save job functionality
  const handleToggleSaveJob = async () => {
    if (!isAuthenticated) {
      navigate('/auth/login', {
        state: { from: `/jobs/${id}`, message: 'Vui lòng đăng nhập để lưu công việc này' }
      });
      return;
    }

    try {
      // First get the candidate ID for the current user
      const candidateResponse = await axios.get(`http://localhost:5000/candidates?userId=${user.id}`);

      if (!candidateResponse.data || candidateResponse.data.length === 0) {
        message.error('Không tìm thấy thông tin ứng viên');
        return;
      }

      const candidateId = candidateResponse.data[0].id;

      if (isSaved) {
        // Find the saved job entry
        const savedJobResponse = await axios.get(`http://localhost:5000/savedJobs?candidateId=${candidateId}&jobId=${id}`);
        if (savedJobResponse.data && savedJobResponse.data.length > 0) {
          // Delete the saved job
          await axios.delete(`http://localhost:5000/savedJobs/${savedJobResponse.data[0].id}`);
          message.success('Đã xóa công việc khỏi danh sách đã lưu');
          setIsSaved(false);
        }
      } else {
        // Save the job
        await axios.post(`http://localhost:5000/savedJobs`, {
          candidateId: candidateId,
          jobId: parseInt(id),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        message.success('Đã lưu công việc thành công');
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error toggling saved job:', error);
      message.error('Có lỗi xảy ra khi thực hiện thao tác. Vui lòng thử lại sau.');
    }
  };

  const renderApplicationForm = () => {
    switch (applicationStep) {
      case 0:
        return (
          <div className="application-step">
            <Title level={4}>Bước 1: Thông tin cá nhân</Title>
            <Text type="secondary" className="mb-4 d-block">
              Vui lòng xác nhận thông tin cá nhân của bạn để ứng tuyển vị trí này.
            </Text>

            <Form
              form={form}
              layout="vertical"
              initialValues={{
                fullName: getFullName(),
                email: user?.email || '',
                phone: user?.phone || ''
              }}
            >
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên của bạn' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên của bạn" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email của bạn' },
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input placeholder="Nhập email của bạn" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại của bạn' }]}
              >
                <Input placeholder="Nhập số điện thoại của bạn" />
              </Form.Item>
            </Form>

            <div className="step-actions d-flex justify-content-end">
              <Button type="primary" onClick={nextStep}>
                Tiếp tục <SendOutlined />
              </Button>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="application-step">
            <Title level={4}>Bước 2: Tải lên CV</Title>
            <Text type="secondary" className="mb-4 d-block">
              Vui lòng tải lên CV của bạn để nhà tuyển dụng xem xét.
            </Text>

            <Form
              form={form}
              layout="vertical"
            >
              <Form.Item
                name="resume"
                label="CV của bạn"
                rules={[{ required: true, message: 'Vui lòng tải lên CV của bạn' }]}
              >
                {/* Use CVUploader component instead of basic Upload */}
                {fileList.length === 0 ? (
                  <CVUploader
                    onUploadSuccess={handleCvUploadSuccess}
                    onUploadError={handleCvUploadError}
                    uploadPreset={CLOUDINARY_CONFIG.uploadPresets.pdf}
                    maxSize={10}
                    disabled={applying}
                  />
                ) : (
                  <div className="uploaded-cv">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div className="file-preview">
                        <Space>
                          <FilePdfOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                          <Text strong>{fileList[0].name}</Text>
                          <Text type="success">Đã tải lên thành công</Text>
                        </Space>
                      </div>

                      <Space>
                        {fileList[0].url && (
                          <Button
                            icon={<EyeOutlined />}
                            onClick={() => window.open(fileList[0].url, '_blank')}
                          >
                            Xem CV
                          </Button>
                        )}
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => {
                            setFileList([]);
                            setUploadedCvUrl('');
                          }}
                        >
                          Xóa và tải lại
                        </Button>
                      </Space>
                    </Space>
                  </div>
                )}
              </Form.Item>

              <Form.Item
                name="coverLetter"
                label="Thư xin việc (tùy chọn)"
              >
                <TextArea
                  rows={6}
                  placeholder="Viết thư giới thiệu ngắn gọn về bản thân và lý do bạn muốn ứng tuyển vị trí này..."
                />
              </Form.Item>
            </Form>

            <div className="step-actions d-flex justify-content-between">
              <Button onClick={prevStep}>
                Quay lại
              </Button>
              <Button type="primary" onClick={nextStep}>
                Tiếp tục
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="application-step">
            <Title level={4}>Bước 3: Câu hỏi bổ sung</Title>
            <Text type="secondary" className="mb-4 d-block">
              Vui lòng trả lời các câu hỏi sau từ nhà tuyển dụng.
            </Text>

            <Form
              form={form}
              layout="vertical"
            >
              {applicationQuestions.map((question) => (
                <Form.Item
                  key={question.id}
                  name={`question_${question.id}`}
                  label={question.question}
                  rules={[{ required: question.isRequired, message: 'Vui lòng trả lời câu hỏi này' }]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Nhập câu trả lời của bạn..."
                  />
                </Form.Item>
              ))}
            </Form>

            <div className="step-actions d-flex justify-content-between">
              <Button onClick={prevStep}>
                Quay lại
              </Button>
              <Button
                type="primary"
                onClick={handleSubmitApplication}
                loading={applying}
              >
                Gửi đơn ứng tuyển
              </Button>
            </div>

            {applicationError && (
              <Alert
                message="Lỗi khi gửi đơn ứng tuyển"
                description={applicationError}
                type="error"
                showIcon
                className="mt-3"
              />
            )}
          </div>
        );

      case 3:
        return (
          <div className="application-step">
            <div className="text-center my-4">
              <CheckCircleOutlined style={{ fontSize: 60, color: '#52c41a' }} />
              <Title level={3} className="mt-3">Đã ứng tuyển thành công!</Title>
              <Text className="d-block mb-4">
                Chúc mừng! Đơn ứng tuyển của bạn đã được gửi đến nhà tuyển dụng.
                Bạn có thể theo dõi trạng thái ứng tuyển của mình trong trang cá nhân.
              </Text>

              <Space>
                <Button type="primary" onClick={handleApplicationCancel}>
                  Đóng
                </Button>
                <Button onClick={() => {
                  handleApplicationCancel(); // First close the modal
                  navigate('/candidate/applications'); // Then navigate
                }}>
                  Xem đơn ứng tuyển của tôi
                </Button>
              </Space>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">Không tìm thấy công việc</div>
      </div>
    );
  }

  return (
    <div className="job-detail-page py-5">
      <div className="container">
        <div className="row">
          {/* Main Content */}
          <div className="col-lg-8">
            <div className="card mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <h1 className="h3 mb-2">{job.title}</h1>
                    <div className="d-flex align-items-center mb-2">
                      <span className="badge bg-primary me-2">{job.jobType}</span>
                      {job.isUrgent && <span className="badge bg-danger me-2">Gấp</span>}
                      {job.isRemote && <span className="badge bg-info">Remote</span>}
                    </div>
                    <div className="text-muted">
                      <i className="bi bi-geo-alt me-1"></i>
                      {job.location}
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="h4 text-primary mb-2">{formatSalary(job.salary)}</div>
                    <div className="text-muted small">
                      <i className="bi bi-eye me-1"></i>
                      {job.views} lượt xem
                    </div>
                  </div>
                </div>

                {/* Add Save Job Button */}
                <div className="d-flex justify-content-end mb-3">
                  <Tooltip title={isSaved ? "Bỏ lưu công việc" : "Lưu công việc này"}>
                    <Button
                      icon={isSaved ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                      onClick={handleToggleSaveJob}
                      type={isSaved ? "default" : "text"}
                    >
                      {isSaved ? "Đã lưu" : "Lưu tin"}
                    </Button>
                  </Tooltip>
                </div>

                <div className="mb-4">
                  <h5 className="mb-3">Mô tả công việc</h5>
                  <p>{job.description}</p>
                </div>

                <div className="mb-4">
                  <h5 className="mb-3">Trách nhiệm</h5>
                  <ul className="list-unstyled">
                    {job.responsibilities.map((item, index) => (
                      <li key={index} className="mb-2">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h5 className="mb-3">Yêu cầu</h5>
                  <ul className="list-unstyled">
                    {job.requirements.map((item, index) => (
                      <li key={index} className="mb-2">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h5 className="mb-3">Quyền lợi</h5>
                  <ul className="list-unstyled">
                    {job.benefits.map((item, index) => (
                      <li key={index} className="mb-2">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h5 className="mb-3">Kỹ năng yêu cầu</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <span key={index} className="badge bg-light text-dark">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title mb-4">Thông tin ứng tuyển</h5>
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Hạn nộp hồ sơ:</span>
                    <span>{new Date(job.applicationDeadline).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Số lượng tuyển:</span>
                    <span>{job.positions} người</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Đã ứng tuyển:</span>
                    <span>{job.applications} người</span>
                  </div>
                </div>
                <div className="d-flex gap-2 mb-2">
                  <button
                    className="btn btn-primary flex-grow-1"
                    onClick={handleApply}
                    disabled={applying}
                  >
                    {applying ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Đang gửi...
                      </>
                    ) : (
                      'Ứng tuyển ngay'
                    )}
                  </button>

                  <button
                    className={`btn ${isSaved ? 'btn-outline-danger' : 'btn-outline-secondary'}`}
                    onClick={handleToggleSaveJob}
                  >
                    {isSaved ? <HeartFilled /> : <HeartOutlined />}
                  </button>
                </div>
              </div>
            </div>

            {/* Employer Information */}
            {employer && (
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title mb-4">Thông tin nhà tuyển dụng</h5>

                  {/* Company Header */}
                  <Link
                    to={`/companies/${employer.id}`}
                    className="text-decoration-none text-dark"
                  >
                    <div className="d-flex align-items-center mb-3 hover-effect">
                      <div className="company-logo me-3">
                        <img
                          src={employer.logo}
                          alt={employer.companyName}
                          className="rounded-circle"
                          width="60"
                          height="60"
                        />
                      </div>
                      <div>
                        <h6 className="mb-1">{employer.companyName}</h6>
                        <div className="text-muted small">
                          <i className="bi bi-building me-1"></i>
                          {employer.industry}
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Company Description */}
                  <div className="mb-3">
                    <p className="small text-muted mb-2">{employer.description}</p>
                  </div>

                  {/* Company Details */}
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-geo-alt me-2"></i>
                      <span className="small text-muted">
                        {employer?.location?.address || 'Địa chỉ không có sẵn'}, {employer?.location?.city || 'Thành phố không có sẵn'}, {employer?.location?.country || 'Quốc gia không có sẵn'}
                      </span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-people me-2"></i>
                      <span className="small text-muted">Quy mô: {employer?.companySize || 'Thông tin không có sẵn'} nhân viên</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-calendar me-2"></i>
                      <span className="small text-muted">Thành lập: {employer?.foundedYear || 'Thông tin không có sẵn'}</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-envelope me-2"></i>
                      <span className="small text-muted">{employer?.contactEmail || 'Email không có sẵn'}</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-telephone me-2"></i>
                      <span className="small text-muted">{employer?.contactPhone || 'Số điện thoại không có sẵn'}</span>
                    </div>
                  </div>


                  {/* Company Culture */}
                  <div className="mb-3">
                    <h6 className="small mb-2">Văn hóa công ty</h6>
                    <p className="small text-muted">{employer?.culture || 'Thông tin không có sẵn'}</p>
                  </div>

                  {/* Company Benefits */}
                  <div className="mb-3">
                    <h6 className="small mb-2">Quyền lợi</h6>
                    <ul className="list-unstyled small text-muted">
                      {employer?.benefits?.length > 0 ? (
                        employer.benefits.map((benefit, index) => (
                          <li key={index} className="mb-1">
                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                            {benefit}
                          </li>
                        ))
                      ) : (
                        <li className="mb-1">Không có quyền lợi</li>
                      )}
                    </ul>
                  </div>

                  {/* Social Links */}
                  <div className="d-flex gap-2">
                    {employer?.socialLinks?.linkedin && (
                      <a href={employer.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted">
                        <i className="bi bi-linkedin fs-5"></i>
                      </a>
                    )}
                    {employer?.socialLinks?.facebook && (
                      <a href={employer.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-muted">
                        <i className="bi bi-facebook fs-5"></i>
                      </a>
                    )}
                    {employer?.socialLinks?.twitter && (
                      <a href={employer.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-muted">
                        <i className="bi bi-twitter fs-5"></i>
                      </a>
                    )}
                    {employer?.website && (
                      <a href={employer.website} target="_blank" rel="noopener noreferrer" className="text-muted">
                        <i className="bi bi-globe fs-5"></i>
                      </a>
                    )}
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Modal */}
      <Modal
        title={
          <div>
            <div className="mb-3">Ứng tuyển vị trí: {job?.title}</div>
            <Steps
              current={applicationStep}
              onChange={handleStepChange}
              items={[
                { title: 'Thông tin', icon: <UserOutlined />, disabled: false },
                { title: 'CV', icon: <FileTextOutlined />, disabled: applicationStep < 1 },
                { title: 'Câu hỏi', icon: <FormOutlined />, disabled: applicationStep < 2 },
                { title: 'Hoàn tất', icon: <CheckCircleOutlined />, disabled: true }
              ]}
            />
          </div>
        }
        open={showApplicationModal}
        onCancel={handleApplicationCancel}
        footer={null}
        width={700}
        destroyOnClose
        maskClosable={!applying}
        closable={!applying}
      >
        <Divider />
        {renderApplicationForm()}
      </Modal>
    </div>
  );
};

export default JobDetail; 