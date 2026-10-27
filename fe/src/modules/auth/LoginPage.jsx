// src/modules/auth/LoginPage.jsx
// Tuân thủ nghiêm ngặt 100% nguyên tắc thiết kế từ DESIGN-playstation.md:
// - Three-Canvas Chapter System: Primary-Nav đen (#000000), Body Light Canvas (#ffffff / #f5f7fa), Footer PlayStation Blue (#0070d1)
// - Typography: Headlines ở weight 300 (light), Body 18px/1.5, Buttons ở weight 700
// - Shapes: Inputs 4px, Cards & Image 8px, CTAs 9999px pill
// - Elevation: Level 0 Flat, tuyệt đối không dùng resting drop shadow
// - Imagery does the heavy lifting: Phối cảnh kiến trúc chung cư chiếm 60% không gian thị giác

import React, { useState } from 'react';
import { Form, Input, Button, message, Alert } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  CheckCircleOutlined,
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

  // Quick Role Testing: Tự động điền thông tin và đăng nhập
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
        backgroundColor: PS_COLORS.surfaceCard, // PlayStation Light Canvas (#f5f7fa)
        color: PS_COLORS.ink,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* ====================================================================
          CHAPTER 1: PRIMARY NAV
          Spec: Background {colors.canvas-dark} (#000000), Text {colors.on-dark},
          Height ~48px, Type {typography.body-strong}, Rounded {rounded.none}
          ==================================================================== */}
      <nav
        style={{
          backgroundColor: PS_COLORS.canvasDark, // #000000 pure black
          height: 48,
          borderRadius: PS_ROUNDED.none,
          display: 'flex',
          alignItems: 'center',
          padding: '0 32px',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Brand Wordmark & Glyph */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: PS_COLORS.primary, // PlayStation Blue dot
              }}
            />
            <span
              className="ps-body-strong"
              style={{
                color: PS_COLORS.onDark,
                fontWeight: 500,
                letterSpacing: '1px',
                fontSize: 16,
              }}
            >
              ABMS • APARTMENT BUILDING MANAGEMENT
            </span>
          </div>

          {/* Utility meta right */}
          <span
            className="ps-caption-sm"
            style={{
              color: PS_COLORS.muteDark,
              letterSpacing: '0.5px',
            }}
          >
            PORTAL ACCESS
          </span>
        </div>
      </nav>

      {/* ====================================================================
          CHAPTER 2: EDITORIAL HERO & AUTHENTICATION
          Spec: 2-column layout (text/card + imagery), 1280px max-width,
          Imagery occupies 60% of visually heavy lifting,
          Display typography at weight 300 (light),
          Flat Level 0 elevation (no resting shadows).
          ==================================================================== */}
      <main
        style={{
          maxWidth: 1280,
          width: '100%',
          margin: '0 auto',
          padding: '48px 32px',
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 48,
          alignItems: 'center',
        }}
      >
        {/* Left Column: Architectural Imagery & Editorial Slot (PlayStation signature) */}
        <div
          style={{
            position: 'relative',
            borderRadius: PS_ROUNDED.md, // 8px
            overflow: 'hidden',
            backgroundColor: PS_COLORS.canvasDark,
            minHeight: 460,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: 36,
          }}
        >
          {/* Architectural Background Image: Phối cảnh tòa nhà chung cư hiện đại */}
          <img
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"
            alt="Apartment Building Architecture"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />

          {/* Faint Vignette Overlay: Bảo đảm độ tương phản chữ đạt chuẩn WCAG AAA */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background:
                'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.85) 100%)',
            }}
          />

          {/* Content Slot: Compressed editorial block overlaid on lower-left */}
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
            {/* Badge Info: PlayStation Blue pill */}
            <span
              className="ps-caption-sm"
              style={{
                backgroundColor: PS_COLORS.primary,
                color: PS_COLORS.onPrimary,
                padding: '4px 12px',
                borderRadius: PS_ROUNDED.full,
                fontWeight: 700,
                letterSpacing: '0.8px',
                display: 'inline-block',
                marginBottom: 16,
              }}
            >
              HỆ THỐNG VẬN HÀNH TÒA NHÀ
            </span>

            {/* Headline: Weight 300 (light!) */}
            <h1
              className="ps-display-md"
              style={{
                color: PS_COLORS.onDark,
                fontWeight: 300,
                lineHeight: 1.25,
                marginBottom: 14,
              }}
            >
              Không gian sống thông minh, vận hành chuẩn mực.
            </h1>

            <p
              className="ps-body-sm"
              style={{
                color: PS_COLORS.bodyDark,
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              Quy trình Move-in/Move-out đồng bộ, chốt chỉ số điện nước minh bạch,
              thanh toán VietQR động và chợ việc bảo trì kỹ thuật cho tòa nhà.
            </p>
          </div>
        </div>

        {/* Right Column: Authentication Card Container */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              width: '100%',
              maxWidth: 440,
              backgroundColor: PS_COLORS.canvasLight, // #ffffff
              borderRadius: PS_ROUNDED.md, // 8px
              border: `1px solid ${PS_COLORS.hairlineLight}`,
              padding: '36px 32px',
              boxShadow: 'none', // Strictly Level 0 Flat
            }}
          >
            {/* Card Header */}
            <div style={{ marginBottom: 28 }}>
              <h2
                className="ps-heading-xl"
                style={{
                  color: PS_COLORS.ink,
                  fontWeight: 300, // Signature weight 300
                  margin: 0,
                  lineHeight: 1.25,
                }}
              >
                Đăng nhập Cổng dịch vụ
              </h2>
              <p
                className="ps-body-sm"
                style={{
                  color: PS_COLORS.bodyLight,
                  marginTop: 6,
                  marginBottom: 0,
                  fontSize: 14,
                }}
              >
                Nhập số điện thoại hoặc email đã đăng ký với Ban Quản Lý
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
              {/* Form Input: 4px radius, 48px height, 1px ash-light border */}
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
                  placeholder="0901000001 hoặc admin@building.vn"
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
                  placeholder="Nhập mật khẩu (mặc định: password123)"
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

              {/* Primary Action CTA: Universal PlayStation Blue Pill (9999px, 48px height, weight 700) */}
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

            {/* Quick Test Role Section: Filter Pill styling (rounded.full, subtle hairline) */}
            <div
              style={{
                borderTop: `1px solid ${PS_COLORS.hairlineLight}`,
                paddingTop: 20,
                textAlign: 'center',
              }}
            >
              <span
                className="ps-caption-sm"
                style={{
                  display: 'block',
                  color: PS_COLORS.muteLight,
                  fontWeight: 500,
                  marginBottom: 12,
                }}
              >
                Tài khoản kiểm thử nhanh (1-Click Switch):
              </span>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="ps-filter-pill"
                  onClick={() => handleQuickRole('ADMIN')}
                  title="Ban Quản Lý Tòa Nhà (0901000001)"
                >
                  Admin (BQL)
                </button>
                <button
                  type="button"
                  className="ps-filter-pill"
                  onClick={() => handleQuickRole('RESIDENT')}
                  title="Cư dân Hồ Anh Dũng (2 căn hộ)"
                >
                  Cư dân (2 căn)
                </button>
                <button
                  type="button"
                  className="ps-filter-pill"
                  onClick={() => handleQuickRole('TECHNICIAN')}
                  title="Nhân viên Kỹ thuật (0902000001)"
                >
                  Kỹ thuật viên
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ====================================================================
          CHAPTER 3: FOOTER SECTION
          Spec: Background {colors.primary} (#0070d1), Text {colors.on-primary},
          Type {typography.caption-md}, Rounded {rounded.none}, Padding 48px 32px
          ==================================================================== */}
      <footer
        className="ps-footer-section"
        style={{
          padding: '24px 32px',
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
            ABMS • Single-Building Apartment Management System
          </span>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
            PlayStation Design Architecture • Light Utility Canvas • Flat Level 0
          </span>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
