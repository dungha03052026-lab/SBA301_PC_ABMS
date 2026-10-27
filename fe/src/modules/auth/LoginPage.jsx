// src/modules/auth/LoginPage.jsx
import React, { useState } from 'react';
import { Form, Input, Button, message, Alert } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  ToolOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { PS_COLORS, PS_ROUNDED } from '../../shared/theme/playstationTheme';

const LoginPage = () => {
  const { mockLogin, login } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigateByRole = (role) => {
    if (role === 'ADMIN') navigate('/admin/apartments');
    else if (role === 'RESIDENT') navigate('/resident/invoices');
    else if (role === 'TECHNICIAN') navigate('/technician/task-pool');
  };

  // Click test nhanh: tự động điền form và đăng nhập ngay
  const handleQuickRole = (role) => {
    const roleCredentials = {
      ADMIN: { username: '0901000001', pass: 'password123' },
      RESIDENT: { username: '0903000001', pass: 'password123' },
      TECHNICIAN: { username: '0902000001', pass: 'password123' },
    };

    const cred = roleCredentials[role];
    if (cred) {
      form.setFieldsValue({
        username: cred.username,
        password: cred.pass,
      });
    }

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
      setErrorMessage('Đã xảy ra lỗi trong quá trình xác thực.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: PS_COLORS.surfaceCard, // PlayStation Light Canvas Mode (#f5f7fa cool-blue-tinted)
        color: PS_COLORS.ink,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
      }}
    >
      {/* 1. Header Bar: PlayStation Blue top brand line + White Canvas Header */}
      <div>
        <div
          style={{
            height: 4,
            backgroundColor: PS_COLORS.primary,
            width: '100%',
          }}
        />
        <header
          style={{
            backgroundColor: PS_COLORS.canvasLight,
            borderBottom: `1px solid ${PS_COLORS.hairlineLight}`,
          }}
        >
          <div
            style={{
              maxWidth: 1280,
              margin: '0 auto',
              padding: '18px 32px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: PS_COLORS.primary,
                }}
              />
              <span
                className="ps-heading-md"
                style={{
                  color: PS_COLORS.ink,
                  fontWeight: 300, // Signature PlayStation weight 300
                  letterSpacing: '1.5px',
                }}
              >
                BMS PORTAL
              </span>
            </div>

            <span
              className="ps-caption-sm"
              style={{
                backgroundColor: 'rgba(0, 112, 209, 0.08)',
                color: PS_COLORS.primary,
                padding: '4px 12px',
                borderRadius: PS_ROUNDED.full,
                fontWeight: 600,
                letterSpacing: '0.5px',
              }}
            >
              PLAYSTATION LIGHT CANVAS
            </span>
          </div>
        </header>
      </div>

      {/* 2. Main Chapter: 2-Column Editorial Layout on Light Canvas (#f5f7fa) */}
      <main
        style={{
          maxWidth: 1280,
          width: '100%',
          margin: '0 auto',
          padding: '48px 32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 56,
          alignItems: 'center',
        }}
      >
        {/* Left Column: Editorial Showcase (PlayStation signature light 300 typography) */}
        <div>
          {/* Badge Tag: PlayStation Blue pill */}
          <span
            className="ps-caption-sm"
            style={{
              backgroundColor: PS_COLORS.primary,
              color: PS_COLORS.onPrimary,
              padding: '6px 14px',
              borderRadius: PS_ROUNDED.full,
              fontWeight: 700,
              letterSpacing: '0.8px',
              display: 'inline-block',
              marginBottom: 20,
            }}
          >
            HỆ THỐNG QUẢN LÝ VẬN HÀNH CHUNG CƯ
          </span>

          {/* Headline: Weight 300 (light!) */}
          <h1
            className="ps-display-lg"
            style={{
              color: PS_COLORS.ink,
              fontWeight: 300,
              lineHeight: 1.2,
              letterSpacing: '0.1px',
              marginBottom: 16,
            }}
          >
            Không gian sống thông minh, vận hành chuẩn mực.
          </h1>

          <p
            className="ps-body-md"
            style={{
              color: PS_COLORS.bodyLight,
              fontWeight: 400,
              lineHeight: 1.6,
              marginBottom: 36,
              maxWidth: 520,
            }}
          >
            Giải pháp số hóa toàn diện quy trình Move-in/Move-out, chốt số điện nước,
            thanh toán VietQR động và chợ việc bảo trì kỹ thuật cho tòa nhà.
          </p>

          {/* 3 Pillar Features Cards: Light Canvas (#ffffff), 8px radius, Flat Level 0 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 500 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '14px 20px',
                backgroundColor: PS_COLORS.canvasLight,
                borderRadius: PS_ROUNDED.md,
                border: `1px solid ${PS_COLORS.hairlineLight}`,
              }}
            >
              <SafetyCertificateOutlined style={{ fontSize: 22, color: PS_COLORS.primary }} />
              <div>
                <span style={{ display: 'block', color: PS_COLORS.ink, fontSize: 15, fontWeight: 600 }}>
                  Ban Quản Lý Tòa Nhà
                </span>
                <span style={{ color: PS_COLORS.muteLight, fontSize: 13 }}>
                  Quản lý mặt bằng, công nợ Move-out, chốt số và đối soát sao kê.
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '14px 20px',
                backgroundColor: PS_COLORS.canvasLight,
                borderRadius: PS_ROUNDED.md,
                border: `1px solid ${PS_COLORS.hairlineLight}`,
              }}
            >
              <HomeOutlined style={{ fontSize: 22, color: PS_COLORS.linkLight }} />
              <div>
                <span style={{ display: 'block', color: PS_COLORS.ink, fontSize: 15, fontWeight: 600 }}>
                  Cư Dân / Chủ Hộ Đại Diện
                </span>
                <span style={{ color: PS_COLORS.muteLight, fontSize: 13 }}>
                  Chuyển đổi ngữ cảnh căn hộ, quét VietQR động và nghiệm thu sửa chữa.
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '14px 20px',
                backgroundColor: PS_COLORS.canvasLight,
                borderRadius: PS_ROUNDED.md,
                border: `1px solid ${PS_COLORS.hairlineLight}`,
              }}
            >
              <ToolOutlined style={{ fontSize: 22, color: PS_COLORS.psPlusGoldEnd }} />
              <div>
                <span style={{ display: 'block', color: PS_COLORS.ink, fontSize: 15, fontWeight: 600 }}>
                  Đội Ngũ Kỹ Thuật Viên
                </span>
                <span style={{ color: PS_COLORS.muteLight, fontSize: 13 }}>
                  Chợ việc Task Pool chung, nhận việc khóa nguyên tử chống tranh chấp.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Form Card (Light Surface #ffffff, 8px radius, Flat Level 0) */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              width: '100%',
              maxWidth: 460,
              backgroundColor: PS_COLORS.canvasLight,
              borderRadius: PS_ROUNDED.md, // 8px
              border: `1px solid ${PS_COLORS.hairlineLight}`,
              padding: '40px 36px',
              boxShadow: 'none', // Strictly Level 0 Flat, no resting shadow
            }}
          >
            <div style={{ marginBottom: 28 }}>
              <h2
                className="ps-heading-xl"
                style={{
                  color: PS_COLORS.ink,
                  margin: 0,
                  fontWeight: 300,
                  letterSpacing: '0.1px',
                }}
              >
                Đăng nhập Cổng dịch vụ
              </h2>
              <p
                style={{
                  color: PS_COLORS.bodyLight,
                  fontSize: 14,
                  marginTop: 6,
                  marginBottom: 0,
                }}
              >
                Nhập số điện thoại hoặc email đã đăng ký trong hệ thống
              </p>
            </div>

            {errorMessage && (
              <Alert
                message={errorMessage}
                type="error"
                showIcon
                style={{
                  marginBottom: 20,
                  borderRadius: PS_ROUNDED.sm,
                }}
              />
            )}

            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              requiredMark={false}
            >
              <Form.Item
                label={
                  <span style={{ color: PS_COLORS.ink, fontSize: 14, fontWeight: 600 }}>
                    Số điện thoại / Email
                  </span>
                }
                name="username"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại hoặc email!' }]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: PS_COLORS.muteLight, marginRight: 6 }} />}
                  placeholder="VD: 0901000001 hoặc admin@building.vn"
                  style={{
                    height: 48,
                    borderRadius: PS_ROUNDED.sm, // 4px
                    backgroundColor: PS_COLORS.canvasLight,
                    borderColor: PS_COLORS.ashLight,
                    color: PS_COLORS.ink,
                    fontSize: 15,
                  }}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span style={{ color: PS_COLORS.ink, fontSize: 14, fontWeight: 600 }}>
                    Mật khẩu
                  </span>
                }
                name="password"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: PS_COLORS.muteLight, marginRight: 6 }} />}
                  placeholder="Nhập mật khẩu"
                  style={{
                    height: 48,
                    borderRadius: PS_ROUNDED.sm, // 4px
                    backgroundColor: PS_COLORS.canvasLight,
                    borderColor: PS_COLORS.ashLight,
                    color: PS_COLORS.ink,
                    fontSize: 15,
                  }}
                />
              </Form.Item>

              {/* Universal PlayStation Primary CTA Pill (#0070d1, 9999px) */}
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                className="ps-btn-primary"
                style={{
                  marginTop: 12,
                  marginBottom: 24,
                  height: 48,
                  borderRadius: PS_ROUNDED.full,
                }}
              >
                Đăng nhập hệ thống
              </Button>
            </Form>

            {/* Quick Test Role Section: Filter-Pill styling on Light Surface */}
            <div
              style={{
                borderTop: `1px solid ${PS_COLORS.hairlineLight}`,
                paddingTop: 20,
                textAlign: 'center',
              }}
            >
              <span
                style={{
                  display: 'block',
                  color: PS_COLORS.bodyLight,
                  fontSize: 13,
                  fontWeight: 500,
                  marginBottom: 12,
                }}
              >
                Chế độ Test nhanh theo vai trò:
              </span>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="ps-filter-pill"
                  onClick={() => handleQuickRole('ADMIN')}
                  title="Đăng nhập tài khoản Ban Quản Lý"
                >
                  🔑 Admin (BQL)
                </button>
                <button
                  type="button"
                  className="ps-filter-pill"
                  onClick={() => handleQuickRole('RESIDENT')}
                  title="Đăng nhập cư dân Hồ Anh Dũng (sở hữu 2 căn)"
                >
                  🏠 Cư dân (2 căn)
                </button>
                <button
                  type="button"
                  className="ps-filter-pill"
                  onClick={() => handleQuickRole('TECHNICIAN')}
                  title="Đăng nhập nhân viên kỹ thuật điện nước"
                >
                  🔧 Kỹ thuật
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Footer Chapter: PlayStation Blue (#0070d1) Full-Bleed Section */}
      <footer
        className="ps-footer-section"
        style={{
          padding: '24px 32px',
          marginTop: 48,
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
            BMS • Single-Building Apartment Management System
          </span>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
            Thiết kế theo chuẩn PlayStation Design System (Light Canvas Mode • Flat Level 0 • Pill CTAs)
          </span>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
