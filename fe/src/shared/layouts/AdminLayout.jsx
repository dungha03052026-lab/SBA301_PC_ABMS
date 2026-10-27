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
import { PS_COLORS, PS_ROUNDED } from '../theme/playstationTheme';

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

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
    <Layout style={{ minHeight: '100vh', backgroundColor: PS_COLORS.surfaceCard }}>
      {/* Sider: PlayStation Canvas Dark (#000000) with Hairline Dark border */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        theme="dark"
        width={250}
        style={{
          backgroundColor: PS_COLORS.canvasDark,
          borderRight: `1px solid ${PS_COLORS.hairlineDark}`,
          boxShadow: 'none', // Level 0 Flat
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: PS_COLORS.canvasDark,
            borderBottom: `1px solid ${PS_COLORS.hairlineDark}`,
            padding: '0 16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* PlayStation Blue Brand Indicator */}
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: PS_COLORS.primary,
              }}
            />
            {!collapsed && (
              <span
                className="ps-heading-md"
                style={{
                  color: PS_COLORS.onDark,
                  fontWeight: 300,
                  letterSpacing: '1px',
                }}
              >
                BMS PORTAL
              </span>
            )}
          </div>
        </div>

        <div style={{ padding: '16px 8px' }}>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{
              backgroundColor: PS_COLORS.canvasDark,
              border: 'none',
            }}
          />
        </div>
      </Sider>

      <Layout style={{ backgroundColor: PS_COLORS.surfaceCard }}>
        {/* Header: Pure White (#ffffff), Level 0 Flat with Hairline Light border */}
        <Header
          style={{
            backgroundColor: PS_COLORS.canvasLight,
            padding: '0 32px',
            height: 64,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${PS_COLORS.hairlineLight}`,
            boxShadow: 'none', // Strictly no resting drop shadow
            zIndex: 9,
          }}
        >
          <div>
            <h2
              className="ps-heading-lg"
              style={{
                color: PS_COLORS.ink,
                margin: 0,
                fontWeight: 300, // Signature PlayStation weight 300
              }}
            >
              Hệ thống Quản lý Vận hành Chung cư
            </h2>
          </div>

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
                    fontSize: 14,
                    fontWeight: 500,
                    color: PS_COLORS.ink,
                  }}
                >
                  {user?.full_name || 'Admin'}
                </span>
                <span
                  className="ps-caption-sm"
                  style={{
                    display: 'inline-block',
                    backgroundColor: PS_COLORS.primary,
                    color: PS_COLORS.onPrimary,
                    padding: '2px 8px',
                    borderRadius: PS_ROUNDED.full,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.3px',
                  }}
                >
                  BAN QUẢN LÝ
                </span>
              </div>
            </Space>

            {/* Button Secondary Light: Outline Pill */}
            <Button
              icon={<KeyOutlined />}
              onClick={() => setChangePassOpen(true)}
              style={{
                borderRadius: PS_ROUNDED.full,
                height: 38,
                padding: '0 20px',
                borderColor: PS_COLORS.ashLight,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Đổi mật khẩu
            </Button>

            {/* Button Warning: Destructive Action Pill */}
            <Button
              icon={<LogoutOutlined />}
              danger
              onClick={handleLogout}
              style={{
                borderRadius: PS_ROUNDED.full,
                height: 38,
                padding: '0 20px',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Đăng xuất
            </Button>
          </Space>
        </Header>

        {/* Content: Surface Card Canvas (#f5f7fa), max 1280px or full container */}
        <Content
          style={{
            margin: '24px 32px',
            minHeight: 'calc(100vh - 180px)',
          }}
        >
          <div
            className="ps-product-card"
            style={{
              backgroundColor: PS_COLORS.canvasLight,
              border: `1px solid ${PS_COLORS.hairlineLight}`,
              borderRadius: PS_ROUNDED.md, // 8px
              padding: '32px',
              minHeight: 400,
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
            padding: '24px 32px',
            textAlign: 'center',
            fontSize: 14,
          }}
        >
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <span style={{ fontWeight: 300, letterSpacing: '0.5px' }}>
              BMS • Apartment Building Management System
            </span>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
              Thiết kế theo chuẩn PlayStation Design System (Flat Level 0 • Pill CTAs • 8px Radius)
            </span>
          </div>
        </Footer>
      </Layout>

      <ChangePasswordModal
        open={changePassOpen}
        onCancel={() => setChangePassOpen(false)}
      />
    </Layout>
  );
};

export default AdminLayout;
