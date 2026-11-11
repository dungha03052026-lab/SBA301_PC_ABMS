/**
 * Khung giao diện Quản trị viên (Admin Layout) - Dành riêng cho Ban Quản Lý tòa nhà.
 * 
 * Thành phần chính:
 * 1. Sidebar điều hướng: Căn hộ & Cư dân, Chốt số & Hóa đơn, Đối soát gạch nợ, Giám sát sự cố, Bản tin tòa nhà.
 * 2. Header: Hiển thị thông tin quản trị viên, nút Đổi mật khẩu và Đăng xuất.
 * 3. Content: Outlet động nạp các module tương ứng.
 * 4. Áp dụng chuẩn thiết kế PlayStation Theme (Pure Black Sider, PS Blue Active highlights, bo góc mềm).
 */
// src/shared/layouts/AdminLayout.jsx
import { useState } from 'react';
import { Layout, Menu, Button, Space, Avatar } from 'antd';
import {
  AppstoreOutlined,
  ThunderboltOutlined,
  DollarOutlined,
  ToolOutlined,
  NotificationOutlined,
  LogoutOutlined,
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { PS_COLORS, PS_ROUNDED } from '../theme/playstationTheme';

const { Header, Sider, Content } = Layout;


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
      {/* Sider: PlayStation Light Utility Mode (#ffffff) with Hairline Light border */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        theme="light"
        width={250}
        className="ps-sider-light"
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: PS_COLORS.canvasLight,
            borderBottom: `1px solid ${PS_COLORS.hairlineLight}`,
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
                  color: PS_COLORS.ink,
                  fontWeight: 600,
                  letterSpacing: '1px',
                  fontSize: 16,
                }}
              >
                BMS ADMIN
              </span>
            )}
          </div>
        </div>

        <div style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
            }}
          />
        </div>

        {/* Khu vực tiện ích tài khoản & bảo mật (Sidebar Bottom) */}
        <div
          style={{
            padding: collapsed ? '12px 8px' : '12px 12px',
            borderTop: `1px solid ${PS_COLORS.hairlineLight}`,
            backgroundColor: PS_COLORS.canvasLight,
          }}
        >
          {!collapsed && (
            <div
              style={{
                padding: '4px 16px 8px',
                fontSize: 11,
                fontWeight: 700,
                color: PS_COLORS.muteLight,
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
              }}
            >
              Hệ thống
            </div>
          )}
          <Menu
            theme="light"
            mode="inline"
            selectable={false}
            selectedKeys={[]}
            items={[
              {
                key: 'change-password',
                icon: <LockOutlined />,
                label: 'Đổi mật khẩu',
                onClick: () => setChangePassOpen(true),
              },
            ]}
            style={{
              backgroundColor: 'transparent',
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

        {/* Content: Surface Card Canvas (#f5f7fa), max 1400px container */}
        <Content
          style={{
            padding: '28px 32px',
            minHeight: 'calc(100vh - 64px)',
            maxWidth: 1400,
            width: '100%',
            margin: '0 auto',
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
