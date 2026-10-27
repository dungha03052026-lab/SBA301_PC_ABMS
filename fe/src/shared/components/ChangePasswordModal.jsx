// src/shared/components/ChangePasswordModal.jsx
import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { useAuth } from '../context/AuthContext';

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
      // Form validation failed
      console.log('Validate Failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Đổi mật khẩu tài khoản"
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
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          name="currentPassword"
          label="Mật khẩu hiện tại"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
        >
          <Input.Password placeholder="Nhập mật khẩu hiện tại" />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
            { min: 6, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' },
          ]}
        >
          <Input.Password placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu mới"
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
          <Input.Password placeholder="Nhập lại mật khẩu mới" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
