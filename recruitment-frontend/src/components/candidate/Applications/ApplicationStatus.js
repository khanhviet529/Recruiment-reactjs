import React from 'react';
import { Tag, Tooltip } from 'antd';
import { 
  ClockCircleOutlined, 
  EyeOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  TeamOutlined,
  CalendarOutlined,
  FileTextOutlined
} from '@ant-design/icons';

/**
 * Renders an application status tag with appropriate color and icon
 */
const ApplicationStatus = ({ status, showIcon = true, showText = true }) => {
  const statusConfig = {
    'pending': { 
      color: 'warning', 
      text: 'Chờ xử lý', 
      icon: <ClockCircleOutlined />,
      tooltip: 'Your application is waiting to be reviewed by the employer'
    },
    'reviewing': { 
      color: 'processing', 
      text: 'Đang xem xét', 
      icon: <EyeOutlined />,
      tooltip: 'Your application is currently being reviewed'
    },
    'interviewing': { 
      color: 'blue', 
      text: 'Phỏng vấn', 
      icon: <TeamOutlined />,
      tooltip: 'You have been selected for an interview'
    },
    'offered': { 
      color: 'success', 
      text: 'Đã đề nghị', 
      icon: <FileTextOutlined />,
      tooltip: 'You have received a job offer'
    },
    'hired': { 
      color: 'success', 
      text: 'Đã tuyển', 
      icon: <CheckCircleOutlined />,
      tooltip: 'You have been hired for this position'
    },
    'rejected': { 
      color: 'error', 
      text: 'Từ chối', 
      icon: <CloseCircleOutlined />,
      tooltip: 'Your application has been rejected'
    },
    'withdrawn': { 
      color: 'default', 
      text: 'Đã rút hồ sơ', 
      icon: <CloseCircleOutlined />,
      tooltip: 'You have withdrawn your application'
    }
  };
  
  // Default to 'pending' if status is not recognized
  const config = statusConfig[status] || statusConfig['pending'];
  
  return (
    <Tooltip title={config.tooltip}>
      <Tag 
        color={config.color} 
        icon={showIcon ? config.icon : null}
      >
        {showText ? config.text : null}
      </Tag>
    </Tooltip>
  );
};

export default ApplicationStatus;
