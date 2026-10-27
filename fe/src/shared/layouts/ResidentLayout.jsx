// src/shared/layouts/ResidentLayout.jsx
import React, { useState } from 'react';
import { Layout, Menu, Button, Space, Typography, Tag, Avatar, Select } from 'antd';
import {
  DollarOutlined,
  ToolOutlined,
  NotificationOutlined,
  LogoutOutlined,
  KeyOutlined,
  UserOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApartment } from '../context/ApartmentContext';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { PS_COLORS, PS_ROUNDED } from '../theme/playstationTheme';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

const ResidentLayout = () => {
  const { user, logout } = useAuth();
  const { apartments, selectedApartmentId, switchApartment } = useApartment();
  const navigate = useNavigate();
  const location = useLocation();
  const [changePassOpen, setChangePassOpen] = useState(false);

  const navItems = [
    {
      key: '/resident/invoices',
      icon: <DollarOutlined />,
      label: 'Hóa đơn của tôi',
    },
    {
      key: '/resident/tickets',
      icon: <ToolOutlined />,
      label: 'Báo hỏng sự cố',
    },
    {
      key: '/resident/announcements',
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
      {/* Primary Nav: Pure Black (#000000 canvas-dark) with Hairline Dark border */}
      <Header
        style={{
          backgroundColor: PS_COLORS.canvasDark,
          height: 64,
          padding: '0 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${PS_COLORS.hairlineDark}`,
          boxShadow: 'none', // Strictly no resting drop shadow
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
            onClick={() => navigate('/resident/invoices')}
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
              BMS CƯ DÂN
            </span>
          </div>

          {/* UC-03: Context Switch Apartment Pill */}
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: '4px 14px',
              borderRadius: PS_ROUNDED.full,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              border: `1px solid ${PS_COLORS.hairlineDark}`,
            }}
          >
            <HomeOutlined style={{ color: PS_COLORS.linkDark }} />
            <span style={{ color: PS_COLORS.onDark, fontSize: 13, fontWeight: 400 }}>
              Căn hộ:
            </span>

            {apartments.length > 1 ? (
              <Select
                value={selectedApartmentId}
                onChange={switchApartment}
                style={{ width: 160 }}
                size="small"
                variant="borderless"
                popupMatchSelectWidth={false}
                options={apartments.map((apt) => ({
                  value: apt.id,
                  label: `${apt.room_number} (${apt.building_block})`,
                }))}
              />
            ) : apartments.length === 1 ? (
              <span
                style={{
                  backgroundColor: PS_COLORS.primary,
                  color: PS_COLORS.onPrimary,
                  padding: '2px 10px',
                  borderRadius: PS_ROUNDED.full,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {apartments[0].room_number} ({apartments[0].building_block})
              </span>
            ) : (
              <span style={{ color: PS_COLORS.muteDark, fontSize: 12 }}>
                Chưa gán căn hộ
              </span>
            )}
          </div>

          {/* Navigation Menu: Dark theme with pill selection */}
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={navItems}
            onClick={handleMenuClick}
            style={{
              minWidth: 380,
              backgroundColor: 'transparent',
              border: 'none',
              fontWeight: 500,
            }}
          />
        </Space>

        {/* User cluster & Action pills */}
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
                {user?.full_name || 'Cư dân'}
              </span>
              <span
                className="ps-caption-sm"
                style={{
                  color: PS_COLORS.linkDark,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                CHỦ HỘ
              </span>
            </div>
          </Space>

          {/* Button Secondary Dark: Outline Pill */}
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

          {/* Button Warning: Destructive Action Pill */}
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

      {/* Content: Max width 1280px (PlayStation standard content area) */}
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
            boxShadow: 'none', // Strictly no resting drop shadow
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
            BMS CƯ DÂN • Cổng Dịch Vụ Căn Hộ Trực Tuyến
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

export default ResidentLayout;
