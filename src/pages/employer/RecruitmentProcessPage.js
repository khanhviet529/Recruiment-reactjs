import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, Steps, Button, Divider, Typography, List, Timeline } from 'antd';
import { 
  FileDoneOutlined, 
  EyeOutlined, 
  PhoneOutlined, 
  CheckCircleOutlined, 
  UserAddOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const RecruitmentProcessPage = () => {
  const { user } = useSelector((state) => state.auth);
  
  // Quy trình mẫu cho công ty
  const defaultProcess = [
    {
      title: 'Sàng lọc hồ sơ',
      description: 'Xem xét CV và đơn ứng tuyển',
      icon: <FileDoneOutlined />,
      steps: [
        'Tiếp nhận đơn ứng tuyển từ ứng viên',
        'Đánh giá và sàng lọc hồ sơ dựa trên yêu cầu công việc',
        'Liên hệ với các ứng viên tiềm năng'
      ]
    },
    {
      title: 'Phỏng vấn sơ bộ',
      description: 'Phỏng vấn qua điện thoại hoặc video',
      icon: <PhoneOutlined />,
      steps: [
        'Gửi email thông báo phỏng vấn',
        'Thực hiện phỏng vấn qua điện thoại hoặc video',
        'Đánh giá kết quả phỏng vấn sơ bộ'
      ]
    },
    {
      title: 'Phỏng vấn chuyên môn',
      description: 'Đánh giá kỹ năng và kinh nghiệm',
      icon: <EyeOutlined />,
      steps: [
        'Sắp xếp lịch phỏng vấn với các bộ phận liên quan',
        'Đánh giá kỹ năng chuyên môn và kinh nghiệm',
        'Thảo luận về các dự án đã thực hiện'
      ]
    },
    {
      title: 'Đề xuất công việc',
      description: 'Đàm phán và đề xuất công việc',
      icon: <CheckCircleOutlined />,
      steps: [
        'Trao đổi về mức lương và phúc lợi',
        'Gửi thư đề nghị công việc chính thức',
        'Thương lượng các điều khoản nếu cần'
      ]
    },
    {
      title: 'Onboarding',
      description: 'Hội nhập nhân viên mới',
      icon: <UserAddOutlined />,
      steps: [
        'Hoàn thiện thủ tục giấy tờ',
        'Giới thiệu về công ty và quy trình làm việc',
        'Bố trí nơi làm việc và các tài nguyên cần thiết'
      ]
    }
  ];

  return (
    <div className="recruitment-process-page">
      <div className="page-header mb-4">
        <Title level={2}>Quy trình tuyển dụng</Title>
        <Paragraph>
          Quy trình tuyển dụng chuẩn của công ty bạn. Quy trình này sẽ được áp dụng khi xử lý các đơn ứng tuyển.
        </Paragraph>
      </div>

      <Card className="mb-4">
        <Steps current={-1}>
          {defaultProcess.map((stage, index) => (
            <Step
              key={index}
              title={stage.title}
              description={stage.description}
              icon={stage.icon}
            />
          ))}
        </Steps>
      </Card>

      {defaultProcess.map((stage, index) => (
        <Card key={index} className="mb-4">
          <div className="d-flex align-items-center mb-3">
            {stage.icon}
            <Title level={4} className="mb-0 ms-2">{`Giai đoạn ${index + 1}: ${stage.title}`}</Title>
          </div>
          
          <Paragraph>{stage.description}</Paragraph>
          
          <List
            bordered
            dataSource={stage.steps}
            renderItem={(item, i) => (
              <List.Item>
                <Text>{`${i + 1}. ${item}`}</Text>
              </List.Item>
            )}
          />
        </Card>
      ))}

      <Card title="Timeline quy trình tuyển dụng">
        <Timeline mode="left">
          {defaultProcess.map((stage, index) => (
            <Timeline.Item key={index} label={`Giai đoạn ${index + 1}`} dot={stage.icon}>
              <Title level={5}>{stage.title}</Title>
              <Paragraph>{stage.description}</Paragraph>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>
    </div>
  );
};

export default RecruitmentProcessPage;
