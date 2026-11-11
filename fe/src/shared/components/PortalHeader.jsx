/**
 * Thanh điều hướng Header dùng chung cho các cổng người dùng (Cư dân & Kỹ thuật viên).
 *
 * Cấu trúc 3 vùng cân đối theo lưới 1280px:
 * 1. Trái: Thương hiệu BMS + badge vai trò + slot phụ (ví dụ Apartment Switcher của Cư dân).
 * 2. Giữa: Thanh điều hướng dạng Segmented Pill (luôn hiển thị đủ tab, không bị gập `...`).
 * 3. Phải: User Profile Dropdown (Đổi mật khẩu, Đăng xuất) + Drawer responsive cho màn hình nhỏ.
 */
import { useState } from 'react';
import { Layout, Avatar, Dropdown, Drawer, Button } from 'antd';
import {
  LogoutOutlined,
  LockOutlined,
  UserOutlined,
  DownOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { PS_COLORS, PS_ROUNDED } from '../theme/playstationTheme';
import './PortalHeader.css';

const { Header } = Layout;

const getUserInitials = (fullName) => {
  if (!fullName || typeof fullName !== 'string') return null;
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

const PortalHeader = ({
  brandTitle = 'BMS',
  brandBadge,
  brandAriaLabel,
  homePath,
  leftExtra = null,
  navItems = [],
  navAriaLabel = 'Điều hướng chính',
  user,
  userRoleLabel,
  defaultUserName = 'Người dùng',
  onOpenChangePassword,
  onLogout,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const initials = getUserInitials(user?.full_name);
  const displayName = user?.full_name || defaultUserName;

  const handleNavigate = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogoutClick = () => {
    setMobileMenuOpen(false);
    onLogout?.();
  };

  const isNavActive = (key) =>
    location.pathname === key || location.pathname.startsWith(`${key}/`);

  const userMenuItems = [
    {
      key: 'user-info',
      disabled: true,
      label: (
        <div style={{ padding: '2px 0', cursor: 'default', minWidth: 190 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: PS_COLORS.ink }}>
            {displayName}
          </div>
          <div style={{ fontSize: 12, color: PS_COLORS.muteLight }}>
            {user?.phone_number || user?.email || userRoleLabel}
          </div>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'change-password',
      icon: <LockOutlined />,
      label: 'Đổi mật khẩu',
      onClick: () => onOpenChangePassword?.(),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: handleLogoutClick,
    },
  ];

  return (
    <>
      <Header className="portal-header">
        <div className="portal-header-inner">
          <div className="portal-header-left">
            <button
              type="button"
              className="portal-brand"
              onClick={() => handleNavigate(homePath)}
              aria-label={brandAriaLabel || `${brandTitle} ${brandBadge || ''}`.trim()}
            >
              <span className="portal-brand-dot" aria-hidden="true" />
              <span className="portal-brand-title">{brandTitle}</span>
              {brandBadge && <span className="portal-brand-subtitle">{brandBadge}</span>}
            </button>

            {leftExtra}
          </div>

          <nav className="portal-nav" aria-label={navAriaLabel}>
            {navItems.map((item) => {
              const active = isNavActive(item.key);
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleNavigate(item.key)}
                  className={`portal-nav-item${active ? ' is-active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="portal-header-right">
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
              <button
                type="button"
                className="portal-user-pill"
                aria-label="Menu tài khoản"
              >
                <Avatar
                  size={30}
                  icon={!initials ? <UserOutlined /> : undefined}
                  style={{
                    backgroundColor: PS_COLORS.primary,
                    color: PS_COLORS.onPrimary,
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {initials}
                </Avatar>
                <div className="portal-user-meta">
                  <span className="portal-user-name">{displayName}</span>
                  {userRoleLabel && <span className="portal-user-role">{userRoleLabel}</span>}
                </div>
                <DownOutlined style={{ color: '#6b7280', fontSize: 10 }} />
              </button>
            </Dropdown>

            <button
              type="button"
              className="portal-mobile-menu-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Mở menu điều hướng"
            >
              <MenuOutlined />
            </button>
          </div>
        </div>
      </Header>

      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar
              size={34}
              icon={!initials ? <UserOutlined /> : undefined}
              style={{
                backgroundColor: PS_COLORS.primary,
                color: PS_COLORS.onPrimary,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {initials}
            </Avatar>
            <div style={{ lineHeight: 1.25 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: PS_COLORS.ink }}>
                {displayName}
              </div>
              {userRoleLabel && (
                <div style={{ fontSize: 12, color: PS_COLORS.primary, fontWeight: 500 }}>
                  {userRoleLabel}
                </div>
              )}
            </div>
          </div>
        }
        placement="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        width={290}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {navItems.map((item) => {
            const active = isNavActive(item.key);
            return (
              <Button
                key={item.key}
                type={active ? 'primary' : 'text'}
                icon={item.icon}
                onClick={() => handleNavigate(item.key)}
                style={{
                  justifyContent: 'flex-start',
                  height: 44,
                  borderRadius: PS_ROUNDED.full,
                  fontWeight: active ? 600 : 500,
                  paddingInline: 18,
                }}
              >
                {item.label}
              </Button>
            );
          })}

          <div
            style={{
              height: 1,
              backgroundColor: PS_COLORS.hairlineLight,
              margin: '12px 0',
            }}
          />

          <Button
            icon={<LockOutlined />}
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenChangePassword?.();
            }}
            style={{
              justifyContent: 'flex-start',
              height: 42,
              borderRadius: PS_ROUNDED.full,
              paddingInline: 18,
            }}
          >
            Đổi mật khẩu
          </Button>

          <Button
            danger
            type="primary"
            icon={<LogoutOutlined />}
            onClick={handleLogoutClick}
            style={{
              justifyContent: 'flex-start',
              height: 42,
              borderRadius: PS_ROUNDED.full,
              paddingInline: 18,
            }}
          >
            Đăng xuất
          </Button>
        </div>
      </Drawer>
    </>
  );
};

export default PortalHeader;
