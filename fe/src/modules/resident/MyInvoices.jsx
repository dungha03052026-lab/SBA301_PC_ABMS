// src/modules/resident/MyInvoices.jsx
// Tuân thủ 100% nguyên tắc thiết kế từ DESIGN-playstation.md:
// - Light Canvas Mode (#f5f7fa layout, #ffffff cards/tables)
// - Typography: Headlines ở weight 300 (light), Form labels 14px/600, Buttons 700 bold
// - Shapes: Inputs 4px (rounded.sm), Cards & Modals 8px (rounded.md), CTAs & Badges 9999px pill (rounded.full)
// - Elevation: Level 0 Flat (boxShadow: none)
// - Nghiệp vụ: UC-10 (Xem hóa đơn căn hộ), UC-11 (VietQR động & Báo đã chuyển khoản - BR-06)

import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  Button,
  Modal,
  Space,
  Tag,
  Alert,
  message,
  Popconfirm,
  Image,
  Typography,
} from 'antd';
import {
  DollarOutlined,
  QrcodeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  BankOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { MockDB } from '../../shared/constants/mockData';
import { useApartment } from '../../shared/context/ApartmentContext';
import { PS_COLORS, PS_ROUNDED } from '../../shared/theme/playstationTheme';

const { Text } = Typography;

const MyInvoices = () => {
  const { selectedApartmentId, apartments } = useApartment();

  // State
  const [invoices, setInvoices] = useState([]);
  const [tariffs, setTariffs] = useState(null);
  const [vehicles, setVehicles] = useState([]);

  // Modal payment & detail
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const reloadData = () => {
    setInvoices(MockDB.getInvoices());
    setTariffs(MockDB.getTariffs());
    setVehicles(MockDB.getVehicles());
  };

  useEffect(() => {
    reloadData();
  }, [selectedApartmentId]);

  // Current active apartment
  const currentApartment = useMemo(() => {
    return apartments.find((a) => a.id === selectedApartmentId) || apartments[0];
  }, [apartments, selectedApartmentId]);

  // UC-03 & UC-10: Tự động lọc hóa đơn theo selectedApartmentId
  const myApartmentInvoices = useMemo(() => {
    if (!selectedApartmentId) return [];
    return invoices
      .filter((inv) => inv.apartment_id === selectedApartmentId)
      .sort((a, b) => b.billing_month.localeCompare(a.billing_month));
  }, [invoices, selectedApartmentId]);

  // Metrics
  const unpaidCount = myApartmentInvoices.filter((i) => i.status === 'UNPAID').length;
  const unpaidAmount = myApartmentInvoices
    .filter((i) => i.status === 'UNPAID')
    .reduce((sum, i) => sum + (Number(i.total_amount) || 0), 0);

  const pendingCount = myApartmentInvoices.filter((i) => i.status === 'PENDING').length;
  const pendingAmount = myApartmentInvoices
    .filter((i) => i.status === 'PENDING')
    .reduce((sum, i) => sum + (Number(i.total_amount) || 0), 0);

  const paidCount = myApartmentInvoices.filter((i) => i.status === 'PAID').length;

  // ==========================================
  // UC-11: BÁO ĐÃ CHUYỂN KHOẢN (STATUS -> PENDING)
  // ==========================================
  const handleConfirmTransfer = (invoiceId) => {
    try {
      const updatedList = invoices.map((item) =>
        item.id === invoiceId
          ? {
              ...item,
              status: 'PENDING',
              paid_at: new Date().toISOString(),
            }
          : item
      );

      MockDB.saveInvoices(updatedList);
      message.success('Đã gửi thông báo chuyển khoản! Ban Quản Lý sẽ đối soát sao kê và gạch nợ sớm nhất.');

      // Cập nhật selectedInvoice trong modal nếu đang mở
      if (selectedInvoice && selectedInvoice.id === invoiceId) {
        setSelectedInvoice((prev) => ({
          ...prev,
          status: 'PENDING',
        }));
      }

      reloadData();
    } catch {
      message.error('Lỗi khi cập nhật trạng thái hóa đơn!');
    }
  };

  // Helper sao chép text
  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    message.success(`Đã sao chép ${label}!`);
  };

  // ==========================================
  // TABLE COLUMNS DEFINITION
  // ==========================================
  const columns = [
    {
      title: 'KỲ THU PHÍ',
      dataIndex: 'billing_month',
      key: 'billing_month',
      render: (m) => (
        <span style={{ fontSize: 15, fontWeight: 700, color: PS_COLORS.ink }}>
          Tháng {m}
        </span>
      ),
    },
    {
      title: 'MÃ HÓA ĐƠN',
      dataIndex: 'invoice_code',
      key: 'invoice_code',
      render: (code) => (
        <span style={{ fontWeight: 600, color: PS_COLORS.primary }}>
          {code}
        </span>
      ),
    },
    {
      title: 'ĐIỆN & NƯỚC',
      key: 'consumption',
      render: (_, record) => {
        const electricKwh = record.new_electric_num - record.old_electric_num;
        const waterM3 = record.new_water_num - record.old_water_num;
        return (
          <div style={{ fontSize: 13, color: PS_COLORS.bodyLight }}>
            ⚡ Điện: <strong>{electricKwh}</strong> kWh ({record.old_electric_num} → {record.new_electric_num})
            <br />
            💧 Nước: <strong>{waterM3}</strong> m³ ({record.old_water_num} → {record.new_water_num})
          </div>
        );
      },
    },
    {
      title: 'TỔNG TIỀN (VNĐ)',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => (
        <span style={{ fontSize: 16, fontWeight: 700, color: PS_COLORS.ink }}>
          {Number(amount).toLocaleString('vi-VN')} đ
        </span>
      ),
    },
    {
      title: 'HẠN NỘP',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (d) => <span style={{ fontSize: 13, color: PS_COLORS.muteLight }}>{d}</span>,
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (status === 'UNPAID') {
          return (
            <Tag color="red" style={{ borderRadius: PS_ROUNDED.full, padding: '2px 12px', fontWeight: 600 }}>
              Chưa thanh toán
            </Tag>
          );
        }
        if (status === 'PENDING') {
          return (
            <Tag color="orange" style={{ borderRadius: PS_ROUNDED.full, padding: '2px 12px', fontWeight: 600 }}>
              <ClockCircleOutlined /> Đang chờ BQL đối soát
            </Tag>
          );
        }
        return (
          <Tag color="green" style={{ borderRadius: PS_ROUNDED.full, padding: '2px 12px', fontWeight: 600 }}>
            <CheckCircleOutlined /> Đã thanh toán
          </Tag>
        );
      },
    },
    {
      title: 'THAO TÁC',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'UNPAID' ? (
            <Button
              type="primary"
              icon={<QrcodeOutlined />}
              onClick={() => {
                setSelectedInvoice(record);
                setPaymentModalOpen(true);
              }}
              className="ps-btn-primary"
              style={{
                height: 36,
                padding: '0 16px',
                fontSize: 13,
                borderRadius: PS_ROUNDED.full,
              }}
            >
              Thanh toán VietQR
            </Button>
          ) : (
            <Button
              type="default"
              icon={<FileTextOutlined />}
              onClick={() => {
                setSelectedInvoice(record);
                setPaymentModalOpen(true);
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
          CỔNG DỊCH VỤ CƯ DÂN • HÓA ĐƠN & VIETQR (UC-10 • UC-11 • BR-06)
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
          Hóa đơn Dịch vụ Căn hộ {currentApartment?.room_number}
        </h1>

        <p
          className="ps-body-sm"
          style={{ color: PS_COLORS.bodyLight, margin: 0, maxWidth: 800 }}
        >
          Theo dõi bảng kê chi tiết điện, nước, phí quản lý và gửi xe hàng tháng. Quét mã
          VietQR động để thanh toán nhanh chóng 24/7 không cần nhập số tài khoản thủ công.
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
            border: `1px solid ${unpaidCount > 0 ? PS_COLORS.warning : PS_COLORS.hairlineLight}`,
            padding: '20px 24px',
            boxShadow: 'none',
          }}
        >
          <span style={{ fontSize: 13, color: unpaidCount > 0 ? PS_COLORS.warning : PS_COLORS.muteLight, fontWeight: 600 }}>
            CÔNG NỢ CẦN THANH TOÁN (UNPAID)
          </span>
          <div
            className="ps-display-md"
            style={{
              fontWeight: 300,
              color: unpaidCount > 0 ? PS_COLORS.warning : PS_COLORS.ink,
              marginTop: 4,
              lineHeight: 1.2,
            }}
          >
            {unpaidAmount.toLocaleString('vi-VN')} đ
          </div>
          <span style={{ fontSize: 12, color: PS_COLORS.muteLight }}>
            {unpaidCount > 0 ? `${unpaidCount} hóa đơn chưa đóng tiền` : 'Đã hoàn tất nghĩa vụ tài chính'}
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
            CHỜ BQL ĐỐI SOÁT (PENDING)
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
            {pendingAmount.toLocaleString('vi-VN')} đ
          </div>
          <span style={{ fontSize: 12, color: PS_COLORS.muteLight }}>
            {pendingCount > 0 ? `${pendingCount} hóa đơn đã bấm chuyển khoản` : 'Không có hóa đơn chờ'}
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
            ĐÃ THANH TOÁN THÀNH CÔNG (PAID)
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
            {paidCount} kỳ
          </div>
          <span style={{ fontSize: 12, color: PS_COLORS.muteLight }}>
            Lịch sử hóa đơn đã gạch nợ thành công
          </span>
        </div>
      </div>

      {/* ====================================================================
          MAIN CARD: Invoices Table
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
            Danh sách Hóa đơn căn hộ {currentApartment?.room_number} ({currentApartment?.building_block})
          </h2>
          <span style={{ fontSize: 13, color: PS_COLORS.muteLight }}>
            (Hệ thống tự động lọc theo căn hộ đang chọn tại Header phía trên theo chuẩn BR-02)
          </span>
        </div>

        <Table
          columns={columns}
          dataSource={myApartmentInvoices}
          rowKey="id"
          pagination={{ pageSize: 6, showSizeChanger: false }}
          locale={{ emptyText: 'Chưa có hóa đơn nào cho căn hộ này' }}
        />
      </div>

      {/* ====================================================================
          MODAL: CHI TIẾT BẢNG KÊ & VIETQR THANH TOÁN ĐỘNG (UC-11)
          ==================================================================== */}
      <Modal
        title={
          <div>
            <span className="ps-heading-lg" style={{ fontWeight: 300, color: PS_COLORS.ink, display: 'block' }}>
              Chi tiết Hóa đơn & Quét mã VietQR
            </span>
            <span style={{ fontSize: 14, color: PS_COLORS.primary, fontWeight: 600 }}>
              Hóa đơn: {selectedInvoice?.invoice_code} (Kỳ {selectedInvoice?.billing_month})
            </span>
          </div>
        }
        open={paymentModalOpen}
        onCancel={() => setPaymentModalOpen(false)}
        footer={null}
        width={720}
        destroyOnClose
        style={{ borderRadius: PS_ROUNDED.md }}
      >
        {selectedInvoice && (
          <div style={{ marginTop: 16 }}>
            {/* Status Alert Banner */}
            {selectedInvoice.status === 'UNPAID' && (
              <Alert
                message="HÓA ĐƠN CHƯA THANH TOÁN"
                description={`Hạn thanh toán: ${selectedInvoice.due_date}. Quý cư dân vui lòng quét mã VietQR bên dưới hoặc chuyển khoản theo thông tin để Ban Quản Lý đối soát.`}
                type="error"
                showIcon
                style={{ marginBottom: 20, borderRadius: PS_ROUNDED.sm }}
              />
            )}

            {selectedInvoice.status === 'PENDING' && (
              <Alert
                message="ĐANG CHỜ BAN QUẢN LÝ ĐỐI SOÁT SAO KÊ"
                description="Bạn đã xác nhận chuyển khoản. Ban Quản Lý sẽ kiểm tra sao kê ngân hàng và phê duyệt gạch nợ trong vòng 24 giờ làm việc."
                type="warning"
                showIcon
                style={{ marginBottom: 20, borderRadius: PS_ROUNDED.sm }}
              />
            )}

            {selectedInvoice.status === 'PAID' && (
              <Alert
                message="HÓA ĐƠN ĐÃ THANH TOÁN THÀNH CÔNG"
                description="Ban Quản Lý đã đối soát sao kê và xác nhận hoàn tất nghĩa vụ tài chính cho kỳ hóa đơn này."
                type="success"
                showIcon
                style={{ marginBottom: 20, borderRadius: PS_ROUNDED.sm }}
              />
            )}

            {/* 2-Column Layout: VietQR Code Left + Breakdown Right */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: selectedInvoice.status === 'UNPAID' ? '280px 1fr' : '1fr',
                gap: 24,
                alignItems: 'start',
              }}
            >
              {/* Left Column: VietQR Image (Chỉ hiện khi UNPAID) */}
              {selectedInvoice.status === 'UNPAID' && (
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: `1px solid ${PS_COLORS.hairlineLight}`,
                    borderRadius: PS_ROUNDED.md,
                    padding: '16px',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: PS_COLORS.primary, display: 'block', marginBottom: 8 }}>
                    QUÉT MÃ VIETQR QUA APP NGÂN HÀNG
                  </span>

                  {/* Render VietQR URL chuẩn theo BR-06 */}
                  <Image
                    src={`https://img.vietqr.io/image/MB-0901234567-compact2.png?amount=${selectedInvoice.total_amount}&addInfo=${selectedInvoice.invoice_code}`}
                    alt="VietQR Payment Code"
                    preview={false}
                    style={{
                      width: '100%',
                      maxWidth: 240,
                      borderRadius: PS_ROUNDED.sm,
                      border: '1px solid #f0f0f0',
                    }}
                  />

                  <span style={{ display: 'block', fontSize: 11, color: PS_COLORS.muteLight, marginTop: 8 }}>
                    Tự động điền đúng số tiền và nội dung chuyển khoản
                  </span>
                </div>
              )}

              {/* Right Column: Breakdown & Bank Information */}
              <div>
                {/* Thông tin chuyển khoản thủ công */}
                <div
                  style={{
                    padding: '14px 18px',
                    backgroundColor: PS_COLORS.surfaceCard,
                    borderRadius: PS_ROUNDED.md,
                    marginBottom: 20,
                    fontSize: 13,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: PS_COLORS.muteLight }}>Ngân hàng:</span>
                    <strong style={{ color: PS_COLORS.ink }}>MB Bank (Ngân hàng Quân Đội)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ color: PS_COLORS.muteLight }}>Số tài khoản:</span>
                    <Space size={4}>
                      <strong style={{ color: PS_COLORS.ink }}>0901234567</strong>
                      <Button
                        type="text"
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() => handleCopy('0901234567', 'Số tài khoản')}
                      />
                    </Space>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: PS_COLORS.muteLight }}>Chủ tài khoản:</span>
                    <strong style={{ color: PS_COLORS.ink }}>BAN QUAN LY CHUNG CU ABMS</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: PS_COLORS.muteLight }}>Nội dung CK:</span>
                    <Space size={4}>
                      <strong style={{ color: PS_COLORS.primary }}>{selectedInvoice.invoice_code}</strong>
                      <Button
                        type="text"
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() => handleCopy(selectedInvoice.invoice_code, 'Nội dung chuyển khoản')}
                      />
                    </Space>
                  </div>
                </div>

                {/* Bảng kê các thành phần chi phí */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${PS_COLORS.hairlineLight}`, paddingBottom: 6 }}>
                    <span>⚡ Điện sinh hoạt ({selectedInvoice.new_electric_num - selectedInvoice.old_electric_num} kWh):</span>
                    <strong>
                      {((selectedInvoice.new_electric_num - selectedInvoice.old_electric_num) * (tariffs?.electricity_unit_price || 3500)).toLocaleString('vi-VN')} đ
                    </strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${PS_COLORS.hairlineLight}`, paddingBottom: 6 }}>
                    <span>💧 Nước sinh hoạt ({selectedInvoice.new_water_num - selectedInvoice.old_water_num} m³):</span>
                    <strong>
                      {((selectedInvoice.new_water_num - selectedInvoice.old_water_num) * (tariffs?.water_unit_price || 15000)).toLocaleString('vi-VN')} đ
                    </strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${PS_COLORS.hairlineLight}`, paddingBottom: 6 }}>
                    <span>🏢 Phí quản lý chung cư ({currentApartment?.area_sqm} m²):</span>
                    <strong>
                      {((currentApartment?.area_sqm || 0) * (tariffs?.management_fee_per_sqm || 10000)).toLocaleString('vi-VN')} đ
                    </strong>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      paddingTop: 8,
                      fontSize: 15,
                      color: PS_COLORS.primary,
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>TỔNG THANH TOÁN:</span>
                    <span style={{ fontWeight: 700, fontSize: 17 }}>
                      {Number(selectedInvoice.total_amount).toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <Button
                onClick={() => setPaymentModalOpen(false)}
                style={{ height: 44, borderRadius: PS_ROUNDED.full, padding: '0 24px' }}
              >
                Đóng
              </Button>

              {selectedInvoice.status === 'UNPAID' && (
                <Popconfirm
                  title="Xác nhận bạn đã chuyển khoản?"
                  description={`Hệ thống sẽ chuyển trạng thái hóa đơn sang CHỜ ĐỐI SOÁT để Ban Quản Lý sao kê kiểm tra.`}
                  onConfirm={() => handleConfirmTransfer(selectedInvoice.id)}
                  okText="Tôi đã chuyển tiền"
                  cancelText="Chưa chuyển"
                >
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    className="ps-btn-primary"
                    style={{ height: 44, borderRadius: PS_ROUNDED.full, padding: '0 28px' }}
                  >
                    Tôi đã chuyển khoản
                  </Button>
                </Popconfirm>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyInvoices;
