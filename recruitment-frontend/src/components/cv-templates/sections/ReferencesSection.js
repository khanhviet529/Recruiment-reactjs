import React, { useState } from 'react';
import { Form, Input, Button, Space, Divider, Card, Row, Col, Modal, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const ReferencesSection = ({ data, onChange }) => {
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
      ...item
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
      
      if (currentItem !== null) {
        // Edit existing item
        newData[currentItem.index] = values;
      } else {
        // Add new item
        newData.push(values);
      }

      onChange(newData);
      setIsModalVisible(false);
    });
  };

  return (
    <div className="references-section-editor">
      <Divider orientation="left">
        <Space>
          <span>Người tham chiếu</span>
          <Tooltip title="Thêm người tham chiếu">
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
            <p>Chưa có thông tin người tham chiếu. Vui lòng thêm thông tin.</p>
            <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
              Thêm người tham chiếu
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
                  <p><strong>Vị trí:</strong> {item.position}</p>
                  <p><strong>Công ty:</strong> {item.company}</p>
                  {item.email && <p><strong>Email:</strong> {item.email}</p>}
                  {item.phone && <p><strong>Điện thoại:</strong> {item.phone}</p>}
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      <Modal
        title={currentItem ? "Chỉnh sửa người tham chiếu" : "Thêm người tham chiếu mới"}
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
            label="Họ tên"
            rules={[{ required: true, message: 'Vui lòng nhập tên người tham chiếu' }]}
          >
            <Input placeholder="Họ tên người tham chiếu" />
          </Form.Item>

          <Form.Item
            name="position"
            label="Vị trí"
            rules={[{ required: true, message: 'Vui lòng nhập vị trí' }]}
          >
            <Input placeholder="Ví dụ: Giám đốc, Trưởng phòng, Giảng viên..." />
          </Form.Item>

          <Form.Item
            name="company"
            label="Công ty/Tổ chức"
            rules={[{ required: true, message: 'Vui lòng nhập tên công ty/tổ chức' }]}
          >
            <Input placeholder="Tên công ty hoặc tổ chức" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
          >
            <Input placeholder="Email liên hệ" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
          >
            <Input placeholder="Số điện thoại liên hệ" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReferencesSection; 