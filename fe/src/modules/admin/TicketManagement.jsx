// src/modules/admin/TicketManagement.jsx
// Tuân thủ 100% nguyên tắc thiết kế từ DESIGN-playstation.md:
// - Light Canvas Mode (#f5f7fa layout, #ffffff cards/tables)
// - Typography: Headlines ở weight 300 (light), Form labels 14px/600, Buttons 700 bold
// - Shapes: Inputs 4px (rounded.sm), Cards & Modals 8px (rounded.md), CTAs & Badges 9999px pill (rounded.full)
// - Elevation: Level 0 Flat (boxShadow: none)
// - Nghiệp vụ: UC-18 (Giám sát sự cố & Cưỡng bức chỉ định thợ khi quá hạn > 24h - BR-07)

import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Modal,
  Space,
  Tag,
  Alert,
  message,
  Rate,
  Image,
} from 'antd';
import {
  SearchOutlined,
  ToolOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { MockDB } from '../../shared/constants/mockData';
import { PS_COLORS, PS_ROUNDED } from '../../shared/theme/playstationTheme';

const TicketManagement = () => {
  // State
  const [tickets, setTickets] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [users, setUsers] = useState([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'OVERDUE' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedTechId, setSelectedTechId] = useState(null);

  const reloadData = () => {
    setTickets(MockDB.getTickets());
    setApartments(MockDB.getApartments());
    setUsers(MockDB.getUsers());
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Map tickets with apartment, resident and technician
  const enrichedTickets = useMemo(() => {
    const now = Date.now();

    return tickets.map((t) => {
      const apt = apartments.find((a) => a.id === t.apartment_id);
      const resident = users.find((u) => u.id === t.resident_id);
      const technician = users.find((u) => u.id === t.assigned_to);

      // BR-07: Tính quá hạn > 24h nếu trạng thái OPEN
      const createdTime = new Date(t.created_at).getTime();
      const diffHours = (now - createdTime) / (1000 * 60 * 60);
      const isOverdue = t.status === 'OPEN' && diffHours > 24;

      return {
        ...t,
        apartment: apt,
        resident,
        technician,
        diffHours: Math.round(diffHours),
        isOverdue,
      };
    });
  }, [tickets, apartments, users]);

  // Filtered List
  const filteredTickets = useMemo(() => {
    return enrichedTickets.filter((t) => {
      // Status & Overdue Filter
      let matchStatus = true;
      if (statusFilter === 'OVERDUE') {
        matchStatus = t.isOverdue;
      } else if (statusFilter !== 'ALL') {
        matchStatus = t.status === statusFilter;
      }

      const matchCategory = categoryFilter === 'ALL' || t.category === categoryFilter;

      const codeMatch = t.ticket_code.toLowerCase().includes(searchKeyword.trim().toLowerCase());
      const titleMatch = t.title.toLowerCase().includes(searchKeyword.trim().toLowerCase());
      const roomMatch = t.apartment?.room_number.toLowerCase().includes(searchKeyword.trim().toLowerCase());
      const matchSearch = !searchKeyword.trim() || codeMatch || titleMatch || roomMatch;

      return matchStatus && matchCategory && matchSearch;
    });
  }, [enrichedTickets, statusFilter, categoryFilter, searchKeyword]);

  // Metric counts
  const totalTickets = tickets.length;
  const overdueCount = enrichedTickets.filter((t) => t.isOverdue).length;
  const openCount = tickets.filter((t) => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter((t) => ['RESOLVED', 'CLOSED'].includes(t.status)).length;

  // Active technicians for assignment
  const techniciansList = useMemo(() => {
    return users.filter((u) => u.role === 'TECHNICIAN' && u.is_active);
  }, [users]);

  // ==========================================
  // UC-18: CƯỠNG BỨC CHỈ ĐỊNH THỢ KỸ THUẬT
  // ==========================================
  const handleOpenAssignModal = (ticket) => {
    setSelectedTicket(ticket);
    setSelectedTechId(techniciansList[0]?.id || null);
    setAssignModalOpen(true);
  };

  const handleConfirmAssign = () => {
    if (!selectedTechId) {
      message.error('Vui lòng chọn nhân viên kỹ thuật!');
      return;
    }

    try {
      const updatedList = tickets.map((item) =>
        item.id === selectedTicket.id
          ? {
              ...item,
              status: 'IN_PROGRESS',
              assigned_to: selectedTechId,
            }
          : item
      );

      MockDB.saveTickets(updatedList);
      const techName = users.find((u) => u.id === selectedTechId)?.full_name || 'Kỹ thuật viên';
      message.success(`Đã chỉ định ${techName} tiếp nhận xử lý sự cố ${selectedTicket.ticket_code}!`);

      setAssignModalOpen(false);
      reloadData();
    } catch {
      message.error('Lỗi khi chỉ định nhân viên kỹ thuật!');
    }
  };

  // Helper format Category
  const renderCategoryTag = (cat) => {
    if (cat === 'ELECTRIC') {
      return (
        <Tag color="gold" style={{ borderRadius: PS_ROUNDED.full, padding: '2px 10px', fontWeight: 600 }}>
          ⚡ Điện
        </Tag>
      );
    }
    if (cat === 'PLUMBING') {
      return (
        <Tag color="cyan" style={{ borderRadius: PS_ROUNDED.full, padding: '2px 10px', fontWeight: 600 }}>
          💧 Nước
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
      width: 280,
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontWeight: 700, color: PS_COLORS.ink, fontSize: 15 }}>
              {record.ticket_code}
            </span>
            {renderCategoryTag(record.category)}
            {record.isOverdue && (
              <Tag
                color="error"
                style={{
                  borderRadius: PS_ROUNDED.full,
                  fontWeight: 700,
                  fontSize: 11,
                  padding: '2px 8px',
                }}
              >
                QUÁ HẠN &gt; 24H ({record.diffHours}h)
              </Tag>
            )}
          </div>
          <span style={{ fontWeight: 600, color: PS_COLORS.ink, display: 'block', fontSize: 14 }}>
            {record.title}
          </span>
          <span style={{ fontSize: 12, color: PS_COLORS.muteLight }}>
            Tạo lúc: {dayjs(record.created_at).format('DD/MM/YYYY HH:mm')}
          </span>
        </div>
      ),
    },
    {
      title: 'CĂN HỘ / CƯ DÂN',
      key: 'resident_info',
      width: 220,
      render: (_, record) => (
        <div>
          <span style={{ fontWeight: 700, color: PS_COLORS.ink, display: 'block' }}>
            {record.apartment?.room_number || '—'} ({record.apartment?.building_block})
          </span>
          <span style={{ fontSize: 13, color: PS_COLORS.muteLight }}>
            {record.resident?.full_name || '—'} • {record.resident?.phone_number || ''}
          </span>
        </div>
      ),
    },
    {
      title: 'THỢ PHỤ TRÁCH',
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
                {record.technician.phone_number}
              </span>
            </div>
          );
        }
        return (
          <span style={{ color: PS_COLORS.muteLight, fontStyle: 'italic', fontSize: 13 }}>
            Chưa có thợ nhận
          </span>
        );
      },
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: (status, record) => {
        if (status === 'OPEN') {
          return (
            <Tag color={record.isOverdue ? 'red' : 'default'} style={{ borderRadius: PS_ROUNDED.full, fontWeight: 600 }}>
              {record.isOverdue ? '⚠️ Cần điều phối gấp' : 'Chờ thợ nhận'}
            </Tag>
          );
        }
        if (status === 'IN_PROGRESS') {
          return (
            <Tag color="processing" style={{ borderRadius: PS_ROUNDED.full, fontWeight: 600 }}>
              Đang sửa chữa
            </Tag>
          );
        }
        if (status === 'RESOLVED') {
          return (
            <Tag color="success" style={{ borderRadius: PS_ROUNDED.full, fontWeight: 600 }}>
              Chờ nghiệm thu
            </Tag>
          );
        }
        return (
          <Tag color="purple" style={{ borderRadius: PS_ROUNDED.full, fontWeight: 600 }}>
            Đã đóng ({record.rating ? `${record.rating}★` : 'Đã nghiệm thu'})
          </Tag>
        );
      },
    },
    {
      title: 'THAO TÁC QUẢN TRỊ',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space size="small">
          {record.status === 'OPEN' && (
            <Button
              type="primary"
              danger={record.isOverdue}
              icon={<ToolOutlined />}
              onClick={() => handleOpenAssignModal(record)}
              className={!record.isOverdue ? 'ps-btn-primary' : ''}
              style={{
                height: 36,
                padding: '0 16px',
                fontSize: 13,
                borderRadius: PS_ROUNDED.full,
                fontWeight: 600,
              }}
            >
              Chỉ định thợ
            </Button>
          )}

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
              padding: '0 14px',
            }}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* ====================================================================
          PAGE HEADER: PlayStation signature light 300 typography + Description
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
          PHÂN HỆ BẢO TRÌ & GIÁM SÁT SỰ CỐ (UC-18 • BR-07)
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
          Giám sát Sự cố & Điều phối Kỹ thuật
        </h1>

        <p
          className="ps-body-sm"
          style={{ color: PS_COLORS.bodyLight, margin: 0, maxWidth: 800 }}
        >
          Theo dõi toàn bộ luồng báo hỏng của cư dân tòa nhà, phát hiện tức thời các sự cố
          tồn đọng quá 24h và cưỡng bức chỉ định nhân viên kỹ thuật xử lý triệt để.
        </p>
      </div>

      {/* ====================================================================
          METRICS STRIP: 4 Flat Level 0 Stat Cards (8px radius, no shadow)
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
            TỔNG SỰ CỐ TOÀN TÒA NHÀ
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
            {totalTickets}
          </div>
          <span style={{ fontSize: 12, color: PS_COLORS.muteLight }}>
            Điện, nước và kỹ thuật chung
          </span>
        </div>

        <div
          style={{
            backgroundColor: PS_COLORS.canvasLight,
            borderRadius: PS_ROUNDED.md,
            border: `1px solid ${overdueCount > 0 ? PS_COLORS.warning : PS_COLORS.hairlineLight}`,
            padding: '20px 24px',
            boxShadow: 'none',
          }}
        >
          <span style={{ fontSize: 13, color: PS_COLORS.warning, fontWeight: 600 }}>
            SỰ CỐ QUÁ HẠN &gt; 24H (BR-07)
          </span>
          <div
            className="ps-display-md"
            style={{
              fontWeight: 300,
              color: PS_COLORS.warning,
              marginTop: 4,
              lineHeight: 1.2,
            }}
          >
            {overdueCount}
          </div>
          <span style={{ fontSize: 12, color: PS_COLORS.muteLight }}>
            Chưa có thợ nhận &gt; 24 tiếng (Cần giao gấp)
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
            ĐANG SỬA CHỮA (IN PROGRESS)
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
            Kỹ thuật viên đang có mặt xử lý
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
            ĐÃ XONG / NGHIỆM THU
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
            {resolvedCount}
          </div>
          <span style={{ fontSize: 12, color: PS_COLORS.muteLight }}>
            Đã có biên bản kỹ thuật & đánh giá
          </span>
        </div>
      </div>

      {/* ====================================================================
          MAIN CARD: Filters + Ticket Table
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
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Input
              prefix={<SearchOutlined style={{ color: PS_COLORS.muteLight }} />}
              placeholder="Tìm theo mã phiếu, tiêu đề, phòng..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{
                width: 280,
                height: 44,
                borderRadius: PS_ROUNDED.sm,
                borderColor: PS_COLORS.ashLight,
              }}
              allowClear
            />

            <Select
              value={categoryFilter}
              onChange={(val) => setCategoryFilter(val)}
              style={{ width: 160, height: 44, borderRadius: PS_ROUNDED.sm }}
              options={[
                { label: 'Tất cả loại sự cố', value: 'ALL' },
                { label: '⚡ Điện sinh hoạt', value: 'ELECTRIC' },
                { label: '💧 Nước sinh hoạt', value: 'PLUMBING' },
                { label: 'Khác', value: 'OTHER' },
              ]}
            />
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`ps-filter-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              Tất cả ({tickets.length})
            </button>

            {overdueCount > 0 && (
              <button
                type="button"
                className={`ps-filter-pill ${statusFilter === 'OVERDUE' ? 'active' : ''}`}
                onClick={() => setStatusFilter('OVERDUE')}
                style={{
                  color: statusFilter === 'OVERDUE' ? '#fff' : PS_COLORS.warning,
                  borderColor: PS_COLORS.warning,
                  backgroundColor: statusFilter === 'OVERDUE' ? PS_COLORS.warning : undefined,
                }}
              >
                ⚠️ Quá hạn &gt; 24h ({overdueCount})
              </button>
            )}

            <button
              type="button"
              className={`ps-filter-pill ${statusFilter === 'OPEN' ? 'active' : ''}`}
              onClick={() => setStatusFilter('OPEN')}
            >
              Chờ thợ ({openCount})
            </button>
            <button
              type="button"
              className={`ps-filter-pill ${statusFilter === 'IN_PROGRESS' ? 'active' : ''}`}
              onClick={() => setStatusFilter('IN_PROGRESS')}
            >
              Đang làm ({inProgressCount})
            </button>
            <button
              type="button"
              className={`ps-filter-pill ${statusFilter === 'RESOLVED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('RESOLVED')}
            >
              Đã xong ({resolvedCount})
            </button>
          </div>
        </div>

        {/* Table of Tickets */}
        <Table
          columns={columns}
          dataSource={filteredTickets}
          rowKey="id"
          pagination={{ pageSize: 8, showSizeChanger: false }}
          locale={{ emptyText: 'Không tìm thấy sự cố nào phù hợp điều kiện lọc' }}
        />
      </div>

      {/* ====================================================================
          MODAL: CƯỠNG BỨC CHỈ ĐỊNH THỢ (UC-18)
          ==================================================================== */}
      <Modal
        title={
          <div>
            <span className="ps-heading-lg" style={{ fontWeight: 300, color: PS_COLORS.ink, display: 'block' }}>
              Chỉ định Nhân viên Kỹ thuật (UC-18)
            </span>
            <span style={{ fontSize: 14, color: PS_COLORS.primary, fontWeight: 600 }}>
              Sự cố: {selectedTicket?.ticket_code} — {selectedTicket?.title}
            </span>
          </div>
        }
        open={assignModalOpen}
        onCancel={() => setAssignModalOpen(false)}
        footer={null}
        destroyOnClose
        style={{ borderRadius: PS_ROUNDED.md }}
      >
        <div style={{ marginTop: 16 }}>
          {selectedTicket?.isOverdue && (
            <Alert
              message="ĐIỀU PHỐI KHẨN CẤP: SỰ CỐ ĐÃ QUÁ HẠN > 24H (BR-07)"
              description={`Sự cố này được tạo cách đây ${selectedTicket?.diffHours} tiếng nhưng chưa có thợ nào nhận. Hệ thống yêu cầu Ban Quản Lý chỉ định cưỡng bức nhân sự để xử lý ngay.`}
              type="error"
              showIcon
              style={{ marginBottom: 20, borderRadius: PS_ROUNDED.sm }}
            />
          )}

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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: PS_COLORS.muteLight }}>Cư dân báo:</span>
              <span style={{ fontWeight: 600, color: PS_COLORS.ink }}>
                {selectedTicket?.resident?.full_name} ({selectedTicket?.resident?.phone_number})
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: PS_COLORS.muteLight }}>Mô tả sự cố:</span>
              <span style={{ color: PS_COLORS.ink, maxWidth: 280, textAlign: 'right' }}>
                {selectedTicket?.description}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <span style={{ display: 'block', fontWeight: 600, color: PS_COLORS.ink, marginBottom: 8, fontSize: 14 }}>
              Chọn kỹ thuật viên phụ trách:
            </span>
            <Select
              value={selectedTechId}
              onChange={(val) => setSelectedTechId(val)}
              style={{ width: '100%', height: 44, borderRadius: PS_ROUNDED.sm }}
              options={techniciansList.map((tech) => ({
                label: `🔧 ${tech.full_name} (${tech.phone_number})`,
                value: tech.id,
              }))}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button
              onClick={() => setAssignModalOpen(false)}
              style={{ height: 44, borderRadius: PS_ROUNDED.full, padding: '0 24px' }}
            >
              Hủy bỏ
            </Button>
            <Button
              type="primary"
              onClick={handleConfirmAssign}
              className="ps-btn-primary"
              style={{ height: 44, borderRadius: PS_ROUNDED.full, padding: '0 28px' }}
            >
              Giao việc ngay
            </Button>
          </div>
        </div>
      </Modal>

      {/* ====================================================================
          MODAL: CHI TIẾT SỰ CỐ & NGHIỆM THU
          ==================================================================== */}
      <Modal
        title={
          <span className="ps-heading-lg" style={{ fontWeight: 300, color: PS_COLORS.ink }}>
            Chi tiết Phiếu Báo hỏng Sự cố
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
                <span style={{ fontWeight: 600, color: PS_COLORS.ink }}>
                  {selectedTicket.apartment?.room_number} ({selectedTicket.apartment?.building_block})
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: PS_COLORS.muteLight }}>Phân loại:</span>
                <span>{renderCategoryTag(selectedTicket.category)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PS_COLORS.muteLight }}>Trạng thái:</span>
                <Tag color={selectedTicket.status === 'RESOLVED' ? 'green' : selectedTicket.status === 'IN_PROGRESS' ? 'blue' : 'default'}>
                  {selectedTicket.status}
                </Tag>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <span style={{ display: 'block', fontWeight: 600, color: PS_COLORS.ink, marginBottom: 4 }}>
                Nội dung mô tả của cư dân:
              </span>
              <p style={{ color: PS_COLORS.bodyLight, margin: 0, padding: '10px 14px', backgroundColor: '#f9f9f9', borderRadius: PS_ROUNDED.sm }}>
                {selectedTicket.description}
              </p>
            </div>

            {selectedTicket.image_url && (
              <div style={{ marginBottom: 20 }}>
                <span style={{ display: 'block', fontWeight: 600, color: PS_COLORS.ink, marginBottom: 6 }}>
                  Ảnh minh họa hiện trường:
                </span>
                <Image
                  src={selectedTicket.image_url}
                  alt="Hiện trường sự cố"
                  style={{ maxHeight: 200, borderRadius: PS_ROUNDED.sm, objectFit: 'cover' }}
                />
              </div>
            )}

            {selectedTicket.technician_note && (
              <div style={{ marginBottom: 20, padding: '12px 16px', backgroundColor: 'rgba(0, 112, 209, 0.05)', borderRadius: PS_ROUNDED.sm, borderLeft: `3px solid ${PS_COLORS.primary}` }}>
                <span style={{ display: 'block', fontWeight: 700, color: PS_COLORS.primary, marginBottom: 4 }}>
                  Biên bản xử lý của Kỹ thuật viên ({selectedTicket.technician?.full_name}):
                </span>
                <p style={{ margin: 0, color: PS_COLORS.ink }}>
                  {selectedTicket.technician_note}
                </p>
              </div>
            )}

            {selectedTicket.rating && (
              <div style={{ marginBottom: 20, textAlign: 'center', padding: '14px', backgroundColor: '#fafafa', borderRadius: PS_ROUNDED.sm }}>
                <span style={{ display: 'block', fontWeight: 600, color: PS_COLORS.ink, marginBottom: 4 }}>
                  Đánh giá nghiệm thu của Cư dân:
                </span>
                <Rate disabled defaultValue={selectedTicket.rating} />
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

export default TicketManagement;
