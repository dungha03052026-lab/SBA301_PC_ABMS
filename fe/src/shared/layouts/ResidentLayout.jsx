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

const { Header, Content } = Layout;
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
    <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <Header
        style={{
          background: '#001529',
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
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 18,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
            onClick={() => navigate('/resident/invoices')}
          >
            🏢 <span>BMS CƯ DÂN</span>
          </div>

          {/* UC-03: Context Switch Apartment Dropdown */}
          <div
            style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '4px 12px',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <HomeOutlined style={{ color: '#1890ff' }} />
            <Text style={{ color: '#rgba(255,255,255,0.85)', color: '#e6f7ff', fontSize: 13 }}>
              Căn hộ:
            </Text>

            {apartments.length > 1 ? (
              <Select
                value={selectedApartmentId}
                onChange={switchApartment}
                style={{ width: 170 }}
                size="small"
                options={apartments.map((apt) => ({
                  value: apt.id,
                  label: `${apt.room_number} (${apt.building_block})`,
                }))}
              />
            ) : apartments.length === 1 ? (
              <Tag color="cyan" style={{ margin: 0, fontWeight: 'bold' }}>
                {apartments[0].room_number} ({apartments[0].building_block})
              </Tag>
            ) : (
              <Tag color="warning" style={{ margin: 0 }}>
                Chưa gán căn hộ
              </Tag>
            )}
          </div>

          {/* Menu Điều hướng */}
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={navItems}
            onClick={handleMenuClick}
            style={{ minWidth: 380, background: 'transparent' }}
          />
        </Space>

        {/* Thông tin Cư dân & Thao tác */}
        <Space size="middle">
          <Space>
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#52c41a' }} />
            <div style={{ lineHeight: 1.2 }}>
              <Text style={{ color: '#fff', display: 'block', fontWeight: 500 }}>
                {user?.full_name || 'Cư dân'}
              </Text>
              <Tag color="green" style={{ margin: 0, fontSize: 11 }}>
                CHỦ HỘ
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

export default ResidentLayout;
