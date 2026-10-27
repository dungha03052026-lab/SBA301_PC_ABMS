// src/modules/admin/MeterReading.jsx
// Tuân thủ 100% nguyên tắc thiết kế từ DESIGN-playstation.md:
// - Light Canvas Mode (#f5f7fa layout, #ffffff cards/tables)
// - Typography: Headlines ở weight 300 (light), Form labels 14px/600, Buttons 700 bold
// - Shapes: Inputs 4px (rounded.sm), Cards & Modals 8px (rounded.md), CTAs & Badges 9999px pill (rounded.full)
// - Elevation: Level 0 Flat (boxShadow: none)
// - Nghiệp vụ: UC-08 (Cấu hình đơn giá), UC-09 (Chốt số điện nước & Xuất hóa đơn theo BR-05)

import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  Button,
  InputNumber,
  Select,
  Modal,
  Form,
  Space,
  Tag,
  Alert,
  message,
  Tooltip,
  DatePicker,
} from 'antd';
import {
  ThunderboltOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
  FileDoneOutlined,
  SendOutlined,
  HomeOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { MockDB } from '../../shared/constants/mockData';
import { PS_COLORS, PS_ROUNDED } from '../../shared/theme/playstationTheme';

const MeterReading = () => {
  // ==========================================
  // 1. STATE & DATA INITIALIZATION
  // ==========================================
  const [apartments, setApartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [tariffs, setTariffs] = useState(null);
  const [invoices, setInvoices] = useState([]);

  // Selected billing month (Format: YYYY-MM, e.g. '2026-10')
  const [billingMonth, setBillingMonth] = useState('2026-10');

  // Meter readings state by apartment ID: { [aptId]: { newElectric, newWater } }
  const [readings, setReadings] = useState({});

  // Modals
  const [tariffModalOpen, setTariffModalOpen] = useState(false);
  const [previewInvoiceModalOpen, setPreviewInvoiceModalOpen] = useState(false);
  const [selectedPreviewInvoice, setSelectedPreviewInvoice] = useState(null);

  const [tariffForm] = Form.useForm();

  const reloadData = () => {
    const apts = MockDB.getApartments();
    const usrs = MockDB.getUsers();
    const vehs = MockDB.getVehicles();
    const trfs = MockDB.getTariffs();
    const invs = MockDB.getInvoices();

    setApartments(apts);
    setUsers(usrs);
    setVehicles(vehs);
    setTariffs(trfs);
    setInvoices(invs);

    // Khởi tạo số đọc điện nước cho các căn OCCUPIED
    const initialReadings = {};
    apts
      .filter((a) => a.status === 'OCCUPIED')
      .forEach((apt) => {
        // Tìm hóa đơn kỳ trước đó để lấy số điện nước cũ
        const aptInvoices = invs
          .filter((i) => i.apartment_id === apt.id)
          .sort((a, b) => b.billing_month.localeCompare(a.billing_month));

        const latestInvoice = aptInvoices[0];
        const oldElectric = latestInvoice ? latestInvoice.new_electric_num : 0;
        const oldWater = latestInvoice ? latestInvoice.new_water_num : 0;

        // Nếu đã có hóa đơn trong kỳ billingMonth này, load số đã lưu
        const existingInv = invs.find(
          (i) => i.apartment_id === apt.id && i.billing_month === billingMonth
        );

        initialReadings[apt.id] = {
          oldElectric: existingInv ? existingInv.old_electric_num : oldElectric,
          newElectric: existingInv ? existingInv.new_electric_num : oldElectric + 50,
          oldWater: existingInv ? existingInv.old_water_num : oldWater,
          newWater: existingInv ? existingInv.new_water_num : oldWater + 8,
        };
      });

    setReadings(initialReadings);
  };

  useEffect(() => {
    reloadData();
  }, [billingMonth]);

  // BR-05: Chỉ quét và lập hóa đơn cho các căn OCCUPIED
  const occupiedApartments = useMemo(() => {
    return apartments
      .filter((apt) => apt.status === 'OCCUPIED')
      .map((apt) => {
        const resident = users.find((u) => u.id === apt.resident_id);
        const aptVehicles = vehicles.filter((v) => v.apartment_id === apt.id);
        const motorCount = aptVehicles.filter((v) => v.vehicle_type === 'MOTORBIKE').length;
        const carCount = aptVehicles.filter((v) => v.vehicle_type === 'CAR').length;

        // Kiểm tra xem đã có hóa đơn trong kỳ này chưa
        const existingInvoice = invoices.find(
          (inv) => inv.apartment_id === apt.id && inv.billing_month === billingMonth
        );

        const currentReading = readings[apt.id] || {
          oldElectric: 0,
          newElectric: 0,
          oldWater: 0,
          newWater: 0,
        };

        // Realtime Calculation BR-05
        const diffElectric = Math.max(0, (currentReading.newElectric || 0) - (currentReading.oldElectric || 0));
        const diffWater = Math.max(0, (currentReading.newWater || 0) - (currentReading.oldWater || 0));

        const electricPrice = tariffs ? tariffs.electricity_unit_price : 3500;
        const waterPrice = tariffs ? tariffs.water_unit_price : 15000;
        const mgmtPrice = tariffs ? tariffs.management_fee_per_sqm : 10000;
        const motorFee = tariffs ? tariffs.motorbike_fee : 100000;
        const carFee = tariffs ? tariffs.car_fee : 1200000;

        const electricAmount = diffElectric * electricPrice;
        const waterAmount = diffWater * waterPrice;
        const mgmtAmount = apt.area_sqm * mgmtPrice;
        const vehicleAmount = motorCount * motorFee + carCount * carFee;

        const totalAmount = electricAmount + waterAmount + mgmtAmount + vehicleAmount;

        const isElectricValid = currentReading.newElectric >= currentReading.oldElectric;
        const isWaterValid = currentReading.newWater >= currentReading.oldWater;

        return {
          ...apt,
          resident,
          motorCount,
          carCount,
          existingInvoice,
          currentReading,
          diffElectric,
          diffWater,
          electricAmount,
          waterAmount,
          mgmtAmount,
          vehicleAmount,
          totalAmount,
          isValid: isElectricValid && isWaterValid,
        };
      });
  }, [apartments, users, vehicles, tariffs, invoices, billingMonth, readings]);

  // Handler update readings
  const handleReadingChange = (aptId, field, value) => {
    setReadings((prev) => ({
      ...prev,
      [aptId]: {
        ...prev[aptId],
        [field]: value ?? 0,
      },
    }));
  };

  // ==========================================
  // 2. UC-08: CẤU HÌNH ĐƠN GIÁ DỊCH VỤ
  // ==========================================
  const handleOpenTariffs = () => {
    if (tariffs) {
      tariffForm.setFieldsValue({
        management_fee_per_sqm: tariffs.management_fee_per_sqm,
        electricity_unit_price: tariffs.electricity_unit_price,
        water_unit_price: tariffs.water_unit_price,
        motorbike_fee: tariffs.motorbike_fee,
        car_fee: tariffs.car_fee,
      });
    }
    setTariffModalOpen(true);
  };

  const handleSaveTariffs = async (values) => {
    try {
      const updatedTariffs = {
        ...tariffs,
        ...values,
        updated_at: new Date().toISOString(),
      };
      MockDB.saveTariffs(updatedTariffs);
      setTariffs(updatedTariffs);
      message.success('Cập nhật bảng đơn giá dịch vụ thành công!');
      setTariffModalOpen(false);
      reloadData();
    } catch {
      message.error('Lỗi khi lưu bảng đơn giá!');
    }
  };

  // ==========================================
  // 3. UC-09: XUẤT HÓA ĐƠN THÁNG (BR-05)
  // ==========================================
  // Helper generate single invoice object
  const createInvoiceObject = (item) => {
    const cleanRoomCode = item.room_number.replace(/[^a-zA-Z0-9]/g, '');
    const cleanMonth = billingMonth.replace('-', '');
    const invoiceCode = `INV-${cleanMonth}-${cleanRoomCode}`;

    return {
      id: invoices.length > 0 ? Math.max(...invoices.map((i) => i.id)) + 1 : 1,
      invoice_code: invoiceCode,
      apartment_id: item.id,
      billing_month: billingMonth,
      old_electric_num: item.currentReading.oldElectric,
      new_electric_num: item.currentReading.newElectric,
      old_water_num: item.currentReading.oldWater,
      new_water_num: item.currentReading.newWater,
      total_amount: item.totalAmount,
      status: 'UNPAID', // BR-06: Mới tạo có trạng thái UNPAID
      due_date: `${billingMonth}-25`, // Mặc định hạn đóng ngày 25 hàng tháng
      paid_at: null,
      approved_by: null,
      created_at: new Date().toISOString(),
    };
  };

  // Xuất 1 căn hộ
  const handleGenerateSingleInvoice = (item) => {
    if (!item.isValid) {
      message.error(`Chỉ số căn hộ ${item.room_number} không hợp lệ! Số mới phải >= số cũ.`);
      return;
    }

    if (item.existingInvoice) {
      message.warning(`Căn hộ ${item.room_number} đã phát hành hóa đơn cho kỳ ${billingMonth}!`);
      return;
    }

    try {
      const newInvoice = createInvoiceObject(item);
      const updatedInvoices = [...invoices, newInvoice];
      MockDB.saveInvoices(updatedInvoices);

      message.success(`Đã xuất hóa đơn ${newInvoice.invoice_code} cho căn hộ ${item.room_number}!`);
      reloadData();
    } catch {
      message.error('Lỗi khi xuất hóa đơn!');
    }
  };

  // Xuất hàng loạt cho tất cả căn chưa xuất trong kỳ
  const handleBatchGenerate = () => {
    const pendingItems = occupiedApartments.filter((a) => !a.existingInvoice);

    if (pendingItems.length === 0) {
      message.info(`Tất cả căn hộ OCCUPIED đã được phát hành hóa đơn trong kỳ ${billingMonth}!`);
      return;
    }

    // Kiểm tra tất cả phải hợp lệ
    const invalidItems = pendingItems.filter((a) => !a.isValid);
    if (invalidItems.length > 0) {
      const invalidRooms = invalidItems.map((a) => a.room_number).join(', ');
      message.error(`Không thể xuất hàng loạt! Các căn hộ sau có số mới < số cũ: ${invalidRooms}`);
      return;
    }

    try {
      let currentMaxId = invoices.length > 0 ? Math.max(...invoices.map((i) => i.id)) : 0;
      const cleanMonth = billingMonth.replace('-', '');

      const newInvoicesList = pendingItems.map((item) => {
        currentMaxId += 1;
        const cleanRoomCode = item.room_number.replace(/[^a-zA-Z0-9]/g, '');
        return {
          id: currentMaxId,
          invoice_code: `INV-${cleanMonth}-${cleanRoomCode}`,
          apartment_id: item.id,
          billing_month: billingMonth,
          old_electric_num: item.currentReading.oldElectric,
          new_electric_num: item.currentReading.newElectric,
          old_water_num: item.currentReading.oldWater,
          new_water_num: item.currentReading.newWater,
          total_amount: item.totalAmount,
          status: 'UNPAID',
          due_date: `${billingMonth}-25`,
          paid_at: null,
          approved_by: null,
          created_at: new Date().toISOString(),
        };
      });

      const updated = [...invoices, ...newInvoicesList];
      MockDB.saveInvoices(updated);

      message.success(`Đã xuất thành công ${newInvoicesList.length} hóa đơn cho kỳ ${billingMonth}!`);
      reloadData();
    } catch {
      message.error('Lỗi khi xuất hóa đơn hàng loạt!');
    }
  };

  // ==========================================
  // 4. TABLE COLUMNS DEFINITION
  // ==========================================
  const columns = [
    {
      title: 'CĂN HỘ / CƯ DÂN',
      key: 'apartment',
      width: 220,
      render: (_, record) => (
        <div>
          <span style={{ fontSize: 16, fontWeight: 700, color: PS_COLORS.ink, display: 'block' }}>
            {record.room_number}
          </span>
          <span style={{ fontSize: 13, color: PS_COLORS.muteLight, display: 'block' }}>
            {record.building_block} • {record.area_sqm} m²
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: PS_COLORS.primary }}>
            {record.resident?.full_name || 'Chưa gán'}
          </span>
        </div>
      ),
    },
    {
      title: 'ĐIỆN (kWh)',
      key: 'electric',
      width: 200,
      render: (_, record) => {
        const isInvalid = record.currentReading.newElectric < record.currentReading.oldElectric;
        const isLocked = Boolean(record.existingInvoice);

        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: PS_COLORS.muteLight, width: 45 }}>Cũ:</span>
              <span style={{ fontWeight: 600, color: PS_COLORS.ink }}>
                {record.currentReading.oldElectric}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: PS_COLORS.muteLight, width: 45 }}>Mới:</span>
              <InputNumber
                min={0}
                value={record.currentReading.newElectric}
                disabled={isLocked}
                onChange={(val) => handleReadingChange(record.id, 'newElectric', val)}
                status={isInvalid ? 'error' : ''}
                style={{
                  width: 95,
                  borderRadius: PS_ROUNDED.sm,
                  borderColor: isInvalid ? PS_COLORS.warning : undefined,
                }}
              />
            </div>
            <span
              style={{
                display: 'block',
                fontSize: 11,
                marginTop: 4,
                color: isInvalid ? PS_COLORS.warning : PS_COLORS.muteLight,
              }}
            >
              {isInvalid
                ? '⚠️ Số mới phải ≥ số cũ'
                : `Dùng: ${record.diffElectric} kWh (${record.electricAmount.toLocaleString('vi-VN')} đ)`}
            </span>
          </div>
        );
      },
    },
    {
      title: 'NƯỚC (m³)',
      key: 'water',
      width: 200,
      render: (_, record) => {
        const isInvalid = record.currentReading.newWater < record.currentReading.oldWater;
        const isLocked = Boolean(record.existingInvoice);

        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: PS_COLORS.muteLight, width: 45 }}>Cũ:</span>
              <span style={{ fontWeight: 600, color: PS_COLORS.ink }}>
                {record.currentReading.oldWater}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: PS_COLORS.muteLight, width: 45 }}>Mới:</span>
              <InputNumber
                min={0}
                value={record.currentReading.newWater}
                disabled={isLocked}
                onChange={(val) => handleReadingChange(record.id, 'newWater', val)}
                status={isInvalid ? 'error' : ''}
                style={{
                  width: 95,
                  borderRadius: PS_ROUNDED.sm,
                  borderColor: isInvalid ? PS_COLORS.warning : undefined,
                }}
              />
            </div>
            <span
              style={{
                display: 'block',
                fontSize: 11,
                marginTop: 4,
                color: isInvalid ? PS_COLORS.warning : PS_COLORS.muteLight,
              }}
            >
              {isInvalid
                ? '⚠️ Số mới phải ≥ số cũ'
                : `Dùng: ${record.diffWater} m³ (${record.waterAmount.toLocaleString('vi-VN')} đ)`}
            </span>
          </div>
        );
      },
    },
    {
      title: 'CỐ ĐỊNH & XE',
      key: 'fixed_fees',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: 13, color: PS_COLORS.ink, marginBottom: 2 }}>
            QL: <strong>{record.mgmtAmount.toLocaleString('vi-VN')} đ</strong>
          </div>
          <div style={{ fontSize: 12, color: PS_COLORS.muteLight }}>
            Xe: {record.carCount} ô tô, {record.motorCount} xe máy
            <br />(
            <strong>{record.vehicleAmount.toLocaleString('vi-VN')} đ</strong>)
          </div>
        </div>
      ),
    },
    {
      title: 'TỔNG CỘNG TẠM TÍNH (BR-05)',
      key: 'total',
      width: 200,
      render: (_, record) => (
        <div>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: PS_COLORS.primary,
              display: 'block',
            }}
          >
            {record.totalAmount.toLocaleString('vi-VN')} đ
          </span>
          <span style={{ fontSize: 11, color: PS_COLORS.muteLight }}>
            Đã gồm Điện + Nước + QL + Xe
          </span>
        </div>
      ),
    },
    {
      title: 'TRẠNG THÁI & THAO TÁC',
      key: 'action',
      width: 210,
      render: (_, record) => {
        if (record.existingInvoice) {
          const inv = record.existingInvoice;
          const statusColors = {
            UNPAID: 'red',
            PENDING: 'orange',
            PAID: 'green',
          };
          const statusLabels = {
            UNPAID: 'Chưa thanh toán',
            PENDING: 'Chờ đối soát',
            PAID: 'Đã thanh toán',
          };

          return (
            <Space direction="vertical" size={4}>
              <Tag color={statusColors[inv.status]} style={{ borderRadius: PS_ROUNDED.full, margin: 0 }}>
                {statusLabels[inv.status]} ({inv.invoice_code})
              </Tag>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  setSelectedPreviewInvoice({
                    ...inv,
                    apartment: record,
                  });
                  setPreviewInvoiceModalOpen(true);
                }}
                style={{ padding: 0, color: PS_COLORS.primary }}
              >
                Xem chi tiết bảng kê →
              </Button>
            </Space>
          );
        }

        return (
          <Button
            type="primary"
            icon={<FileDoneOutlined />}
            onClick={() => handleGenerateSingleInvoice(record)}
            disabled={!record.isValid}
            className="ps-btn-primary"
            style={{
              height: 36,
              borderRadius: PS_ROUNDED.full,
              padding: '0 18px',
              fontSize: 13,
            }}
          >
            Xuất hóa đơn
          </Button>
        );
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* ====================================================================
          PAGE HEADER: PlayStation signature light 300 typography + Action Pills
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
            PHÂN HỆ HÓA ĐƠN & DỊCH VỤ (UC-08 • UC-09 • BR-05)
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
            Chốt số Điện Nước & Lập Hóa đơn Tháng
          </h1>

          <p
            className="ps-body-sm"
            style={{ color: PS_COLORS.bodyLight, margin: 0, maxWidth: 780 }}
          >
            Cấu hình đơn giá dịch vụ tòa nhà, nhập chỉ số điện nước theo kỳ và xuất hóa đơn
            tự động cho các căn hộ đang có người ở (OCCUPIED) theo đúng công thức chuẩn BR-05.
          </p>
        </div>

        {/* Action Buttons: Tariffs config + Batch Generate Pill */}
        <Space size="middle" wrap>
          <Button
            icon={<SettingOutlined />}
            onClick={handleOpenTariffs}
            style={{
              height: 48,
              borderRadius: PS_ROUNDED.full,
              borderColor: PS_COLORS.ashLight,
              padding: '0 24px',
              fontWeight: 600,
            }}
          >
            Cấu hình Đơn giá (UC-08)
          </Button>

          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleBatchGenerate}
            className="ps-btn-primary"
            style={{
              height: 48,
              borderRadius: PS_ROUNDED.full,
              padding: '0 28px',
            }}
          >
            Xuất hóa đơn hàng loạt
          </Button>
        </Space>
      </div>

      {/* ====================================================================
          CURRENT TARIFFS STRIP: 5 Flat Level 0 Mini-Cards (8px radius, no shadow)
          ==================================================================== */}
      {tariffs && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
          }}
        >
          <div
            style={{
              backgroundColor: PS_COLORS.canvasLight,
              border: `1px solid ${PS_COLORS.hairlineLight}`,
              borderRadius: PS_ROUNDED.md,
              padding: '16px 20px',
              boxShadow: 'none',
            }}
          >
            <span style={{ fontSize: 12, color: PS_COLORS.muteLight, display: 'block' }}>
              PHÍ QUẢN LÝ / M²
            </span>
            <span style={{ fontSize: 18, fontWeight: 700, color: PS_COLORS.ink }}>
              {Number(tariffs.management_fee_per_sqm).toLocaleString('vi-VN')} đ
            </span>
          </div>

          <div
            style={{
              backgroundColor: PS_COLORS.canvasLight,
              border: `1px solid ${PS_COLORS.hairlineLight}`,
              borderRadius: PS_ROUNDED.md,
              padding: '16px 20px',
              boxShadow: 'none',
            }}
          >
            <span style={{ fontSize: 12, color: PS_COLORS.muteLight, display: 'block' }}>
              ĐIỆN SINH HOẠT / kWh
            </span>
            <span style={{ fontSize: 18, fontWeight: 700, color: PS_COLORS.ink }}>
              {Number(tariffs.electricity_unit_price).toLocaleString('vi-VN')} đ
            </span>
          </div>

          <div
            style={{
              backgroundColor: PS_COLORS.canvasLight,
              border: `1px solid ${PS_COLORS.hairlineLight}`,
              borderRadius: PS_ROUNDED.md,
              padding: '16px 20px',
              boxShadow: 'none',
            }}
          >
            <span style={{ fontSize: 12, color: PS_COLORS.muteLight, display: 'block' }}>
              NƯỚC SINH HOẠT / M³
            </span>
            <span style={{ fontSize: 18, fontWeight: 700, color: PS_COLORS.ink }}>
              {Number(tariffs.water_unit_price).toLocaleString('vi-VN')} đ
            </span>
          </div>

          <div
            style={{
              backgroundColor: PS_COLORS.canvasLight,
              border: `1px solid ${PS_COLORS.hairlineLight}`,
              borderRadius: PS_ROUNDED.md,
              padding: '16px 20px',
              boxShadow: 'none',
            }}
          >
            <span style={{ fontSize: 12, color: PS_COLORS.muteLight, display: 'block' }}>
              GỬI XE MÁY / THÁNG
            </span>
            <span style={{ fontSize: 18, fontWeight: 700, color: PS_COLORS.ink }}>
              {Number(tariffs.motorbike_fee).toLocaleString('vi-VN')} đ
            </span>
          </div>

          <div
            style={{
              backgroundColor: PS_COLORS.canvasLight,
              border: `1px solid ${PS_COLORS.hairlineLight}`,
              borderRadius: PS_ROUNDED.md,
              padding: '16px 20px',
              boxShadow: 'none',
            }}
          >
            <span style={{ fontSize: 12, color: PS_COLORS.muteLight, display: 'block' }}>
              GỬI Ô TÔ / THÁNG
            </span>
            <span style={{ fontSize: 18, fontWeight: 700, color: PS_COLORS.ink }}>
              {Number(tariffs.car_fee).toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>
      )}

      {/* ====================================================================
          MAIN CARD: Billing Month Selector + Meter Reading Table
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
        {/* Month Selector Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 24,
            borderBottom: `1px solid ${PS_COLORS.hairlineLight}`,
            paddingBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontWeight: 600, color: PS_COLORS.ink, fontSize: 15 }}>
              Kỳ tính hóa đơn:
            </span>
            <Select
              value={billingMonth}
              onChange={(val) => setBillingMonth(val)}
              style={{ width: 170, height: 44, borderRadius: PS_ROUNDED.sm }}
              options={[
                { label: 'Tháng 11 / 2026', value: '2026-11' },
                { label: 'Tháng 10 / 2026', value: '2026-10' },
                { label: 'Tháng 09 / 2026', value: '2026-09' },
                { label: 'Tháng 08 / 2026', value: '2026-08' },
              ]}
            />
          </div>

          <div style={{ fontSize: 13, color: PS_COLORS.muteLight }}>
            Đang hiển thị{' '}
            <strong style={{ color: PS_COLORS.primary }}>
              {occupiedApartments.length} căn hộ OCCUPIED
            </strong>{' '}
            (Tự động bỏ qua các căn trống theo quy định BR-05)
          </div>
        </div>

        {/* Table of Readings */}
        <Table
          columns={columns}
          dataSource={occupiedApartments}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: 'Không có căn hộ nào đang ở (OCCUPIED)' }}
        />
      </div>

      {/* ====================================================================
          MODAL: CẤU HÌNH ĐƠN GIÁ TÒA NHÀ (UC-08)
          ==================================================================== */}
      <Modal
        title={
          <span className="ps-heading-lg" style={{ fontWeight: 300, color: PS_COLORS.ink }}>
            Cấu hình Bảng đơn giá Dịch vụ Tòa nhà (UC-08)
          </span>
        }
        open={tariffModalOpen}
        onCancel={() => setTariffModalOpen(false)}
        footer={null}
        destroyOnClose
        style={{ borderRadius: PS_ROUNDED.md }}
      >
        <Form
          form={tariffForm}
          layout="vertical"
          onFinish={handleSaveTariffs}
          style={{ marginTop: 20 }}
          requiredMark={false}
        >
          <Form.Item
            label={<span style={{ fontWeight: 600, color: PS_COLORS.ink }}>Phí quản lý vận hành (VNĐ / m² / tháng)</span>}
            name="management_fee_per_sqm"
            rules={[{ required: true, message: 'Nhập đơn giá phí quản lý!' }]}
          >
            <InputNumber
              min={0}
              step={1000}
              style={{ width: '100%', height: 44, borderRadius: PS_ROUNDED.sm }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label={<span style={{ fontWeight: 600, color: PS_COLORS.ink }}>Điện sinh hoạt (VNĐ / kWh)</span>}
              name="electricity_unit_price"
              rules={[{ required: true, message: 'Nhập giá điện!' }]}
            >
              <InputNumber
                min={0}
                step={500}
                style={{ width: '100%', height: 44, borderRadius: PS_ROUNDED.sm }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ fontWeight: 600, color: PS_COLORS.ink }}>Nước sinh hoạt (VNĐ / m³)</span>}
              name="water_unit_price"
              rules={[{ required: true, message: 'Nhập giá nước!' }]}
            >
              <InputNumber
                min={0}
                step={1000}
                style={{ width: '100%', height: 44, borderRadius: PS_ROUNDED.sm }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label={<span style={{ fontWeight: 600, color: PS_COLORS.ink }}>Gửi xe máy (VNĐ / xe / tháng)</span>}
              name="motorbike_fee"
              rules={[{ required: true, message: 'Nhập phí gửi xe máy!' }]}
            >
              <InputNumber
                min={0}
                step={10000}
                style={{ width: '100%', height: 44, borderRadius: PS_ROUNDED.sm }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ fontWeight: 600, color: PS_COLORS.ink }}>Gửi ô tô (VNĐ / xe / tháng)</span>}
              name="car_fee"
              rules={[{ required: true, message: 'Nhập phí gửi ô tô!' }]}
            >
              <InputNumber
                min={0}
                step={50000}
                style={{ width: '100%', height: 44, borderRadius: PS_ROUNDED.sm }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button
              onClick={() => setTariffModalOpen(false)}
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
              Lưu bảng đơn giá
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ====================================================================
          MODAL: XEM CHI TIẾT BẢNG KÊ HÓA ĐƠN
          ==================================================================== */}
      <Modal
        title={
          <span className="ps-heading-lg" style={{ fontWeight: 300, color: PS_COLORS.ink }}>
            Bảng kê Chi tiết Hóa đơn Dịch vụ
          </span>
        }
        open={previewInvoiceModalOpen}
        onCancel={() => setPreviewInvoiceModalOpen(false)}
        footer={null}
        destroyOnClose
        style={{ borderRadius: PS_ROUNDED.md }}
      >
        {selectedPreviewInvoice && (
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
                  {selectedPreviewInvoice.invoice_code}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: PS_COLORS.muteLight }}>Căn hộ:</span>
                <span style={{ fontWeight: 600, color: PS_COLORS.ink }}>
                  {selectedPreviewInvoice.apartment?.room_number} ({selectedPreviewInvoice.apartment?.building_block})
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: PS_COLORS.muteLight }}>Kỳ hóa đơn:</span>
                <span style={{ fontWeight: 600, color: PS_COLORS.ink }}>
                  {selectedPreviewInvoice.billing_month}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: PS_COLORS.muteLight }}>Hạn thanh toán:</span>
                <span style={{ fontWeight: 600, color: PS_COLORS.warning }}>
                  {selectedPreviewInvoice.due_date}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${PS_COLORS.hairlineLight}`, paddingBottom: 8 }}>
                <span>⚡ Điện sinh hoạt ({selectedPreviewInvoice.new_electric_num - selectedPreviewInvoice.old_electric_num} kWh):</span>
                <strong>
                  {((selectedPreviewInvoice.new_electric_num - selectedPreviewInvoice.old_electric_num) * (tariffs?.electricity_unit_price || 3500)).toLocaleString('vi-VN')} đ
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${PS_COLORS.hairlineLight}`, paddingBottom: 8 }}>
                <span>💧 Nước sinh hoạt ({selectedPreviewInvoice.new_water_num - selectedPreviewInvoice.old_water_num} m³):</span>
                <strong>
                  {((selectedPreviewInvoice.new_water_num - selectedPreviewInvoice.old_water_num) * (tariffs?.water_unit_price || 15000)).toLocaleString('vi-VN')} đ
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${PS_COLORS.hairlineLight}`, paddingBottom: 8 }}>
                <span>🏢 Phí quản lý chung cư ({selectedPreviewInvoice.apartment?.area_sqm} m²):</span>
                <strong>
                  {((selectedPreviewInvoice.apartment?.area_sqm || 0) * (tariffs?.management_fee_per_sqm || 10000)).toLocaleString('vi-VN')} đ
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${PS_COLORS.hairlineLight}`, paddingBottom: 8 }}>
                <span>🚗 Phí phương tiện gửi xe:</span>
                <strong>
                  {((selectedPreviewInvoice.apartment?.carCount || 0) * (tariffs?.car_fee || 1200000) + (selectedPreviewInvoice.apartment?.motorCount || 0) * (tariffs?.motorbike_fee || 100000)).toLocaleString('vi-VN')} đ
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
                  {Number(selectedPreviewInvoice.total_amount).toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => setPreviewInvoiceModalOpen(false)}
                className="ps-btn-primary"
                style={{ height: 44, borderRadius: PS_ROUNDED.full, padding: '0 28px' }}
              >
                Đóng bảng kê
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MeterReading;
