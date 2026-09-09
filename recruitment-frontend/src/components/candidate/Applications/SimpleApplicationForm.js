import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

const SimpleApplicationForm = ({ 
  jobId, 
  jobTitle,
  companyName,
  onSuccess = () => {},
  onCancel = () => {}
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    console.log('Simple form submitted with values:', values);
    setLoading(true);
    
    try {
      // Simulate submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('Test: Form submission successful!');
      onSuccess();
    } catch (error) {
      console.error('Test form error:', error);
      message.error('Test: Form submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="simple-application-form">
      <Card>
        <Title level={4}>Test Application Form</Title>
        <Text>Testing application for: <strong>{jobTitle}</strong></Text>
        <Text>Company: <strong>{companyName}</strong></Text>
        
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label="Full Name"
            name="fullName"
            rules={[{ required: true, message: 'Please enter your full name' }]}
          >
            <Input placeholder="Enter your full name" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            label="Phone"
            name="phone"
          >
            <Input placeholder="Enter your phone number" />
          </Form.Item>

          <Form.Item
            label="Cover Letter"
            name="coverLetter"
          >
            <TextArea 
              rows={4} 
              placeholder="Write a brief cover letter..."
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button onClick={onCancel}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SendOutlined />}
              >
                Test Submit
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SimpleApplicationForm; 