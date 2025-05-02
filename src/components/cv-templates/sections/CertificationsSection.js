import React, { useState } from 'react';
import { Form, Input, Button, DatePicker, Space, Divider, Card, Row, Col, Modal, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';

const CertificationsSection = ({ data, onChange }) => {
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
      date: item.date ? moment(item.date) : null
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
        date: values.date ? values.date.format('YYYY-MM-DD') : ''
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
    <div className="certifications-section-editor">
      <Divider orientation="left">
        <Space>
          <span>Chứng chỉ</span>
          <Tooltip title="Thêm chứng chỉ">
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
            <p>Chưa có thông tin chứng chỉ. Vui lòng thêm thông tin.</p>
            <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
              Thêm chứng chỉ
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
                  <p><strong>Tổ chức cấp:</strong> {item.issuer}</p>
                  {item.date && <p><strong>Ngày cấp:</strong> {item.date}</p>}
                  {item.description && <p><strong>Mô tả:</strong> {item.description}</p>}
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      <Modal
        title={currentItem ? "Chỉnh sửa chứng chỉ" : "Thêm chứng chỉ mới"}
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
            label="Tên chứng chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập tên chứng chỉ' }]}
          >
            <Input placeholder="Ví dụ: AWS Certified Solutions Architect, IELTS 7.0..." />
          </Form.Item>

          <Form.Item
            name="issuer"
            label="Tổ chức cấp"
            rules={[{ required: true, message: 'Vui lòng nhập tên tổ chức cấp' }]}
          >
            <Input placeholder="Ví dụ: Microsoft, AWS, British Council..." />
          </Form.Item>

          <Form.Item
            name="date"
            label="Ngày cấp"
          >
            <DatePicker format="YYYY-MM-DD" placeholder="Chọn ngày" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={3} placeholder="Mô tả thêm về chứng chỉ..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CertificationsSection; 