import React, { useState } from 'react';
import { Form, Input, Button, Space, Divider, Card, Row, Col, Modal, Tooltip, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons';

const SkillsSection = ({ data, onChange }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentSkill, setCurrentSkill] = useState('');
  const [form] = Form.useForm();

  const showAddModal = () => {
    setCurrentSkill('');
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleDelete = (index) => {
    const newData = [...data];
    newData.splice(index, 1);
    onChange(newData);
  };

  const handleAddSkill = () => {
    form.validateFields().then(values => {
      const skill = values.skill.trim();
      if (skill && !data.includes(skill)) {
        const newData = [...data, skill];
        onChange(newData);
        form.resetFields();
      }
    });
  };

  return (
    <div className="skills-section-editor">
      <Divider orientation="left">
        <Space>
          <span>Kỹ năng</span>
          <Tooltip title="Thêm kỹ năng">
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
            <p>Chưa có thông tin kỹ năng. Vui lòng thêm thông tin.</p>
            <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
              Thêm kỹ năng
            </Button>
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Card size="small">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {data.map((skill, index) => (
                    <Tag
                      key={index}
                      closable
                      onClose={() => handleDelete(index)}
                      style={{ fontSize: '14px', padding: '4px 8px' }}
                    >
                      {skill}
                    </Tag>
                  ))}
                  <Tag 
                    style={{ background: '#fff', borderStyle: 'dashed', cursor: 'pointer' }}
                    onClick={showAddModal}
                  >
                    <PlusOutlined /> Thêm kỹ năng
                  </Tag>
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </div>

      <Modal
        title="Thêm kỹ năng"
        open={isModalVisible}
        onOk={handleAddSkill}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="skill"
            label="Kỹ năng"
            rules={[{ required: true, message: 'Vui lòng nhập kỹ năng' }]}
          >
            <Input placeholder="Ví dụ: JavaScript, React, Design Thinking..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SkillsSection; 