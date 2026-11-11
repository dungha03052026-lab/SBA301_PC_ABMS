/**
 * Phân hệ Chợ Việc Chung & Nhận Sự Cố (Task Pool - Technician).
 * 
 * Các ca sử dụng và nghiệp vụ trọng tâm:
 * 1. UC-14: Danh sách kho việc chung (Task Pool) của toàn bộ tòa nhà:
 *    - Chỉ hiển thị các ticket đang ở trạng thái OPEN (chưa có kỹ thuật viên nhận).
 *    - Đánh dấu cảnh báo đỏ với các sự cố Quá Hạn (> 24h) chưa được xử lý.
 * 2. UC-15: Cơ chế Nhận Việc Nguyên Tử (Atomic Claim - BR-07):
 *    - Kỹ thuật viên ấn "Tiếp nhận công việc".
 *    - Gửi request POST /api/v1/technician/tickets/{id}/claim.
 *    - Chống xung đột đồng thời (Concurrency): nếu kỹ thuật viên khác đã nhận trước thì hiển thị lỗi thông báo ngay.
 *    - Sau khi nhận việc thành công, công việc tự động chuyển sang phân hệ "Việc của tôi".
 */
// src/modules/technician/TaskPool.jsx
// Tuân thủ 100% nguyên tắc thiết kế từ DESIGN-playstation.md:
// - Light Canvas Mode (#f5f7fa layout, #ffffff cards/tables)
// - Typography: Headlines ở weight 300 (light), Form labels 14px/600, Buttons 700 bold
// - Shapes: Inputs 4px (rounded.sm), Cards & Modals 8px (rounded.md), CTAs & Badges 9999px pill (rounded.full)
// - Elevation: Level 0 Flat (boxShadow: none)
// - Nghiệp vụ: UC-14 (Chợ việc chung Task Pool, cảnh báo quá hạn > 24h - BR-07), UC-15 (Nhận việc Atomic Claim)

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
  Image,
  Popconfirm,
} from 'antd';
import {
  ShopOutlined,
  ToolOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  WarningOutlined,
  UserOutlined,
  HomeOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { MockDB } from '../../shared/constants/mockData';
import axiosClient from '../../shared/api/axiosClient';
import { useAuth } from '../../shared/context/AuthContext';
import { PS_COLORS, PS_ROUNDED } from '../../shared/theme/playstationTheme';

const TaskPool = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [tickets, setTickets] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [users, setUsers] = useState([]);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  // Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const reloadData = async () => {
    let tcks = MockDB.getTickets();
    let apts = MockDB.getApartments();
    let usrs = MockDB.getUsers();

    try {
      const res = await axiosClient.get('/technician/tickets/pool/all');
      if (res && Array.isArray(res.data || res)) {
        const raw = res.data || res;
        tcks = raw.map((t) => ({
          id: t.id,
          ticket_code: t.ticketCode,
          apartment_id: t.apartmentId,
          resident_id: t.residentId,
          category: t.category,
          title: t.title,
          description: t.description,
          image_url: t.imageUrl,
          status: t.status,
          assigned_to: t.assignedToId,
          technician_note: t.technicianNote,
          rating: t.rating,
          created_at: t.createdAt,
          resolved_at: t.resolvedAt,
          isOverdue: t.isOverdue,
          apartment: {
            id: t.apartmentId,
            room_number: t.roomNumber,
            floor: t.floor,
            building_block: t.buildingBlock,
          },
          resident: {
            id: t.residentId,
            full_name: t.residentName,
            phone_number: t.residentPhone,
          },
        }));
      }
    } catch (e) {
      console.warn('API error in TaskPool reloadData, using MockDB', e);
    }

    setTickets(tcks);
    setApartments(apts);
    setUsers(usrs);
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Lọc các sự cố OPEN trong toàn tòa nhà (UC-14)
  const openTickets = useMemo(() => {
    const now = Date.now();

    return tickets
      .filter((t) => t.status === 'OPEN' && !t.assigned_to)
      .map((t) => {
        const apt = apartments.find((a) => a.id === t.apartment_id);
        const resident = users.find((u) => u.id === t.resident_id);

        const createdTime = new Date(t.created_at).getTime();
        const diffHours = (now - createdTime) / (1000 * 60 * 60);
        const isOverdue = diffHours > 24;

        return {
          ...t,
          apartment: apt,
          resident,
          diffHours: Math.round(diffHours),
          isOverdue,
        };
      })
      .sort((a, b) => {
        // Ưu tiên các sự cố quá hạn lên đầu (BR-07)
        if (a.isOverdue !== b.isOverdue) {
          return b.isOverdue ? 1 : -1;
        }
        
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
  }, [tickets, apartments, users]);

  // Filtered List
  const filteredList = useMemo(() => {
    return openTickets.filter((t) => {
      const matchCategory = categoryFilter === 'ALL' || t.category === categoryFilter;
      const matchOverdue = !overdueOnly || t.isOverdue;

      const codeMatch = t.ticket_code.toLowerCase().includes(searchKeyword.trim().toLowerCase());
      const titleMatch = t.title.toLowerCase().includes(searchKeyword.trim().toLowerCase());
      const roomMatch = t.apartment?.room_number.toLowerCase().includes(searchKeyword.trim().toLowerCase());
      const matchSearch = !searchKeyword.trim() || codeMatch || titleMatch || roomMatch;

      return matchCategory && matchOverdue && matchSearch;
    });
  }, [openTickets, categoryFilter, overdueOnly, searchKeyword]);

  // Metrics
  const totalOpenCount = openTickets.length;
  const overdueCount = openTickets.filter((t) => t.isOverdue).length;
  const electricCount = openTickets.filter((t) => t.category === 'ELECTRIC').length;
  const plumbingCount = openTickets.filter((t) => t.category === 'PLUMBING').length;

  // ==========================================
  // UC-15: NHẬN VIỆC (CLAIM) - ATOMIC CHECK
  // ==========================================
  const handleClaimTicket = async (ticketId) => {
    try {
      try {
        await axiosClient.post(`/technician/tickets/${ticketId}/claim`);
        message.success('Bạn đã nhận việc xử lý sự cố thành công!');
        navigate('/technician/my-tasks');
        return;
      } catch (apiErr) {
        console.warn('API error claiming ticket, falling back to MockDB', apiErr);
      }

      // Đọc dữ liệu mới nhất từ Storage để chống xung đột (Atomic Check)
      const freshTickets = MockDB.getTickets();
      const currentTicket = freshTickets.find((t) => t.id === ticketId);

      if (!currentTicket || currentTicket.status !== 'OPEN' || currentTicket.assigned_to) {
        message.error('Sự cố này vừa được nhận bởi kỹ thuật viên khác hoặc đã được Admin phân công! Danh sách đã được làm mới.');
        reloadData();
        return;
      }

      // Nhận việc hợp lệ
      const updated = freshTickets.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: 'IN_PROGRESS',
              assigned_to: user?.id || 2, // ID thợ đang đăng nhập
            }
          : t
      );

      MockDB.saveTickets(updated);
      message.success(`Bạn đã nhận việc xử lý sự cố ${currentTicket.ticket_code} thành công!`);

      // Tự động chuyển sang tab "Việc của tôi" (UC-15)
      navigate('/technician/my-tasks');
    } catch {
      message.error('Lỗi khi nhận việc!');
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
            Thời gian tạo: {dayjs(record.created_at).format('DD/MM/YYYY HH:mm')} ({record.diffHours} giờ trước)
          </span>
        </div>
      ),
    },
    {
      title: 'CĂN HỘ / CƯ DÂN LIÊN HỆ',
      key: 'location',
      width: 260,
      render: (_, record) => (
        <div>
          <span style={{ fontWeight: 700, color: PS_COLORS.ink, display: 'block' }}>
            <HomeOutlined style={{ marginRight: 6, color: PS_COLORS.primary }} />
            Căn hộ {record.apartment?.room_number || '—'} ({record.apartment?.building_block} • Tầng {record.apartment?.floor})
          </span>
          <span style={{ fontSize: 13, color: PS_COLORS.muteLight }}>
            Cư dân: <strong>{record.resident?.full_name || '—'}</strong>
            <br />
            SĐT: <strong>{record.resident?.phone_number || '—'}</strong>
          </span>
        </div>
      ),
    },
    {
      title: 'THỜI GIAN CHỜ',
      key: 'wait_time',
      width: 160,
      render: (_, record) => (
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: record.isOverdue ? PS_COLORS.warning : PS_COLORS.ink,
          }}
        >
          {record.diffHours} giờ
        </span>
      ),
    },
    {
      title: 'THAO TÁC',
      key: 'actions',
      width: 220,
      render: (_, record) => (
        <Space size="small">
          <Popconfirm
            title="Xác nhận nhận việc này?"
            description="Bạn sẽ phụ trách xử lý sự cố này và liên hệ với cư dân để tới sửa chữa."
            onConfirm={() => handleClaimTicket(record.id)}
            okText="Nhận ngay"
            cancelText="Hủy"
          >
            <Button
              type="primary"
              icon={<ToolOutlined />}
              className="ps-btn-primary"
              style={{
                height: 36,
                padding: '0 18px',
                fontSize: 13,
                borderRadius: PS_ROUNDED.full,
              }}
            >
              Nhận việc (Claim)
            </Button>
          </Popconfirm>

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
            Chi tiết
          </Button>
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
          CỔNG KỸ THUẬT VIÊN • CHỢ VIỆC TOÀN TÒA NHÀ
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
          Chợ việc Chung (Task Pool)
        </h1>

        <p
          className="ps-body-sm"
          style={{ color: PS_COLORS.bodyLight, margin: 0, maxWidth: 800 }}
        >
          Danh sách toàn bộ các sự cố điện nước chưa có kỹ thuật viên tiếp nhận. Chủ động nhận việc
          khẩn cấp quá hạn &gt; 24h để giải quyết kịp thời yêu cầu sinh hoạt của cư dân tòa nhà.
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
            TỔNG VIỆC ĐANG CHỜ (OPEN)
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
            {totalOpenCount}
          </div>
          <span style={{ fontSize: 12, color: PS_COLORS.muteLight }}>
            Chưa có thợ nào nhận
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
          <span style={{ fontSize: 13, color: overdueCount > 0 ? PS_COLORS.warning : PS_COLORS.muteLight, fontWeight: 600 }}>
            SỰ CỐ QUÁ HẠN &gt; 24H
          </span>
          <div
            className="ps-display-md"
            style={{
              fontWeight: 300,
              color: overdueCount > 0 ? PS_COLORS.warning : PS_COLORS.ink,
              marginTop: 4,
              lineHeight: 1.2,
            }}
          >
            {overdueCount}
          </div>
          <span style={{ fontSize: 12, color: PS_COLORS.muteLight }}>
            {overdueCount > 0 ? 'Ưu tiên nhận xử lý ngay!' : 'Không có sự cố trễ hạn'}
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
            SỰ CỐ ĐIỆN SINH HOẠT
          </span>
          <div
            className="ps-display-md"
            style={{
              fontWeight: 300,
              color: '#d48806',
              marginTop: 4,
              lineHeight: 1.2,
            }}
          >
            {electricCount}
          </div>
          <span style={{ fontSize: 12, color: PS_COLORS.muteLight }}>
            Aptomat, ổ cắm, đường dây
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
            SỰ CỐ NƯỚC SINH HOẠT
          </span>
          <div
            className="ps-display-md"
            style={{
              fontWeight: 300,
              color: '#13c2c2',
              marginTop: 4,
              lineHeight: 1.2,
            }}
          >
            {plumbingCount}
          </div>
          <span style={{ fontSize: 12, color: PS_COLORS.muteLight }}>
            Đường ống, vòi sen, rò rỉ
          </span>
        </div>
      </div>

      {/* ====================================================================
          MAIN CARD: Filters + Open Task Pool Table
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
              placeholder="Tìm theo mã sự cố, phòng, nội dung..."
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
              style={{ width: 170, height: 44, borderRadius: PS_ROUNDED.sm }}
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
              className={`ps-filter-pill ${!overdueOnly ? 'active' : ''}`}
              onClick={() => setOverdueOnly(false)}
            >
              Tất cả sự cố chờ ({openTickets.length})
            </button>

            {overdueCount > 0 && (
              <button
                type="button"
                className={`ps-filter-pill ${overdueOnly ? 'active' : ''}`}
                onClick={() => setOverdueOnly(true)}
                style={{
                  color: overdueOnly ? '#fff' : PS_COLORS.warning,
                  borderColor: PS_COLORS.warning,
                  backgroundColor: overdueOnly ? PS_COLORS.warning : undefined,
                }}
              >
                ⚠️ Quá hạn &gt; 24h ({overdueCount})
              </button>
            )}
          </div>
        </div>

        {/* Table of Open Tasks */}
        <Table
          columns={columns}
          dataSource={filteredList}
          rowKey="id"
          pagination={{ pageSize: 6, showSizeChanger: false }}
          locale={{ emptyText: 'Hiện tại không có sự cố nào đang chờ trong Task Pool' }}
        />
      </div>

      {/* ====================================================================
          MODAL: CHI TIẾT SỰ CỐ
          ==================================================================== */}
      <Modal
        title={
          <span className="ps-heading-lg" style={{ fontWeight: 300, color: PS_COLORS.ink }}>
            Chi tiết Yêu cầu Sửa chữa
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
            {selectedTicket.isOverdue && (
              <Alert
                message="SỰ CỐ ĐÃ QUÁ HẠN > 24H"
                description={`Yêu cầu này được tạo cách đây ${selectedTicket.diffHours} tiếng. Cần được tiếp nhận khẩn cấp.`}
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
                <span style={{ color: PS_COLORS.muteLight }}>Mã phiếu:</span>
                <span style={{ fontWeight: 700, color: PS_COLORS.ink }}>
                  {selectedTicket.ticket_code}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: PS_COLORS.muteLight }}>Căn hộ:</span>
                <span style={{ fontWeight: 700, color: PS_COLORS.ink }}>
                  {selectedTicket.apartment?.room_number} ({selectedTicket.apartment?.building_block} • Tầng {selectedTicket.apartment?.floor})
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: PS_COLORS.muteLight }}>Cư dân:</span>
                <span style={{ fontWeight: 600, color: PS_COLORS.ink }}>
                  {selectedTicket.resident?.full_name} ({selectedTicket.resident?.phone_number})
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PS_COLORS.muteLight }}>Phân loại:</span>
                <span>{renderCategoryTag(selectedTicket.category)}</span>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <span style={{ display: 'block', fontWeight: 600, color: PS_COLORS.ink, marginBottom: 4 }}>
                Mô tả hiện tượng từ cư dân:
              </span>
              <p style={{ margin: 0, padding: '12px 14px', backgroundColor: '#f9f9f9', borderRadius: PS_ROUNDED.sm, color: PS_COLORS.bodyLight }}>
                {selectedTicket.description}
              </p>
            </div>

            {selectedTicket.image_url && (
              <div style={{ marginBottom: 24 }}>
                <span style={{ display: 'block', fontWeight: 600, color: PS_COLORS.ink, marginBottom: 6 }}>
                  Hình ảnh hiện trường do cư dân gửi:
                </span>
                <Image
                  src={selectedTicket.image_url}
                  alt="Hiện trường"
                  style={{ maxHeight: 220, borderRadius: PS_ROUNDED.sm }}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button
                onClick={() => setDetailModalOpen(false)}
                style={{ height: 44, borderRadius: PS_ROUNDED.full, padding: '0 24px' }}
              >
                Đóng
              </Button>
              <Button
                type="primary"
                icon={<ToolOutlined />}
                onClick={() => {
                  setDetailModalOpen(false);
                  handleClaimTicket(selectedTicket.id);
                }}
                className="ps-btn-primary"
                style={{ height: 44, borderRadius: PS_ROUNDED.full, padding: '0 28px' }}
              >
                Nhận việc này ngay
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TaskPool;
