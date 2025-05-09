import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Avatar, Badge, Typography, Divider, Breadcrumb } from 'antd';
import { 
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  MessageOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

const { Header, Sider, Content, Footer } = Layout;
const { Text, Title } = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);
  
  // Helper function to check if the link is active
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };
  
  // Get breadcrumb items based on current path
  const getBreadcrumbItems = () => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    
    // Always start with Home
    const items = [
      {
        title: <Link to="/admin/dashboard">Dashboard</Link>,
      }
    ];
    
    // Add other parts
    if (pathParts.length > 1) {
      const path = pathParts[1];
      
      switch (path) {
        case 'dashboard':
          // Already included
          break;
        case 'users':
          items.push({
            title: 'Quản lý người dùng',
          });
          break;
        case 'jobs':
          items.push({
            title: 'Quản lý tin tuyển dụng',
          });
          break;
        case 'messages':
          items.push({
            title: 'Tin nhắn hỗ trợ',
          });
          break;
        case 'reports':
          items.push({
            title: 'Báo cáo & Thống kê',
          });
          break;
        case 'settings':
          items.push({
            title: 'Cài đặt hệ thống',
          });
          break;
        default:
          items.push({
            title: path.charAt(0).toUpperCase() + path.slice(1),
          });
      }
    }
    
    return items;
  };
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth/admin-login');
  };
  
  // User dropdown menu
  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/admin/settings">Hồ sơ cá nhân</Link>
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        <Link to="/admin/settings">Cài đặt</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          backgroundColor: '#001529'
        }}
      >
        <div className="sidebar-logo" style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 24px',
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          {collapsed ? 'JP' : 'JobPortal Admin'}
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={[
            {
              key: '/admin/dashboard',
              icon: <DashboardOutlined />,
              label: <Link to="/admin/dashboard">Dashboard</Link>,
            },
            {
              key: '/admin/users',
              icon: <TeamOutlined />,
              label: <Link to="/admin/users">Quản lý người dùng</Link>,
            },
            {
              key: '/admin/jobs',
              icon: <FileTextOutlined />,
              label: <Link to="/admin/jobs">Quản lý tin tuyển dụng</Link>,
            },
            {
              key: '/admin/messages',
              icon: <MessageOutlined />,
              label: <Link to="/admin/messages">Tin nhắn hỗ trợ</Link>,
            },
            {
              key: '/admin/reports',
              icon: <BarChartOutlined />,
              label: <Link to="/admin/reports">Báo cáo & Thống kê</Link>,
            },
            {
              key: '/admin/settings',
              icon: <SettingOutlined />,
              label: <Link to="/admin/settings">Cài đặt hệ thống</Link>,
            },
          ]}
        />
      </Sider>
      
      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'all 0.2s' }}>
        {/* Header */}
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 64, height: 64 }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Badge count={5} dot>
              <Button
                type="text"
                icon={<BellOutlined />}
                style={{ fontSize: '16px', marginRight: 24 }}
              />
            </Badge>
            
            <Dropdown overlay={userMenu} placement="bottomRight" trigger={['click']}>
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: '#1890ff', marginRight: 8 }} icon={<UserOutlined />} />
                {user ? (
                  <span style={{ marginRight: 8 }}>{user.email}</span>
                ) : (
                  <span style={{ marginRight: 8 }}>Admin</span>
                )}
              </div>
            </Dropdown>
          </div>
        </Header>
        
        {/* Main content */}
        <Content style={{ 
          margin: '24px 16px', 
          padding: 24, 
          background: '#fff', 
          minHeight: 280 
        }}>
          <Breadcrumb style={{ marginBottom: '16px' }} items={getBreadcrumbItems()} />
          <Outlet />
        </Content>
        
        {/* Footer */}
        <Footer style={{ textAlign: 'center', padding: '12px 50px' }}>
          JobPortal Admin ©{new Date().getFullYear()} - Hệ thống quản lý website tuyển dụng
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
