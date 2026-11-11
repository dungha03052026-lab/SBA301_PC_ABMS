/**
 * Khung giao diện Cư dân (Resident Layout) - Dành riêng cho Cư dân sinh sống tại tòa nhà.
 * 
 * Thành phần chính:
 * 1. Chuyển đổi căn hộ (Apartment Switcher - UC-03): Pill dropdown trên Header cho phép cư dân
 *    chọn căn hộ muốn xem nếu sở hữu nhiều căn (1-N).
 * 2. Top Navigation Bar: Hóa đơn của tôi, Báo hỏng sự cố, Bản tin tòa nhà (Segmented Pill Nav).
 * 3. User Controls: Menu tài khoản cư dân (Thông tin, Modal Đổi mật khẩu, và Đăng xuất).
 */
// src/shared/layouts/ResidentLayout.jsx
import { useMemo, useState } from 'react';
import { Layout, Dropdown } from 'antd';
import {
  DollarOutlined,
  ToolOutlined,
  NotificationOutlined,
  HomeOutlined,
  DownOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApartment } from '../context/ApartmentContext';
import ChangePasswordModal from '../components/ChangePasswordModal';
import PortalHeader from '../components/PortalHeader';
import { PS_COLORS } from '../theme/playstationTheme';

const { Content } = Layout;

const ResidentLayout = () => {
  const { user, logout } = useAuth();
  const { apartments, selectedApartmentId, selectedApartment, switchApartment } = useApartment();
  const navigate = useNavigate();
  const [changePassOpen, setChangePassOpen] = useState(false);

  const navItems = useMemo(
    () => [
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
    ],
    []
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Menu dropdown chọn căn hộ (UC-03)
  const apartmentMenuItems = useMemo(
    () =>
      apartments.map((apt) => {
        const isSelected = apt.id === selectedApartmentId;
        const metaParts = [];
        if (apt.floor !== undefined && apt.floor !== null) metaParts.push(`Tầng ${apt.floor}`);
        if (apt.area_sqm) metaParts.push(`${apt.area_sqm} m²`);

        return {
          key: String(apt.id),
          label: (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                minWidth: 190,
                padding: '2px 0',
              }}
            >
              <div>
                <div style={{ fontWeight: isSelected ? 600 : 500, fontSize: 13, color: PS_COLORS.ink }}>
                  {apt.room_number} ({apt.building_block})
                </div>
                {metaParts.length > 0 && (
                  <div style={{ fontSize: 11, color: PS_COLORS.muteLight }}>
                    {metaParts.join(' · ')}
                  </div>
                )}
              </div>
              {isSelected && <CheckOutlined style={{ color: PS_COLORS.primary, fontSize: 12 }} />}
            </div>
          ),
          onClick: () => switchApartment(apt.id),
        };
      }),
    [apartments, selectedApartmentId, switchApartment]
  );

  const activeApt = selectedApartment || apartments[0] || null;

  // UC-03: Context Switch Apartment Pill
  const apartmentSwitcher = (
    <>
      <span className="portal-divider" aria-hidden="true" />
      {apartments.length > 1 ? (
        <Dropdown
          menu={{
            items: apartmentMenuItems,
            selectedKeys: selectedApartmentId ? [String(selectedApartmentId)] : [],
          }}
          trigger={['click']}
          placement="bottomLeft"
        >
          <button
            type="button"
            className="portal-apt-pill portal-apt-pill--interactive"
            aria-label="Chuyển đổi căn hộ"
          >
            <HomeOutlined style={{ color: PS_COLORS.primary, fontSize: 14 }} />
            <span className="portal-apt-prefix">Căn hộ:</span>
            <span className="portal-apt-value">
              {activeApt
                ? `${activeApt.room_number} (${activeApt.building_block})`
                : 'Chọn căn hộ'}
            </span>
            <DownOutlined style={{ color: '#6b7280', fontSize: 10 }} />
          </button>
        </Dropdown>
      ) : apartments.length === 1 && activeApt ? (
        <div className="portal-apt-pill" title="Căn hộ hiện tại">
          <HomeOutlined style={{ color: PS_COLORS.primary, fontSize: 14 }} />
          <span className="portal-apt-prefix">Căn hộ:</span>
          <span className="portal-apt-value">
            {activeApt.room_number} ({activeApt.building_block})
          </span>
        </div>
      ) : (
        <div className="portal-apt-pill">
          <HomeOutlined style={{ color: '#9ca3af', fontSize: 14 }} />
          <span className="portal-apt-empty">Chưa gán căn hộ</span>
        </div>
      )}
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: PS_COLORS.surfaceCard }}>
      <PortalHeader
        brandTitle="BMS"
        brandBadge="CƯ DÂN"
        brandAriaLabel="Trang chủ BMS Cư dân"
        homePath="/resident/invoices"
        leftExtra={apartmentSwitcher}
        navItems={navItems}
        navAriaLabel="Điều hướng cư dân"
        user={user}
        userRoleLabel="Chủ hộ"
        defaultUserName="Cư dân"
        onOpenChangePassword={() => setChangePassOpen(true)}
        onLogout={handleLogout}
      />

      {/* Content: Max width 1280px (PlayStation standard content area) */}
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

export default ResidentLayout;
