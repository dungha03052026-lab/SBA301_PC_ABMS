/**
 * Modal đổi mật khẩu tài khoản người dùng (UC-02 - Change Password Modal).
 * 
 * - Yêu cầu nhập mật khẩu hiện tại, mật khẩu mới (tối thiểu 6 ký tự) và xác nhận mật khẩu.
 * - Gọi hàm `changePassword` từ AuthContext để gửi request tới API Backend (kèm offline fallback).
 * - Sử dụng PlayStation Theme UI (bo góc thẻ, nút gradient PS Blue, phông chữ thanh lịch).
 */
import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { useAuth } from '../context/AuthContext';
import { PS_COLORS, PS_ROUNDED } from '../theme/playstationTheme';

const ChangePasswordModal = ({ open, onCancel }) => {
  const [form] = Form.useForm();
  const { changePassword } = useAuth();
  const [loading, setLoading] = useState(false);

  // Xử lý submit form đổi mật khẩu
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
      okText="Lưu mật khẩu mới"
      cancelText="Hủy bỏ"
      confirmLoading={loading}
      centered
      okButtonProps={{
        style: {
          background: 'linear-gradient(135deg, #0070D1 0%, #00439C 100%)',
          borderColor: 'transparent',
          borderRadius: PS_ROUNDED.sm,
          fontWeight: 500,
        },
      }}
      cancelButtonProps={{
        style: {
          borderRadius: PS_ROUNDED.sm,
        },
      }}
    >
      <Form form={form} layout="vertical" className="mt-4">
        {/* Mật khẩu hiện tại */}
        <Form.Item
          label={<span style={{ fontWeight: 500 }}>Mật khẩu hiện tại</span>}
          name="currentPassword"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
        >
          <Input.Password
            placeholder="Nhập mật khẩu hiện tại"
            style={{ borderRadius: PS_ROUNDED.sm }}
          />
        </Form.Item>

        {/* Mật khẩu mới */}
        <Form.Item
          label={<span style={{ fontWeight: 500 }}>Mật khẩu mới</span>}
          name="newPassword"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
          ]}
        >
          <Input.Password
            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
            style={{ borderRadius: PS_ROUNDED.sm }}
          />
        </Form.Item>

        {/* Xác nhận mật khẩu mới */}
        <Form.Item
          label={<span style={{ fontWeight: 500 }}>Xác nhận mật khẩu mới</span>}
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password
            placeholder="Nhập lại mật khẩu mới"
            style={{ borderRadius: PS_ROUNDED.sm }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
