import React, { useState } from 'react';
import { Form, Input, Button, DatePicker, Space, Divider, Card, Row, Col, Modal, Tooltip, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';

const { TextArea } = Input;
const { Option } = Select;

const ProjectsSection = ({ data, onChange }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [form] = Form.useForm();

  const showAddModal = () => {
    setCurrentItem(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (item, index) => {
    setCurrentItem({ ...item, index });
    form.setFieldsValue({
      ...item,
      startDate: item.startDate ? moment(item.startDate) : null,
      endDate: item.endDate ? moment(item.endDate) : null,
      technologies: item.technologies || []
    });
    setIsModalVisible(true);
  };

  const handleDelete = (index) => {
    const newData = [...data];
    newData.splice(index, 1);
    onChange(newData);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      const newData = [...data];
      const itemData = {
        ...values,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : '',
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : ''
      };

      if (currentItem !== null) {
        // Edit existing item
        newData[currentItem.index] = itemData;
      } else {
        // Add new item
        newData.push(itemData);
      }

      onChange(newData);
      setIsModalVisible(false);
    });
  };

  return (
    <div className="projects-section-editor">
      <Divider orientation="left">
        <Space>
          <span>Dự án</span>
          <Tooltip title="Thêm dự án">
            <Button 
              type="primary" 
              shape="circle" 
              icon={<PlusOutlined />} 
              size="small" 
              onClick={showAddModal}
            />
          </Tooltip>
        </Space>
      </Divider>
      
      <div className="section-items">
        {data.length === 0 ? (
          <div className="empty-list">
            <p>Chưa có thông tin dự án. Vui lòng thêm thông tin.</p>
            <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
              Thêm dự án
            </Button>
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {data.map((item, index) => (
              <Col xs={24} sm={12} key={index}>
                <Card 
                  size="small"
                  title={item.name}
                  extra={
                    <Space>
                      <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        onClick={() => showEditModal(item, index)}
                      />
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleDelete(index)}
                      />
                    </Space>
                  }
                >
                  <p>
                    <strong>Thời gian:</strong> {' '}
                    {item.startDate} {item.endDate ? ` - ${item.endDate}` : ' - Hiện tại'}
                  </p>
                  {item.description && <p><strong>Mô tả:</strong> {item.description}</p>}
                  {item.technologies && item.technologies.length > 0 && (
                    <p>
                      <strong>Công nghệ:</strong> {item.technologies.join(', ')}
                    </p>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      <Modal
        title={currentItem ? "Chỉnh sửa dự án" : "Thêm dự án mới"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Tên dự án"
            rules={[{ required: true, message: 'Vui lòng nhập tên dự án' }]}
          >
            <Input placeholder="Ví dụ: Website thương mại điện tử, Ứng dụng quản lý dự án..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Ngày bắt đầu"
                rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
              >
                <DatePicker format="YYYY-MM-DD" placeholder="Chọn ngày" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="Ngày kết thúc (để trống nếu là hiện tại)"
              >
                <DatePicker format="YYYY-MM-DD" placeholder="Chọn ngày" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả dự án"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả dự án' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Mô tả về mục tiêu, phạm vi và kết quả của dự án..." 
            />
          </Form.Item>

          <Form.Item
            name="technologies"
            label="Công nghệ sử dụng"
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Nhập các công nghệ sử dụng trong dự án"
              tokenSeparators={[',']}
            >
              {/* Các công nghệ phổ biến */}
              <Option value="JavaScript">JavaScript</Option>
              <Option value="React">React</Option>
              <Option value="Angular">Angular</Option>
              <Option value="Vue.js">Vue.js</Option>
              <Option value="Node.js">Node.js</Option>
              <Option value="Express">Express</Option>
              <Option value="Python">Python</Option>
              <Option value="Django">Django</Option>
              <Option value="Flask">Flask</Option>
              <Option value="Java">Java</Option>
              <Option value="Spring Boot">Spring Boot</Option>
              <Option value="PHP">PHP</Option>
              <Option value="Laravel">Laravel</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectsSection; 