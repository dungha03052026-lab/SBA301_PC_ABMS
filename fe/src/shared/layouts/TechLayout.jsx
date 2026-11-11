/**
 * Khung giao diện Kỹ thuật viên (Technician Layout) - Dành riêng cho Đội ngũ bảo trì tòa nhà.
 * 
 * Thành phần chính:
 * 1. Top Navigation Bar: Chợ việc chung (Task Pool) & Việc của tôi (Đang sửa chữa).
 * 2. User Controls: Menu tài khoản kỹ thuật viên (Đổi mật khẩu tài khoản, và Đăng xuất).
 */
// src/shared/layouts/TechLayout.jsx
import { useMemo, useState } from 'react';
import { Layout } from 'antd';
import { ShopOutlined, ToolOutlined } from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChangePasswordModal from '../components/ChangePasswordModal';
import PortalHeader from '../components/PortalHeader';
import { PS_COLORS } from '../theme/playstationTheme';

const { Content } = Layout;

const TechLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [changePassOpen, setChangePassOpen] = useState(false);

  const navItems = useMemo(
    () => [
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
    ],
    []
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: PS_COLORS.surfaceCard }}>
      <PortalHeader
        brandTitle="BMS"
        brandBadge="KỸ THUẬT"
        brandAriaLabel="Trang chủ BMS Kỹ thuật"
        homePath="/technician/task-pool"
        navItems={navItems}
        navAriaLabel="Điều hướng kỹ thuật viên"
        user={user}
        userRoleLabel="Bảo trì & Sửa chữa"
        defaultUserName="Kỹ thuật viên"
        onOpenChangePassword={() => setChangePassOpen(true)}
        onLogout={handleLogout}
      />

      {/* Content: Max width 1280px */}
      <Content
        style={{
          maxWidth: 1280,
          width: '100%',
          margin: '32px auto',
          padding: '0 24px',
          minHeight: 'calc(100vh - 128px)',
        }}
      >
        <Outlet />
      </Content>

      <ChangePasswordModal
        open={changePassOpen}
        onCancel={() => setChangePassOpen(false)}
      />
    </Layout>
  );
};

export default TechLayout;
