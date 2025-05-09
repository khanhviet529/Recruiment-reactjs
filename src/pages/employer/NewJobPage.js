import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Form, Input, Button, Select, DatePicker, InputNumber, Card, 
  message, Divider, Switch, Tag, Space, Tabs, Tooltip, Alert, Typography 
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
const { Text } = Typography;

const NewJobPage = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
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
  const [isRemote, setIsRemote] = useState(true);
  const [salaryHidden, setSalaryHidden] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [languages, setLanguages] = useState([
    { name: "Tiếng Anh", proficiency: "intermediate" }
  ]);
  const [questions, setQuestions] = useState([
    { 
      id: "1", 
      question: "Mô tả kinh nghiệm của bạn với các dự án full stack?", 
      isRequired: true 
    },
    { 
      id: "2", 
      question: "Bạn đã từng làm việc remote chưa và bạn thích nghi với nó như thế nào?", 
      isRequired: true 
    }
  ]);
  const [activeTab, setActiveTab] = useState('general');
  
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
    fetchOptions();
    
    // Set initial tags based on the example data
    setSelectedTags(["Remote", "Full Stack", "JavaScript", "React", "Node.js"]);
    
    // Set initial skills based on the example data
    setSelectedSkills(["JavaScript", "TypeScript", "React", "Node.js", "MongoDB", "AWS"]);
    
    // Set initial categories
    setSelectedCategories(["1", "2", "7"]); // Assuming these IDs map to the given categories
  }, []);

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

  const onFinish = async (values) => {
    try {
      setLoading(true);
      
      // Convert deadline to ISO format for storage
      const deadlineISO = values.deadline.format('YYYY-MM-DDT23:59:59.000Z');
      const postedAtISO = moment().format('YYYY-MM-DDT10:00:00.000Z');
      
      // Prepare data with all fields
      const jobData = {
        employerId: user.id,
        title: values.title,
        description: values.description,
        shortDescription: values.shortDescription,
        responsibilities: Array.isArray(values.responsibilities) 
          ? values.responsibilities 
          : values.responsibilities.split('\n').filter(item => item.trim() !== ''),
        requirements: Array.isArray(values.requirements) 
          ? values.requirements 
          : values.requirements.split('\n').filter(item => item.trim() !== ''),
        benefits: Array.isArray(values.benefits) 
          ? values.benefits 
          : values.benefits.split('\n').filter(item => item.trim() !== ''),
        jobTypeId: values.jobTypeId,
        jobType: jobTypes.find(type => type.id === values.jobTypeId)?.name || "remote",
        experienceLevelId: values.experienceLevelId,
        experienceLevel: jobLevels.find(level => level.id === values.experienceLevelId)?.name || "intermediate",
        minExperienceYears: values.minExperienceYears || 0,
        educationLevelId: values.educationLevelId,
        educationLevel: educationLevels.find(level => level.id === values.educationLevelId)?.name || "bachelor",
        salary: {
          min: values.salaryMin,
          max: values.salaryMax,
          currency: values.salaryCurrency,
          period: values.salaryPeriod || 'monthly',
          isHidden: salaryHidden,
          salaryRangeId: "5" // This would ideally be determined based on range
        },
        locationId: isRemote ? "1" : values.locationId,
        location: isRemote ? "Remote" : locations.find(loc => loc.id === values.locationId)?.name || "Remote",
        isRemote,
        workType: isRemote ? 'remote' : values.workType || 'onsite',
        industryIds: values.industryIds || ["1"],
        skills: selectedSkills,
        categories: selectedCategories.map(id => {
          const category = categories.find(cat => cat.id === id);
          return category ? category.name : id;
        }),
        positions: values.positions || 1,
        applicationDeadline: deadlineISO,
        postedAt: postedAtISO,
        status: values.status || 'active',
        isFeatured,
        isUrgent,
        pauseReason: values.status === 'paused' ? pauseReason : '',
        pausedAt: values.status === 'paused' ? moment().format('YYYY-MM-DDT14:30:00.000Z') : null,
        views: 0,
        applications: 0,
        questions: questions
          .filter(q => q.question.trim() !== '')
          .map(q => ({
            id: q.id,
            question: q.question,
            isRequired: q.isRequired
          })),
        languages,
        tags: [...selectedTags, ...selectedSkills.slice(0, 3)],
        visibility: values.visibility || 'public',
        displayInFeed: true,
        allowSearch: true,
        premium: false,
        companyName: user.companyName || "Digital Enterprise",
        companyLogo: user.companyLogo || "https://via.placeholder.com/150?text=DE",
        createdAt: moment().format(),
        updatedAt: moment().format()
      };
      
      console.log('Submitting job data:', jobData);

      // Submit to API
      await axios.post('http://localhost:5000/jobs', jobData);
      message.success('Đăng tin tuyển dụng thành công');
      navigate('/employer/jobs');
    } catch (error) {
      console.error('Error creating job:', error);
      message.error('Có lỗi xảy ra khi đăng tin');
    } finally {
      setLoading(false);
    }
  };

  // Handle skills selection
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

  // Handle category selection
  const handleCategoryChange = (selectedCats) => {
    setSelectedCategories(selectedCats);
  };

  // Generate hierarchical category options
  const generateCategoryOptions = (categoriesData) => {
    // Group categories by parent
    const categoriesByParent = {};
    const rootCategories = [];

    categoriesData.forEach(category => {
      if (!category.parentId) {
        rootCategories.push(category);
      } else {
        if (!categoriesByParent[category.parentId]) {
          categoriesByParent[category.parentId] = [];
        }
        categoriesByParent[category.parentId].push(category);
      }
    });

    // Generate options recursively
    const generateOptions = (categories) => {
      return categories.map(category => {
        const children = categoriesByParent[category.id];
        if (children && children.length > 0) {
          return (
            <Select.OptGroup key={category.id} label={category.name}>
              <Option key={category.id} value={category.id}>{category.name}</Option>
              {generateOptions(children)}
            </Select.OptGroup>
          );
        }
        return <Option key={category.id} value={category.id}>{category.name}</Option>;
      });
    };

    return generateOptions(rootCategories);
  };

  // Handle questions
  const addQuestion = () => {
    // Generate a unique string ID for the question (using timestamp)
    const newId = Date.now().toString();
    setQuestions([...questions, { id: newId, question: '', isRequired: true }]);
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // Handle tag selection
  const handleTagAdd = () => {
    if (newTag && !selectedTags.includes(newTag)) {
      setSelectedTags([...selectedTags, newTag]);
      setNewTag('');
    }
  };

  const handleTagRemove = (tag) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  // Handle language changes
  const handleLanguageChange = (index, field, value) => {
    const newLanguages = [...languages];
    newLanguages[index][field] = value;
    setLanguages(newLanguages);
  };

  const addLanguage = () => {
    setLanguages([...languages, { name: '', proficiency: 'basic' }]);
  };

  const removeLanguage = (index) => {
    const newLanguages = [...languages];
    newLanguages.splice(index, 1);
    setLanguages(newLanguages);
  };

  return (
    <div className="new-job-page">
      <div className="page-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <Button 
              type="link" 
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/employer/jobs')}
            >
              Quay lại
            </Button>
            <h2>Đăng tin tuyển dụng mới</h2>
          </div>
          <Button 
            type="primary" 
            form="jobForm"
            htmlType="submit" 
            icon={<SaveOutlined />}
            loading={loading}
            size="large"
          >
            Đăng tin tuyển dụng
          </Button>
        </div>
      </div>

      <Card>
        <Alert
          message="Tạo tin tuyển dụng hiệu quả"
          description="Cung cấp thông tin chi tiết và cụ thể để thu hút ứng viên phù hợp. Tin tuyển dụng sẽ được kiểm duyệt trước khi hiển thị."
          type="info"
          showIcon
          className="mb-4"
        />
        
        <Form
          id="jobForm"
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            status: 'active',
            salaryCurrency: 'USD',
            salaryPeriod: 'monthly',
            jobTypeId: '4', // Remote
            workType: 'remote',
            experienceLevelId: '3', // Regular employee
            educationLevelId: '3', // Bachelor
            visibility: 'public',
            positions: 2,
            minExperienceYears: 3,
            salaryMin: 2000,
            salaryMax: 3500
          }}
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
                    label="Mô tả công việc chi tiết"
                    rules={[{ required: true, message: 'Vui lòng nhập mô tả chi tiết' }]}
                  >
                    <ReactQuill 
                      theme="snow" 
                      modules={modules}
                      formats={formats}
                      placeholder="Mô tả chi tiết về công việc, nhiệm vụ, trách nhiệm..."
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
                    name="responsibilities"
                    label="Trách nhiệm công việc"
                    rules={[{ required: true, message: 'Vui lòng nhập trách nhiệm công việc' }]}
                  >
                    <ReactQuill 
                      theme="snow" 
                      modules={modules}
                      formats={formats}
                      placeholder="Liệt kê các trách nhiệm chính của vị trí này..."
                    />
                  </Form.Item>
                </div>
                
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
                    />
                  </Form.Item>
                </div>

                <div className="col-md-12">
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
                    />
                  </Form.Item>
                </div>
              </div>
            </TabPane>

            <TabPane 
              tab={
                <span>
                  <BulbOutlined /> Kỹ năng & Chuyên môn
                </span>
              } 
              key="skills"
            >
              <div className="row">
                <div className="col-md-6">
                  <Card title="Kỹ năng chuyên môn" className="mb-3">
                    <Form.Item label="Kỹ năng">
                      <Select
                        placeholder="Chọn kỹ năng"
                        showSearch
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        onSelect={handleSkillSelect}
                        value={null}
                      >
                        {skills.map(skill => (
                          <Option key={skill.id} value={skill.name}>{skill.name}</Option>
                        ))}
                      </Select>
                      
                      <div className="mt-2 mb-3">
                        <Input
                          placeholder="Thêm kỹ năng mới"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onPressEnter={handleSkillAdd}
                          suffix={
                            <Button 
                              type="text" 
                              icon={<PlusOutlined />} 
                              onClick={handleSkillAdd}
                            />
                          }
                        />
                      </div>
                      
                      <div className="skill-tags">
                        {selectedSkills.map(skill => (
                          <Tag
                            key={skill}
                            closable
                            onClose={() => handleSkillRemove(skill)}
                            className="mb-1 me-1"
                          >
                            {skill}
                          </Tag>
                        ))}
                      </div>
                    </Form.Item>

                    <Form.Item
                      name="categories"
                      label="Danh mục"
                      rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 danh mục' }]}
                    >
                      <Select
                        mode="multiple"
                        placeholder="Chọn danh mục"
                        onChange={handleCategoryChange}
                        value={selectedCategories}
                      >
                        {generateCategoryOptions(categories)}
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
                      >
                        {industries.map(industry => (
                          <Option key={industry.id} value={industry.id}>{industry.name}</Option>
                        ))}
                      </Select>
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
                  
                  <Card title="Yêu cầu ngôn ngữ" className="mb-3">
                    <div className="mb-3">
                      <Text type="secondary">
                        Chọn ngôn ngữ và trình độ yêu cầu cho vị trí này
                      </Text>
                    </div>
                    
                    {languages.map((language, index) => (
                      <div key={index} className="language-item mb-3">
                        <div className="d-flex align-items-start">
                          <div className="flex-grow-1 me-2">
                            <Input
                              placeholder="Tên ngôn ngữ"
                              value={language.name}
                              onChange={(e) => handleLanguageChange(index, 'name', e.target.value)}
                              className="mb-2"
                            />
                            <Select 
                              style={{ width: '100%' }} 
                              value={language.proficiency}
                              onChange={(value) => handleLanguageChange(index, 'proficiency', value)}
                            >
                              {languageProficiencyOptions.map(option => (
                                <Option key={option.value} value={option.value}>
                                  {option.label}
                                </Option>
                              ))}
                            </Select>
                          </div>
                          <Button
                            type="text"
                            danger
                            icon={<CloseOutlined />}
                            onClick={() => removeLanguage(index)}
                            disabled={languages.length <= 1}
                          />
                        </div>
                      </div>
                    ))}

                    <Button
                      type="dashed"
                      onClick={addLanguage}
                      block
                      icon={<PlusOutlined />}
                    >
                      Thêm ngôn ngữ
                    </Button>
                  </Card>
                </div>
              </div>

              <Card title="Thẻ tìm kiếm" className="mb-3">
                <div className="mb-1">
                  <Text type="secondary">
                    Thêm các thẻ tìm kiếm để tin tuyển dụng dễ dàng được tìm thấy hơn
                  </Text>
                </div>
                <div className="mt-2 mb-3">
                  <Input
                    placeholder="Thêm thẻ tìm kiếm mới"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onPressEnter={handleTagAdd}
                    suffix={
                      <Button 
                        type="text" 
                        icon={<PlusOutlined />} 
                        onClick={handleTagAdd}
                      />
                    }
                  />
                </div>
                
                <div className="tag-list">
                  {selectedTags.map(tag => (
                    <Tag
                      key={tag}
                      closable
                      onClose={() => handleTagRemove(tag)}
                      className="mb-1 me-1"
                      color="blue"
                    >
                      {tag}
                    </Tag>
                  ))}
                </div>
              </Card>
            </TabPane>

            <TabPane 
              tab={
                <span>
                  <EnvironmentOutlined /> Địa điểm & Hình thức
                </span>
              } 
              key="location"
            >
              <div className="row">
                <div className="col-md-6">
                  <Card title="Địa điểm làm việc" className="mb-3">
                    <Form.Item
                      label="Làm việc từ xa"
                    >
                      <Switch
                        checked={isRemote}
                        onChange={setIsRemote}
                      />
                    </Form.Item>

                    <Form.Item
                      name="locationId"
                      label="Địa điểm"
                      rules={[{ required: !isRemote, message: 'Vui lòng chọn địa điểm làm việc' }]}
                      className={isRemote ? 'd-none' : ''}
                    >
                      <Select
                        placeholder="Chọn địa điểm"
                        showSearch
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
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
                  </Card>
                </div>
              </div>
            </TabPane>

            <TabPane 
              tab={
                <span>
                  <DollarOutlined /> Lương & Quyền lợi
                </span>
              } 
              key="salary"
            >
              <div className="row">
                <div className="col-md-6">
                  <Card title="Thông tin lương" className="mb-3">
                    <div className="row">
                      <div className="col-6">
                        <Form.Item
                          name="salaryMin"
                          label="Lương tối thiểu"
                          rules={[{ required: !salaryHidden, message: 'Vui lòng nhập lương tối thiểu' }]}
                        >
                          <InputNumber
                            style={{ width: '100%' }}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            disabled={salaryHidden}
                          />
                        </Form.Item>
                      </div>
                      <div className="col-6">
                        <Form.Item
                          name="salaryMax"
                          label="Lương tối đa"
                          rules={[{ required: !salaryHidden, message: 'Vui lòng nhập lương tối đa' }]}
                        >
                          <InputNumber
                            style={{ width: '100%' }}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            disabled={salaryHidden}
                          />
                        </Form.Item>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-6">
                        <Form.Item
                          name="salaryCurrency"
                          label="Đơn vị tiền tệ"
                        >
                          <Select disabled={salaryHidden}>
                            <Option value="VND">VND</Option>
                            <Option value="USD">USD</Option>
                          </Select>
                        </Form.Item>
                      </div>
                      <div className="col-6">
                        <Form.Item
                          name="salaryPeriod"
                          label="Thời hạn trả lương"
                        >
                          <Select disabled={salaryHidden}>
                            <Option value="hourly">Theo giờ</Option>
                            <Option value="daily">Theo ngày</Option>
                            <Option value="weekly">Theo tuần</Option>
                            <Option value="monthly">Theo tháng</Option>
                            <Option value="yearly">Theo năm</Option>
                          </Select>
                        </Form.Item>
                      </div>
                    </div>

                    <Form.Item label="Ẩn thông tin lương">
                      <Switch
                        checked={salaryHidden}
                        onChange={setSalaryHidden}
                      />
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
              <Card title="Câu hỏi sàng lọc ứng viên khi nộp đơn" className="mb-3">
                <Alert
                  message="Câu hỏi tùy chỉnh"
                  description="Thêm các câu hỏi để ứng viên trả lời khi ứng tuyển vào vị trí của bạn. Mỗi câu hỏi sẽ xuất hiện trong form ứng tuyển và ứng viên phải trả lời trước khi nộp đơn. Câu trả lời sẽ được hiển thị trong hồ sơ ứng tuyển để giúp bạn đánh giá ứng viên tốt hơn."
                  type="info"
                  showIcon
                  className="mb-4"
                />

                {questions.map((question, index) => (
                  <div className="question-item mb-3" key={question.id}>
                    <div className="d-flex align-items-start">
                      <div className="flex-grow-1 me-2">
                        <div className="mb-1">
                          <small className="text-muted">ID: {question.id}</small>
                        </div>
                        <Input
                          placeholder={`Câu hỏi ${index + 1}`}
                          value={question.question}
                          onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                        />
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="me-2">
                          <Switch
                            checkedChildren="Bắt buộc"
                            unCheckedChildren="Tùy chọn"
                            defaultChecked={question.isRequired}
                            onChange={(checked) => updateQuestion(question.id, 'isRequired', checked)}
                          />
                        </div>
                        <Button
                          type="text"
                          danger
                          icon={<CloseOutlined />}
                          onClick={() => removeQuestion(question.id)}
                          disabled={questions.length <= 1}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="dashed"
                  onClick={addQuestion}
                  block
                  icon={<PlusOutlined />}
                >
                  Thêm câu hỏi
                </Button>
              </Card>
            </TabPane>
          </Tabs>
          
          <div className="d-flex justify-content-between mt-4">
            <Button 
              onClick={() => {
                const current = ['general', 'details', 'skills', 'location', 'salary', 'questions'];
                const currentIndex = current.indexOf(activeTab);
                if (currentIndex > 0) {
                  handleTabChange(current[currentIndex - 1]);
                }
              }}
            >
              Quay lại
            </Button>
            
            <Space>
              <Button 
                onClick={() => {
                  const current = ['general', 'details', 'skills', 'location', 'salary', 'questions'];
                  const currentIndex = current.indexOf(activeTab);
                  if (currentIndex < current.length - 1) {
                    handleTabChange(current[currentIndex + 1]);
                  }
                }}
                disabled={activeTab === 'questions'}
                type="default"
              >
                Tiếp theo
              </Button>
              
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SaveOutlined />}
                loading={loading}
              >
                Đăng tin tuyển dụng
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default NewJobPage;
