import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider, Alert, Space } from 'antd';
import { SendOutlined, FilePdfOutlined, UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { uploadPDF } from '../../../services/fileService';
import FileUpload from '../../common/FileUpload';
import CVUploader from '../../common/CVUploader';

const { Title, Text } = Typography;
const { TextArea } = Input;

/**
 * Application form component for job applications
 */
const ApplicationForm = ({ 
  jobId, 
  jobTitle,
  companyName,
  questions = [],
  onSuccess = () => {},
  onCancel = () => {}
}) => {
  const { user } = useSelector((state) => state.auth);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [uploadedCvUrl, setUploadedCvUrl] = useState('');
  const [candidateProfile, setCandidateProfile] = useState(null);

  // Fetch candidate profile on component mount
  useEffect(() => {
    const fetchCandidateProfile = async () => {
      if (user && user.id) {
        try {
          // Get candidate profile
          const response = await axios.get(`http://localhost:5000/candidates/${user.id}`);
          if (response.data) {
            setCandidateProfile(response.data);
            
            // Pre-fill form with candidate data
            form.setFieldsValue({
              fullName: response.data.fullName || user.name,
              email: response.data.email || user.email,
              phone: response.data.phone || '',
            });
          }
        } catch (error) {
          console.error('Error fetching candidate profile:', error);
        }
      }
    };

    fetchCandidateProfile();
  }, [user, form]);

  // Handle PDF upload success
  const handlePdfUploadSuccess = (result) => {
    console.log('Upload success response:', result);
    
    // Store the secure URL and other details from Cloudinary response
    if (result && result.data) {
      setUploadedCvUrl(result.data.secure_url);
      setCvFile({
        name: result.data.original_filename || 'CV Document.pdf',
        url: result.data.url,
        secureUrl: result.data.secure_url
      });
      message.success('Tải CV lên thành công');
    } else {
      console.error('Invalid response format from Cloudinary:', result);
      message.error('Định dạng phản hồi từ máy chủ không hợp lệ');
      setCvFile(null);
      setUploadedCvUrl('');
    }
  };

  // Handle PDF upload error
  const handlePdfUploadError = (error) => {
    console.error('PDF upload error:', error);
    message.error(`Không thể tải CV lên: ${error}`);
    setCvFile(null);
    setUploadedCvUrl('');
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    if (!uploadedCvUrl) {
      message.error('Vui lòng tải CV lên trước khi nộp đơn');
      return;
    }

    setLoading(true);

    try {
      // Get candidate ID from user ID
      let candidateId = user.id;
      
      // If candidate profile doesn't exist, create one
      if (!candidateProfile) {
        const candidateData = {
          userId: user.id,
          fullName: values.fullName,
          email: values.email,
          phone: values.phone
        };
        
        const candidateResponse = await axios.post('http://localhost:5000/candidates', candidateData);
        candidateId = candidateResponse.data.id;
      }

      // Kiểm tra xem ứng viên đã ứng tuyển công việc này trước đó chưa
      const checkResponse = await axios.get(`http://localhost:5000/applications?candidateId=${candidateId}&jobId=${jobId}`);
      const existingApplications = checkResponse.data || [];
      console.log('Existing applications for this job:', existingApplications);
      
      // Lọc ra các đơn ứng tuyển hoạt động và đã rút hồ sơ
      const activeApplications = existingApplications.filter(app => app.status !== 'withdrawn');
      const withdrawnApplications = existingApplications.filter(app => app.status === 'withdrawn');
      
      console.log('Active applications:', activeApplications);
      console.log('Withdrawn applications:', withdrawnApplications);
      
      if (activeApplications.length > 0) {
        // Hiển thị thông báo chi tiết với trạng thái cụ thể
        const application = activeApplications[0];
        const statusText = {
          'pending': 'đang chờ xử lý',
          'reviewing': 'đang được xem xét',
          'interviewing': 'đã được mời phỏng vấn',
          'offered': 'đã được đề nghị việc làm',
          'hired': 'đã được tuyển dụng',
          'rejected': 'đã bị từ chối'
        }[application.status] || 'đang trong quá trình xử lý';
        
        console.log(`Found active application with status: ${application.status}, cannot apply`);
        message.error(`Bạn đã ứng tuyển vị trí này và đơn của bạn ${statusText}. Không thể ứng tuyển lại.`);
        setLoading(false);
        return;
      }
      
      // Kiểm tra xem có đơn nào đã rút hồ sơ không để hiển thị thông báo
      if (withdrawnApplications.length > 0) {
        console.log('Found withdrawn applications, proceeding with reapplication');
        message.info('Bạn đang nộp lại đơn ứng tuyển sau khi đã rút hồ sơ trước đó.');
      }

      // Prepare answers to custom questions
      const answers = questions.map(q => ({
        questionId: q.id,
        question: q.question,
        answer: values[`question_${q.id}`] || '',
        isRequired: q.isRequired
      }));

      // Create resume object from CV file
      const resume = {
        url: uploadedCvUrl,
        name: cvFile.name || 'CV Document.pdf'
      };

      // Create application data
      const applicationData = {
        jobId: parseInt(jobId),
        candidateId,
        appliedAt: new Date().toISOString(),
        status: 'pending',
        coverLetter: values.coverLetter || '',
        resume: resume,
        resumeUrl: uploadedCvUrl, // For backward compatibility
        answers,
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        stageHistory: [
          {
            stage: 1,
            enteredAt: new Date().toISOString(),
            exitedAt: null,
            notes: withdrawnApplications.length > 0 
              ? "Ứng viên nộp lại hồ sơ sau khi đã rút hồ sơ trước đó."
              : "Hồ sơ đang chờ xét duyệt."
          }
        ],
        currentStage: 1,
        updatedAt: new Date().toISOString(),
        // Add reappliedAt if this is a reapplication
        ...(withdrawnApplications.length > 0 ? { reappliedAt: new Date().toISOString() } : {})
      };

      console.log('Submitting application data:', applicationData);

      // Submit application
      const response = await axios.post('http://localhost:5000/applications', applicationData);
      console.log('Application submission response:', response.data);
      
      message.success('Nộp đơn ứng tuyển thành công');
      onSuccess(applicationData);
    } catch (error) {
      console.error('Error submitting application:', error);
      message.error('Không thể nộp đơn ứng tuyển. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="application-form">
      <Card>
        <Title level={4}>Ứng tuyển cho: {jobTitle}</Title>
        <Text type="secondary">tại {companyName}</Text>
        
        <Divider />
        
        <Alert
          message="Lưu ý quan trọng: Chuẩn bị CV của bạn"
          description="Bạn cần tải lên CV của mình dưới định dạng PDF để hoàn tất đơn ứng tuyển."
          type="info"
          showIcon
          className="mb-4"
        />
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={true}
        >
          {/* Personal Information */}
          <Title level={5}>Thông tin cá nhân</Title>
          
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Họ và tên của bạn" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Vui lòng nhập email hợp lệ' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Địa chỉ email của bạn" />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại của bạn" />
          </Form.Item>
          
          {/* CV Upload */}
          <Title level={5} className="mt-4">CV/Sơ yếu lý lịch</Title>
          
          <Form.Item
            label="Tải lên CV của bạn (định dạng PDF)"
            required
            tooltip="Vui lòng tải lên CV của bạn dưới định dạng PDF"
          >
            <CVUploader 
              onUploadSuccess={handlePdfUploadSuccess}
              onUploadError={handlePdfUploadError}
              uploadPreset="upload-pdf"
              maxSize={10} // 10MB max
              disabled={loading}
            />
          </Form.Item>
          
          {/* Cover Letter */}
          <Title level={5} className="mt-4">Thư xin việc (Không bắt buộc)</Title>
          
          <Form.Item
            name="coverLetter"
            label="Thư xin việc"
          >
            <TextArea 
              rows={6} 
              placeholder="Viết một thư xin việc ngắn gọn giải thích tại sao bạn phù hợp với vị trí này..." 
            />
          </Form.Item>
          
          {/* Custom Questions */}
          {questions && questions.length > 0 && (
            <>
              <Title level={5} className="mt-4">Câu hỏi bổ sung</Title>
              
              {questions.map((question) => (
                <Form.Item
                  key={question.id}
                  name={`question_${question.id}`}
                  label={question.question}
                  rules={[
                    { 
                      required: question.isRequired, 
                      message: `Vui lòng trả lời câu hỏi này` 
                    }
                  ]}
                >
                  <TextArea 
                    rows={3} 
                    placeholder="Câu trả lời của bạn..." 
                  />
                </Form.Item>
              ))}
            </>
          )}
          
          {/* Submit Buttons */}
          <Divider />
          
          <Form.Item className="mt-4">
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SendOutlined />} 
                loading={loading}
                disabled={!uploadedCvUrl}
              >
                Nộp đơn ứng tuyển
              </Button>
              
              <Button onClick={onCancel}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ApplicationForm;
