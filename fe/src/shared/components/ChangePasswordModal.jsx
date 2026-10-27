// src/shared/components/ChangePasswordModal.jsx
import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { useAuth } from '../context/AuthContext';
import { PS_COLORS, PS_ROUNDED } from '../theme/playstationTheme';

const ChangePasswordModal = ({ open, onCancel }) => {
  const [form] = Form.useForm();
  const { changePassword } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const res = await changePassword(values.currentPassword, values.newPassword);
      if (res.success) {
        message.success('Đổi mật khẩu thành công!');
        form.resetFields();
        onCancel();
      } else {
        message.error(res.message || 'Mật khẩu hiện tại không chính xác');
      }
    } catch (err) {
      console.log('Validate Failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <span
          className="ps-heading-lg"
          style={{
            fontWeight: 300, // Signature PlayStation weight 300
            color: PS_COLORS.ink,
          }}
        >
          Đổi mật khẩu tài khoản
        </span>
      }
      open={open}
      onOk={handleSubmit}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      confirmLoading={loading}
      okText="Xác nhận đổi"
      cancelText="Hủy bỏ"
      destroyOnClose
      okButtonProps={{
        style: {
          borderRadius: PS_ROUNDED.full,
          backgroundColor: PS_COLORS.primary,
          height: 40,
          padding: '0 24px',
          fontWeight: 700,
        },
      }}
      cancelButtonProps={{
        style: {
          borderRadius: PS_ROUNDED.full,
          height: 40,
          padding: '0 24px',
          fontWeight: 600,
        },
      }}
    >
      <div style={{ marginTop: 16 }}>
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="currentPassword"
            label={<span style={{ fontWeight: 500, fontSize: 14 }}>Mật khẩu hiện tại</span>}
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
          >
            <Input.Password
              placeholder="Nhập mật khẩu hiện tại"
              style={{ height: 44, borderRadius: PS_ROUNDED.sm }}
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label={<span style={{ fontWeight: 500, fontSize: 14 }}>Mật khẩu mới</span>}
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 6, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' },
            ]}
          >
            <Input.Password
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              style={{ height: 44, borderRadius: PS_ROUNDED.sm }}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={<span style={{ fontWeight: 500, fontSize: 14 }}>Xác nhận mật khẩu mới</span>}
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không trùng khớp!'));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Nhập lại mật khẩu mới"
              style={{ height: 44, borderRadius: PS_ROUNDED.sm }}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;
