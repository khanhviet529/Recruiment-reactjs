import React, { useState } from 'react';
import { Form, Input, Button, Space, Divider, Card, Row, Col, Modal, Tooltip, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const InterestsSection = ({ data, onChange }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const showAddModal = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleDelete = (index) => {
    const newData = [...data];
    newData.splice(index, 1);
    onChange(newData);
  };

  const handleAddInterest = () => {
    form.validateFields().then(values => {
      const interest = values.interest.trim();
      if (interest && !data.includes(interest)) {
        const newData = [...data, interest];
        onChange(newData);
        form.resetFields();
      }
    });
  };

  return (
    <div className="interests-section-editor">
      <Divider orientation="left">
        <Space>
          <span>Sở thích</span>
          <Tooltip title="Thêm sở thích">
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
            <p>Chưa có thông tin sở thích. Vui lòng thêm thông tin.</p>
            <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
              Thêm sở thích
            </Button>
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Card size="small">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {data.map((interest, index) => (
                    <Tag
                      key={index}
                      closable
                      onClose={() => handleDelete(index)}
                      style={{ fontSize: '14px', padding: '4px 8px' }}
                    >
                      {interest}
                    </Tag>
                  ))}
                  <Tag 
                    style={{ background: '#fff', borderStyle: 'dashed', cursor: 'pointer' }}
                    onClick={showAddModal}
                  >
                    <PlusOutlined /> Thêm sở thích
                  </Tag>
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </div>

      <Modal
        title="Thêm sở thích"
        open={isModalVisible}
        onOk={handleAddInterest}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="interest"
            label="Sở thích"
            rules={[{ required: true, message: 'Vui lòng nhập sở thích' }]}
          >
            <Input placeholder="Ví dụ: Đọc sách, Du lịch, Chơi cờ, Nấu ăn..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InterestsSection; 