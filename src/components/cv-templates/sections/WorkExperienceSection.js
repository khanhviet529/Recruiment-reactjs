import React, { useState } from 'react';
import { Form, Input, Button, DatePicker, Space, Divider, Card, Row, Col, Modal, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';

const { TextArea } = Input;

const WorkExperienceSection = ({ data, onChange }) => {
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
    <div className="work-experience-section-editor">
      <Divider orientation="left">
        <Space>
          <span>Kinh nghiệm làm việc</span>
          <Tooltip title="Thêm kinh nghiệm">
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
            <p>Chưa có thông tin kinh nghiệm làm việc. Vui lòng thêm thông tin.</p>
            <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
              Thêm kinh nghiệm
            </Button>
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {data.map((item, index) => (
              <Col xs={24} key={index}>
                <Card 
                  size="small"
                  title={`${item.position} tại ${item.company}`}
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
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      <Modal
        title={currentItem ? "Chỉnh sửa kinh nghiệm làm việc" : "Thêm kinh nghiệm làm việc mới"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="company"
            label="Công ty"
            rules={[{ required: true, message: 'Vui lòng nhập tên công ty' }]}
          >
            <Input placeholder="Ví dụ: Công ty ABC" />
          </Form.Item>

          <Form.Item
            name="position"
            label="Vị trí"
            rules={[{ required: true, message: 'Vui lòng nhập vị trí công việc' }]}
          >
            <Input placeholder="Ví dụ: Frontend Developer" />
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
            label="Mô tả công việc"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả công việc' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Mô tả về trách nhiệm, thành tựu và kỹ năng bạn đã sử dụng trong công việc này..." 
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WorkExperienceSection; 