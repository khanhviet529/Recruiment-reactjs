import React, { useState } from 'react';
import { Form, Input, Button, Space, Divider, Card, Row, Col, Modal, Tooltip, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

const LanguagesSection = ({ data, onChange }) => {
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

  const proficiencyOptions = [
    { value: 'Sơ cấp', label: 'Sơ cấp' },
    { value: 'Trung cấp', label: 'Trung cấp' },
    { value: 'Thành thạo', label: 'Thành thạo' },
    { value: 'Chuyên nghiệp', label: 'Chuyên nghiệp' },
    { value: 'Bản ngữ', label: 'Bản ngữ' },
    { value: 'A1', label: 'A1' },
    { value: 'A2', label: 'A2' },
    { value: 'B1', label: 'B1' },
    { value: 'B2', label: 'B2' },
    { value: 'C1', label: 'C1' },
    { value: 'C2', label: 'C2' },
  ];

  return (
    <div className="languages-section-editor">
      <Divider orientation="left">
        <Space>
          <span>Ngôn ngữ</span>
          <Tooltip title="Thêm ngôn ngữ">
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
            <p>Chưa có thông tin ngôn ngữ. Vui lòng thêm thông tin.</p>
            <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
              Thêm ngôn ngữ
            </Button>
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {data.map((item, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
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
                  <p><strong>Trình độ:</strong> {item.proficiency}</p>
                  {item.description && <p><strong>Ghi chú:</strong> {item.description}</p>}
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      <Modal
        title={currentItem ? "Chỉnh sửa ngôn ngữ" : "Thêm ngôn ngữ mới"}
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
            label="Tên ngôn ngữ"
            rules={[{ required: true, message: 'Vui lòng nhập tên ngôn ngữ' }]}
          >
            <Input placeholder="Ví dụ: Tiếng Anh, Tiếng Nhật, Tiếng Pháp..." />
          </Form.Item>

          <Form.Item
            name="proficiency"
            label="Trình độ"
            rules={[{ required: true, message: 'Vui lòng chọn trình độ' }]}
          >
            <Select placeholder="Chọn trình độ">
              {proficiencyOptions.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Ghi chú"
          >
            <Input.TextArea rows={2} placeholder="Thông tin bổ sung về trình độ ngôn ngữ..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LanguagesSection; 