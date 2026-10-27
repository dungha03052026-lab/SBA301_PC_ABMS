// src/modules/technician/MyTasks.jsx
// Tuân thủ 100% nguyên tắc thiết kế từ DESIGN-playstation.md:
// - Light Canvas Mode (#f5f7fa layout, #ffffff cards/tables)
// - Typography: Headlines ở weight 300 (light), Form labels 14px/600, Buttons 700 bold
// - Shapes: Inputs 4px (rounded.sm), Cards & Modals 8px (rounded.md), CTAs & Badges 9999px pill (rounded.full)
// - Elevation: Level 0 Flat (boxShadow: none)
// - Nghiệp vụ: UC-16 (Quản lý việc đang nhận & Nhập biên bản kỹ thuật báo hoàn thành)

import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  Space,
  Tag,
  Alert,
  message,
  Rate,
  Image,
} from 'antd';
import {
  ToolOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileDoneOutlined,
  EyeOutlined,
  UserOutlined,
  HomeOutlined,
  PhoneOutlined,
  StarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { MockDB } from '../../shared/constants/mockData';
import { useAuth } from '../../shared/context/AuthContext';
import { PS_COLORS, PS_ROUNDED } from '../../shared/theme/playstationTheme';

const { TextArea } = Input;

const MyTasks = () => {
  const { user } = useAuth();

  // State
  const [tickets, setTickets] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [users, setUsers] = useState([]);

  // Filter
  const [statusFilter, setStatusFilter] = useState('IN_PROGRESS'); // 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'ALL'

  // Modals
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [form] = Form.useForm();

  const reloadData = () => {
    setTickets(MockDB.getTickets());
    setApartments(MockDB.getApartments());
    setUsers(MockDB.getUsers());
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Lọc các ticket thuộc về chính kỹ thuật viên này (UC-16)
  const myTasksList = useMemo(() => {
    const currentTechId = user?.id || 2; // Default tech ID

    return tickets
      .filter((t) => t.assigned_to === currentTechId)
      .map((t) => {
        const apt = apartments.find((a) => a.id === t.apartment_id);
        const resident = users.find((u) => u.id === t.resident_id);
        return {
          ...t,
          apartment: apt,
          resident,
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [tickets, apartments, users, user]);

  // Filtered List
  const filteredTasks = useMemo(() => {
    if (statusFilter === 'ALL') return myTasksList;
    return myTasksList.filter((t) => t.status === statusFilter);
  }, [myTasksList, statusFilter]);

  // Metric counts
  const inProgressCount = myTasksList.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolvedCount = myTasksList.filter((t) => t.status === 'RESOLVED').length;
  const closedCount = myTasksList.filter((t) => t.status === 'CLOSED').length;

  // ==========================================
  // UC-16: BÁO HOÀN THÀNH (RESOLVED)
  // ==========================================
  const handleOpenComplete = (record) => {
    setSelectedTicket(record);
    form.resetFields();
    form.setFieldsValue({
      technician_note: 'Đã kiểm tra, thay thế linh kiện hỏng và chạy thử tải ổn định. Khu vực thi công đã dọn dẹp sạch sẽ.',
    });
    setCompleteModalOpen(true);
  };

  const handleConfirmComplete = async (values) => {
    try {
      const updated = tickets.map((t) =>
        t.id === selectedTicket.id
          ? {
              ...t,
              status: 'RESOLVED', // Chuyển sang chờ cư dân nghiệm thu
              technician_note: values.technician_note.trim(),
              resolved_at: new Date().toISOString(),
            }
          : t
      );

      MockDB.saveTickets(updated);
      message.success(`Đã gửi biên bản hoàn thành sự cố ${selectedTicket.ticket_code}! Đang chờ cư dân nghiệm thu.`);

      setCompleteModalOpen(false);
      reloadData();
    } catch {
      message.error('Lỗi khi báo hoàn thành sự cố!');
    }
  };

  // Helper render Category
  const renderCategoryTag = (cat) => {
    if (cat === 'ELECTRIC') {
      return (
        <Tag color="gold" style={{ borderRadius: PS_ROUNDED.full, padding: '2px 10px', fontWeight: 600 }}>
          ⚡ Điện sinh hoạt
        </Tag>
      );
    }
    if (cat === 'PLUMBING') {
      return (
        <Tag color="cyan" style={{ borderRadius: PS_ROUNDED.full, padding: '2px 10px', fontWeight: 600 }}>
          💧 Nước sinh hoạt
        </Tag>
      );
    }
    return (
      <Tag style={{ borderRadius: PS_ROUNDED.full, padding: '2px 10px', fontWeight: 600 }}>
        Khác
      </Tag>
    );
  };

  // ==========================================
  // TABLE COLUMNS DEFINITION
  // ==========================================
  const columns = [
    {
      title: 'MÃ PHIẾU / TIÊU ĐỀ',
      key: 'ticket_info',
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontWeight: 700, color: PS_COLORS.ink, fontSize: 15 }}>
              {record.ticket_code}
            </span>
            {renderCategoryTag(record.category)}
          </div>
          <span style={{ fontWeight: 600, color: PS_COLORS.ink, display: 'block', fontSize: 14 }}>
            {record.title}
          </span>
          <span style={{ fontSize: 12, color: PS_COLORS.muteLight }}>
            Nhận việc lúc: {dayjs(record.created_at).format('DD/MM/YYYY HH:mm')}
          </span>
        </div>
      ),
    },
    {
      title: 'ĐỊA CHỈ & LIÊN HỆ CƯ DÂN',
      key: 'contact',
      width: 280,
      render: (_, record) => (
        <div>
          <span style={{ fontWeight: 700, color: PS_COLORS.ink, display: 'block' }}>
            <HomeOutlined style={{ marginRight: 6, color: PS_COLORS.primary }} />
            Căn hộ {record.apartment?.room_number || '—'} ({record.apartment?.building_block} • Tầng {record.apartment?.floor})
          </span>
          <span style={{ fontSize: 13, color: PS_COLORS.muteLight }}>
            Chủ hộ: <strong>{record.resident?.full_name || '—'}</strong>
            <br />
            <PhoneOutlined style={{ marginRight: 4, color: PS_COLORS.primary }} />
            SĐT: <strong>{record.resident?.phone_number || '—'}</strong>
          </span>
        </div>
      ),
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: (status, record) => {
        if (status === 'IN_PROGRESS') {
          return (
            <Tag color="processing" style={{ borderRadius: PS_ROUNDED.full, padding: '2px 12px', fontWeight: 600 }}>
              <ToolOutlined /> Đang xử lý
            </Tag>
          );
        }
        if (status === 'RESOLVED') {
          return (
            <Tag color="warning" style={{ borderRadius: PS_ROUNDED.full, padding: '2px 12px', fontWeight: 600 }}>
              <ClockCircleOutlined /> Chờ nghiệm thu
            </Tag>
          );
        }
        return (
          <Tag color="success" style={{ borderRadius: PS_ROUNDED.full, padding: '2px 12px', fontWeight: 600 }}>
            <CheckCircleOutlined /> Đã xong ({record.rating}★)
          </Tag>
        );
      },
    },
    {
      title: 'THAO TÁC',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space size="small">
          {record.status === 'IN_PROGRESS' ? (
            <Button
              type="primary"
              icon={<FileDoneOutlined />}
              onClick={() => handleOpenComplete(record)}
              className="ps-btn-primary"
              style={{
                height: 36,
                padding: '0 18px',
                fontSize: 13,
                borderRadius: PS_ROUNDED.full,
              }}
            >
              Báo hoàn thành
            </Button>
          ) : (
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedTicket(record);
                setDetailModalOpen(true);
              }}
              style={{
                height: 36,
                borderRadius: PS_ROUNDED.full,
                fontSize: 13,
                borderColor: PS_COLORS.ashLight,
              }}
            >
              Xem chi tiết
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* ====================================================================
          PAGE HEADER: PlayStation signature light 300 typography
          ==================================================================== */}
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
          CỔNG KỸ THUẬT VIÊN • CÔNG VIỆC CỦA TÔI (UC-16)
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
          Danh sách Công việc Đang phụ trách
        </h1>

        <p
          className="ps-body-sm"
          style={{ color: PS_COLORS.bodyLight, margin: 0, maxWidth: 800 }}
        >
          Quản lý các sự cố đã tiếp nhận hoặc được Ban Quản Lý chỉ định phân công. Nhập biên bản
          xử lý kỹ thuật sau khi hoàn tất để bàn giao nghiệm thu tới cư dân.
        </p>
      </div>

      {/* ====================================================================
          METRICS STRIP: 3 Flat Level 0 Stat Cards (8px radius, no shadow)
          ==================================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20,
        }}
      >
        <div
          style={{
            backgroundColor: PS_COLORS.canvasLight,
            borderRadius: PS_ROUNDED.md,
            border: `1px solid ${inProgressCount > 0 ? PS_COLORS.primary : PS_COLORS.hairlineLight}`,
            padding: '20px 24px',
            boxShadow: 'none',
          }}
        >
          <span style={{ fontSize: 13, color: PS_COLORS.primary, fontWeight: 600 }}>
            VIỆC ĐANG XỬ LÝ (IN PROGRESS)
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
            {inProgressCount}
          </div>
          <span style={{ fontSize: 12, color: PS_COLORS.muteLight }}>
            Cần có mặt kiểm tra sửa chữa
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
          <span style={{ fontSize: 13, color: '#fa8c16', fontWeight: 600 }}>
            CHỜ CƯ DÂN NGHIỆM THU (RESOLVED)
          </span>
          <div
            className="ps-display-md"
            style={{
              fontWeight: 300,
              color: '#fa8c16',
              marginTop: 4,
              lineHeight: 1.2,
            }}
          >
            {resolvedCount}
          </div>
          <span style={{ fontSize: 12, color: PS_COLORS.muteLight }}>
            Đã gửi biên bản xử lý
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
          <span style={{ fontSize: 13, color: '#52c41a', fontWeight: 600 }}>
            ĐÃ NGHIỆM THU HOÀN TẤT (CLOSED)
          </span>
          <div
            className="ps-display-md"
            style={{
              fontWeight: 300,
              color: '#52c41a',
              marginTop: 4,
              lineHeight: 1.2,
            }}
          >
            {closedCount}
          </div>
          <span style={{ fontSize: 12, color: PS_COLORS.muteLight }}>
            Đã có đánh giá chất lượng từ cư dân
          </span>
        </div>
      </div>

      {/* ====================================================================
          MAIN CARD: Status Filter Pills + Tasks Table
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
        {/* Status Filter Pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          <button
            type="button"
            className={`ps-filter-pill ${statusFilter === 'IN_PROGRESS' ? 'active' : ''}`}
            onClick={() => setStatusFilter('IN_PROGRESS')}
          >
            Đang sửa chữa ({inProgressCount})
          </button>
          <button
            type="button"
            className={`ps-filter-pill ${statusFilter === 'RESOLVED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('RESOLVED')}
          >
            Chờ nghiệm thu ({resolvedCount})
          </button>
          <button
            type="button"
            className={`ps-filter-pill ${statusFilter === 'CLOSED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('CLOSED')}
          >
            Đã nghiệm thu ({closedCount})
          </button>
          <button
            type="button"
            className={`ps-filter-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            Tất cả ({myTasksList.length})
          </button>
        </div>

        {/* Table of Tasks */}
        <Table
          columns={columns}
          dataSource={filteredTasks}
          rowKey="id"
          pagination={{ pageSize: 6, showSizeChanger: false }}
          locale={{ emptyText: 'Không có công việc nào trong danh mục này' }}
        />
      </div>

      {/* ====================================================================
          MODAL: NHẬP BIÊN BẢN BÁO HOÀN THÀNH (UC-16)
          ==================================================================== */}
      <Modal
        title={
          <div>
            <span className="ps-heading-lg" style={{ fontWeight: 300, color: PS_COLORS.ink, display: 'block' }}>
              Biên bản Báo hoàn thành Xử lý Sự cố (UC-16)
            </span>
            <span style={{ fontSize: 14, color: PS_COLORS.primary, fontWeight: 600 }}>
              Sự cố: {selectedTicket?.ticket_code} — {selectedTicket?.title}
            </span>
          </div>
        }
        open={completeModalOpen}
        onCancel={() => setCompleteModalOpen(false)}
        footer={null}
        destroyOnClose
        style={{ borderRadius: PS_ROUNDED.md }}
      >
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: PS_COLORS.surfaceCard,
              borderRadius: PS_ROUNDED.md,
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: PS_COLORS.muteLight }}>Căn hộ:</span>
              <span style={{ fontWeight: 700, color: PS_COLORS.ink }}>
                {selectedTicket?.apartment?.room_number} ({selectedTicket?.apartment?.building_block})
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: PS_COLORS.muteLight }}>Cư dân:</span>
              <span style={{ fontWeight: 600, color: PS_COLORS.ink }}>
                {selectedTicket?.resident?.full_name} ({selectedTicket?.resident?.phone_number})
              </span>
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleConfirmComplete}
            requiredMark={false}
          >
            <Form.Item
              label={<span style={{ fontWeight: 600, color: PS_COLORS.ink }}>Biên bản xử lý kỹ thuật (Bắt buộc)</span>}
              name="technician_note"
              rules={[{ required: true, message: 'Vui lòng nhập nội dung công việc và linh kiện đã xử lý!' }]}
            >
              <TextArea
                rows={5}
                placeholder="Ghi rõ các hạng mục đã kiểm tra, linh kiện thay thế mới và kết quả thử tải an toàn..."
                style={{ borderRadius: PS_ROUNDED.sm }}
              />
            </Form.Item>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <Button
                onClick={() => setCompleteModalOpen(false)}
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
                Gửi biên bản hoàn thành
              </Button>
            </div>
          </Form>
        </div>
      </Modal>

      {/* ====================================================================
          MODAL: CHI TIẾT SỰ CỐ & ĐÁNH GIÁ CỦA CƯ DÂN
          ==================================================================== */}
      <Modal
        title={
          <span className="ps-heading-lg" style={{ fontWeight: 300, color: PS_COLORS.ink }}>
            Chi tiết Công việc & Đánh giá Nghiệm thu
          </span>
        }
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        destroyOnClose
        style={{ borderRadius: PS_ROUNDED.md }}
      >
        {selectedTicket && (
          <div style={{ marginTop: 16 }}>
            <div
              style={{
                padding: '16px 20px',
                backgroundColor: PS_COLORS.surfaceCard,
                borderRadius: PS_ROUNDED.md,
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: PS_COLORS.muteLight }}>Mã sự cố:</span>
                <span style={{ fontWeight: 700, color: PS_COLORS.ink }}>
                  {selectedTicket.ticket_code}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: PS_COLORS.muteLight }}>Căn hộ:</span>
                <span style={{ fontWeight: 700, color: PS_COLORS.ink }}>
                  {selectedTicket.apartment?.room_number} ({selectedTicket.apartment?.building_block})
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PS_COLORS.muteLight }}>Trạng thái:</span>
                <Tag color={selectedTicket.status === 'CLOSED' ? 'green' : 'orange'}>
                  {selectedTicket.status === 'CLOSED' ? 'Đã nghiệm thu' : 'Chờ nghiệm thu'}
                </Tag>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <span style={{ display: 'block', fontWeight: 600, color: PS_COLORS.ink, marginBottom: 4 }}>
                Mô tả hiện tượng ban đầu từ cư dân:
              </span>
              <p style={{ margin: 0, padding: '10px 14px', backgroundColor: '#f9f9f9', borderRadius: PS_ROUNDED.sm, color: PS_COLORS.bodyLight }}>
                {selectedTicket.description}
              </p>
            </div>

            {selectedTicket.image_url && (
              <div style={{ marginBottom: 20 }}>
                <span style={{ display: 'block', fontWeight: 600, color: PS_COLORS.ink, marginBottom: 6 }}>
                  Ảnh hiện trường cư dân gửi:
                </span>
                <Image
                  src={selectedTicket.image_url}
                  alt="Hiện trường"
                  style={{ maxHeight: 200, borderRadius: PS_ROUNDED.sm }}
                />
              </div>
            )}

            {selectedTicket.technician_note && (
              <div
                style={{
                  padding: '14px 18px',
                  backgroundColor: 'rgba(0, 112, 209, 0.05)',
                  borderRadius: PS_ROUNDED.md,
                  borderLeft: `4px solid ${PS_COLORS.primary}`,
                  marginBottom: 20,
                }}
              >
                <span style={{ display: 'block', fontWeight: 700, color: PS_COLORS.primary, marginBottom: 4 }}>
                  Biên bản xử lý kỹ thuật của bạn:
                </span>
                <p style={{ margin: 0, color: PS_COLORS.ink }}>
                  {selectedTicket.technician_note}
                </p>
              </div>
            )}

            {selectedTicket.rating && (
              <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#fafafa', borderRadius: PS_ROUNDED.md, marginBottom: 24 }}>
                <span style={{ display: 'block', fontWeight: 600, color: PS_COLORS.ink, marginBottom: 6 }}>
                  Đánh giá nghiệm thu của Cư dân:
                </span>
                <Rate disabled defaultValue={selectedTicket.rating} style={{ fontSize: 28 }} />
                {selectedTicket.resident_feedback && (
                  <p style={{ fontStyle: 'italic', color: PS_COLORS.bodyLight, marginTop: 8, marginBottom: 0 }}>
                    "{selectedTicket.resident_feedback}"
                  </p>
                )}
              </div>
            )}

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

export default MyTasks;
