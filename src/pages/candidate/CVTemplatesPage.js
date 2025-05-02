import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, Row, Col, Button, Modal, Tabs, Form, Input, Switch, Divider, message, Space, Popconfirm, Tooltip, Tag } from 'antd';
import { EyeOutlined, DownloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import axios from 'axios';
import CVTemplate1 from '../../components/cv-templates/CVTemplate1';
import CVTemplate2 from '../../components/cv-templates/CVTemplate2';
import CVTemplate3 from '../../components/cv-templates/CVTemplate3';
import EducationSection from '../../components/cv-templates/sections/EducationSection';
import WorkExperienceSection from '../../components/cv-templates/sections/WorkExperienceSection';
import SkillsSection from '../../components/cv-templates/sections/SkillsSection';
import ProjectsSection from '../../components/cv-templates/sections/ProjectsSection';
import CertificationsSection from '../../components/cv-templates/sections/CertificationsSection';
import LanguagesSection from '../../components/cv-templates/sections/LanguagesSection';
import InterestsSection from '../../components/cv-templates/sections/InterestsSection';
import ReferencesSection from '../../components/cv-templates/sections/ReferencesSection';
import SummarySection from '../../components/cv-templates/sections/SummarySection';

const { TabPane } = Tabs;

const CVTemplatesPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [candidate, setCandidate] = useState(null);
  const [customCvData, setCustomCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [useProfileData, setUseProfileData] = useState(true);
  const [askProfileDataVisible, setAskProfileDataVisible] = useState(false);
  const [editSectionVisible, setEditSectionVisible] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [sectionType, setSectionType] = useState(null);
  const [savedCVs, setSavedCVs] = useState([]);
  const [isChanged, setIsChanged] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [cvNameForm] = Form.useForm();

  // Default sections that can be added to CV
  const availableSections = [
    { key: 'personalInfo', title: 'Thông tin cá nhân', required: true },
    { key: 'education', title: 'Học vấn', required: false },
    { key: 'workExperience', title: 'Kinh nghiệm làm việc', required: false },
    { key: 'skills', title: 'Kỹ năng', required: false },
    { key: 'projects', title: 'Dự án', required: false },
    { key: 'certifications', title: 'Chứng chỉ', required: false },
    { key: 'languages', title: 'Ngôn ngữ', required: false },
    { key: 'interests', title: 'Sở thích', required: false },
    { key: 'references', title: 'Người tham chiếu', required: false },
    { key: 'summary', title: 'Tóm tắt', required: false },
  ];
  
  const [activeSections, setActiveSections] = useState([
    { key: 'personalInfo', title: 'Thông tin cá nhân', required: true },
    { key: 'education', title: 'Học vấn', required: false },
    { key: 'workExperience', title: 'Kinh nghiệm làm việc', required: false },
    { key: 'skills', title: 'Kỹ năng', required: false },
  ]);

  useEffect(() => {
    fetchCandidateData();
    loadSavedCVs();

    // Thêm cảnh báo khi người dùng rời trang nếu đã có thay đổi chưa lưu
    const handleBeforeUnload = (e) => {
      if (isChanged) {
        e.preventDefault();
        e.returnValue = 'Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn rời khỏi trang?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, isChanged]);

  // Load saved CVs from localStorage
  const loadSavedCVs = async () => {
    try {
      setLoading(true);
      // Lấy dữ liệu từ API thay vì localStorage
      const response = await axios.get(`http://localhost:5000/savedCVs?candidateId=${user.id}`);
      if (response.data && response.data.length > 0) {
        setSavedCVs(response.data);
      }
    } catch (error) {
      console.error('Error loading saved CVs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save CV to database
  const saveCVToDatabase = async (newCV) => {
    try {
      // Lưu CV mới vào API
      const response = await axios.post('http://localhost:5000/savedCVs', newCV);
      if (response.data) {
        // Cập nhật danh sách CV đã lưu
        setSavedCVs([...savedCVs, response.data]);
        message.success('Đã lưu CV thành công');
      }
    } catch (error) {
      console.error('Error saving CV:', error);
      message.error('Có lỗi xảy ra khi lưu CV');
    }
  };

  // Update existing CV in database
  const updateCVInDatabase = async (updatedCV) => {
    try {
      // Cập nhật CV đã tồn tại vào API
      const response = await axios.put(`http://localhost:5000/savedCVs/${updatedCV.id}`, updatedCV);
      if (response.data) {
        // Cập nhật danh sách CV đã lưu
        const updatedCVs = savedCVs.map(cv => cv.id === updatedCV.id ? response.data : cv);
        setSavedCVs(updatedCVs);
        message.success('CV đã được cập nhật thành công');
      }
    } catch (error) {
      console.error('Error updating CV:', error);
      message.error('Có lỗi xảy ra khi cập nhật CV');
    }
  };

  // Delete CV from database
  const deleteCVFromDatabase = async (cvId) => {
    try {
      // Xóa CV từ API
      await axios.delete(`http://localhost:5000/savedCVs/${cvId}`);
      // Cập nhật danh sách CV đã lưu
      const updatedCVs = savedCVs.filter(cv => cv.id !== cvId);
      setSavedCVs(updatedCVs);
      message.success('Đã xóa CV thành công');
    } catch (error) {
      console.error('Error deleting CV:', error);
      message.error('Có lỗi xảy ra khi xóa CV');
    }
  };

  const handleSaveCV = () => {
    if (!customCvData) {
      message.error('Bạn cần tạo CV trước khi lưu');
      return;
    }
    
    // Kiểm tra xem có phải đang chỉnh sửa CV đã lưu hay không
    const existingCVIndex = savedCVs.findIndex(cv => cv.id === customCvData.savedId);
    
    if (existingCVIndex !== -1) {
      // Nếu đang chỉnh sửa CV đã lưu, cập nhật trực tiếp
      const updatedCV = {
        ...savedCVs[existingCVIndex],
        data: customCvData,
        template: selectedTemplate?.id || 1,
        activeSections: activeSections,
        updatedAt: new Date().toISOString()
      };
      
      updateCVInDatabase(updatedCV);
      setIsChanged(false);
      setPreviewVisible(false);
    } else {
      // Nếu tạo mới CV, hiển thị modal để nhập tên
      setSaveModalVisible(true);
    }
  };

  const confirmSaveCV = (values) => {
    if (customCvData?.savedId) {
      // Nếu đang chỉnh sửa CV đã lưu, cập nhật CV đó
      const existingCVIndex = savedCVs.findIndex(cv => cv.id === customCvData.savedId);
      if (existingCVIndex !== -1) {
        // Tạo bản sao của customCvData nhưng loại bỏ trường savedId
        const { savedId, ...cvDataWithoutId } = customCvData;
        
        const updatedCV = {
          ...savedCVs[existingCVIndex],
          name: values.cvName,  // Cập nhật tên CV nếu người dùng đổi tên
          data: cvDataWithoutId,
          template: selectedTemplate?.id || 1,
          activeSections: activeSections,
          updatedAt: new Date().toISOString()
        };
        
        updateCVInDatabase(updatedCV);
        setIsChanged(false);
        setSaveModalVisible(false);
        cvNameForm.resetFields();
        setPreviewVisible(false);
      } else {
        // CV không tồn tại trong danh sách đã lưu, tạo mới
        createNewCV(values);
      }
    } else {
      // Tạo CV mới
      createNewCV(values);
    }
  };

  // Hàm tạo CV mới
  const createNewCV = (values) => {
    const newCV = {
      candidateId: user.id,
      name: values.cvName,
      data: customCvData,
      template: selectedTemplate?.id || 1,
      activeSections: activeSections,
      isDefault: savedCVs.length === 0, // Đặt làm mặc định nếu là CV đầu tiên
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    saveCVToDatabase(newCV);
    setIsChanged(false);
    setSaveModalVisible(false);
    cvNameForm.resetFields();
    setPreviewVisible(false);
  };

  const fetchCandidateData = async () => {
    try {
      setLoading(true);
      
      try {
        // Lấy dữ liệu từ API
        const response = await axios.get(`http://localhost:5000/candidates?userId=${user.id}`);
        
        if (response.data && response.data.length > 0) {
          // Lấy thông tin ứng viên từ API
          const candidateData = response.data[0];
          console.log("API Response:", candidateData); // Log để debug
          
          // Chuyển đổi dữ liệu từ API sang định dạng phù hợp với ứng dụng
          const formattedCandidate = {
            id: candidateData.id,
            firstName: candidateData.firstName || '',
            lastName: candidateData.lastName || '',
            email: candidateData.email || '',
            phone: candidateData.phone || '',
            address: candidateData.address || '',
            city: candidateData.city || '',
            country: candidateData.country || '',
            avatar: candidateData.avatar || null,
            headline: candidateData.headline || `${candidateData.firstName || ''} ${candidateData.lastName || ''}`,
            summary: candidateData.summary || '',
            
            // Chuyển đổi định dạng giáo dục
            education: Array.isArray(candidateData.educations) ? 
              candidateData.educations.map(edu => ({
                id: edu.id || Date.now() + Math.random(),
                school: edu.school || '',
                degree: edu.degree || '',
                fieldOfStudy: edu.major || '',
                startDate: edu.startDate || '',
                endDate: edu.endDate || '',
                description: edu.description || ''
              })) : [],
              
            // Chuyển đổi định dạng kinh nghiệm làm việc
            workExperience: Array.isArray(candidateData.workExperiences) ? 
              candidateData.workExperiences.map(exp => ({
                id: exp.id || Date.now() + Math.random(),
                company: exp.company || '',
                position: exp.position || '',
                location: exp.location || '',
                startDate: exp.startDate || '',
                endDate: exp.endDate || '',
                description: exp.description || ''
              })) : [],
              
            // Chuyển đổi định dạng kỹ năng
            skills: Array.isArray(candidateData.skills) ? 
              candidateData.skills.map(skill => typeof skill === 'string' ? skill : skill.name || '') : [],
              
            // Chuyển đổi định dạng ngôn ngữ
            languages: Array.isArray(candidateData.languages) ? 
              candidateData.languages.map(lang => ({
                id: lang.id || Date.now() + Math.random(),
                name: lang.language || '',
                proficiency: lang.proficiency || ''
              })) : [],
              
            // Chuyển đổi định dạng chứng chỉ
            certifications: Array.isArray(candidateData.certifications) ? 
              candidateData.certifications.map(cert => ({
                id: cert.id || Date.now() + Math.random(),
                name: cert.name || '',
                issuer: cert.issuer || '',
                date: cert.issueDate || '',
                description: cert.description || ''
              })) : [],
              
            // Chuyển đổi định dạng dự án
            projects: Array.isArray(candidateData.projects) ? 
              candidateData.projects.map(project => ({
                id: project.id || Date.now() + Math.random(),
                name: project.name || '',
                startDate: project.startDate || '',
                endDate: project.endDate || '',
                description: project.description || '',
                technologies: project.technologies || []
              })) : [],
              
            // Chuyển đổi định dạng người tham chiếu
            references: Array.isArray(candidateData.references) ? 
              candidateData.references.map(ref => ({
                id: ref.id || Date.now() + Math.random(),
                name: ref.name || '',
                position: ref.position || '',
                company: ref.company || '',
                email: ref.email || '',
                phone: ref.phone || ''
              })) : []
          };
          
          console.log("Formatted Candidate:", formattedCandidate); // Log để debug
          setCandidate(formattedCandidate);
        } else {
          console.warn('No candidate data found');
          setCandidate({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            country: '',
            headline: '',
            summary: '',
            education: [],
            workExperience: [],
            skills: [],
            languages: [],
            certifications: [],
            projects: [],
            references: []
          });
        }
      } catch (apiError) {
        console.warn('Error fetching candidate data:', apiError);
        setCandidate({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          country: '',
          headline: '',
          summary: '',
          education: [],
          workExperience: [],
          skills: [],
          languages: [],
          certifications: [],
          projects: [],
          references: []
        });
      }
    } catch (error) {
      console.error('Error in fetchCandidateData:', error);
      setCandidate({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        headline: '',
        summary: '',
        education: [],
        workExperience: [],
        skills: [],
        languages: [],
        certifications: [],
        projects: [],
        references: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileDataChange = (useProfile) => {
    setUseProfileData(useProfile);
    
    if (useProfile && candidate) {
      // Use data from candidate profile
      setCustomCvData({
        ...candidate,
        sections: activeSections
      });
    } else if (!useProfile) {
      // Create empty CV structure with placeholders
      setCustomCvData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        headline: '',
        summary: '',
        education: [],
        workExperience: [],
        skills: [],
        projects: [],
        certifications: [],
        languages: [],
        interests: [],
        references: [],
        sections: activeSections
      });
    }
    
    setIsChanged(true);
  };

  const handlePreview = (template) => {
    setSelectedTemplate(template);
    
    // Luôn hiển thị hộp thoại xác nhận trước khi xem trước CV
    setAskProfileDataVisible(true);
  };

  const handleConfirmProfileData = (useProfile) => {
    setUseProfileData(useProfile);
    setAskProfileDataVisible(false);
    
    if (useProfile && candidate) {
      // Use data from candidate profile
      const sections = [...activeSections];
      
      // Kiểm tra dữ liệu và tự động thêm các section tương ứng nếu có dữ liệu
      if (candidate.workExperience && candidate.workExperience.length > 0) {
        if (!sections.some(s => s.key === 'workExperience')) {
          sections.push({ key: 'workExperience', title: 'Kinh nghiệm làm việc', required: false });
        }
      }
      
      if (candidate.education && candidate.education.length > 0) {
        if (!sections.some(s => s.key === 'education')) {
          sections.push({ key: 'education', title: 'Học vấn', required: false });
        }
      }
      
      if (candidate.skills && candidate.skills.length > 0) {
        if (!sections.some(s => s.key === 'skills')) {
          sections.push({ key: 'skills', title: 'Kỹ năng', required: false });
        }
      }
      
      if (candidate.languages && candidate.languages.length > 0) {
        if (!sections.some(s => s.key === 'languages')) {
          sections.push({ key: 'languages', title: 'Ngôn ngữ', required: false });
        }
      }
      
      if (candidate.certifications && candidate.certifications.length > 0) {
        if (!sections.some(s => s.key === 'certifications')) {
          sections.push({ key: 'certifications', title: 'Chứng chỉ', required: false });
        }
      }
      
      if (candidate.projects && candidate.projects.length > 0) {
        if (!sections.some(s => s.key === 'projects')) {
          sections.push({ key: 'projects', title: 'Dự án', required: false });
        }
      }
      
      if (candidate.summary) {
        if (!sections.some(s => s.key === 'summary')) {
          sections.push({ key: 'summary', title: 'Tóm tắt', required: false });
        }
      }
      
      setActiveSections(sections);
      
      setCustomCvData({
        ...candidate,
        sections: sections
      });
    } else {
      // Create empty CV structure with placeholders
      setCustomCvData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        headline: '',
        summary: '',
        education: [],
        workExperience: [],
        skills: [],
        projects: [],
        certifications: [],
        languages: [],
        interests: [],
        references: [],
        sections: activeSections
      });
    }
    
    // Open the preview after setting data
    setPreviewVisible(true);
    setIsChanged(true);
  };

  const handleDownload = (template) => {
    setSelectedTemplate(template);
    // Luôn hiển thị hộp thoại xác nhận khi tải xuống
    setAskProfileDataVisible(true);
  };

  const handleEditSection = (section) => {
    setCurrentSection(section);
    setSectionType(section.key);
    setEditSectionVisible(true);
  };

  const handleDeleteSection = (sectionKey) => {
    // Cannot delete required sections like personal info
    const sectionToDelete = activeSections.find(section => section.key === sectionKey);
    if (sectionToDelete && sectionToDelete.required) {
      message.error('Không thể xóa mục bắt buộc này');
      return;
    }
    
    setActiveSections(activeSections.filter(section => section.key !== sectionKey));
    message.success('Đã xóa mục thành công');
    setIsChanged(true);
  };

  const handleAddSection = () => {
    setCurrentSection(null);
    setSectionType('');
    setEditSectionVisible(true);
  };

  const handleSaveSection = (values) => {
    if (currentSection) {
      // Editing existing section
      setActiveSections(prev => 
        prev.map(section => 
          section.key === currentSection.key ? { ...section, title: values.title } : section
        )
      );
    } else {
      // Adding new section
      // Check if the section already exists
      if (activeSections.some(section => section.key === values.type)) {
        message.error('Mục này đã tồn tại trong CV');
        return;
      }
      
      // Find the section in available sections
      const newSection = availableSections.find(section => section.key === values.type);
      if (newSection) {
        setActiveSections([...activeSections, { ...newSection, title: values.title }]);
      }
    }
    
    setEditSectionVisible(false);
    message.success(currentSection ? 'Đã cập nhật mục thành công' : 'Đã thêm mục thành công');
    setIsChanged(true);
  };

  const handleUpdateCV = (newData) => {
    setCustomCvData(newData);
    setIsChanged(true);
  };

  const renderTemplatePreview = () => {
    if (!selectedTemplate || !customCvData) return null;
    const TemplateComponent = selectedTemplate.component;
    return <TemplateComponent candidate={customCvData} activeSections={activeSections} />;
  };

  const renderAvailableSectionOptions = () => {
    // Filter out sections that are already active
    const availableSectionOptions = availableSections.filter(
      section => !activeSections.some(activeSection => activeSection.key === section.key)
    );
    
    return availableSectionOptions.map(section => (
      <option key={section.key} value={section.key}>{section.title}</option>
    ));
  };

  const templates = [
    {
      id: 1,
      name: 'Mẫu CV 1',
      description: 'Mẫu CV truyền thống với bố cục rõ ràng',
      component: CVTemplate1,
      thumbnail: '/images/cv-template-1.png'
    },
    {
      id: 2,
      name: 'Mẫu CV 2',
      description: 'Mẫu CV hiện đại với sidebar nổi bật',
      component: CVTemplate2,
      thumbnail: '/images/cv-template-2.png'
    },
    {
      id: 3,
      name: 'Mẫu CV 3',
      description: 'Mẫu CV chuyên nghiệp với thiết kế tối giản',
      component: CVTemplate3,
      thumbnail: '/images/cv-template-3.png'
    }
  ];

  const handleViewSavedCV = (cv) => {
    setSelectedTemplate(templates.find(t => t.id === cv.template));
    
    // Thêm thông tin savedId vào customCvData để biết đang chỉnh sửa CV nào
    const cvDataWithId = {
      ...cv.data,
      savedId: cv.id
    };
    
    setCustomCvData(cvDataWithId);
    setActiveSections(cv.activeSections);
    setPreviewVisible(true);
  };

  // Thêm hàm để đặt CV mặc định
  const setDefaultCV = async (cvId) => {
    try {
      // Cập nhật tất cả CV hiện tại để không phải là mặc định
      for (const cv of savedCVs) {
        if (cv.isDefault && cv.id !== cvId) {
          await axios.patch(`http://localhost:5000/savedCVs/${cv.id}`, {
            isDefault: false
          });
        }
      }
      
      // Đặt CV được chọn làm mặc định
      await axios.patch(`http://localhost:5000/savedCVs/${cvId}`, {
        isDefault: true
      });
      
      // Tải lại danh sách CV đã lưu
      loadSavedCVs();
      message.success('Đã đặt CV mặc định thành công');
    } catch (error) {
      console.error('Error setting default CV:', error);
      message.error('Có lỗi xảy ra khi đặt CV mặc định');
    }
  };

  return (
    <div className="cv-templates-page">
      <h1 className="mb-4">Mẫu CV xin việc</h1>
      
      {/* Danh sách CV đã lưu */}
      {savedCVs.length > 0 && (
        <Row gutter={[16, 16]} className="mb-4">
          <Col span={24}>
            <Card 
              title="CV đã lưu"
            >
              <Row gutter={[16, 16]}>
                {savedCVs.map(cv => (
                  <Col xs={24} md={12} lg={8} key={cv.id}>
                    <Card 
                      size="small"
                      title={cv.name}
                      extra={
                        <Space>
                          <Tooltip title="Xem CV">
                            <Button 
                              type="text" 
                              icon={<EyeOutlined />} 
                              onClick={() => handleViewSavedCV(cv)}
                            />
                          </Tooltip>
                          <Popconfirm
                            title="Xóa CV này?"
                            description="Bạn có chắc chắn muốn xóa CV này không?"
                            onConfirm={() => {
                              deleteCVFromDatabase(cv.id);
                            }}
                            okText="Có"
                            cancelText="Không"
                          >
                            <Button 
                              type="text" 
                              danger
                              icon={<DeleteOutlined />} 
                            />
                          </Popconfirm>
                        </Space>
                      }
                    >
                      <p>Tạo lúc: {new Date(cv.createdAt).toLocaleString()}</p>
                      <p>Mẫu: {templates.find(t => t.id === cv.template)?.name || 'Mẫu CV 1'}</p>
                      {cv.isDefault ? (
                        <Tag color="green">CV Mặc định</Tag>
                      ) : (
                        <Button 
                          type="link"
                          size="small"
                          onClick={() => setDefaultCV(cv.id)}
                        >
                          Đặt làm mặc định
                        </Button>
                      )}
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
      )}
      
      <Row gutter={[16, 16]} className="mb-4">
        <Col span={24}>
          <Card 
            title="Tùy chỉnh CV của bạn"
            extra={
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                onClick={handleSaveCV}
                disabled={!customCvData}
              >
                Lưu CV
              </Button>
            }
          >
            <div className="mb-4">
              <Switch 
                checked={useProfileData} 
                onChange={handleProfileDataChange} 
                className="me-2"
              />
              <span>Sử dụng thông tin từ hồ sơ của bạn</span>
            </div>
            
            <Divider orientation="left">Các mục trong CV</Divider>
            
            <Row gutter={[16, 16]}>
              {activeSections.map(section => (
                <Col xs={24} md={12} lg={8} key={section.key}>
                  <Card 
                    size="small" 
                    title={section.title}
                    extra={
                      <Space>
                        <Button 
                          type="text" 
                          icon={<EditOutlined />} 
                          onClick={() => handleEditSection(section)}
                        />
                        {!section.required && (
                          <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />} 
                            onClick={() => handleDeleteSection(section.key)}
                          />
                        )}
                      </Space>
                    }
                  >
                    {section.required ? (
                      <div className="text-muted">Mục bắt buộc</div>
                    ) : (
                      <div className="text-muted">Mục tùy chọn</div>
                    )}
                  </Card>
                </Col>
              ))}
              
              <Col xs={24} md={12} lg={8}>
                <Card
                  size="small"
                  className="add-section-card"
                  style={{ 
                    height: '100%', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    border: '1px dashed #d9d9d9',
                    cursor: 'pointer'
                  }}
                  onClick={handleAddSection}
                >
                  <div className="text-center">
                    <PlusOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                    <div>Thêm mục mới</div>
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      
      <Divider orientation="left">Chọn mẫu CV</Divider>
      
      <Row gutter={[16, 16]}>
        {templates.map((template) => (
          <Col xs={24} sm={12} md={8} key={template.id}>
            <Card
              hoverable
              cover={
                <div className="template-thumbnail" style={{ height: '200px', background: '#f0f0f0' }}>
                  {/* Placeholder for template thumbnail */}
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <h3>{template.name}</h3>
                  </div>
                </div>
              }
              actions={[
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => handlePreview(template)}
                >
                  Xem trước
                </Button>,
                <Button
                  type="text"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload(template)}
                >
                  Tải xuống
                </Button>
              ]}
            >
              <Card.Meta
                title={template.name}
                description={template.description}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal asking if user wants to use profile data */}
      <Modal
        title="Sử dụng thông tin hồ sơ"
        open={askProfileDataVisible}
        onCancel={() => {
          console.log("Closing modal");
          setAskProfileDataVisible(false);
          // Nếu không có dữ liệu custom nào được tạo, reset về null
          if (!customCvData) {
            setSelectedTemplate(null);
          }
        }}
        maskClosable={true}
        destroyOnClose={true}
        footer={[
          <Button key="no" onClick={() => handleConfirmProfileData(false)}>
            Không, tôi sẽ điền thông tin mới
          </Button>,
          <Button key="yes" type="primary" onClick={() => handleConfirmProfileData(true)}>
            Có, sử dụng thông tin hồ sơ
          </Button>
        ]}
      >
        <p>Bạn có muốn sử dụng thông tin từ hồ sơ cá nhân để tạo CV không?</p>
      </Modal>

      {/* Modal for editing sections */}
      <Modal
        title={currentSection ? "Chỉnh sửa mục" : "Thêm mục mới"}
        open={editSectionVisible}
        onCancel={() => setEditSectionVisible(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={handleSaveSection}
          initialValues={{
            title: currentSection?.title || '',
            type: currentSection?.key || ''
          }}
        >
          {!currentSection && (
            <Form.Item
              name="type"
              label="Loại mục"
              rules={[{ required: true, message: 'Vui lòng chọn loại mục' }]}
            >
              <select className="form-select">
                <option value="">Chọn loại mục</option>
                {renderAvailableSectionOptions()}
              </select>
            </Form.Item>
          )}
          
          <Form.Item
            name="title"
            label="Tiêu đề mục"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề mục' }]}
          >
            <Input placeholder="Ví dụ: Học vấn, Kinh nghiệm, Kỹ năng..." />
          </Form.Item>
          
          <div className="d-flex justify-content-end">
            <Button onClick={() => setEditSectionVisible(false)} className="me-2">
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              {currentSection ? "Cập nhật" : "Thêm mục"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* CV Preview Modal */}
      <Modal
        title="Xem trước CV"
        open={previewVisible}
        onCancel={() => {
          console.log("Closing preview modal");
          if (isChanged) {
            Modal.confirm({
              title: 'Xác nhận',
              content: 'Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn đóng không?',
              onOk() {
                setPreviewVisible(false);
                setIsChanged(false);
                // Nếu đang xem CV mới (không phải CV đã lưu), reset dữ liệu
                if (!customCvData?.savedId) {
                  setCustomCvData(null);
                  setSelectedTemplate(null);
                }
              },
              onCancel() {
                console.log("Cancel closing");
              },
              okText: "Đóng",
              cancelText: "Hủy"
            });
          } else {
            setPreviewVisible(false);
          }
        }}
        destroyOnClose={true}
        maskClosable={true}
        width="90%"
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: "calc(100vh - 200px)", overflow: "auto" }}
        zIndex={1050}
        footer={[
          <Button key="back" onClick={() => {
            console.log("Back button clicked");
            if (isChanged) {
              Modal.confirm({
                title: 'Xác nhận',
                content: 'Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn đóng không?',
                onOk() {
                  setPreviewVisible(false);
                  setIsChanged(false);
                  // Nếu đang xem CV mới (không phải CV đã lưu), reset dữ liệu
                  if (!customCvData?.savedId) {
                    setCustomCvData(null);
                    setSelectedTemplate(null);
                  }
                },
                okText: "Đóng",
                cancelText: "Hủy"
              });
            } else {
              setPreviewVisible(false);
            }
          }}>
            Đóng
          </Button>,
          <Button 
            key="save" 
            type="primary"
            onClick={handleSaveCV}
          >
            Lưu CV
          </Button>,
          <Button 
            key="download" 
            icon={<DownloadOutlined />}
            onClick={() => {
              // Chuẩn bị để in bằng cách thêm class và style
              document.body.classList.add('printing');
              
              // Chuyển sang tab xem trước nếu đang ở tab chỉnh sửa
              const previewTab = document.querySelector('.ant-tabs-tab[data-node-key="preview"]');
              if (previewTab) {
                previewTab.click();
              }
              
              // Tìm tất cả các element cần xử lý
              const modal = document.querySelector('.ant-modal-content');
              const modalBody = document.querySelector('.ant-modal-body');
              const modalHeader = document.querySelector('.ant-modal-header');
              const modalFooter = document.querySelector('.ant-modal-footer');
              const tabsNav = document.querySelector('.ant-tabs-nav');
              
              // Lưu style hiện tại
              const originalStyles = {};
              
              // Thay đổi style để chuẩn bị in
              if (modal) {
                originalStyles.modal = {
                  position: modal.style.position,
                  overflow: modal.style.overflow,
                  height: modal.style.height
                };
                modal.style.position = 'static';
                modal.style.overflow = 'visible';
                modal.style.height = 'auto';
              }
              
              if (modalBody) {
                originalStyles.modalBody = {
                  overflow: modalBody.style.overflow,
                  height: modalBody.style.height,
                  maxHeight: modalBody.style.maxHeight
                };
                modalBody.style.overflow = 'visible';
                modalBody.style.height = 'auto';
                modalBody.style.maxHeight = 'none';
              }
              
              // Ẩn header, footer và tabs nav
              if (modalHeader) modalHeader.style.display = 'none';
              if (modalFooter) modalFooter.style.display = 'none';
              if (tabsNav) tabsNav.style.display = 'none';
              
              // Thay đổi style cho tất cả các phần của CV để tránh bị cắt
              const sections = document.querySelectorAll('.cv-section, .main-section, .sidebar-section, .cv-container, .cv-body, .cv-columns, .cv-column');
              sections.forEach(section => {
                section.style.overflow = 'visible';
                section.style.height = 'auto';
                section.style.pageBreakInside = 'avoid';
                section.style.breakInside = 'avoid';
              });
              
              // In CV
              setTimeout(() => {
                window.print();
                
                // Khôi phục lại style sau khi in
                setTimeout(() => {
                  document.body.classList.remove('printing');
                  
                  // Khôi phục style cho modal
                  if (modal) {
                    modal.style.position = originalStyles.modal.position;
                    modal.style.overflow = originalStyles.modal.overflow;
                    modal.style.height = originalStyles.modal.height;
                  }
                  
                  // Khôi phục style cho modal body
                  if (modalBody) {
                    modalBody.style.overflow = originalStyles.modalBody.overflow;
                    modalBody.style.height = originalStyles.modalBody.height;
                    modalBody.style.maxHeight = originalStyles.modalBody.maxHeight;
                  }
                  
                  // Hiển thị lại header, footer và tabs nav
                  if (modalHeader) modalHeader.style.display = '';
                  if (modalFooter) modalFooter.style.display = '';
                  if (tabsNav) tabsNav.style.display = '';
                  
                  // Khôi phục style cho các section
                  sections.forEach(section => {
                    section.style.overflow = '';
                    section.style.height = '';
                    section.style.pageBreakInside = '';
                    section.style.breakInside = '';
                  });
                }, 500);
              }, 100);
            }}
          >
            Tải xuống CV
          </Button>
        ]}
      >
        <Tabs defaultActiveKey="preview">
          <TabPane tab="Xem trước" key="preview">
            {renderTemplatePreview()}
          </TabPane>
          <TabPane tab="Chỉnh sửa thông tin" key="edit">
            <EditCVForm 
              data={customCvData} 
              activeSections={activeSections} 
              onSave={handleUpdateCV} 
            />
          </TabPane>
        </Tabs>
      </Modal>

      {/* Save CV Modal */}
      <Modal
        title="Lưu CV"
        open={saveModalVisible}
        onCancel={() => setSaveModalVisible(false)}
        footer={null}
        zIndex={1051}
      >
        <Form
          form={cvNameForm}
          layout="vertical"
          onFinish={(values) => {
            confirmSaveCV(values);
            // Reset sau khi lưu
            setCustomCvData(null);
            setPreviewVisible(false);
          }}
        >
          <Form.Item
            name="cvName"
            label="Tên CV"
            rules={[{ required: true, message: 'Vui lòng nhập tên cho CV của bạn' }]}
          >
            <Input placeholder="Ví dụ: CV IT Developer 2023" />
          </Form.Item>
          
          <div className="d-flex justify-content-end">
            <Button onClick={() => setSaveModalVisible(false)} className="me-2">
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Lưu CV
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

// Component for editing CV information
const EditCVForm = ({ data, activeSections, onSave }) => {
  const [form] = Form.useForm();
  const [updatedData, setUpdatedData] = useState(data || {});
  
  useEffect(() => {
    if (data) {
      setUpdatedData(data);
      form.setFieldsValue({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        country: data.country || '',
        headline: data.headline || ''
      });
    }
  }, [data, form]);
  
  const handleSave = () => {
    try {
      form.validateFields().then(values => {
        // Get updated personal info from form
        const personalInfo = {
          firstName: values.firstName || '',
          lastName: values.lastName || '',
          email: values.email || '',
          phone: values.phone || '',
          address: values.address || '',
          city: values.city || '',
          country: values.country || '',
          headline: values.headline || ''
        };
        
        // Merge with section data that is managed by the section components
        const updatedCV = {
          ...updatedData,
          ...personalInfo
        };
        
        onSave(updatedCV);
        message.success('Đã lưu thông tin CV');
      }).catch(errorInfo => {
        console.error('Validate Failed:', errorInfo);
        message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      });
    } catch (error) {
      console.error('Error saving CV:', error);
      message.error('Có lỗi xảy ra khi lưu CV');
    }
  };
  
  // Handle updates from section components
  const handleSectionUpdate = (sectionKey, newData) => {
    try {
      setUpdatedData(prev => ({
        ...prev,
        [sectionKey]: newData
      }));
    } catch (error) {
      console.error(`Error updating ${sectionKey}:`, error);
      message.error(`Có lỗi xảy ra khi cập nhật ${sectionKey}`);
    }
  };
  
  const renderSection = (sectionKey) => {
    try {
      switch (sectionKey) {
        case 'personalInfo':
          return (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="firstName" label="Họ" rules={[{ required: true, message: 'Vui lòng nhập họ' }]}>
                    <Input placeholder="Họ" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="lastName" label="Tên" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                    <Input placeholder="Tên" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ' }]}>
                    <Input placeholder="Email" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                    <Input placeholder="Số điện thoại" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item name="address" label="Địa chỉ">
                    <Input placeholder="Địa chỉ" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="city" label="Thành phố">
                    <Input placeholder="Thành phố" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="country" label="Quốc gia">
                    <Input placeholder="Quốc gia" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item name="headline" label="Tiêu đề nghề nghiệp">
                    <Input placeholder="Ví dụ: Frontend Developer với 3 năm kinh nghiệm" />
                  </Form.Item>
                </Col>
              </Row>
            </>
          );
        
        case 'summary':
          return (
            <SummarySection 
              data={updatedData.summary || ''} 
              onChange={(newData) => handleSectionUpdate('summary', newData)} 
            />
          );
        
        case 'education':
          return (
            <EducationSection 
              data={Array.isArray(updatedData.education) ? updatedData.education : []} 
              onChange={(newData) => handleSectionUpdate('education', newData)} 
            />
          );
        
        case 'workExperience':
          return (
            <WorkExperienceSection 
              data={Array.isArray(updatedData.workExperience) ? updatedData.workExperience : []} 
              onChange={(newData) => handleSectionUpdate('workExperience', newData)} 
            />
          );
        
        case 'skills':
          return (
            <SkillsSection 
              data={Array.isArray(updatedData.skills) ? updatedData.skills : []} 
              onChange={(newData) => handleSectionUpdate('skills', newData)} 
            />
          );
        
        case 'projects':
          return (
            <ProjectsSection 
              data={Array.isArray(updatedData.projects) ? updatedData.projects : []} 
              onChange={(newData) => handleSectionUpdate('projects', newData)} 
            />
          );
        
        case 'certifications':
          return (
            <CertificationsSection 
              data={Array.isArray(updatedData.certifications) ? updatedData.certifications : []} 
              onChange={(newData) => handleSectionUpdate('certifications', newData)} 
            />
          );
        
        case 'languages':
          return (
            <LanguagesSection 
              data={Array.isArray(updatedData.languages) ? updatedData.languages : []} 
              onChange={(newData) => handleSectionUpdate('languages', newData)} 
            />
          );
        
        case 'interests':
          return (
            <InterestsSection 
              data={Array.isArray(updatedData.interests) ? updatedData.interests : []} 
              onChange={(newData) => handleSectionUpdate('interests', newData)} 
            />
          );
        
        case 'references':
          return (
            <ReferencesSection 
              data={Array.isArray(updatedData.references) ? updatedData.references : []} 
              onChange={(newData) => handleSectionUpdate('references', newData)} 
            />
          );
        
        default:
          return null;
      }
    } catch (error) {
      console.error(`Error rendering section ${sectionKey}:`, error);
      return <div>Có lỗi xảy ra khi hiển thị mục này</div>;
    }
  };
  
  return (
    <Form
      form={form}
      layout="vertical"
    >
      <Tabs>
        {activeSections.map(section => (
          <TabPane tab={section.title} key={section.key}>
            {renderSection(section.key)}
          </TabPane>
        ))}
      </Tabs>
      
      <div className="d-flex justify-content-end mt-4">
        <Button type="primary" onClick={handleSave}>
          Lưu thông tin
        </Button>
      </div>
    </Form>
  );
};

export default CVTemplatesPage; 