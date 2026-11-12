/**
 * Phân hệ Quản Lý Bảng Tin & Thông Báo Tòa Nhà (Announcements Management - Admin).
 * 
 * Các ca sử dụng và nghiệp vụ trọng tâm:
 * 1. UC-19: Soạn thảo, ghim và quản lý thông báo tòa nhà:
 *    - Đăng thông báo mới với tiêu đề và nội dung chi tiết.
 *    - Tính năng Ghim tin quan trọng (Pushpin): Đẩy tin lên đầu bảng tin cư dân.
 *    - Chỉnh sửa thông báo hoặc xóa tin cũ.
 * 2. Lọc thông báo theo trạng thái ghim và từ khóa tìm kiếm.
 */
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

  Tag,
  Switch,
  message,
  Popconfirm,
  Badge,
  Alert,
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
import { MockDB, IS_MOCK_FALLBACK_ENABLED } from '../../shared/constants/mockData';
import axiosClient, { getBackendErrorMessage } from '../../shared/api/axiosClient';
import { useAuth } from '../../shared/context/AuthContext';
import { PS_COLORS, PS_ROUNDED } from '../../shared/theme/playstationTheme';

const { TextArea } = Input;

const Announcements = () => {
  const { user } = useAuth();

  // State
  const [announcements, setAnnouncements] = useState([]);
  const [users, setUsers] = useState([]);
  const [backendError, setBackendError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [pinFilter, setPinFilter] = useState('ALL'); // 'ALL' | 'PINNED' | 'NORMAL'

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [form] = Form.useForm();

  const reloadData = async () => {
    setLoading(true);
    let anns = [];
    let usrs = [];

    try {
      const res = await axiosClient.get('/announcements');
      if (res && Array.isArray(res.data || res)) {
        const raw = res.data || res;
        anns = raw.map((a) => ({
          id: a.id,
          title: a.title,
          content: a.content,
          created_by: a.createdById ?? a.author?.id ?? 1,
          author: a.createdByName
            ? {
                id: a.createdById,
                full_name: a.createdByName,
                email: '',
              }
            : a.author
              ? {
                  id: a.author.id,
                  full_name: a.author.fullName,
                  email: a.author.email,
                }
              : null,
          is_pinned: a.isPinned,
          created_at: a.createdAt,
        }));
      }
      setBackendError('');
    } catch (e) {
      console.warn('API error in Announcements:', e);
      if (!IS_MOCK_FALLBACK_ENABLED) {
        setBackendError(
          getBackendErrorMessage(
            e,
            'Không thể kết nối tới máy chủ để tải danh sách bản tin. Vui lòng thử lại!'
          )
        );
      } else {
        anns = MockDB.getAnnouncements();
        usrs = MockDB.getUsers();
      }
    } finally {
      setLoading(false);
    }

    setAnnouncements(anns);
    setUsers(usrs);
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Map announcements with author & sort pinned on top
  const enrichedAnnouncements = useMemo(() => {
    return announcements
      .map((ann) => {
        const author = ann.author || users.find((u) => u.id === ann.created_by);
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
      const payload = {
        title: values.title.trim(),
        content: values.content.trim(),
        isPinned: Boolean(values.is_pinned),
      };

      if (editMode && selectedAnnouncement) {
        try {
          await axiosClient.put(`/admin/announcements/${selectedAnnouncement.id}`, payload);
          message.success('Cập nhật bản tin thông báo thành công trên CSDL MSSQL!');
          setModalOpen(false);
          reloadData();
          return;
        } catch (apiErr) {
          if (apiErr.response?.data?.message || !IS_MOCK_FALLBACK_ENABLED) {
            message.error(
              getBackendErrorMessage(
                apiErr,
                'Không thể kết nối máy chủ. Bản tin chưa được cập nhật!'
              )
            );
            return;
          }
          console.warn('Update announcement API failed, fallback MockDB', apiErr);
        }

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
        try {
          await axiosClient.post('/admin/announcements', payload);
          message.success('Đăng bản tin thông báo mới thành công vào CSDL MSSQL!');
          setModalOpen(false);
          reloadData();
          return;
        } catch (apiErr) {
          if (apiErr.response?.data?.message || !IS_MOCK_FALLBACK_ENABLED) {
            message.error(
              getBackendErrorMessage(apiErr, 'Không thể kết nối máy chủ. Bản tin chưa được đăng!')
            );
            return;
          }
          console.warn('Create announcement API failed, fallback MockDB', apiErr);
        }

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
  const handleTogglePin = async (record) => {
    try {
      try {
        await axiosClient.put(`/admin/announcements/${record.id}`, {
          title: record.title,
          content: record.content,
          isPinned: !record.is_pinned,
        });
        message.success(`Đã ${record.is_pinned ? 'bỏ ghim' : 'ghim'} bản tin "${record.title}" trên CSDL!`);
        reloadData();
        return;
      } catch (apiErr) {
        if (apiErr.response?.data?.message || !IS_MOCK_FALLBACK_ENABLED) {
          message.error(
            getBackendErrorMessage(
              apiErr,
              'Không thể kết nối máy chủ. Trạng thái ghim chưa được cập nhật!'
            )
          );
          return;
        }
        console.warn('Toggle pin API failed, fallback MockDB', apiErr);
      }

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
  const handleDelete = async (id) => {
    try {
      try {
        await axiosClient.delete(`/admin/announcements/${id}`);
        message.success('Đã xóa bản tin thông báo trên CSDL MSSQL!');
        reloadData();
        return;
      } catch (apiErr) {
        if (apiErr.response?.data?.message || !IS_MOCK_FALLBACK_ENABLED) {
          message.error(
            getBackendErrorMessage(apiErr, 'Không thể kết nối máy chủ. Bản tin chưa được xóa!')
          );
          return;
        }
        console.warn('Delete announcement API failed, fallback MockDB', apiErr);
      }

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
  const tableActionBtnStyle = {
    borderRadius: PS_ROUNDED.full,
    height: 30,
    paddingInline: 8,
    fontSize: 13,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const columns = [
    {
      title: 'TIÊU ĐỀ BẢN TIN',
      key: 'title_info',
      render: (_, record) => (
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
              marginBottom: 4,
            }}
          >
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
                  marginInlineEnd: 0,
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
      width: 165,
      onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
      render: (_, record) => (
        <span
          style={{
            fontWeight: 600,
            color: PS_COLORS.ink,
            fontSize: 13,
            whiteSpace: 'nowrap',
          }}
        >
          {record.author?.full_name || 'Ban Quản Lý'}
        </span>
      ),
    },
    {
      title: 'NGÀY PHÁT HÀNH',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 145,
      onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
      render: (d) => (
        <span
          style={{
            fontSize: 13,
            color: PS_COLORS.muteLight,
            whiteSpace: 'nowrap',
          }}
        >
          {dayjs(d).format('DD/MM/YYYY HH:mm')}
        </span>
      ),
    },
    {
      title: 'THAO TÁC',
      key: 'actions',
      width: 280,
      align: 'right',
      onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
      render: (_, record) => (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 4,
            whiteSpace: 'nowrap',
          }}
        >
          <Button
            type="text"
            size="small"
            icon={<PushpinOutlined />}
            onClick={() => handleTogglePin(record)}
            style={{
              ...tableActionBtnStyle,
              width: 88,
              justifyContent: 'flex-start',
              color: record.is_pinned ? PS_COLORS.primary : PS_COLORS.muteLight,
            }}
          >
            {record.is_pinned ? 'Bỏ ghim' : 'Ghim'}
          </Button>

          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenEdit(record)}
            style={{ ...tableActionBtnStyle, width: 58, fontWeight: 500 }}
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
              size="small"
              danger
              icon={<DeleteOutlined />}
              style={{ ...tableActionBtnStyle, width: 58, fontWeight: 500 }}
            >
              Xóa
            </Button>
          </Popconfirm>

          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            title="Xem chi tiết"
            onClick={() => {
              setSelectedAnnouncement(record);
              setDetailModalOpen(true);
            }}
            style={{
              ...tableActionBtnStyle,
              width: 30,
              paddingInline: 0,
            }}
          />
        </div>
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
            PHÂN HỆ TRUYỀN THÔNG & BẢN TIN TÒA NHÀ
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

        {!IS_MOCK_FALLBACK_ENABLED && backendError && (
          <Alert
            message="Không thể tải dữ liệu từ máy chủ"
            description={backendError}
            type="error"
            showIcon
            action={
              <Button size="small" onClick={reloadData}>
                Thử lại
              </Button>
            }
            style={{ marginBottom: 16, borderRadius: PS_ROUNDED.sm }}
          />
        )}

        {/* Table of Announcements */}
        <Table
          columns={columns}
          dataSource={filteredAnnouncements}
          rowKey="id"
          loading={loading}
          tableLayout="fixed"
          scroll={{ x: 800 }}
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
