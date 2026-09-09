import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Form, Input, Button, Select, DatePicker, InputNumber, Card, 
  message, Divider, Switch, Tag, Space, Tabs, Tooltip, Alert, Typography, Spin
} from 'antd';
import { 
  SaveOutlined, ArrowLeftOutlined, PlusOutlined, 
  CloseOutlined, QuestionCircleOutlined, DollarOutlined,
  EnvironmentOutlined, TeamOutlined, CalendarOutlined,
  ClockCircleOutlined, FileTextOutlined, BulbOutlined
} from '@ant-design/icons';
import moment from 'moment';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../../styles/NewJobPage.scss';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Text, Title } = Typography;

const EditJobPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [jobData, setJobData] = useState(null);
  
  // Form state
  const [jobTypes, setJobTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [jobLevels, setJobLevels] = useState([]);
  const [educationLevels, setEducationLevels] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isRemote, setIsRemote] = useState(false);
  const [salaryHidden, setSalaryHidden] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [languages, setLanguages] = useState([
    { name: "Tiếng Anh", proficiency: "intermediate" }
  ]);
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState('general');
  const [requirements, setRequirements] = useState('');
  const [benefits, setBenefits] = useState('');
  
  // Rich text editor configurations
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link'],
      ['clean']
    ],
  };
  
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link'
  ];

  // Language proficiency options
  const languageProficiencyOptions = [
    { value: 'basic', label: 'Cơ bản' },
    { value: 'intermediate', label: 'Trung bình' },
    { value: 'advanced', label: 'Nâng cao' },
    { value: 'fluent', label: 'Thành thạo' },
    { value: 'native', label: 'Bản ngữ' }
  ];

  useEffect(() => {
    fetchJobData();
    fetchOptions();
  }, [id]);

  const fetchOptions = async () => {
    try {
      // Fetch locations và jobFilters
      const [locationsRes, jobFiltersRes, categoriesRes, skillsRes] = await Promise.all([
        axios.get('http://localhost:5000/locations'),
        axios.get('http://localhost:5000/jobFilters'),
        axios.get('http://localhost:5000/categories'),
        axios.get('http://localhost:5000/skills')
      ]);
      
      // Lấy dữ liệu từ jobFilters
      const filtersData = jobFiltersRes.data;
      setJobTypes(filtersData.jobTypes || []);
      setIndustries(filtersData.industries || []);
      setJobLevels(filtersData.jobLevels || []);
      setEducationLevels(filtersData.educationLevels || []);
      
      setLocations(locationsRes.data);
      setCategories(categoriesRes.data);
      setSkills(skillsRes.data);
    } catch (error) {
      console.error('Error fetching options:', error);
      message.error('Không thể tải dữ liệu từ server');
    }
  };

  const fetchJobData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/jobs/${id}`);
      const job = response.data;
      
      // Check if job belongs to this employer
      if (job.employerId !== user.id) {
        message.error('Bạn không có quyền chỉnh sửa tin tuyển dụng này');
        navigate('/employer/jobs');
        return;
      }

      setJobData(job);
      
      // Set state from job data
      setIsRemote(job.isRemote || false);
      setIsFeatured(job.isFeatured || false);
      setIsUrgent(job.isUrgent || false);
      setPauseReason(job.pauseReason || '');
      setSalaryHidden(job.salary?.isHidden || false);
      setSelectedSkills(job.skills || []);
      setSelectedCategories(job.categories || []);
      setSelectedTags(job.tags || []);
      setLanguages(job.languages || [{ name: "Tiếng Anh", proficiency: "intermediate" }]);
      setQuestions(job.questions || []);
      
      // Ensure requirements and benefits are strings for ReactQuill
      const getStringContent = (content) => {
        if (!content) return '';
        if (typeof content === 'string') return content;
        if (Array.isArray(content)) return content.join('\n');
        return String(content);
      };
      
      // Set ReactQuill state
      setRequirements(getStringContent(job.requirements));
      setBenefits(getStringContent(job.benefits));
      
      // Set form values with safe defaults
      form.setFieldsValue({
        title: job.title || '',
        shortDescription: job.shortDescription || '',
        description: job.description || '',
        requirements: getStringContent(job.requirements),
        benefits: getStringContent(job.benefits),
        jobTypeId: job.jobTypeId,
        experienceLevelId: job.experienceLevelId,
        educationLevelId: job.educationLevelId,
        minExperienceYears: job.minExperienceYears || 0,
        locationId: job.locationId,
        industryIds: job.industryIds || [],
        positions: job.positions || 1,
        deadline: job.deadline || job.applicationDeadline ? moment(job.deadline || job.applicationDeadline) : null,
        status: job.status || 'active',
        salaryMin: job.salary?.min || 0,
        salaryMax: job.salary?.max || 0,
        salaryCurrency: job.salary?.currency || 'USD',
        salaryPeriod: job.salary?.period || 'monthly',
        workType: job.workType || 'onsite',
        visibility: job.visibility || 'public',
        skills: job.skills || []
      });
    } catch (error) {
      console.error('Error fetching job data:', error);
      message.error('Có lỗi xảy ra khi tải thông tin công việc');
      navigate('/employer/jobs');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    try {
      setSubmitLoading(true);
      
      // Convert deadline to ISO format for storage
      const deadlineISO = values.deadline ? values.deadline.format('YYYY-MM-DDT23:59:59.000Z') : null;
      
      // Helper function to process text content
      const processTextContent = (content) => {
        if (!content) return '';
        if (typeof content === 'string') {
          // If it's HTML from ReactQuill, keep it as is
          if (content.includes('<') && content.includes('>')) {
            return content;
          }
          // Otherwise split by newlines
          return content.split('\n').filter(item => item.trim() !== '');
        }
        if (Array.isArray(content)) return content;
        return String(content);
      };
      
      // Prepare data with all fields
      const jobUpdateData = {
        ...jobData,
        title: values.title || '',
        shortDescription: values.shortDescription || '',
        description: values.description || '',
        requirements: processTextContent(values.requirements),
        benefits: processTextContent(values.benefits),
        jobTypeId: values.jobTypeId,
        jobType: jobTypes.find(type => type.id === values.jobTypeId)?.name || jobData.jobType,
        experienceLevelId: values.experienceLevelId,
        experienceLevel: jobLevels.find(level => level.id === values.experienceLevelId)?.name || jobData.experienceLevel,
        minExperienceYears: values.minExperienceYears || 0,
        educationLevelId: values.educationLevelId,
        educationLevel: educationLevels.find(level => level.id === values.educationLevelId)?.name || jobData.educationLevel,
        salary: {
          min: values.salaryMin || 0,
          max: values.salaryMax || 0,
          currency: values.salaryCurrency || 'USD',
          period: values.salaryPeriod || 'monthly',
          isHidden: salaryHidden,
          salaryRangeId: jobData.salary?.salaryRangeId || "5"
        },
        locationId: isRemote ? "1" : values.locationId,
        location: isRemote ? "Remote" : locations.find(loc => loc.id === values.locationId)?.name || jobData.location,
        isRemote,
        workType: isRemote ? 'remote' : values.workType || 'onsite',
        industryIds: values.industryIds || ["1"],
        skills: selectedSkills || [],
        categories: selectedCategories || [],
        positions: values.positions || 1,
        applicationDeadline: deadlineISO,
        deadline: deadlineISO,
        status: values.status || 'active',
        isFeatured,
        isUrgent,
        pauseReason: values.status === 'paused' ? pauseReason : '',
        pausedAt: values.status === 'paused' ? moment().format('YYYY-MM-DDT14:30:00.000Z') : null,
        questions: questions
          .filter(q => q.question?.trim() !== '')
          .map(q => ({
            id: q.id,
            question: q.question,
            isRequired: q.isRequired
          })),
        languages: languages || [],
        tags: [...(selectedTags || []), ...(selectedSkills || []).slice(0, 3)],
        visibility: values.visibility || 'public',
        updatedAt: new Date().toISOString()
      };
      
      await axios.put(`http://localhost:5000/jobs/${id}`, jobUpdateData);
      
      message.success('Cập nhật tin tuyển dụng thành công');
      navigate('/employer/jobs');
    } catch (error) {
      console.error('Error updating job:', error);
      message.error('Có lỗi xảy ra khi cập nhật tin tuyển dụng');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handler functions
  const handleSkillAdd = () => {
    if (newSkill && !selectedSkills.includes(newSkill)) {
      setSelectedSkills([...selectedSkills, newSkill]);
      setNewSkill('');
    }
  };

  const handleSkillRemove = (skill) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const handleSkillSelect = (value) => {
    if (!selectedSkills.includes(value)) {
      setSelectedSkills([...selectedSkills, value]);
    }
  };

  const handleCategoryChange = (selectedCats) => {
    setSelectedCategories(selectedCats);
  };

  const addQuestion = () => {
    setQuestions([...questions, { 
      id: Date.now().toString(), 
      question: '', 
      isRequired: false 
    }]);
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handleTagAdd = () => {
    if (newTag && !selectedTags.includes(newTag)) {
      setSelectedTags([...selectedTags, newTag]);
      setNewTag('');
    }
  };

  const handleTagRemove = (tag) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const handleLanguageChange = (index, field, value) => {
    const newLanguages = [...languages];
    newLanguages[index][field] = value;
    setLanguages(newLanguages);
  };

  const addLanguage = () => {
    setLanguages([...languages, { name: '', proficiency: 'intermediate' }]);
  };

  const removeLanguage = (index) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spin size="large" />
        <Text className="ms-3">Đang tải thông tin công việc...</Text>
      </div>
    );
  }

  return (
    <div className="new-job-page">
      <Card>
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

        <Alert
          message="Chỉnh sửa tin tuyển dụng"
          description="Cập nhật thông tin chi tiết để thu hút ứng viên phù hợp. Tin tuyển dụng sẽ được kiểm duyệt lại nếu có thay đổi quan trọng."
          type="info"
          showIcon
          className="mb-4"
        />
        
        <Form
          id="jobForm"
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={true}
        >
          <Tabs activeKey={activeTab} onChange={handleTabChange}>
            <TabPane 
              tab={
                <span>
                  <FileTextOutlined /> Thông tin cơ bản
                </span>
              } 
              key="general"
            >
              <div className="row">
                <div className="col-md-8">
                  <Form.Item
                    name="title"
                    label="Tiêu đề tin tuyển dụng"
                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                  >
                    <Input placeholder="VD: Tuyển dụng Senior Frontend Developer" />
                  </Form.Item>

                  <Form.Item
                    name="shortDescription"
                    label="Mô tả ngắn"
                    rules={[{ required: true, message: 'Vui lòng nhập mô tả ngắn' }]}
                  >
                    <TextArea 
                      placeholder="Mô tả ngắn gọn về vị trí tuyển dụng (hiển thị ở trang kết quả tìm kiếm)" 
                      rows={2}
                      showCount
                      maxLength={150}
                    />
                  </Form.Item>

                  <Form.Item
                    name="description"
                    label="Mô tả công việc"
                    rules={[{ required: true, message: 'Vui lòng nhập mô tả công việc' }]}
                  >
                    <ReactQuill 
                      theme="snow" 
                      modules={modules}
                      formats={formats}
                      placeholder="Mô tả chi tiết về công việc..."
                    />
                  </Form.Item>
                </div>

                <div className="col-md-4">
                  <Card title="Thông tin cơ bản" className="mb-3">
                    <Form.Item
                      name="positions"
                      label="Số lượng tuyển"
                      rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                    >
                      <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                      name="deadline"
                      label="Hạn nộp hồ sơ"
                      rules={[{ required: true, message: 'Vui lòng chọn hạn nộp hồ sơ' }]}
                    >
                      <DatePicker 
                        style={{ width: '100%' }} 
                        format="DD/MM/YYYY"
                        disabledDate={(current) => current && current < moment().startOf('day')}
                      />
                    </Form.Item>

                    <Form.Item
                      name="status"
                      label="Trạng thái"
                    >
                      <Select onChange={(value) => value === 'paused' && setActiveTab('general')}>
                        <Option value="active">Đang hoạt động (Active)</Option>
                        <Option value="paused">Tạm dừng (Paused)</Option>
                        <Option value="closed">Đã đóng (Closed)</Option>
                        <Option value="expired">Hết hạn (Expired)</Option>
                        <Option value="pending">Chờ duyệt (Pending)</Option>
                      </Select>
                    </Form.Item>

                    {form.getFieldValue('status') === 'paused' && (
                      <Form.Item
                        name="pauseReason"
                        label="Lý do tạm dừng"
                      >
                        <TextArea 
                          placeholder="Nhập lý do tạm dừng tin tuyển dụng" 
                          rows={2}
                          value={pauseReason}
                          onChange={(e) => setPauseReason(e.target.value)}
                        />
                      </Form.Item>
                    )}
                  </Card>

                  <Card title="Quảng cáo tin" className="mb-3">
                    <Form.Item 
                      label={
                        <span>
                          Tin nổi bật
                          <Tooltip title="Tin tuyển dụng sẽ được hiển thị trên trang chủ và đánh dấu là nổi bật">
                            <QuestionCircleOutlined className="ms-1" />
                          </Tooltip>
                        </span>
                      }
                    >
                      <Switch
                        checked={isFeatured}
                        onChange={setIsFeatured}
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span>
                          Tin khẩn cấp
                          <Tooltip title="Tin tuyển dụng sẽ được đánh dấu là khẩn cấp và được ưu tiên trong kết quả tìm kiếm">
                            <QuestionCircleOutlined className="ms-1" />
                          </Tooltip>
                        </span>
                      }
                    >
                      <Switch
                        checked={isUrgent}
                        onChange={setIsUrgent}
                      />
                    </Form.Item>
                  </Card>
                </div>
              </div>
            </TabPane>

            <TabPane 
              tab={
                <span>
                  <TeamOutlined /> Yêu cầu & Phúc lợi
                </span>
              } 
              key="details"
            >
              <div className="row">
                <div className="col-md-6">
                  <Form.Item
                    name="requirements"
                    label="Yêu cầu công việc"
                    rules={[{ required: true, message: 'Vui lòng nhập yêu cầu công việc' }]}
                  >
                    <ReactQuill 
                      theme="snow" 
                      modules={modules}
                      formats={formats}
                      placeholder="Liệt kê các yêu cầu, kỹ năng cần thiết cho vị trí này..."
                      value={requirements}
                      onChange={(value) => {
                        setRequirements(value);
                        form.setFieldsValue({ requirements: value });
                      }}
                    />
                  </Form.Item>
                </div>

                <div className="col-md-6">
                  <Form.Item
                    name="benefits"
                    label="Quyền lợi"
                    rules={[{ required: true, message: 'Vui lòng nhập quyền lợi' }]}
                  >
                    <ReactQuill 
                      theme="snow" 
                      modules={modules}
                      formats={formats}
                      placeholder="Mô tả các quyền lợi, phúc lợi khi làm việc tại công ty của bạn..."
                      value={benefits}
                      onChange={(value) => {
                        setBenefits(value);
                        form.setFieldsValue({ benefits: value });
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
            </TabPane>

            <TabPane 
              tab={
                <span>
                  <DollarOutlined /> Lương & Phân loại
                </span>
              } 
              key="salary"
            >
              <div className="row">
                <div className="col-md-6">
                  <Card title="Mức lương" className="mb-3">
                    <Form.Item
                      name="salaryMin"
                      label="Lương tối thiểu"
                      rules={[{ required: true, message: 'Vui lòng nhập lương tối thiểu' }]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      />
                    </Form.Item>

                    <Form.Item
                      name="salaryMax"
                      label="Lương tối đa"
                      rules={[{ required: true, message: 'Vui lòng nhập lương tối đa' }]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      />
                    </Form.Item>

                    <Form.Item
                      name="salaryCurrency"
                      label="Đơn vị tiền tệ"
                      rules={[{ required: true, message: 'Vui lòng chọn đơn vị tiền tệ' }]}
                    >
                      <Select>
                        <Option value="VND">VND</Option>
                        <Option value="USD">USD</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="salaryPeriod"
                      label="Chu kỳ trả lương"
                    >
                      <Select>
                        <Option value="hourly">Theo giờ</Option>
                        <Option value="daily">Theo ngày</Option>
                        <Option value="weekly">Theo tuần</Option>
                        <Option value="monthly">Theo tháng</Option>
                        <Option value="yearly">Theo năm</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item 
                      label={
                        <span>
                          Ẩn mức lương
                          <Tooltip title="Không hiển thị mức lương trong tin tuyển dụng">
                            <QuestionCircleOutlined className="ms-1" />
                          </Tooltip>
                        </span>
                      }
                    >
                      <Switch
                        checked={salaryHidden}
                        onChange={setSalaryHidden}
                      />
                    </Form.Item>
                  </Card>
                </div>

                <div className="col-md-6">
                  <Card title="Trình độ & Kinh nghiệm" className="mb-3">
                    <Form.Item
                      name="experienceLevelId"
                      label="Cấp bậc"
                      rules={[{ required: true, message: 'Vui lòng chọn cấp bậc' }]}
                    >
                      <Select placeholder="Chọn cấp bậc">
                        {jobLevels.map(level => (
                          <Option key={level.id} value={level.id}>{level.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="minExperienceYears"
                      label="Số năm kinh nghiệm tối thiểu"
                      rules={[{ required: true, message: 'Vui lòng nhập số năm kinh nghiệm' }]}
                    >
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                      name="educationLevelId"
                      label="Trình độ học vấn"
                      rules={[{ required: true, message: 'Vui lòng chọn trình độ học vấn' }]}
                    >
                      <Select placeholder="Chọn trình độ học vấn">
                        {educationLevels.map(level => (
                          <Option key={level.id} value={level.id}>{level.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Card>
                </div>
              </div>
            </TabPane>

            <TabPane 
              tab={
                <span>
                  <EnvironmentOutlined /> Địa điểm & Loại hình
                </span>
              } 
              key="location"
            >
              <div className="row">
                <div className="col-md-6">
                  <Card title="Địa điểm làm việc" className="mb-3">
                    <Form.Item 
                      label={
                        <span>
                          Làm việc từ xa (Remote)
                          <Tooltip title="Cho phép nhân viên làm việc từ xa hoàn toàn">
                            <QuestionCircleOutlined className="ms-1" />
                          </Tooltip>
                        </span>
                      }
                    >
                      <Switch
                        checked={isRemote}
                        onChange={setIsRemote}
                      />
                    </Form.Item>

                    <Form.Item
                      name="locationId"
                      label="Địa điểm"
                      rules={[{ required: !isRemote, message: 'Vui lòng chọn địa điểm' }]}
                    >
                      <Select placeholder="Chọn địa điểm" disabled={isRemote}>
                        {locations.map(location => (
                          <Option key={location.id} value={location.id}>{location.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="workType"
                      label="Hình thức làm việc"
                      rules={[{ required: true, message: 'Vui lòng chọn hình thức làm việc' }]}
                    >
                      <Select
                        placeholder="Chọn hình thức làm việc"
                        disabled={isRemote}
                      >
                        <Option value="onsite">Tại văn phòng</Option>
                        <Option value="hybrid">Kết hợp (Hybrid)</Option>
                        <Option value="remote">Từ xa (Remote)</Option>
                      </Select>
                    </Form.Item>
                  </Card>
                </div>

                <div className="col-md-6">
                  <Card title="Loại công việc" className="mb-3">
                    <Form.Item
                      name="jobTypeId"
                      label="Loại hình công việc"
                      rules={[{ required: true, message: 'Vui lòng chọn loại hình công việc' }]}
                    >
                      <Select placeholder="Chọn loại hình công việc">
                        {jobTypes.map(type => (
                          <Option key={type.id} value={type.id}>{type.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="industryIds"
                      label="Ngành nghề"
                      rules={[{ required: true, message: 'Vui lòng chọn ngành nghề' }]}
                    >
                      <Select 
                        mode="multiple" 
                        placeholder="Chọn ngành nghề"
                        maxTagCount="responsive"
                      >
                        {industries.map(industry => (
                          <Option key={industry.id} value={industry.id}>{industry.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Card>
                </div>
              </div>
            </TabPane>

            <TabPane 
              tab={
                <span>
                  <BulbOutlined /> Kỹ năng & Tags
                </span>
              } 
              key="skills"
            >
              <div className="row">
                <div className="col-md-6">
                  <Card title="Kỹ năng yêu cầu" className="mb-3">
                    <Form.Item label="Thêm kỹ năng">
                      <div className="d-flex mb-2">
                        <Select
                          style={{ flex: 1, marginRight: 8 }}
                          placeholder="Chọn kỹ năng"
                          value={newSkill}
                          onChange={setNewSkill}
                          showSearch
                        >
                          {skills.map(skill => (
                            <Option key={skill.id} value={skill.name}>{skill.name}</Option>
                          ))}
                        </Select>
                        <Button type="primary" onClick={handleSkillAdd} icon={<PlusOutlined />} />
                      </div>
                      <div className="mb-2">
                        <Input
                          placeholder="Hoặc nhập kỹ năng mới"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onPressEnter={handleSkillAdd}
                        />
                      </div>
                    </Form.Item>

                    <Form.Item label="Kỹ năng đã chọn">
                      <div>
                        {selectedSkills.map(skill => (
                          <Tag 
                            key={skill} 
                            closable 
                            onClose={() => handleSkillRemove(skill)}
                            color="blue"
                          >
                            {skill}
                          </Tag>
                        ))}
                      </div>
                    </Form.Item>
                  </Card>
                </div>

                <div className="col-md-6">
                  <Card title="Tags & Từ khóa" className="mb-3">
                    <Form.Item label="Thêm tag">
                      <div className="d-flex mb-2">
                        <Input
                          style={{ flex: 1, marginRight: 8 }}
                          placeholder="Nhập tag mới"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onPressEnter={handleTagAdd}
                        />
                        <Button type="primary" onClick={handleTagAdd} icon={<PlusOutlined />} />
                      </div>
                    </Form.Item>

                    <Form.Item label="Tags đã chọn">
                      <div>
                        {selectedTags.map(tag => (
                          <Tag 
                            key={tag} 
                            closable 
                            onClose={() => handleTagRemove(tag)}
                            color="green"
                          >
                            {tag}
                          </Tag>
                        ))}
                      </div>
                    </Form.Item>
                  </Card>
                </div>
              </div>
            </TabPane>

            <TabPane 
              tab={
                <span>
                  <QuestionCircleOutlined /> Câu hỏi ứng tuyển
                </span>
              } 
              key="questions"
            >
              <Card title="Câu hỏi cho ứng viên" className="mb-3">
                <Alert
                  message="Thêm câu hỏi tùy chỉnh"
                  description="Tạo các câu hỏi để hiểu rõ hơn về ứng viên trước khi phỏng vấn"
                  type="info"
                  showIcon
                  className="mb-3"
                />
                
                {questions.map((question, index) => (
                  <div key={question.id} className="border rounded p-3 mb-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Text strong>Câu hỏi {index + 1}</Text>
                      <Button 
                        type="text" 
                        danger 
                        icon={<CloseOutlined />}
                        onClick={() => removeQuestion(question.id)}
                      />
                    </div>
                    <Input.TextArea
                      placeholder="Nhập câu hỏi của bạn"
                      value={question.question}
                      onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                      rows={2}
                      className="mb-2"
                    />
                    <Switch
                      checked={question.isRequired}
                      onChange={(checked) => updateQuestion(question.id, 'isRequired', checked)}
                    />
                    <span className="ms-2">Bắt buộc trả lời</span>
                  </div>
                ))}
                
                <Button 
                  type="dashed" 
                  onClick={addQuestion}
                  icon={<PlusOutlined />}
                  block
                >
                  Thêm câu hỏi
                </Button>
              </Card>
            </TabPane>
          </Tabs>

          <Divider />

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={submitLoading}
                size="large"
              >
                Cập nhật tin tuyển dụng
              </Button>
              <Button
                onClick={() => navigate('/employer/jobs')}
                size="large"
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditJobPage;
