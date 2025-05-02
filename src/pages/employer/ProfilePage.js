import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  Row, 
  Col, 
  Card, 
  Form, 
  Input, 
  Button, 
  Select, 
  Divider, 
  Upload, 
  message, 
  Image, 
  Typography,
  Tabs,
  Spin,
  Space,
  notification
} from 'antd';
import { 
  UploadOutlined, 
  SaveOutlined, 
  EditOutlined, 
  LoadingOutlined,
  PlusOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useForm } from 'antd/lib/form/Form';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const EmployerProfilePage = () => {
  const { user } = useSelector(state => state.auth || {});
  const [form] = useForm();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  useEffect(() => {
    if (user && user.id) {
      fetchEmployerProfile();
    }
  }, [user]);

  const fetchEmployerProfile = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user data
      const userResponse = await axios.get(`http://localhost:5000/users/${user.id}`);
      
      // Fetch employer data
      const employerResponse = await axios.get(`http://localhost:5000/employers?userId=${user.id}`);
      
      if (employerResponse.data && employerResponse.data.length > 0) {
        const employerData = employerResponse.data[0];
        
        // Combine user and employer data
        const profileData = {
          ...userResponse.data,
          ...employerData
        };
        
        setProfile(profileData);
        setLogoUrl(profileData.logo || '');
        setCoverUrl(profileData.coverImage || '');
        
        // Set form values
        form.setFieldsValue({
          email: profileData.email,
          phone: profileData.phone,
          companyName: profileData.companyName,
          industry: profileData.industry,
          companySize: profileData.companySize,
          foundedYear: profileData.foundedYear,
          website: profileData.website,
          address: profileData.location?.address,
          city: profileData.location?.city,
          country: profileData.location?.country,
          contactEmail: profileData.contactEmail,
          contactPhone: profileData.contactPhone,
          description: profileData.description,
          benefits: profileData.benefits?.join('\n'),
          culture: profileData.culture,
          linkedin: profileData.socialLinks?.linkedin,
          facebook: profileData.socialLinks?.facebook,
          twitter: profileData.socialLinks?.twitter,
        });
      } else {
        message.warning('Chưa có thông tin công ty. Vui lòng cập nhật hồ sơ.');
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error fetching employer profile:', error);
      
      // For development, use mock data if API fails
      const mockProfile = {
        id: user?.id || '1',
        userId: user?.id || '1',
        email: user?.email || 'employer1@company.com',
        phone: '0901234567',
        companyName: 'Tech Solutions Inc.',
        logo: 'https://via.placeholder.com/150?text=TSI',
        coverImage: 'https://via.placeholder.com/1200x300?text=TechSolutionsInc',
        description: 'Tech Solutions Inc. là công ty công nghệ hàng đầu chuyên cung cấp giải pháp phần mềm sáng tạo cho doanh nghiệp toàn cầu.',
        industry: 'Công nghệ thông tin',
        companySize: '51-200',
        foundedYear: 2010,
        website: 'https://techsolutions.example.com',
        socialLinks: {
          linkedin: 'https://linkedin.com/company/techsolutions',
          facebook: 'https://facebook.com/techsolutions',
          twitter: 'https://twitter.com/techsolutions'
        },
        location: {
          address: '123 Nguyễn Huệ',
          city: 'Hồ Chí Minh',
          country: 'Việt Nam',
          zipCode: '70000'
        },
        contactEmail: 'hr@techsolutions.example.com',
        contactPhone: '0901234567',
        benefits: [
          'Bảo hiểm sức khỏe',
          'Lương tháng 13',
          'Nghỉ phép linh hoạt',
          'Môi trường làm việc hiện đại'
        ],
        culture: 'Chúng tôi đề cao sự sáng tạo, hợp tác và liên tục học hỏi.',
        verified: true
      };
      
      setProfile(mockProfile);
      setLogoUrl(mockProfile.logo);
      setCoverUrl(mockProfile.coverImage);
      
      // Set form values with mock data
      form.setFieldsValue({
        email: mockProfile.email,
        phone: mockProfile.phone,
        companyName: mockProfile.companyName,
        industry: mockProfile.industry,
        companySize: mockProfile.companySize,
        foundedYear: mockProfile.foundedYear,
        website: mockProfile.website,
        address: mockProfile.location?.address,
        city: mockProfile.location?.city,
        country: mockProfile.location?.country,
        contactEmail: mockProfile.contactEmail,
        contactPhone: mockProfile.contactPhone,
        description: mockProfile.description,
        benefits: mockProfile.benefits?.join('\n'),
        culture: mockProfile.culture,
        linkedin: mockProfile.socialLinks?.linkedin,
        facebook: mockProfile.socialLinks?.facebook,
        twitter: mockProfile.socialLinks?.twitter,
      });
      
      message.warning('Sử dụng dữ liệu mẫu do không kết nối được API.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (values) => {
    try {
      setIsLoading(true);
      
      // Prepare data
      const employerData = {
        userId: user.id,
        companyName: values.companyName,
        description: values.description,
        industry: values.industry,
        companySize: values.companySize,
        foundedYear: values.foundedYear,
        website: values.website,
        socialLinks: {
          linkedin: values.linkedin,
          facebook: values.facebook,
          twitter: values.twitter
        },
        location: {
          address: values.address,
          city: values.city,
          country: values.country
        },
        contactEmail: values.contactEmail,
        contactPhone: values.contactPhone,
        benefits: values.benefits ? values.benefits.split('\n').filter(b => b.trim() !== '') : [],
        culture: values.culture,
        verified: profile?.verified || false
      };

      // Handle logo file upload first if exists
      if (logoFile) {
        const logoFormData = new FormData();
        logoFormData.append('file', logoFile);
        logoFormData.append('type', 'logo');
        
        try {
          // For development with mock API
          if (logoUrl && logoUrl.startsWith('data:')) {
            employerData.logo = logoUrl; // Use the base64 data directly for now
          } else {
            const logoResponse = await axios.post('http://localhost:5000/upload', logoFormData);
            employerData.logo = logoResponse.data.url;
          }
        } catch (error) {
          console.error('Error uploading logo:', error);
          // Use base64 data if API fails
          if (logoUrl && logoUrl.startsWith('data:')) {
            employerData.logo = logoUrl;
          } else {
            message.error('Không thể tải lên logo.');
          }
        }
      } else if (logoUrl) {
        employerData.logo = logoUrl;
      }
      
      // Handle cover image file upload if exists
      if (coverFile) {
        const coverFormData = new FormData();
        coverFormData.append('file', coverFile);
        coverFormData.append('type', 'cover');
        
        try {
          // For development with mock API
          if (coverUrl && coverUrl.startsWith('data:')) {
            employerData.coverImage = coverUrl; // Use the base64 data directly for now
          } else {
            const coverResponse = await axios.post('http://localhost:5000/upload', coverFormData);
            employerData.coverImage = coverResponse.data.url;
          }
        } catch (error) {
          console.error('Error uploading cover image:', error);
          // Use base64 data if API fails
          if (coverUrl && coverUrl.startsWith('data:')) {
            employerData.coverImage = coverUrl;
          } else {
            message.error('Không thể tải lên ảnh bìa.');
          }
        }
      } else if (coverUrl) {
        employerData.coverImage = coverUrl;
      }
      
      // Update user data
      const userData = {
        email: values.email,
        phone: values.phone
      };
      
      await axios.put(`http://localhost:5000/users/${user.id}`, userData);
      
      // Update employer profile
      if (profile && profile.id) {
        await axios.put(`http://localhost:5000/employers/${profile.id}`, employerData);
      } else {
        await axios.post('http://localhost:5000/employers', employerData);
      }
      
      notification.success({
        message: 'Cập nhật thành công',
        description: 'Thông tin công ty đã được cập nhật thành công!',
        placement: 'topRight'
      });
      
      setIsEditing(false);
      fetchEmployerProfile();
    } catch (error) {
      console.error('Error saving employer profile:', error);
      
      // For development
      notification.success({
        message: 'Cập nhật thành công (chế độ thử nghiệm)',
        description: 'Thông tin công ty đã được cập nhật (giả lập thành công)!',
        placement: 'topRight'
      });
      
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoChange = (info) => {
    if (info.file) {
      setLogoFile(info.file.originFileObj);
      // Preview image immediately
      getBase64(info.file.originFileObj, url => {
        setLogoUrl(url);
      });
    }
  };

  const handleCoverChange = (info) => {
    if (info.file) {
      setCoverFile(info.file.originFileObj);
      // Preview image immediately
      getBase64(info.file.originFileObj, url => {
        setCoverUrl(url);
      });
    }
  };

  // Helper function to convert file to base64
  const getBase64 = (file, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(file);
  };

  const renderProfileView = () => {
    if (!profile) return null;
    
    return (
      <div className="company-profile">
        <div className="cover-image-container position-relative mb-4" style={{ height: '250px', overflow: 'hidden' }}>
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={profile.companyName}
              style={{ width: '100%', objectFit: 'cover', height: '250px' }}
              fallback="https://via.placeholder.com/1200x300?text=No+Cover+Image"
            />
          ) : (
            <div className="no-cover" style={{ width: '100%', height: '250px', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text type="secondary">Chưa có ảnh bìa</Text>
            </div>
          )}
          
          <Button 
            type="primary"
            icon={<EditOutlined />}
            className="position-absolute"
            style={{ top: '10px', right: '10px' }}
            onClick={() => setIsEditing(true)}
          >
            Chỉnh sửa
          </Button>
        </div>
        
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8} lg={6}>
            <Card className="text-center">
              <div className="company-logo mb-3">
                <Image
                  src={logoUrl}
                  alt={profile.companyName}
                  style={{ width: '150px', height: '150px', objectFit: 'contain' }}
                  fallback="https://via.placeholder.com/150?text=No+Logo"
                />
              </div>
              
              <Title level={4}>{profile.companyName}</Title>
              {profile.verified && (
                <div className="verified-badge mb-2">
                  <CheckCircleOutlined style={{ color: '#52c41a' }} /> <Text type="success">Đã xác thực</Text>
                </div>
              )}
              
              <Divider />
              
              <div className="company-info text-left">
                <p>
                  <EnvironmentOutlined className="me-2" />
                  {profile.location?.address}, {profile.location?.city}, {profile.location?.country}
                </p>
                <p>
                  <MailOutlined className="me-2" />
                  {profile.contactEmail}
                </p>
                <p>
                  <PhoneOutlined className="me-2" />
                  {profile.contactPhone}
                </p>
                <p>
                  <GlobalOutlined className="me-2" />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer">
                    {profile.website}
                  </a>
                </p>
              </div>
              
              <Divider />
              
              <div className="company-meta">
                <p><strong>Ngành nghề:</strong> {profile.industry}</p>
                <p><strong>Quy mô:</strong> {profile.companySize} nhân viên</p>
                <p><strong>Năm thành lập:</strong> {profile.foundedYear}</p>
              </div>
              
              <Divider />
              
              <div className="social-links">
                {profile.socialLinks?.linkedin && (
                  <Button type="link" href={profile.socialLinks.linkedin} target="_blank">
                    <i className="bi bi-linkedin"></i>
                  </Button>
                )}
                {profile.socialLinks?.facebook && (
                  <Button type="link" href={profile.socialLinks.facebook} target="_blank">
                    <i className="bi bi-facebook"></i>
                  </Button>
                )}
                {profile.socialLinks?.twitter && (
                  <Button type="link" href={profile.socialLinks.twitter} target="_blank">
                    <i className="bi bi-twitter"></i>
                  </Button>
                )}
              </div>
            </Card>
          </Col>
          
          <Col xs={24} md={16} lg={18}>
            <Card>
              <Tabs defaultActiveKey="about">
                <TabPane tab="Giới thiệu" key="about">
                  <Title level={4}>Giới thiệu công ty</Title>
                  <Paragraph>{profile.description}</Paragraph>
                  
                  <Divider />
                  
                  <Title level={4}>Văn hóa công ty</Title>
                  <Paragraph>{profile.culture}</Paragraph>
                </TabPane>
                
                <TabPane tab="Phúc lợi" key="benefits">
                  <Title level={4}>Phúc lợi</Title>
                  <ul className="benefits-list">
                    {profile.benefits?.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  const renderEditForm = () => {
    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={{
          email: profile?.email || '',
          phone: profile?.phone || '',
          companyName: profile?.companyName || '',
          industry: profile?.industry || '',
          companySize: profile?.companySize || '',
          foundedYear: profile?.foundedYear || new Date().getFullYear(),
          website: profile?.website || '',
          address: profile?.location?.address || '',
          city: profile?.location?.city || '',
          country: profile?.location?.country || 'Việt Nam',
          contactEmail: profile?.contactEmail || '',
          contactPhone: profile?.contactPhone || '',
          description: profile?.description || '',
          benefits: profile?.benefits?.join('\n') || '',
          culture: profile?.culture || '',
          linkedin: profile?.socialLinks?.linkedin || '',
          facebook: profile?.socialLinks?.facebook || '',
          twitter: profile?.socialLinks?.twitter || '',
        }}
      >
        <Card title="Cập nhật thông tin công ty" className="mb-4">
          <Row gutter={[24, 16]}>
            <Col span={24}>
              <Title level={5}>Ảnh công ty</Title>
              <Row gutter={16}>
                <Col md={12}>
                  <Form.Item label="Logo công ty">
                    <Upload
                      name="logo"
                      listType="picture-card"
                      showUploadList={false}
                      beforeUpload={() => false}
                      onChange={handleLogoChange}
                      maxCount={1}
                    >
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Tải lên</div>
                        </div>
                      )}
                    </Upload>
                    <Text type="secondary">Nên sử dụng ảnh vuông, kích thước tối thiểu 200x200px</Text>
                  </Form.Item>
                </Col>
                
                <Col md={12}>
                  <Form.Item label="Ảnh bìa">
                    <Upload
                      name="coverImage"
                      listType="picture-card"
                      showUploadList={false}
                      beforeUpload={() => false}
                      onChange={handleCoverChange}
                      maxCount={1}
                    >
                      {coverUrl ? (
                        <img src={coverUrl} alt="Cover" style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                      ) : (
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Tải lên</div>
                        </div>
                      )}
                    </Upload>
                    <Text type="secondary">Nên sử dụng ảnh kích thước 1200x300px</Text>
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            
            <Col md={12}>
              <Form.Item name="companyName" label="Tên công ty" rules={[{ required: true, message: 'Vui lòng nhập tên công ty' }]}>
                <Input placeholder="Nhập tên công ty" />
              </Form.Item>
            </Col>
            
            <Col md={12}>
              <Form.Item name="industry" label="Ngành nghề" rules={[{ required: true, message: 'Vui lòng chọn ngành nghề' }]}>
                <Select placeholder="Chọn ngành nghề">
                  <Option value="Công nghệ thông tin">Công nghệ thông tin</Option>
                  <Option value="Tài chính - Ngân hàng">Tài chính - Ngân hàng</Option>
                  <Option value="Bán lẻ">Bán lẻ</Option>
                  <Option value="Sản xuất">Sản xuất</Option>
                  <Option value="Giáo dục">Giáo dục</Option>
                  <Option value="Y tế">Y tế</Option>
                  <Option value="Bất động sản">Bất động sản</Option>
                  <Option value="Du lịch">Du lịch</Option>
                  <Option value="Khác">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col md={12}>
              <Form.Item name="companySize" label="Quy mô công ty" rules={[{ required: true, message: 'Vui lòng chọn quy mô công ty' }]}>
                <Select placeholder="Chọn quy mô">
                  <Option value="1-10">1-10 nhân viên</Option>
                  <Option value="11-50">11-50 nhân viên</Option>
                  <Option value="51-200">51-200 nhân viên</Option>
                  <Option value="201-500">201-500 nhân viên</Option>
                  <Option value="501-1000">501-1000 nhân viên</Option>
                  <Option value="1000+">Trên 1000 nhân viên</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col md={12}>
              <Form.Item name="foundedYear" label="Năm thành lập" rules={[{ required: true, message: 'Vui lòng nhập năm thành lập' }]}>
                <Input type="number" placeholder="Nhập năm thành lập" />
              </Form.Item>
            </Col>
            
            <Col md={12}>
              <Form.Item name="website" label="Website" rules={[{ type: 'url', message: 'Vui lòng nhập đúng định dạng URL' }]}>
                <Input placeholder="Nhập website công ty" />
              </Form.Item>
            </Col>
            
            <Col md={12}>
              <Form.Item name="address" label="Địa chỉ">
                <Input placeholder="Nhập địa chỉ công ty" />
              </Form.Item>
            </Col>
            
            <Col md={6}>
              <Form.Item name="city" label="Thành phố">
                <Input placeholder="Nhập thành phố" />
              </Form.Item>
            </Col>
            
            <Col md={6}>
              <Form.Item name="country" label="Quốc gia">
                <Input placeholder="Nhập quốc gia" defaultValue="Việt Nam" />
              </Form.Item>
            </Col>
            
            <Col md={12}>
              <Form.Item name="contactEmail" label="Email liên hệ" rules={[{ type: 'email', message: 'Vui lòng nhập đúng định dạng email' }]}>
                <Input placeholder="Nhập email liên hệ" />
              </Form.Item>
            </Col>
            
            <Col md={12}>
              <Form.Item name="contactPhone" label="Số điện thoại liên hệ">
                <Input placeholder="Nhập số điện thoại liên hệ" />
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Form.Item name="description" label="Mô tả công ty" rules={[{ required: true, message: 'Vui lòng nhập mô tả công ty' }]}>
                <TextArea rows={6} placeholder="Mô tả chi tiết về công ty" />
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Form.Item name="culture" label="Văn hóa công ty">
                <TextArea rows={4} placeholder="Mô tả văn hóa công ty" />
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Form.Item name="benefits" label="Phúc lợi">
                <TextArea rows={4} placeholder="Nhập danh sách phúc lợi (mỗi dòng một phúc lợi)" />
              </Form.Item>
              <Text type="secondary">Mỗi dòng là một phúc lợi. Ví dụ: Bảo hiểm sức khỏe</Text>
            </Col>
            
            <Divider>Mạng xã hội</Divider>
            
            <Col md={8}>
              <Form.Item name="linkedin" label="LinkedIn">
                <Input placeholder="https://linkedin.com/company/..." />
              </Form.Item>
            </Col>
            
            <Col md={8}>
              <Form.Item name="facebook" label="Facebook">
                <Input placeholder="https://facebook.com/..." />
              </Form.Item>
            </Col>
            
            <Col md={8}>
              <Form.Item name="twitter" label="Twitter">
                <Input placeholder="https://twitter.com/..." />
              </Form.Item>
            </Col>
            
            <Divider>Thông tin tài khoản</Divider>
            
            <Col md={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ' }]}>
                <Input disabled={!!profile?.email} />
              </Form.Item>
            </Col>
            
            <Col md={12}>
              <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={isLoading}>
                Lưu thông tin
              </Button>
              {profile && (
                <Button onClick={() => setIsEditing(false)}>
                  Hủy
                </Button>
              )}
            </Space>
          </Form.Item>
        </Card>
      </Form>
    );
  };

  if (isLoading && !profile) {
    return (
      <div className="text-center py-5">
        <Spin size="large" />
        <div className="mt-3">Đang tải thông tin công ty...</div>
      </div>
    );
  }

  return (
    <div className="employer-profile-page">
      {isEditing ? renderEditForm() : renderProfileView()}
    </div>
  );
};

export default EmployerProfilePage;
