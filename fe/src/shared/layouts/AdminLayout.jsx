// src/shared/layouts/AdminLayout.jsx
import React, { useState } from 'react';
import { Layout, Menu, Button, Space, Typography, Tag, Avatar } from 'antd';
import {
  AppstoreOutlined,
  ThunderboltOutlined,
  DollarOutlined,
  ToolOutlined,
  NotificationOutlined,
  LogoutOutlined,
  KeyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChangePasswordModal from '../components/ChangePasswordModal';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [changePassOpen, setChangePassOpen] = useState(false);

  const menuItems = [
    {
      key: '/admin/apartments',
      icon: <AppstoreOutlined />,
      label: 'Căn hộ & Cư dân',
    },
    {
      key: '/admin/meter-reading',
      icon: <ThunderboltOutlined />,
      label: 'Chốt số & Hóa đơn',
    },
    {
      key: '/admin/invoices',
      icon: <DollarOutlined />,
      label: 'Đối soát gạch nợ',
    },
    {
      key: '/admin/tickets',
      icon: <ToolOutlined />,
      label: 'Giám sát sự cố',
    },
    {
      key: '/admin/announcements',
      icon: <NotificationOutlined />,
      label: 'Bản tin tòa nhà',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        theme="dark"
        width={240}
        style={{
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
          zIndex: 10,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#002140',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: collapsed ? 16 : 18,
            letterSpacing: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          {collapsed ? 'BMS' : '🏢 BMS PORTAL'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            zIndex: 9,
          }}
        >
          <div>
            <Text strong style={{ fontSize: 16 }}>
              Hệ thống Quản lý Vận hành Chung cư
            </Text>
          </div>

          <Space size="middle">
            <Space>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
              <div style={{ lineHeight: 1.2 }}>
                <Text strong style={{ display: 'block' }}>
                  {user?.full_name || 'Admin'}
                </Text>
                <Tag color="geekblue" style={{ margin: 0 }}>
                  BAN QUẢN LÝ
                </Tag>
              </div>
            </Space>

            <Button
              icon={<KeyOutlined />}
              onClick={() => setChangePassOpen(true)}
              size="middle"
            >
              Đổi mật khẩu
            </Button>

            <Button
              icon={<LogoutOutlined />}
              danger
              onClick={handleLogout}
              size="middle"
            >
              Đăng xuất
            </Button>
          </Space>
        </Header>

        <Content
          style={{
            margin: '20px',
            padding: '24px',
            background: '#fff',
            borderRadius: '8px',
            minHeight: 280,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>

      <ChangePasswordModal
        open={changePassOpen}
        onCancel={() => setChangePassOpen(false)}
      />
    </Layout>
  );
};

export default AdminLayout;
