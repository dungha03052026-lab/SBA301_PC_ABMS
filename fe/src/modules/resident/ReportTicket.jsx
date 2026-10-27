// src/modules/resident/ReportTicket.jsx
// Tuân thủ 100% nguyên tắc thiết kế từ DESIGN-playstation.md:
// - Light Canvas Mode (#f5f7fa layout, #ffffff cards/tables)
// - Typography: Headlines ở weight 300 (light), Form labels 14px/600, Buttons 700 bold
// - Shapes: Inputs 4px (rounded.sm), Cards & Modals 8px (rounded.md), CTAs & Badges 9999px pill (rounded.full)
// - Elevation: Level 0 Flat (boxShadow: none)
// - Nghiệp vụ: UC-13 (Tạo phiếu báo hỏng), UC-17 (Nghiệm thu đánh giá 1-5 sao hoặc yêu cầu làm lại)

import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Modal,
  Form,
  Space,
  Tag,
  Alert,
  message,
  Rate,
  Radio,
  Image,
  Steps,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  StarOutlined,
  UndoOutlined,
  EyeOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { MockDB } from '../../shared/constants/mockData';
import { useAuth } from '../../shared/context/AuthContext';
import { useApartment } from '../../shared/context/ApartmentContext';
import { PS_COLORS, PS_ROUNDED } from '../../shared/theme/playstationTheme';

const { TextArea } = Input;

