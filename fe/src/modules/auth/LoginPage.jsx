// src/modules/auth/LoginPage.jsx
import React, { useState } from 'react';
import { Card, Form, Input, Button, Space, Typography, message, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';

const { Title, Text } = Typography;

const LoginPage = () => {
  const { mockLogin, login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigateByRole = (role) => {
    if (role === 'ADMIN') navigate('/admin/apartments');
    else if (role === 'RESIDENT') navigate('/resident/invoices');
    else if (role === 'TECHNICIAN') navigate('/technician/task-pool');
  };

  const handleRoleSelect = (role) => {
    const loggedUser = mockLogin(role);
    message.success(`Đăng nhập thành công với vai trò: ${role}`);
    navigateByRole(loggedUser.role);
  };

  const handleFinish = async (values) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await login(values.username, values.password);
      if (res.success) {
        message.success(`Xin chào, ${res.user.full_name}!`);
        navigateByRole(res.user.role);
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Đã xảy ra lỗi trong quá trình đăng nhập.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f0f2f5',
        padding: 16,
      }}
    >
      <Card style={{ width: 420, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ marginBottom: 4 }}>
            🏢 BMS Portal
          </Title>
          <Text type="secondary">Hệ thống Quản lý Vận hành Chung cư</Text>
        </div>

        {errorMessage && (
          <Alert
            message={errorMessage}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form layout="vertical" onFinish={handleFinish}>
          <Form.Item
            label="Số điện thoại / Email"
            name="username"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại hoặc email!' },
            ]}
          >
            <Input placeholder="VD: 0901000001 hoặc admin@building.vn" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password placeholder="Nhập mật khẩu (Mặc định: password123)" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            style={{ marginBottom: 16 }}
          >
            Đăng nhập
          </Button>
        </Form>

        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, textAlign: 'center' }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 10, fontSize: 13 }}>
            Chế độ Test nhanh theo vai trò:
          </Text>
          <Space wrap justify="center">
            <Button size="small" type="dashed" onClick={() => handleRoleSelect('ADMIN')}>
              🔑 Admin
            </Button>
            <Button size="small" type="dashed" onClick={() => handleRoleSelect('RESIDENT')}>
              🏠 Cư dân (2 căn)
            </Button>
            <Button size="small" type="dashed" onClick={() => handleRoleSelect('TECHNICIAN')}>
              🔧 Kỹ thuật
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
