import React from 'react';
import { Card, Form, Input, Button, Space, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';

const { Title, Text } = Typography;

const LoginPage = () => {
  const { mockLogin } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    const loggedUser = mockLogin(role);
    message.success(`Đăng nhập thành công vai trò: ${role}`);

    if (role === 'ADMIN') navigate('/admin/apartments');
    else if (role === 'RESIDENT') navigate('/resident/invoices');
    else if (role === 'TECHNICIAN') navigate('/technician/task-pool');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ marginBottom: 4 }}>BMS Portal</Title>
          <Text type="secondary">Quản lý Vận hành Chung cư</Text>
        </div>

        <Form layout="vertical">
          <Form.Item label="Số điện thoại / Email" name="username">
            <Input placeholder="Nhập số điện thoại hoặc email" />
          </Form.Item>

          <Form.Item label="Mật khẩu" name="password">
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Button type="primary" block style={{ marginBottom: 16 }}>
            Đăng nhập
          </Button>
        </Form>

        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, textAlign: 'center' }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Test nhanh theo vai trò:</Text>
          <Space>
            <Button onClick={() => handleRoleSelect('ADMIN')}>Admin</Button>
            <Button onClick={() => handleRoleSelect('RESIDENT')}>Cư dân</Button>
            <Button onClick={() => handleRoleSelect('TECHNICIAN')}>Kỹ thuật</Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;