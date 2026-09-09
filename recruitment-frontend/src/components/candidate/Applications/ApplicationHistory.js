import React from 'react';
import { Timeline, Card, Typography, Tag, Space } from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  FileTextOutlined,
  EyeOutlined
} from '@ant-design/icons';
import moment from 'moment';
import ApplicationStatus from './ApplicationStatus';

const { Text, Title } = Typography;

/**
 * Component to display application history timeline
 */
const ApplicationHistory = ({ history = [] }) => {
  // Sort history entries by date (newest first)
  const sortedHistory = [...history].sort((a, b) => {
    return new Date(b.date || b.enteredAt) - new Date(a.date || a.enteredAt);
  });

  return (
    <Card title="Lịch sử xử lý hồ sơ">
      {sortedHistory.length > 0 ? (
        <Timeline mode="left">
          {sortedHistory.map((item, index) => {
            // Determine stage information
            const stage = item.stage || item.status || 'unknown';
            const date = item.date || item.enteredAt || item.timestamp || new Date().toISOString();
            const notes = item.notes || item.message || '';
            
            // Get color based on status
            let color = 'blue';
            let icon = <ClockCircleOutlined />;
            
            if (['hired', 'offered', 'success'].includes(stage)) {
              color = 'green';
              icon = <CheckCircleOutlined />;
            } else if (['rejected', 'withdrawn', 'failed'].includes(stage)) {
              color = 'red';
              icon = <CloseCircleOutlined />;
            } else if (['reviewing', 'interviewing'].includes(stage)) {
              color = 'blue';
              icon = <EyeOutlined />;
            } else if (['pending'].includes(stage)) {
              color = 'orange';
              icon = <ClockCircleOutlined />;
            }
            
            return (
              <Timeline.Item 
                key={index} 
                color={color}
                dot={icon}
                label={moment(date).format('DD/MM/YYYY HH:mm')}
              >
                <Space direction="vertical" size={1}>
                  <Space>
                    <ApplicationStatus status={stage} />
                    <Text strong>{getStatusText(stage)}</Text>
                  </Space>
                  
                  {notes && (
                    <Text type="secondary">{notes}</Text>
                  )}
                </Space>
              </Timeline.Item>
            );
          })}
        </Timeline>
      ) : (
        <Text type="secondary">Chưa có hoạt động nào được ghi nhận</Text>
      )}
    </Card>
  );
};

// Helper function to get readable status text
function getStatusText(status) {
  const statusMap = {
    'pending': 'Chờ xử lý',
    'reviewing': 'Đang xem xét',
    'interviewing': 'Phỏng vấn',
    'offered': 'Đã đề nghị',
    'hired': 'Đã tuyển dụng', 
    'rejected': 'Từ chối',
    'withdrawn': 'Đã rút hồ sơ',
    'success': 'Thành công',
    'failed': 'Thất bại',
    '1': 'Giai đoạn 1', 
    '2': 'Giai đoạn 2', 
    '3': 'Giai đoạn 3'
  };
  
  return statusMap[status] || status;
}

export default ApplicationHistory;
