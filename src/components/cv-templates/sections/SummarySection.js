import React from 'react';
import { Form, Input, Divider, Card } from 'antd';

const { TextArea } = Input;

const SummarySection = ({ data, onChange }) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="summary-section-editor">
      <Divider orientation="left">Tóm tắt</Divider>
      
      <Card size="small">
        <Form layout="vertical">
          <Form.Item
            label="Tóm tắt về bản thân và kinh nghiệm của bạn"
            help="Đây là nơi bạn có thể giới thiệu ngắn gọn về bản thân, kinh nghiệm và mục tiêu nghề nghiệp."
          >
            <TextArea
              rows={6}
              value={data || ''}
              onChange={handleChange}
              placeholder="Ví dụ: Tôi là một Frontend Developer với hơn 3 năm kinh nghiệm trong việc phát triển các ứng dụng web sử dụng React, Angular và Vue.js. Tôi có khả năng làm việc độc lập và làm việc nhóm tốt, luôn tìm kiếm cách tối ưu hóa hiệu suất và trải nghiệm người dùng trong các dự án..."
            />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SummarySection; 