const ReportTicket = () => {
  const { user } = useAuth();
  const { selectedApartmentId, apartments } = useApartment();

  // State
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Forms
  const [createForm] = Form.useForm();
  const [reviewForm] = Form.useForm();

  const reloadData = () => {
    setTickets(MockDB.getTickets());
    setUsers(MockDB.getUsers());
  };

  useEffect(() => {
    reloadData();
  }, [selectedApartmentId]);

  // Current active apartment
  const currentApartment = useMemo(() => {
    return apartments.find((a) => a.id === selectedApartmentId) || apartments[0];
  }, [apartments, selectedApartmentId]);

  // Filter tickets by selectedApartmentId
  const myApartmentTickets = useMemo(() => {
    if (!selectedApartmentId) return [];
    return tickets
      .filter((t) => t.apartment_id === selectedApartmentId)
      .map((t) => {
        const technician = users.find((u) => u.id === t.assigned_to);
        return {
          ...t,
          technician,
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [tickets, selectedApartmentId, users]);

  // Metrics
  const totalCount = myApartmentTickets.length;
  const inProgressCount = myApartmentTickets.filter((t) => ['OPEN', 'IN_PROGRESS'].includes(t.status)).length;
  const resolvedCount = myApartmentTickets.filter((t) => t.status === 'RESOLVED').length;
  const closedCount = myApartmentTickets.filter((t) => t.status === 'CLOSED').length;

  // ==========================================
  // UC-13: TẠO PHIẾU BÁO HỎNG SỰ CỐ
  // ==========================================
  const handleOpenCreate = () => {
    createForm.resetFields();
    createForm.setFieldsValue({
      category: 'ELECTRIC',
    });
    setCreateModalOpen(true);
  };

  const handleCreateTicket = async (values) => {
    try {
      const yearMonth = dayjs().format('YYYYMM');
      const seq = String(tickets.length + 1).padStart(3, '0');
      const ticketCode = `TCK-${yearMonth}-${seq}`;

      const newTicket = {
        id: tickets.length > 0 ? Math.max(...tickets.map((t) => t.id)) + 1 : 1,
        ticket_code: ticketCode,
        apartment_id: selectedApartmentId,
        resident_id: user?.id || 3,
        category: values.category,
        title: values.title.trim(),
        description: values.description.trim(),
        image_url: values.image_url?.trim() || '',
        status: 'OPEN', // Trạng thái ban đầu
        assigned_to: null,
        technician_note: null,
        rating: null,
        created_at: new Date().toISOString(),
        resolved_at: null,
      };

      const updated = [newTicket, ...tickets];
      MockDB.saveTickets(updated);

      message.success(`Đã gửi phiếu báo hỏng ${newTicket.ticket_code} tới Ban Quản Lý và Đội Kỹ thuật!`);
      setCreateModalOpen(false);
      reloadData();
    } catch {
      message.error('Lỗi khi gửi phiếu báo hỏng!');
    }
  };

  // ==========================================
  // UC-17: NGHIỆM THU ĐÁNH GIÁ (RESOLVED -> CLOSED)
  // ==========================================
  const handleOpenReview = (record) => {
    setSelectedTicket(record);
    reviewForm.resetFields();
    reviewForm.setFieldsValue({
      rating: 5,
      feedback: 'Kỹ thuật viên xử lý nhanh chóng, thái độ nhiệt tình.',
    });
    setReviewModalOpen(true);
  };

  const handleConfirmReview = async (values) => {
    try {
      const updated = tickets.map((t) =>
        t.id === selectedTicket.id
          ? {
              ...t,
              status: 'CLOSED', // Nghiệm thu hoàn tất
              rating: values.rating,
              resident_feedback: values.feedback?.trim() || '',
            }
          : t
      );

      MockDB.saveTickets(updated);
      message.success(`Cảm ơn bạn đã nghiệm thu và đánh giá ${values.rating} sao cho kỹ thuật viên!`);
      setReviewModalOpen(false);
      reloadData();
    } catch {
      message.error('Lỗi khi nghiệm thu sự cố!');
    }
  };

  // UC-17: Yêu cầu làm lại (RESOLVED -> IN_PROGRESS)
  const handleRequestRework = (ticketId) => {
    try {
      const updated = tickets.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: 'IN_PROGRESS', // Đẩy lại thợ sửa tiếp
              technician_note: `${t.technician_note || ''} [Cư dân yêu cầu làm lại vì chưa triệt để]`,
            }
          : t
      );

      MockDB.saveTickets(updated);
      message.warning('Đã gửi phản hồi yêu cầu kỹ thuật viên tiếp tục kiểm tra và xử lý lại.');
      reloadData();
    } catch {
      message.error('Lỗi khi gửi yêu cầu làm lại!');
    }
  };

  // Helper render Category Tag
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
            Tạo ngày: {dayjs(record.created_at).format('DD/MM/YYYY HH:mm')}
          </span>
        </div>
      ),
    },
    {
      title: 'KỸ THUẬT PHỤ TRÁCH',
      key: 'technician',
      width: 200,
      render: (_, record) => {
        if (record.technician) {
          return (
            <div>
              <span style={{ fontWeight: 600, color: PS_COLORS.primary, display: 'block' }}>
                🔧 {record.technician.full_name}
              </span>
              <span style={{ fontSize: 12, color: PS_COLORS.muteLight }}>
                SĐT: {record.technician.phone_number}
              </span>
            </div>
          );
        }
        return (
          <span style={{ color: PS_COLORS.muteLight, fontStyle: 'italic', fontSize: 13 }}>
            Đang điều phối thợ...
          </span>
        );
      },
    },
    {
      title: 'TRẠNG THÁI TIẾN ĐỘ',
      dataIndex: 'status',
      key: 'status',
      width: 200,
      render: (status, record) => {
        if (status === 'OPEN') {
          return (
            <Tag color="default" style={{ borderRadius: PS_ROUNDED.full, padding: '2px 12px', fontWeight: 600 }}>
              <ClockCircleOutlined /> Đang chờ thợ nhận việc
            </Tag>
          );
        }
        if (status === 'IN_PROGRESS') {
          return (
            <Tag color="processing" style={{ borderRadius: PS_ROUNDED.full, padding: '2px 12px', fontWeight: 600 }}>
              <ToolOutlined /> Đang kiểm tra sửa chữa
            </Tag>
          );
        }
        if (status === 'RESOLVED') {
          return (
            <Tag color="warning" style={{ borderRadius: PS_ROUNDED.full, padding: '2px 12px', fontWeight: 600 }}>
              ★ Thợ báo xong • Chờ nghiệm thu
            </Tag>
          );
        }
        return (
          <Tag color="success" style={{ borderRadius: PS_ROUNDED.full, padding: '2px 12px', fontWeight: 600 }}>
            <CheckCircleOutlined /> Đã nghiệm thu ({record.rating}★)
          </Tag>
        );
      },
    },
    {
      title: 'THAO TÁC',
      key: 'action',
      width: 260,
      render: (_, record) => {
        // Trạng thái RESOLVED: Hiện nút Nghiệm thu & Nút Yêu cầu làm lại
        if (record.status === 'RESOLVED') {
          return (
            <Space size="small">
              <Button
                type="primary"
                icon={<StarOutlined />}
                onClick={() => handleOpenReview(record)}
                className="ps-btn-primary"
                style={{
                  height: 36,
                  padding: '0 16px',
                  fontSize: 13,
                  borderRadius: PS_ROUNDED.full,
                }}
              >
                Nghiệm thu
              </Button>

              <Popconfirm
                title="Sự cố chưa hết?"
                description="Hệ thống sẽ chuyển trạng thái quay lại để thợ tiếp tục xử lý."
                onConfirm={() => handleRequestRework(record.id)}
                okText="Yêu cầu làm lại"
                cancelText="Hủy"
              >
                <Button
                  danger
                  icon={<UndoOutlined />}
                  style={{
                    height: 36,
                    padding: '0 12px',
                    fontSize: 13,
                    borderRadius: PS_ROUNDED.full,
                  }}
                >
                  Làm lại
                </Button>
              </Popconfirm>

              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => {
                  setSelectedTicket(record);
                  setDetailModalOpen(true);
                }}
                style={{ borderRadius: PS_ROUNDED.full }}
              />
            </Space>
          );
        }

        return (
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
              borderColor: PS_COLORS.ashLight,
              fontSize: 13,
            }}
          >
            Xem tiến trình
          </Button>
        );
      },
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
            CỔNG DỊCH VỤ CƯ DÂN • BẢO TRÌ SỰ CỐ (UC-13 • UC-17)
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
            Báo hỏng Sự cố Căn hộ {currentApartment?.room_number}
          </h1>

          <p
            className="ps-body-sm"
            style={{ color: PS_COLORS.bodyLight, margin: 0, maxWidth: 780 }}
          >
            Gửi yêu cầu sửa chữa điện, nước hoặc sự cố kỹ thuật trong căn hộ. Kỹ thuật viên tòa nhà
            sẽ tiếp nhận xử lý trong vòng 24 giờ. Cư dân trực tiếp nghiệm thu và đánh giá chất lượng.
          </p>
        </div>

        {/* Primary Action Button: Universal PlayStation CTA Pill (#0070d1, 9999px) */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenCreate}
          className="ps-btn-primary"
          style={{
            height: 48,
            padding: '0 28px',
            borderRadius: PS_ROUNDED.full,
          }}
        >
          Tạo phiếu báo hỏng
        </Button>
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
            border: `1px solid ${PS_COLORS.hairlineLight}`,
            padding: '20px 24px',
            boxShadow: 'none',
          }}
        >
          <span style={{ fontSize: 13, color: PS_COLORS.muteLight, fontWeight: 500 }}>
            TỔNG SỐ PHIẾU BÁO HỎNG
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
            Lịch sử yêu cầu của căn hộ
          </span>
        </div>

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
            ĐANG TIẾP NHẬN / SỬA CHỮA
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
            Thợ đang hỗ trợ xử lý
          </span>
        </div>

        <div
          style={{
            backgroundColor: PS_COLORS.canvasLight,
            borderRadius: PS_ROUNDED.md,
            border: `1px solid ${resolvedCount > 0 ? '#fa8c16' : PS_COLORS.hairlineLight}`,
            padding: '20px 24px',
            boxShadow: 'none',
          }}
        >
          <span style={{ fontSize: 13, color: resolvedCount > 0 ? '#fa8c16' : '#52c41a', fontWeight: 600 }}>
            {resolvedCount > 0 ? '★ CẦN NGHIỆM THU NGAY' : 'ĐÃ NGHIỆM THU XONG'}
          </span>
          <div
            className="ps-display-md"
            style={{
              fontWeight: 300,
              color: resolvedCount > 0 ? '#fa8c16' : '#52c41a',
              marginTop: 4,
              lineHeight: 1.2,
            }}
          >
            {resolvedCount > 0 ? `${resolvedCount} phiếu` : `${closedCount} phiếu`}
          </div>
          <span style={{ fontSize: 12, color: PS_COLORS.muteLight }}>
            {resolvedCount > 0 ? 'Thợ đã làm xong, chờ bạn chấm điểm' : 'Tất cả sự cố đã đóng an toàn'}
          </span>
        </div>
      </div>

      {/* ====================================================================
          MAIN CARD: Tickets Table
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
        <div style={{ marginBottom: 20 }}>
          <h2 className="ps-heading-md" style={{ color: PS_COLORS.ink, margin: 0, fontWeight: 600 }}>
            Tiến trình Sự cố Căn hộ {currentApartment?.room_number}
          </h2>
          <span style={{ fontSize: 13, color: PS_COLORS.muteLight }}>
            Theo dõi trạng thái thời gian thực từ lúc báo hỏng đến khi nghiệm thu đóng phiếu
          </span>
        </div>

        <Table
          columns={columns}
          dataSource={myApartmentTickets}
          rowKey="id"
          pagination={{ pageSize: 6, showSizeChanger: false }}
          locale={{ emptyText: 'Căn hộ hiện tại không có sự cố nào' }}
        />
      </div>

      {/* ====================================================================
          MODAL: TẠO PHIẾU BÁO HỎNG (UC-13)
          ==================================================================== */}
      <Modal
        title={
          <div>
            <span className="ps-heading-lg" style={{ fontWeight: 300, color: PS_COLORS.ink, display: 'block' }}>
              Tạo Phiếu Báo hỏng Sự cố (UC-13)
            </span>
            <span style={{ fontSize: 14, color: PS_COLORS.primary, fontWeight: 600 }}>
              Căn hộ: {currentApartment?.room_number} ({currentApartment?.building_block})
            </span>
          </div>
        }
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={null}
        destroyOnClose
        style={{ borderRadius: PS_ROUNDED.md }}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateTicket}
          style={{ marginTop: 20 }}
          requiredMark={false}
        >
          <Form.Item
            label={<span style={{ fontWeight: 600, color: PS_COLORS.ink }}>Phân loại sự cố</span>}
            name="category"
            rules={[{ required: true, message: 'Vui lòng chọn loại sự cố!' }]}
          >
            <Radio.Group style={{ width: '100%' }}>
              <Radio.Button value="ELECTRIC" style={{ width: '33.33%', textAlign: 'center' }}>
                ⚡ Điện sinh hoạt
              </Radio.Button>
              <Radio.Button value="PLUMBING" style={{ width: '33.33%', textAlign: 'center' }}>
                💧 Nước sinh hoạt
              </Radio.Button>
              <Radio.Button value="OTHER" style={{ width: '33.33%', textAlign: 'center' }}>
                Khác
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: 600, color: PS_COLORS.ink }}>Tiêu đề sự cố</span>}
            name="title"
            rules={[{ required: true, message: 'Nhập tiêu đề ngắn gọn về sự cố!' }]}
          >
            <Input
              placeholder="VD: Rò rỉ nước bồn rửa bát, Chập aptomat..."
              style={{ height: 44, borderRadius: PS_ROUNDED.sm }}
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: 600, color: PS_COLORS.ink }}>Mô tả chi tiết tình trạng</span>}
            name="description"
            rules={[{ required: true, message: 'Mô tả chi tiết để thợ chuẩn bị dụng cụ!' }]}
          >
            <TextArea
              rows={4}
              placeholder="Mô tả cụ thể vị trí, hiện tượng phát sinh để kỹ thuật viên chuẩn bị vật tư thay thế phù hợp..."
              style={{ borderRadius: PS_ROUNDED.sm }}
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: 600, color: PS_COLORS.ink }}>Link hình ảnh hiện trường (Tùy chọn)</span>}
            name="image_url"
          >
            <Input
              placeholder="Dán link ảnh hiện trường (hoặc để trống)..."
              style={{ height: 44, borderRadius: PS_ROUNDED.sm }}
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button
              onClick={() => setCreateModalOpen(false)}
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
              Gửi yêu cầu sửa chữa
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ====================================================================
          MODAL: NGHIỆM THU & CHẤM SAO ĐÁNH GIÁ (UC-17)
          ==================================================================== */}
      <Modal
        title={
          <span className="ps-heading-lg" style={{ fontWeight: 300, color: PS_COLORS.ink }}>
            Nghiệm thu & Đánh giá Chất lượng (UC-17)
          </span>
        }
        open={reviewModalOpen}
        onCancel={() => setReviewModalOpen(false)}
        footer={null}
        destroyOnClose
        style={{ borderRadius: PS_ROUNDED.md }}
      >
        {selectedTicket && (
          <div style={{ marginTop: 16 }}>
            {/* Biên bản xử lý của kỹ thuật viên */}
            <div
              style={{
                padding: '16px 20px',
                backgroundColor: 'rgba(0, 112, 209, 0.05)',
                borderRadius: PS_ROUNDED.md,
                borderLeft: `4px solid ${PS_COLORS.primary}`,
                marginBottom: 24,
              }}
            >
              <span style={{ display: 'block', fontWeight: 700, color: PS_COLORS.primary, marginBottom: 4 }}>
                Biên bản bàn giao của Thợ ({selectedTicket.technician?.full_name}):
              </span>
              <p style={{ margin: 0, color: PS_COLORS.ink, fontSize: 14 }}>
                {selectedTicket.technician_note || 'Đã kiểm tra, thay thế linh kiện và hoàn tất sửa chữa an toàn.'}
              </p>
            </div>

            <Form
              form={reviewForm}
              layout="vertical"
              onFinish={handleConfirmReview}
              requiredMark={false}
            >
              <Form.Item
                label={<span style={{ fontWeight: 600, color: PS_COLORS.ink }}>Mức độ hài lòng của bạn</span>}
                name="rating"
                rules={[{ required: true, message: 'Vui lòng chọn số sao đánh giá!' }]}
                style={{ textAlign: 'center' }}
              >
                <Rate style={{ fontSize: 32 }} />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontWeight: 600, color: PS_COLORS.ink }}>Ý kiến phản hồi / Góp ý (Tùy chọn)</span>}
                name="feedback"
              >
                <TextArea
                  rows={3}
                  placeholder="Nhập cảm nhận của bạn về thời gian đáp ứng và thái độ của kỹ thuật viên..."
                  style={{ borderRadius: PS_ROUNDED.sm }}
                />
              </Form.Item>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <Button
                  onClick={() => setReviewModalOpen(false)}
                  style={{ height: 44, borderRadius: PS_ROUNDED.full, padding: '0 24px' }}
                >
                  Đóng
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="ps-btn-primary"
                  style={{ height: 44, borderRadius: PS_ROUNDED.full, padding: '0 28px' }}
                >
                  Xác nhận Nghiệm thu
                </Button>
              </div>
            </Form>
          </div>
        )}
      </Modal>

      {/* ====================================================================
          MODAL: XEM CHI TIẾT TIẾN TRÌNH SỰ CỐ
          ==================================================================== */}
      <Modal
        title={
          <span className="ps-heading-lg" style={{ fontWeight: 300, color: PS_COLORS.ink }}>
            Tiến trình Xử lý Sự cố • {selectedTicket?.ticket_code}
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
            {/* Steps Progress */}
            <div style={{ marginBottom: 28, padding: '16px 0' }}>
              <Steps
                current={
                  selectedTicket.status === 'OPEN'
                    ? 0
                    : selectedTicket.status === 'IN_PROGRESS'
                    ? 1
                    : selectedTicket.status === 'RESOLVED'
                    ? 2
                    : 3
                }
                items={[
                  { title: 'Tiếp nhận' },
                  { title: 'Đang sửa' },
                  { title: 'Báo xong' },
                  { title: 'Nghiệm thu' },
                ]}
              />
            </div>

            <div
              style={{
                padding: '16px 20px',
                backgroundColor: PS_COLORS.surfaceCard,
                borderRadius: PS_ROUNDED.md,
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: PS_COLORS.muteLight }}>Tiêu đề:</span>
                <span style={{ fontWeight: 700, color: PS_COLORS.ink }}>
                  {selectedTicket.title}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: PS_COLORS.muteLight }}>Phân loại:</span>
                <span>{renderCategoryTag(selectedTicket.category)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PS_COLORS.muteLight }}>Kỹ thuật viên:</span>
                <span style={{ fontWeight: 600, color: PS_COLORS.primary }}>
                  {selectedTicket.technician?.full_name || 'Đang chờ phân công'}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <span style={{ display: 'block', fontWeight: 600, color: PS_COLORS.ink, marginBottom: 4 }}>
                Mô tả hiện tượng:
              </span>
              <p style={{ margin: 0, padding: '10px 14px', backgroundColor: '#f9f9f9', borderRadius: PS_ROUNDED.sm, color: PS_COLORS.bodyLight }}>
                {selectedTicket.description}
              </p>
            </div>

            {selectedTicket.image_url && (
              <div style={{ marginBottom: 20 }}>
                <span style={{ display: 'block', fontWeight: 600, color: PS_COLORS.ink, marginBottom: 6 }}>
                  Hình ảnh đính kèm:
                </span>
                <Image
                  src={selectedTicket.image_url}
                  alt="Ảnh sự cố"
                  style={{ maxHeight: 200, borderRadius: PS_ROUNDED.sm }}
                />
              </div>
            )}

            {selectedTicket.technician_note && (
              <div style={{ marginBottom: 20, padding: '12px 16px', backgroundColor: 'rgba(0, 112, 209, 0.05)', borderRadius: PS_ROUNDED.sm }}>
                <span style={{ display: 'block', fontWeight: 700, color: PS_COLORS.primary, marginBottom: 4 }}>
                  Ghi chú sửa chữa của thợ:
                </span>
                <p style={{ margin: 0, color: PS_COLORS.ink }}>
                  {selectedTicket.technician_note}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
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

export default ReportTicket;
