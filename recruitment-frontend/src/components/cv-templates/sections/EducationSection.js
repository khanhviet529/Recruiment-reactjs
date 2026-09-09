import React, { useState } from 'react';
import { Form, Input, Button, DatePicker, Space, Divider, Card, Row, Col, Modal, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';

const { TextArea } = Input;

const EducationSection = ({ data, onChange }) => {
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
      endDate: item.endDate ? moment(item.endDate) : null
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
    <div className="education-section-editor">
      <Divider orientation="left">
        <Space>
          <span>Học vấn</span>
          <Tooltip title="Thêm học vấn">
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
            <p>Chưa có thông tin học vấn. Vui lòng thêm thông tin.</p>
            <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
              Thêm học vấn
            </Button>
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {data.map((item, index) => (
              <Col xs={24} sm={12} key={index}>
                <Card 
                  size="small"
                  title={item.degree}
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
                  <p><strong>Trường:</strong> {item.school}</p>
                  <p>
                    <strong>Thời gian:</strong> {' '}
                    {item.startDate} {item.endDate ? ` - ${item.endDate}` : ' - Hiện tại'}
                  </p>
                  {item.description && <p><strong>Mô tả:</strong> {item.description}</p>}
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      <Modal
        title={currentItem ? "Chỉnh sửa học vấn" : "Thêm học vấn mới"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="school"
            label="Trường"
            rules={[{ required: true, message: 'Vui lòng nhập tên trường' }]}
          >
            <Input placeholder="Ví dụ: Đại học Bách Khoa Hà Nội" />
          </Form.Item>

          <Form.Item
            name="degree"
            label="Bằng cấp / Chuyên ngành"
            rules={[{ required: true, message: 'Vui lòng nhập bằng cấp/chuyên ngành' }]}
          >
            <Input placeholder="Ví dụ: Cử nhân Công nghệ thông tin" />
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
            label="Mô tả"
          >
            <TextArea rows={4} placeholder="Mô tả về chương trình học, thành tích, GPA..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EducationSection; 