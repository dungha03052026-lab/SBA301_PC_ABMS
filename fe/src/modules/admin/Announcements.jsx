// src/modules/admin/Announcements.jsx
// Tuân thủ 100% nguyên tắc thiết kế từ DESIGN-playstation.md:
// - Light Canvas Mode (#f5f7fa layout, #ffffff cards/tables)
// - Typography: Headlines ở weight 300 (light), Form labels 14px/600, Buttons 700 bold
// - Shapes: Inputs 4px (rounded.sm), Cards & Modals 8px (rounded.md), CTAs & Badges 9999px pill (rounded.full)
// - Elevation: Level 0 Flat (boxShadow: none)
// - Nghiệp vụ: UC-19 (Đăng, ghim và quản lý bản tin thông báo tòa nhà)

import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  Space,
  Tag,
  Switch,
  message,
  Popconfirm,
  Badge,
} from 'antd';
import {
  NotificationOutlined,
  PlusOutlined,
  PushpinOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { MockDB } from '../../shared/constants/mockData';
import { useAuth } from '../../shared/context/AuthContext';
import { PS_COLORS, PS_ROUNDED } from '../../shared/theme/playstationTheme';

const { TextArea } = Input;

const Announcements = () => {
  const { user } = useAuth();

  // State
  const [announcements, setAnnouncements] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [pinFilter, setPinFilter] = useState('ALL'); // 'ALL' | 'PINNED' | 'NORMAL'

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [form] = Form.useForm();

  const reloadData = () => {
    setAnnouncements(MockDB.getAnnouncements());
    setUsers(MockDB.getUsers());
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Map announcements with author & sort pinned on top
  const enrichedAnnouncements = useMemo(() => {
    return announcements
      .map((ann) => {
        const author = users.find((u) => u.id === ann.created_by);
        return {
          ...ann,
          author,
        };
      })
      .sort((a, b) => {
        // Ưu tiên tin ghim lên đầu
        if (a.is_pinned !== b.is_pinned) {
          return b.is_pinned ? 1 : -1;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [announcements, users]);

  // Filtered List
  const filteredAnnouncements = useMemo(() => {
    return enrichedAnnouncements.filter((ann) => {
      let matchPin = true;
      if (pinFilter === 'PINNED') matchPin = ann.is_pinned;
      else if (pinFilter === 'NORMAL') matchPin = !ann.is_pinned;

      const titleMatch = ann.title.toLowerCase().includes(searchKeyword.trim().toLowerCase());
      const contentMatch = ann.content.toLowerCase().includes(searchKeyword.trim().toLowerCase());
      const matchSearch = !searchKeyword.trim() || titleMatch || contentMatch;

      return matchPin && matchSearch;
    });
  }, [enrichedAnnouncements, pinFilter, searchKeyword]);

  // Metric counts
  const totalCount = announcements.length;
  const pinnedCount = announcements.filter((a) => a.is_pinned).length;
  const thisMonthCount = announcements.filter((a) => {
    const createdMonth = dayjs(a.created_at).format('YYYY-MM');
    const currentMonth = dayjs().format('YYYY-MM');
    return createdMonth === currentMonth;
  }).length;

  // ==========================================
  // THÊM / SỬA BẢN TIN
  // ==========================================
  const handleOpenAdd = () => {
    setEditMode(false);
    setSelectedAnnouncement(null);
    form.resetFields();
    form.setFieldsValue({
      is_pinned: false,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditMode(true);
    setSelectedAnnouncement(record);
    form.setFieldsValue({
      title: record.title,
      content: record.content,
      is_pinned: record.is_pinned,
    });
    setModalOpen(true);
  };

  const handleSave = async (values) => {
    try {
      if (editMode && selectedAnnouncement) {
        const updated = announcements.map((item) =>
          item.id === selectedAnnouncement.id
            ? {
                ...item,
                title: values.title.trim(),
                content: values.content.trim(),
                is_pinned: Boolean(values.is_pinned),
                updated_at: new Date().toISOString(),
              }
            : item
        );
        MockDB.saveAnnouncements(updated);
        message.success('Cập nhật bản tin thông báo thành công!');
      } else {
        const newId = announcements.length > 0 ? Math.max(...announcements.map((a) => a.id)) + 1 : 1;
        const newAnn = {
          id: newId,
          title: values.title.trim(),
          content: values.content.trim(),
          created_by: user?.id || 1,
          is_pinned: Boolean(values.is_pinned),
          created_at: new Date().toISOString(),
        };

        const updated = [newAnn, ...announcements];
        MockDB.saveAnnouncements(updated);
        message.success('Đăng bản tin thông báo mới thành công!');
      }

      setModalOpen(false);
      reloadData();
    } catch {
      message.error('Lỗi khi lưu bản tin thông báo!');
    }
  };

  // Toggle Pin nhanh trực tiếp từ bảng
  const handleTogglePin = (record) => {
    try {
      const updated = announcements.map((item) =>
        item.id === record.id
          ? { ...item, is_pinned: !item.is_pinned }
          : item
      );
      MockDB.saveAnnouncements(updated);
      message.success(`Đã ${record.is_pinned ? 'bỏ ghim' : 'ghim'} bản tin "${record.title}"!`);
      reloadData();
    } catch {
      message.error('Lỗi khi thay đổi trạng thái ghim!');
    }
  };

  // Xóa bản tin
  const handleDelete = (id) => {
    try {
      const updated = announcements.filter((item) => item.id !== id);
      MockDB.saveAnnouncements(updated);
      message.success('Đã xóa bản tin thông báo!');
      reloadData();
    } catch {
      message.error('Lỗi khi xóa bản tin!');
    }
  };

  // ==========================================
  // TABLE COLUMNS DEFINITION
  // ==========================================
  const columns = [
    {
      title: 'TIÊU ĐỀ BẢN TIN',
      key: 'title_info',
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            {record.is_pinned && (
              <Tag
                color="blue"
                style={{
                  borderRadius: PS_ROUNDED.full,
                  padding: '2px 10px',
                  fontWeight: 700,
                  fontSize: 11,
                  backgroundColor: 'rgba(0, 112, 209, 0.1)',
                  borderColor: PS_COLORS.primary,
                  color: PS_COLORS.primary,
                }}
              >
                <PushpinOutlined /> ĐÃ GHIM ƯU TIÊN
              </Tag>
            )}
            <span style={{ fontWeight: 700, color: PS_COLORS.ink, fontSize: 15 }}>
              {record.title}
            </span>
          </div>
          <p
            style={{
              color: PS_COLORS.bodyLight,
              fontSize: 13,
              margin: 0,
              maxWidth: 580,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {record.content}
          </p>
        </div>
      ),
    },
    {
      title: 'NGƯỜI ĐĂNG',
      key: 'author',
      width: 180,
      render: (_, record) => (
        <span style={{ fontWeight: 600, color: PS_COLORS.ink, fontSize: 13 }}>
          {record.author?.full_name || 'Ban Quản Lý'}
        </span>
      ),
    },
    {
      title: 'NGÀY PHÁT HÀNH',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 170,
      render: (d) => (
        <span style={{ fontSize: 13, color: PS_COLORS.muteLight }}>
          {dayjs(d).format('DD/MM/YYYY HH:mm')}
        </span>
      ),
    },
    {
      title: 'THAO TÁC',
      key: 'actions',
      width: 240,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<PushpinOutlined />}
            onClick={() => handleTogglePin(record)}
            style={{
              borderRadius: PS_ROUNDED.full,
              color: record.is_pinned ? PS_COLORS.primary : PS_COLORS.muteLight,
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            {record.is_pinned ? 'Bỏ ghim' : 'Ghim'}
          </Button>

          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleOpenEdit(record)}
            style={{ borderRadius: PS_ROUNDED.full, fontSize: 13 }}
          >
            Sửa
          </Button>

          <Popconfirm
            title="Xác nhận xóa bản tin này?"
            description="Bản tin sẽ không còn hiển thị trên bảng tin của cư dân."
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              style={{ borderRadius: PS_ROUNDED.full, fontSize: 13 }}
            >
              Xóa
            </Button>
          </Popconfirm>

          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedAnnouncement(record);
              setDetailModalOpen(true);
            }}
            style={{ borderRadius: PS_ROUNDED.full }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* ====================================================================
          PAGE HEADER: PlayStation signature light 300 typography + Action Pill
          ==================================================================== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <span
            className="ps-caption-sm"
            style={{
              backgroundColor: 'rgba(0, 112, 209, 0.08)',
              color: PS_COLORS.primary,
              padding: '4px 12px',
              borderRadius: PS_ROUNDED.full,
              fontWeight: 700,
              letterSpacing: '0.8px',
              display: 'inline-block',
              marginBottom: 10,
            }}
          >
            PHÂN HỆ TRUYỀN THÔNG & BẢN TIN TÒA NHÀ (UC-19)
          </span>

          <h1
            className="ps-heading-xl"
            style={{
              fontWeight: 300, // Signature PlayStation weight 300
              color: PS_COLORS.ink,
              margin: '0 0 8px 0',
              lineHeight: 1.25,
            }}
          >
            Quản lý Bản tin Thông báo Tòa nhà
          </h1>

          <p
            className="ps-body-sm"
            style={{ color: PS_COLORS.bodyLight, margin: 0, maxWidth: 760 }}
          >
            Đăng thông báo hoạt động, lịch cắt điện nước, bảo dưỡng thang máy và ghim
            các tin quan trọng lên đầu danh sách để cư dân theo dõi kịp thời.
          </p>
        </div>

        {/* Primary Action Button: Universal PlayStation CTA Pill (#0070d1, 9999px) */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenAdd}
          className="ps-btn-primary"
          style={{
            height: 48,
            padding: '0 28px',
            borderRadius: PS_ROUNDED.full,
          }}
        >
          Đăng thông báo mới
        </Button>
      </div>

      {/* ====================================================================
          METRICS STRIP: 3 Flat Level 0 Stat Cards (8px radius, no shadow)
          ==================================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
        }}
      >
        <div
          style={{
            backgroundColor: PS_COLORS.canvasLight,
            borderRadius: PS_ROUNDED.md,
            border: `1px solid ${PS_COLORS.hairlineLight}`,
            padding: '20px 24px',
            boxShadow: 'none',
          }}
        >
          <span style={{ fontSize: 13, color: PS_COLORS.muteLight, fontWeight: 500 }}>
            TỔNG SỐ BẢN TIN
          </span>
          <div
            className="ps-display-md"
            style={{
              fontWeight: 300,
              color: PS_COLORS.ink,
              marginTop: 4,
              lineHeight: 1.2,
            }}
          >
            {totalCount}
          </div>
          <span style={{ fontSize: 12, color: PS_COLORS.muteLight }}>
            Đã phát hành trong hệ thống
          </span>
        </div>

        <div
          style={{
            backgroundColor: PS_COLORS.canvasLight,
            borderRadius: PS_ROUNDED.md,
            border: `1px solid ${PS_COLORS.hairlineLight}`,
            padding: '20px 24px',
            boxShadow: 'none',
          }}
        >
          <span style={{ fontSize: 13, color: PS_COLORS.primary, fontWeight: 600 }}>
            BẢN TIN ĐANG GHIM ƯU TIÊN
          </span>
          <div
            className="ps-display-md"
            style={{
              fontWeight: 300,
              color: PS_COLORS.primary,
              marginTop: 4,
              lineHeight: 1.2,
            }}
          >
            {pinnedCount}
          </div>
          <span style={{ fontSize: 12, color: PS_COLORS.muteLight }}>
            Hiển thị trên đầu bảng tin cư dân
          </span>
        </div>

        <div
          style={{
            backgroundColor: PS_COLORS.canvasLight,
            borderRadius: PS_ROUNDED.md,
            border: `1px solid ${PS_COLORS.hairlineLight}`,
            padding: '20px 24px',
            boxShadow: 'none',
          }}
        >
          <span style={{ fontSize: 13, color: PS_COLORS.muteLight, fontWeight: 500 }}>
            PHÁT HÀNH THÁNG NÀY
          </span>
          <div
            className="ps-display-md"
            style={{
              fontWeight: 300,
              color: PS_COLORS.ink,
              marginTop: 4,
              lineHeight: 1.2,
            }}
          >
            {thisMonthCount}
          </div>
          <span style={{ fontSize: 12, color: PS_COLORS.muteLight }}>
            Bản tin mới trong tháng {dayjs().format('MM/YYYY')}
          </span>
        </div>
      </div>

      {/* ====================================================================
          MAIN CARD: Filters + Announcements Table
          ==================================================================== */}
      <div
        style={{
          backgroundColor: PS_COLORS.canvasLight,
          borderRadius: PS_ROUNDED.md,
          border: `1px solid ${PS_COLORS.hairlineLight}`,
          padding: '28px',
          boxShadow: 'none',
        }}
      >
        {/* Filter Strip */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <Input
            prefix={<SearchOutlined style={{ color: PS_COLORS.muteLight }} />}
            placeholder="Tìm theo tiêu đề, nội dung thông báo..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{
              width: 320,
              height: 44,
              borderRadius: PS_ROUNDED.sm,
              borderColor: PS_COLORS.ashLight,
            }}
            allowClear
          />

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`ps-filter-pill ${pinFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setPinFilter('ALL')}
            >
              Tất cả ({announcements.length})
            </button>
            <button
              type="button"
              className={`ps-filter-pill ${pinFilter === 'PINNED' ? 'active' : ''}`}
              onClick={() => setPinFilter('PINNED')}
            >
              Đang ghim ({pinnedCount})
            </button>
            <button
              type="button"
              className={`ps-filter-pill ${pinFilter === 'NORMAL' ? 'active' : ''}`}
              onClick={() => setPinFilter('NORMAL')}
            >
              Tin thường ({announcements.length - pinnedCount})
            </button>
          </div>
        </div>

        {/* Table of Announcements */}
        <Table
          columns={columns}
          dataSource={filteredAnnouncements}
          rowKey="id"
          pagination={{ pageSize: 6, showSizeChanger: false }}
          locale={{ emptyText: 'Không có bản tin nào' }}
        />
      </div>

      {/* ====================================================================
          MODAL: THÊM / SỬA BẢN TIN (UC-19)
          ==================================================================== */}
      <Modal
        title={
          <span className="ps-heading-lg" style={{ fontWeight: 300, color: PS_COLORS.ink }}>
            {editMode ? 'Chỉnh sửa Bản tin Thông báo' : 'Đăng Thông báo Mới tới Cư dân'}
          </span>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
        style={{ borderRadius: PS_ROUNDED.md }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          style={{ marginTop: 20 }}
          requiredMark={false}
        >
          <Form.Item
            label={<span style={{ fontWeight: 600, color: PS_COLORS.ink }}>Tiêu đề thông báo</span>}
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề thông báo!' }]}
          >
            <Input
              placeholder="VD: Thông báo bảo trì thang máy Tòa A..."
              style={{ height: 44, borderRadius: PS_ROUNDED.sm }}
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: 600, color: PS_COLORS.ink }}>Nội dung chi tiết</span>}
            name="content"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung chi tiết!' }]}
          >
            <TextArea
              rows={5}
              placeholder="Nhập nội dung đầy đủ để thông báo tới cư dân..."
              style={{ borderRadius: PS_ROUNDED.sm }}
            />
          </Form.Item>

          <Form.Item
            name="is_pinned"
            valuePropName="checked"
            style={{ marginBottom: 24 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Switch />
              <span style={{ fontWeight: 600, color: PS_COLORS.ink }}>
                Ghim thông báo quan trọng này lên đầu danh sách (Pin to Top)
              </span>
            </div>
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button
              onClick={() => setModalOpen(false)}
              style={{ height: 44, borderRadius: PS_ROUNDED.full, padding: '0 24px' }}
            >
              Hủy bỏ
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="ps-btn-primary"
              style={{ height: 44, borderRadius: PS_ROUNDED.full, padding: '0 28px' }}
            >
              {editMode ? 'Lưu thay đổi' : 'Đăng thông báo'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ====================================================================
          MODAL: XEM CHI TIẾT BẢN TIN
          ==================================================================== */}
      <Modal
        title={
          <span className="ps-heading-lg" style={{ fontWeight: 300, color: PS_COLORS.ink }}>
            Chi tiết Bản tin Thông báo
          </span>
        }
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        destroyOnClose
        style={{ borderRadius: PS_ROUNDED.md }}
      >
        {selectedAnnouncement && (
          <div style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 16 }}>
              {selectedAnnouncement.is_pinned && (
                <Tag color="blue" style={{ borderRadius: PS_ROUNDED.full, marginBottom: 8 }}>
                  <PushpinOutlined /> ĐÃ GHIM ƯU TIÊN
                </Tag>
              )}
              <h2 className="ps-heading-md" style={{ color: PS_COLORS.ink, margin: '4px 0' }}>
                {selectedAnnouncement.title}
              </h2>
              <span style={{ fontSize: 13, color: PS_COLORS.muteLight }}>
                Đăng bởi: {selectedAnnouncement.author?.full_name || 'Ban Quản Lý'} •{' '}
                {dayjs(selectedAnnouncement.created_at).format('DD/MM/YYYY HH:mm')}
              </span>
            </div>

            <div
              style={{
                padding: '16px 20px',
                backgroundColor: PS_COLORS.surfaceCard,
                borderRadius: PS_ROUNDED.md,
                color: PS_COLORS.ink,
                fontSize: 15,
                lineHeight: 1.6,
                whiteSpace: 'pre-line',
                marginBottom: 24,
              }}
            >
              {selectedAnnouncement.content}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => setDetailModalOpen(false)}
                className="ps-btn-primary"
                style={{ height: 44, borderRadius: PS_ROUNDED.full, padding: '0 28px' }}
              >
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Announcements;
