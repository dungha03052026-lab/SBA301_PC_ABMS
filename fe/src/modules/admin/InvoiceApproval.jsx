// src/modules/admin/InvoiceApproval.jsx
// Tuân thủ 100% nguyên tắc thiết kế từ DESIGN-playstation.md:
// - Light Canvas Mode (#f5f7fa layout, #ffffff cards/tables)
// - Typography: Headlines ở weight 300 (light), Form labels 14px/600, Buttons 700 bold
// - Shapes: Inputs 4px (rounded.sm), Cards & Modals 8px (rounded.md), CTAs & Badges 9999px pill (rounded.full)
// - Elevation: Level 0 Flat (boxShadow: none)
// - Nghiệp vụ: UC-12 (Đối soát sao kê ngân hàng & Gạch nợ thủ công Plan B - BR-06)

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
  Popconfirm,
  Badge,
} from 'antd';
import {
  SearchOutlined,
  CheckOutlined,
  CloseOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  EyeOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { MockDB } from '../../shared/constants/mockData';
import { useAuth } from '../../shared/context/AuthContext';
import { PS_COLORS, PS_ROUNDED } from '../../shared/theme/playstationTheme';

const InvoiceApproval = () => {
  const { user } = useAuth();

  // State
  const [invoices, setInvoices] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [tariffs, setTariffs] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('PENDING'); // Default ưu tiên PENDING
  const [searchKeyword, setSearchKeyword] = useState('');
  const [monthFilter, setMonthFilter] = useState('ALL');

  // Modal Detail
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const reloadData = () => {
    setInvoices(MockDB.getInvoices());
    setApartments(MockDB.getApartments());
    setUsers(MockDB.getUsers());
    setTariffs(MockDB.getTariffs());
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Map invoice with apartment and resident
  const enrichedInvoices = useMemo(() => {
    return invoices.map((inv) => {
      const apt = apartments.find((a) => a.id === inv.apartment_id);
      const resident = apt ? users.find((u) => u.id === apt.resident_id) : null;
      return {
        ...inv,
        apartment: apt,
        resident,
      };
    });
  }, [invoices, apartments, users]);

  // Filtered List
  const filteredInvoices = useMemo(() => {
    return enrichedInvoices.filter((inv) => {
      const matchStatus = statusFilter === 'ALL' || inv.status === statusFilter;
      const matchMonth = monthFilter === 'ALL' || inv.billing_month === monthFilter;

      const codeMatch = inv.invoice_code.toLowerCase().includes(searchKeyword.trim().toLowerCase());
      const roomMatch = inv.apartment?.room_number.toLowerCase().includes(searchKeyword.trim().toLowerCase());
      const residentMatch = inv.resident?.full_name.toLowerCase().includes(searchKeyword.trim().toLowerCase());

      const matchSearch = !searchKeyword.trim() || codeMatch || roomMatch || residentMatch;

      return matchStatus && matchMonth && matchSearch;
    });
  }, [enrichedInvoices, statusFilter, monthFilter, searchKeyword]);

  // Metric counts
  const pendingCount = invoices.filter((i) => i.status === 'PENDING').length;
  const unpaidCount = invoices.filter((i) => i.status === 'UNPAID').length;
  const paidCount = invoices.filter((i) => i.status === 'PAID').length;

  const pendingAmount = invoices
    .filter((i) => i.status === 'PENDING')
    .reduce((sum, i) => sum + (Number(i.total_amount) || 0), 0);

  const totalCollectedAmount = invoices
    .filter((i) => i.status === 'PAID')
    .reduce((sum, i) => sum + (Number(i.total_amount) || 0), 0);

  // Unique billing months for filter dropdown
  const uniqueMonths = useMemo(() => {
    const months = Array.from(new Set(invoices.map((i) => i.billing_month)));
    return months.sort((a, b) => b.localeCompare(a));
  }, [invoices]);

  // ==========================================
  // THAO TÁC DUYỆT GẠCH NỢ (APPROVE)
  // ==========================================
  const handleApproveInvoice = (invoice) => {
    try {
      const updatedList = invoices.map((item) =>
        item.id === invoice.id
          ? {
              ...item,
              status: 'PAID',
              paid_at: new Date().toISOString(),
              approved_by: user?.id || 1,
            }
          : item
      );

      MockDB.saveInvoices(updatedList);
      message.success(`Đã xác nhận gạch nợ thành công cho hóa đơn ${invoice.invoice_code}!`);
      reloadData();
    } catch {
      message.error('Lỗi khi duyệt gạch nợ hóa đơn!');
    }
  };

  // ==========================================
  // THAO TÁC TỪ CHỐI GẠCH NỢ (REJECT)
  // ==========================================
  const handleRejectInvoice = (invoice) => {
    try {
      const updatedList = invoices.map((item) =>
        item.id === invoice.id
          ? {
              ...item,
              status: 'UNPAID', // Trả về UNPAID để cư dân thanh toán lại
              paid_at: null,
              approved_by: null,
            }
          : item
      );

      MockDB.saveInvoices(updatedList);
      message.warning(`Đã từ chối và trả hóa đơn ${invoice.invoice_code} về trạng thái CHƯA THANH TOÁN.`);
      reloadData();
    } catch {
      message.error('Lỗi khi từ chối gạch nợ!');
    }
  };

  // ==========================================
  // TABLE COLUMNS DEFINITION
  // ==========================================
  const columns = [
    {
      title: 'MÃ HÓA ĐƠN',
      dataIndex: 'invoice_code',
      key: 'invoice_code',
      render: (code) => (
        <span style={{ fontWeight: 700, color: PS_COLORS.ink, fontSize: 15 }}>
          {code}
        </span>
      ),
    },
    {
      title: 'CĂN HỘ / CHỦ HỘ',
      key: 'apartment_info',
      render: (_, record) => (
        <div>
          <span style={{ fontWeight: 700, color: PS_COLORS.ink, display: 'block' }}>
            {record.apartment?.room_number || '—'} ({record.apartment?.building_block})
          </span>
          <span style={{ fontSize: 13, color: PS_COLORS.muteLight }}>
            {record.resident?.full_name || 'Chưa gán'} • {record.resident?.phone_number || ''}
          </span>
        </div>
      ),
    },
    {
      title: 'KỲ THU PHÍ',
      dataIndex: 'billing_month',
      key: 'billing_month',
      render: (m) => <span style={{ fontWeight: 600 }}>Tháng {m}</span>,
    },
    {
      title: 'SỐ TIỀN CẦN THU',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => (
        <span style={{ fontSize: 16, fontWeight: 700, color: PS_COLORS.primary }}>
          {Number(amount).toLocaleString('vi-VN')} đ
        </span>
      ),
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (status === 'PENDING') {
          return (
            <Tag color="orange" style={{ borderRadius: PS_ROUNDED.full, padding: '2px 12px', fontWeight: 600 }}>
              <ClockCircleOutlined /> Chờ đối soát
            </Tag>
          );
        }
        if (status === 'PAID') {
          return (
            <Tag color="green" style={{ borderRadius: PS_ROUNDED.full, padding: '2px 12px', fontWeight: 600 }}>
              <CheckCircleOutlined /> Đã thanh toán
            </Tag>
          );
        }
        return (
          <Tag color="red" style={{ borderRadius: PS_ROUNDED.full, padding: '2px 12px', fontWeight: 600 }}>
            Chưa thanh toán
          </Tag>
        );
      },
    },
    {
      title: 'THAO TÁC ĐỐI SOÁT',
      key: 'action',
      render: (_, record) => {
        if (record.status === 'PENDING') {
          return (
            <Space size="small">
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleApproveInvoice(record)}
                className="ps-btn-primary"
                style={{
                  height: 36,
                  padding: '0 16px',
                  fontSize: 13,
                  borderRadius: PS_ROUNDED.full,
                }}
              >
                Duyệt gạch nợ
              </Button>

              <Popconfirm
                title="Xác nhận từ chối gạch nợ?"
                description="Hóa đơn sẽ chuyển lại về trạng thái UNPAID để cư dân chuyển khoản lại."
                onConfirm={() => handleRejectInvoice(record)}
                okText="Từ chối"
                cancelText="Hủy"
              >
                <Button
                  danger
                  icon={<CloseOutlined />}
                  style={{
                    height: 36,
                    padding: '0 14px',
                    fontSize: 13,
                    borderRadius: PS_ROUNDED.full,
                  }}
                >
                  Từ chối
                </Button>
              </Popconfirm>

              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => {
                  setSelectedInvoice(record);
                  setDetailModalOpen(true);
                }}
                style={{ borderRadius: PS_ROUNDED.full }}
              >
                Bảng kê
              </Button>
            </Space>
          );
        }

        return (
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedInvoice(record);
              setDetailModalOpen(true);
            }}
            style={{ color: PS_COLORS.primary, padding: 0 }}
          >
            Xem bảng kê chi tiết
          </Button>
        );
      },
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
          PHÂN HỆ TÀI CHÍNH & ĐỐI SOÁT (UC-12 • BR-06 PLAN B)
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
          Đối soát Sao kê & Phê duyệt Gạch nợ
        </h1>

        <p
          className="ps-body-sm"
          style={{ color: PS_COLORS.bodyLight, margin: 0, maxWidth: 800 }}
        >
          Kiểm tra sao kê tài khoản ngân hàng tòa nhà, đối chiếu mã giao dịch VietQR động và
          phê duyệt gạch nợ thủ công (Plan B) để đảm bảo 100% dòng tiền minh bạch.
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
            HÓA ĐƠN CHỜ ĐỐI SOÁT (PENDING)
          </span>
          <div
            className="ps-display-md"
            style={{
              fontWeight: 300,
              color: '#fa8c16', // Orange
              marginTop: 4,
              lineHeight: 1.2,
            }}
          >
            {pendingCount}
          </div>
          <span style={{ fontSize: 12, color: PS_COLORS.muteLight }}>
            Cư dân đã bấm chuyển khoản VietQR
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
            TỔNG TIỀN CHỜ DUYỆT GẠCH NỢ
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
            {pendingAmount.toLocaleString('vi-VN')} đ
          </div>
          <span style={{ fontSize: 12, color: PS_COLORS.muteLight }}>
            Cần đối chiếu với sao kê ngân hàng
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
            CHƯA THANH TOÁN (UNPAID)
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
            {unpaidCount}
          </div>
          <span style={{ fontSize: 12, color: PS_COLORS.muteLight }}>
            Chưa phát sinh giao dịch chuyển khoản
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
            TỔNG TIỀN ĐÃ THU ĐƯỢC (PAID)
          </span>
          <div
            className="ps-display-md"
            style={{
              fontWeight: 300,
              color: '#52c41a', // Green
              marginTop: 4,
              lineHeight: 1.2,
            }}
          >
            {totalCollectedAmount.toLocaleString('vi-VN')} đ
          </div>
          <span style={{ fontSize: 12, color: PS_COLORS.muteLight }}>
            Đã gạch nợ thành công ({paidCount} hóa đơn)
          </span>
        </div>
      </div>

      {/* ====================================================================
          MAIN CARD: Filters + Invoices Table
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
              placeholder="Tìm theo mã hóa đơn, phòng, tên..."
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
              value={monthFilter}
              onChange={(val) => setMonthFilter(val)}
              style={{ width: 170, height: 44, borderRadius: PS_ROUNDED.sm }}
              options={[
                { label: 'Tất cả các kỳ', value: 'ALL' },
                ...uniqueMonths.map((m) => ({ label: `Kỳ ${m}`, value: m })),
              ]}
            />
          </div>

          {/* Status Filter Pills: Default PENDING highlighted */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`ps-filter-pill ${statusFilter === 'PENDING' ? 'active' : ''}`}
              onClick={() => setStatusFilter('PENDING')}
            >
              Chờ đối soát ({pendingCount})
            </button>
            <button
              type="button"
              className={`ps-filter-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              Tất cả ({invoices.length})
            </button>
            <button
              type="button"
              className={`ps-filter-pill ${statusFilter === 'UNPAID' ? 'active' : ''}`}
              onClick={() => setStatusFilter('UNPAID')}
            >
              Chưa trả ({unpaidCount})
            </button>
            <button
              type="button"
              className={`ps-filter-pill ${statusFilter === 'PAID' ? 'active' : ''}`}
              onClick={() => setStatusFilter('PAID')}
            >
              Đã thu ({paidCount})
            </button>
          </div>
        </div>

        {/* Table of Invoices */}
        <Table
          columns={columns}
          dataSource={filteredInvoices}
          rowKey="id"
          pagination={{ pageSize: 8, showSizeChanger: false }}
          locale={{ emptyText: 'Không có hóa đơn nào thỏa mãn điều kiện lọc' }}
        />
      </div>

      {/* ====================================================================
          MODAL: CHI TIẾT BẢNG KÊ HÓA ĐƠN
          ==================================================================== */}
      <Modal
        title={
          <span className="ps-heading-lg" style={{ fontWeight: 300, color: PS_COLORS.ink }}>
            Bảng kê Thu phí Hóa đơn Dịch vụ
          </span>
        }
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        destroyOnClose
        style={{ borderRadius: PS_ROUNDED.md }}
      >
        {selectedInvoice && (
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
                <span style={{ color: PS_COLORS.muteLight }}>Mã hóa đơn:</span>
                <span style={{ fontWeight: 700, color: PS_COLORS.ink }}>
                  {selectedInvoice.invoice_code}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: PS_COLORS.muteLight }}>Căn hộ:</span>
                <span style={{ fontWeight: 600, color: PS_COLORS.ink }}>
                  {selectedInvoice.apartment?.room_number} ({selectedInvoice.apartment?.building_block})
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: PS_COLORS.muteLight }}>Chủ hộ:</span>
                <span style={{ fontWeight: 600, color: PS_COLORS.ink }}>
                  {selectedInvoice.resident?.full_name} ({selectedInvoice.resident?.phone_number})
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PS_COLORS.muteLight }}>Trạng thái thanh toán:</span>
                <Tag color={selectedInvoice.status === 'PAID' ? 'green' : selectedInvoice.status === 'PENDING' ? 'orange' : 'red'}>
                  {selectedInvoice.status === 'PAID' ? 'Đã thanh toán' : selectedInvoice.status === 'PENDING' ? 'Chờ đối soát' : 'Chưa thanh toán'}
                </Tag>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${PS_COLORS.hairlineLight}`, paddingBottom: 8 }}>
                <span>⚡ Điện: {selectedInvoice.new_electric_num - selectedInvoice.old_electric_num} kWh ({selectedInvoice.old_electric_num} → {selectedInvoice.new_electric_num})</span>
                <strong>
                  {((selectedInvoice.new_electric_num - selectedInvoice.old_electric_num) * (tariffs?.electricity_unit_price || 3500)).toLocaleString('vi-VN')} đ
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${PS_COLORS.hairlineLight}`, paddingBottom: 8 }}>
                <span>💧 Nước: {selectedInvoice.new_water_num - selectedInvoice.old_water_num} m³ ({selectedInvoice.old_water_num} → {selectedInvoice.new_water_num})</span>
                <strong>
                  {((selectedInvoice.new_water_num - selectedInvoice.old_water_num) * (tariffs?.water_unit_price || 15000)).toLocaleString('vi-VN')} đ
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${PS_COLORS.hairlineLight}`, paddingBottom: 8 }}>
                <span>🏢 Phí quản lý chung cư:</span>
                <strong>
                  {((selectedInvoice.apartment?.area_sqm || 0) * (tariffs?.management_fee_per_sqm || 10000)).toLocaleString('vi-VN')} đ
                </strong>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: 10,
                  fontSize: 16,
                  color: PS_COLORS.primary,
                }}
              >
                <span style={{ fontWeight: 700 }}>TỔNG CỘNG HÓA ĐƠN:</span>
                <span style={{ fontWeight: 700, fontSize: 18 }}>
                  {Number(selectedInvoice.total_amount).toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button
                onClick={() => setDetailModalOpen(false)}
                style={{ height: 44, borderRadius: PS_ROUNDED.full, padding: '0 24px' }}
              >
                Đóng
              </Button>
              {selectedInvoice.status === 'PENDING' && (
                <Button
                  type="primary"
                  onClick={() => {
                    handleApproveInvoice(selectedInvoice);
                    setDetailModalOpen(false);
                  }}
                  className="ps-btn-primary"
                  style={{ height: 44, borderRadius: PS_ROUNDED.full, padding: '0 28px' }}
                >
                  Xác nhận duyệt gạch nợ
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InvoiceApproval;
