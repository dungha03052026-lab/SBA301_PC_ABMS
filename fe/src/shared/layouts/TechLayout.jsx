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
import { PS_COLORS, PS_ROUNDED } from '../theme/playstationTheme';

const { Header, Content, Footer } = Layout;

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
    <Layout style={{ minHeight: '100vh', backgroundColor: PS_COLORS.surfaceCard }}>
      {/* Header: Pure Black (#000000 canvas-dark) */}
      <Header
        style={{
          backgroundColor: PS_COLORS.canvasDark,
          height: 64,
          padding: '0 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${PS_COLORS.hairlineDark}`,
          boxShadow: 'none', // Level 0 flat
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Space size="large" align="center">
          <div
            style={{
              color: PS_COLORS.onDark,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
            onClick={() => navigate('/technician/task-pool')}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: PS_COLORS.primary,
              }}
            />
            <span
              className="ps-heading-md"
              style={{
                color: PS_COLORS.onDark,
                fontWeight: 300,
                letterSpacing: '1px',
              }}
            >
              BMS KỸ THUẬT
            </span>
          </div>

          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={navItems}
            onClick={handleMenuClick}
            style={{
              minWidth: 360,
              backgroundColor: 'transparent',
              border: 'none',
              fontWeight: 500,
            }}
          />
        </Space>

        <Space size="middle" align="center">
          <Space align="center" size="small">
            <Avatar
              icon={<UserOutlined />}
              style={{
                backgroundColor: PS_COLORS.primary,
                color: PS_COLORS.onPrimary,
              }}
            />
            <div style={{ lineHeight: 1.2 }}>
              <span
                style={{
                  display: 'block',
                  color: PS_COLORS.onDark,
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {user?.full_name || 'Kỹ thuật viên'}
              </span>
              <span
                className="ps-caption-sm"
                style={{
                  color: PS_COLORS.linkDark,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                BẢO TRÌ & SỬA CHỮA
              </span>
            </div>
          </Space>

          <Button
            icon={<KeyOutlined />}
            onClick={() => setChangePassOpen(true)}
            style={{
              backgroundColor: 'transparent',
              color: PS_COLORS.onDark,
              borderColor: PS_COLORS.hairlineDark,
              borderRadius: PS_ROUNDED.full,
              height: 36,
              padding: '0 18px',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Đổi mật khẩu
          </Button>

          <Button
            danger
            type="primary"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{
              borderRadius: PS_ROUNDED.full,
              height: 36,
              padding: '0 18px',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Đăng xuất
          </Button>
        </Space>
      </Header>

      {/* Content: Max width 1280px */}
      <Content
        style={{
          maxWidth: 1280,
          width: '100%',
          margin: '32px auto',
          padding: '0 24px',
          minHeight: 'calc(100vh - 192px)',
        }}
      >
        <div
          className="ps-product-card"
          style={{
            backgroundColor: PS_COLORS.canvasLight,
            border: `1px solid ${PS_COLORS.hairlineLight}`,
            borderRadius: PS_ROUNDED.md, // 8px
            padding: '36px',
            minHeight: 480,
            boxShadow: 'none',
          }}
        >
          <Outlet />
        </div>
      </Content>

      {/* Footer: PlayStation Blue band (#0070d1 footer-section) */}
      <Footer
        style={{
          backgroundColor: PS_COLORS.primary,
          color: PS_COLORS.onPrimary,
          padding: '32px',
          textAlign: 'center',
          fontSize: 14,
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <span style={{ fontWeight: 300, letterSpacing: '0.5px' }}>
            BMS KỸ THUẬT • Cổng Điều Phối & Xử Lý Sự Cố
          </span>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
            Thiết kế theo chuẩn PlayStation Design System
          </span>
        </div>
      </Footer>

      <ChangePasswordModal
        open={changePassOpen}
        onCancel={() => setChangePassOpen(false)}
      />
    </Layout>
  );
};

export default TechLayout;
