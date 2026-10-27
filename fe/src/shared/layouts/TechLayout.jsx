// src/shared/layouts/TechLayout.jsx
import React, { useState } from 'react';
import { Layout, Menu, Button, Space, Typography, Tag, Avatar } from 'antd';
import {
  ShopOutlined,
  ToolOutlined,
  LogoutOutlined,
  KeyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChangePasswordModal from '../components/ChangePasswordModal';

const { Header, Content } = Layout;
const { Text } = Typography;

const TechLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [changePassOpen, setChangePassOpen] = useState(false);

  const navItems = [
    {
      key: '/technician/task-pool',
      icon: <ShopOutlined />,
      label: 'Chợ việc chung (Task Pool)',
    },
    {
      key: '/technician/my-tasks',
      icon: <ToolOutlined />,
      label: 'Việc của tôi (Đang sửa)',
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
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header
        style={{
          background: '#141414',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Space size="large" align="center">
          <div
            style={{
              color: '#faad14',
              fontWeight: 'bold',
              fontSize: 18,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
            onClick={() => navigate('/technician/task-pool')}
          >
            🔧 <span>BMS KỸ THUẬT</span>
          </div>

          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={navItems}
            onClick={handleMenuClick}
            style={{ minWidth: 360, background: 'transparent' }}
          />
        </Space>

        <Space size="middle">
          <Space>
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#faad14' }} />
            <div style={{ lineHeight: 1.2 }}>
              <Text style={{ color: '#fff', display: 'block', fontWeight: 500 }}>
                {user?.full_name || 'Kỹ thuật viên'}
              </Text>
              <Tag color="gold" style={{ margin: 0, fontSize: 11 }}>
                THỢ BẢO TRÌ
              </Tag>
            </div>
          </Space>

          <Button
            ghost
            icon={<KeyOutlined />}
            onClick={() => setChangePassOpen(true)}
            size="small"
          >
            Đổi mật khẩu
          </Button>

          <Button
            danger
            type="primary"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            size="small"
          >
            Đăng xuất
          </Button>
        </Space>
      </Header>

      <Content
        style={{
          maxWidth: 1200,
          width: '100%',
          margin: '24px auto',
          padding: '0 16px',
        }}
      >
        <div
          style={{
            background: '#fff',
            padding: '24px',
            borderRadius: '8px',
            minHeight: 'calc(100vh - 120px)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          <Outlet />
        </div>
      </Content>

      <ChangePasswordModal
        open={changePassOpen}
        onCancel={() => setChangePassOpen(false)}
      />
    </Layout>
  );
};

export default TechLayout;
