// src/modules/admin/ApartmentManagement.jsx
// Tuân thủ 100% nguyên tắc thiết kế từ DESIGN-playstation.md:
// - Light Canvas Mode (#f5f7fa layout, #ffffff cards/tables)
// - Typography: Headlines ở weight 300 (light), Form labels 14px/600, Buttons 700 bold
// - Shapes: Inputs 4px (rounded.sm), Cards & Modals 8px (rounded.md), CTAs & Badges 9999px pill (rounded.full)
// - Elevation: Level 0 Flat (boxShadow: none)
// - Màu sắc: PlayStation Blue (#0070d1), Warning (#c81b3a)
// - Nghiệp vụ: UC-04 (CRUD Căn hộ), UC-05 (Move-in), UC-06 (Move-out chặn nợ BR-04), UC-07 (Phương tiện xe)

import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Modal,
  Form,
  InputNumber,
  Space,
  Tag,
  Alert,
  message,
  Popconfirm,
  Radio,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  HomeOutlined,
  UserOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  SwapRightOutlined,
  LoginOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { MockDB } from '../../shared/constants/mockData';
import { PS_COLORS, PS_ROUNDED } from '../../shared/theme/playstationTheme';

const ApartmentManagement = () => {
  // ==========================================
  // 1. STATE & DATA INITIALIZATION
  // ==========================================
  const [apartments, setApartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // Search & Filter
  const [searchRoom, setSearchRoom] = useState('');
  const [blockFilter, setBlockFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals State
  const [apartmentModalOpen, setApartmentModalOpen] = useState(false);
  const [apartmentEditMode, setApartmentEditMode] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(null);

  const [moveInModalOpen, setMoveInModalOpen] = useState(false);
  const [moveOutModalOpen, setMoveOutModalOpen] = useState(false);
  const [moveOutDebts, setMoveOutDebts] = useState([]);

  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);

  // Forms
  const [aptForm] = Form.useForm();
  const [moveInForm] = Form.useForm();
  const [vehicleForm] = Form.useForm();

  // Load data from LocalStorage MockDB
  const reloadData = () => {
    setApartments(MockDB.getApartments());
    setUsers(MockDB.getUsers());
    setVehicles(MockDB.getVehicles());
    setInvoices(MockDB.getInvoices());
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Map resident and vehicle count
  const apartmentListWithMeta = useMemo(() => {
    return apartments.map((apt) => {
      const resident = users.find((u) => u.id === apt.resident_id);
      const aptVehicles = vehicles.filter((v) => v.apartment_id === apt.id);
      return {
        ...apt,
        resident,
        vehicles: aptVehicles,
      };
    });
  }, [apartments, users, vehicles]);

  // Filtered List
  const filteredApartments = useMemo(() => {
    return apartmentListWithMeta.filter((apt) => {
      const matchRoom = apt.room_number
        .toLowerCase()
        .includes(searchRoom.trim().toLowerCase());
      const matchBlock =
        blockFilter === 'ALL' || apt.building_block === blockFilter;
      const matchStatus =
        statusFilter === 'ALL' || apt.status === statusFilter;
      return matchRoom && matchBlock && matchStatus;
    });
  }, [apartmentListWithMeta, searchRoom, blockFilter, statusFilter]);

  // Metrics summary
  const totalApartments = apartments.length;
  const occupiedCount = apartments.filter((a) => a.status === 'OCCUPIED').length;
  const vacantCount = apartments.filter((a) => a.status === 'VACANT').length;
  const totalVehiclesCount = vehicles.length;

  // ==========================================
  // 2. UC-04: CRUD CĂN HỘ
  // ==========================================
  const handleOpenAddApartment = () => {
    setApartmentEditMode(false);
    setSelectedApartment(null);
    aptForm.resetFields();
    aptForm.setFieldsValue({
      building_block: 'Tòa A',
      floor: 1,
      area_sqm: 70.0,
    });
    setApartmentModalOpen(true);
  };

  const handleOpenEditApartment = (record) => {
    setApartmentEditMode(true);
    setSelectedApartment(record);
    aptForm.setFieldsValue({
      room_number: record.room_number,
      building_block: record.building_block,
      floor: record.floor,
      area_sqm: record.area_sqm,
    });
    setApartmentModalOpen(true);
  };

  const handleSaveApartment = async (values) => {
    try {
      if (apartmentEditMode && selectedApartment) {
        // Cập nhật
        const updatedList = apartments.map((item) =>
          item.id === selectedApartment.id
            ? {
                ...item,
                building_block: values.building_block,
                floor: values.floor,
                area_sqm: values.area_sqm,
                updated_at: new Date().toISOString(),
              }
            : item
        );
        MockDB.saveApartments(updatedList);
        message.success(`Cập nhật thông tin căn hộ ${selectedApartment.room_number} thành công!`);
      } else {
        // Tạo mới - kiểm tra trùng mã phòng
        const exists = apartments.some(
          (a) => a.room_number.toLowerCase() === values.room_number.trim().toLowerCase()
        );
        if (exists) {
          message.error(`Mã căn hộ ${values.room_number} đã tồn tại trong tòa nhà!`);
          return;
        }

        const newId = apartments.length > 0 ? Math.max(...apartments.map((a) => a.id)) + 1 : 1;
        const newApt = {
          id: newId,
          room_number: values.room_number.trim(),
          floor: values.floor,
          building_block: values.building_block,
          area_sqm: values.area_sqm,
          status: 'VACANT',
          resident_id: null,
          updated_at: new Date().toISOString(),
        };

        const updatedList = [...apartments, newApt];
        MockDB.saveApartments(updatedList);
        message.success(`Thêm mới căn hộ ${newApt.room_number} thành công!`);
      }

      setApartmentModalOpen(false);
      reloadData();
    } catch {
      message.error('Có lỗi xảy ra khi lưu thông tin căn hộ!');
    }
  };

  // ==========================================
  // 3. UC-05: TIẾP NHẬN CƯ DÂN (MOVE-IN)
  // ==========================================
  const [moveInType, setMoveInType] = useState('NEW'); // 'NEW' | 'EXISTING'

  const handleOpenMoveIn = (record) => {
    setSelectedApartment(record);
    setMoveInType('NEW');
    moveInForm.resetFields();
    setMoveInModalOpen(true);
  };

  const handleConfirmMoveIn = async (values) => {
    try {
      let residentId = null;

      if (moveInType === 'EXISTING') {
        residentId = values.existing_resident_id;
        const targetUser = users.find((u) => u.id === residentId);
        if (targetUser && !targetUser.is_active) {
          // Kích hoạt lại tài khoản nếu đang bị khóa
          const updatedUsers = users.map((u) =>
            u.id === residentId ? { ...u, is_active: true } : u
          );
          MockDB.saveUsers(updatedUsers);
        }
      } else {
        // Tạo hoặc kích hoạt cư dân mới
        const existingByPhone = users.find(
          (u) => u.phone_number === values.phone_number.trim()
        );

        if (existingByPhone) {
          residentId = existingByPhone.id;
          const updatedUsers = users.map((u) =>
            u.id === residentId ? { ...u, is_active: true, full_name: values.full_name } : u
          );
          MockDB.saveUsers(updatedUsers);
        } else {
          const newUserId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
          const newUser = {
            id: newUserId,
            phone_number: values.phone_number.trim(),
            email: values.email?.trim() || `resident${newUserId}@building.vn`,
            password: 'password123',
            full_name: values.full_name.trim(),
            role: 'RESIDENT',
            is_active: true,
            created_at: new Date().toISOString(),
          };
          const updatedUsers = [...users, newUser];
          MockDB.saveUsers(updatedUsers);
          residentId = newUserId;
        }
      }

      // Cập nhật trạng thái căn hộ sang OCCUPIED
      const updatedApartments = apartments.map((a) =>
        a.id === selectedApartment.id
          ? {
              ...a,
              status: 'OCCUPIED',
              resident_id: residentId,
              updated_at: new Date().toISOString(),
            }
          : a
      );
      MockDB.saveApartments(updatedApartments);

      message.success(`Tiếp nhận Move-in thành công cho căn hộ ${selectedApartment.room_number}!`);
      setMoveInModalOpen(false);
      reloadData();
    } catch {
      message.error('Lỗi khi tiếp nhận cư dân!');
    }
  };

  // ==========================================
  // 4. UC-06: TRẢ PHÒNG & CHẶN NỢ (MOVE-OUT / BR-04)
  // ==========================================
  const handleOpenMoveOut = (record) => {
    setSelectedApartment(record);
    // Kiểm tra công nợ chưa trả (UNPAID hoặc PENDING)
    const unpaidInvoices = invoices.filter(
      (inv) => inv.apartment_id === record.id && ['UNPAID', 'PENDING'].includes(inv.status)
    );
    setMoveOutDebts(unpaidInvoices);
    setMoveOutModalOpen(true);
  };

  const handleConfirmMoveOut = () => {
    if (moveOutDebts.length > 0) {
      message.error('Không thể thực hiện Move-out vì căn hộ còn công nợ chưa thanh toán!');
      return;
    }

    try {
      const oldResidentId = selectedApartment.resident_id;

      // 1. Cập nhật căn hộ về VACANT
      const updatedApartments = apartments.map((a) =>
        a.id === selectedApartment.id
          ? {
              ...a,
              status: 'VACANT',
              resident_id: null,
              updated_at: new Date().toISOString(),
            }
          : a
      );
      MockDB.saveApartments(updatedApartments);

      // 2. Xóa các phương tiện thuộc căn hộ này
      const remainingVehicles = vehicles.filter(
        (v) => v.apartment_id !== selectedApartment.id
      );
      MockDB.saveVehicles(remainingVehicles);

      // 3. Kiểm tra xem cư dân cũ còn sở hữu căn hộ nào khác không
      const otherOccupied = updatedApartments.filter(
        (a) => a.resident_id === oldResidentId && a.status === 'OCCUPIED'
      );
      if (otherOccupied.length === 0 && oldResidentId) {
        const updatedUsers = users.map((u) =>
          u.id === oldResidentId ? { ...u, is_active: false } : u
        );
        MockDB.saveUsers(updatedUsers);
      }

      message.success(`Đã hoàn tất bàn giao Move-out cho căn hộ ${selectedApartment.room_number}!`);
      setMoveOutModalOpen(false);
      reloadData();
    } catch {
      message.error('Lỗi trong quá trình bàn giao trả phòng!');
    }
  };

  // ==========================================
  // 5. UC-07: QUẢN LÝ PHƯƠNG TIỆN (VEHICLES)
  // ==========================================
  const handleOpenVehicles = (record) => {
    setSelectedApartment(record);
    vehicleForm.resetFields();
    if (record.resident) {
      vehicleForm.setFieldsValue({
        owner_name: record.resident.full_name,
        vehicle_type: 'MOTORBIKE',
      });
    }
    setVehicleModalOpen(true);
  };

  const handleAddVehicle = async (values) => {
    try {
      // Kiểm tra biển số xe trùng
      const exists = vehicles.some(
        (v) => v.license_plate.toUpperCase() === values.license_plate.trim().toUpperCase()
      );
      if (exists) {
        message.error(`Biển số xe ${values.license_plate} đã được đăng ký trong hệ thống tòa nhà!`);
        return;
      }

      const newId = vehicles.length > 0 ? Math.max(...vehicles.map((v) => v.id)) + 1 : 1;
      const newVehicle = {
        id: newId,
        apartment_id: selectedApartment.id,
        license_plate: values.license_plate.trim().toUpperCase(),
        vehicle_type: values.vehicle_type,
        owner_name: values.owner_name.trim(),
        created_at: new Date().toISOString(),
      };

      const updatedVehicles = [...vehicles, newVehicle];
      MockDB.saveVehicles(updatedVehicles);
      message.success(`Đăng ký phương tiện ${newVehicle.license_plate} thành công!`);

      vehicleForm.resetFields();
      if (selectedApartment.resident) {
        vehicleForm.setFieldsValue({
          owner_name: selectedApartment.resident.full_name,
          vehicle_type: 'MOTORBIKE',
        });
      }
      reloadData();
    } catch {
      message.error('Lỗi khi đăng ký xe!');
    }
  };

  const handleDeleteVehicle = (vehicleId) => {
    try {
      const updated = vehicles.filter((v) => v.id !== vehicleId);
      MockDB.saveVehicles(updated);
      message.success('Đã hủy đăng ký phương tiện!');
      reloadData();
    } catch {
      message.error('Lỗi khi xóa phương tiện!');
    }
  };

  // ==========================================
  // 6. TABLE COLUMNS DEFINITION
  // ==========================================
  const columns = [
    {
      title: 'MÃ CĂN HỘ',
      dataIndex: 'room_number',
      key: 'room_number',
      render: (text, record) => (
        <div>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: PS_COLORS.ink,
              display: 'block',
            }}
          >
            {text}
          </span>
          <span style={{ fontSize: 13, color: PS_COLORS.muteLight }}>
            {record.building_block} • Tầng {record.floor}
          </span>
        </div>
      ),
    },
    {
      title: 'DIỆN TÍCH',
      dataIndex: 'area_sqm',
      key: 'area_sqm',
      render: (val) => (
        <span style={{ fontWeight: 500, color: PS_COLORS.ink }}>
          {val} m²
        </span>
      ),
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (status === 'OCCUPIED') {
          return (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: 'rgba(0, 112, 209, 0.1)',
                color: PS_COLORS.primary,
                padding: '4px 14px',
                borderRadius: PS_ROUNDED.full,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.3px',
              }}
            >
              <CheckCircleOutlined /> Đang cư trú
            </span>
          );
        }
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: 'rgba(0, 0, 0, 0.06)',
              color: PS_COLORS.muteLight,
              padding: '4px 14px',
              borderRadius: PS_ROUNDED.full,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Đang trống (VACANT)
          </span>
        );
      },
    },
    {
      title: 'CƯ DÂN ĐẠI DIỆN',
      key: 'resident',
      render: (_, record) => {
        if (record.resident) {
          return (
            <div>
              <span
                style={{
                  display: 'block',
                  color: PS_COLORS.ink,
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {record.resident.full_name}
              </span>
              <span style={{ fontSize: 13, color: PS_COLORS.bodyLight }}>
                {record.resident.phone_number} • {record.resident.email}
              </span>
            </div>
          );
        }
        return (
          <span style={{ color: PS_COLORS.ashLight, fontStyle: 'italic', fontSize: 13 }}>
            Chưa gán cư dân đại diện
          </span>
        );
      },
    },
    {
      title: 'PHƯƠNG TIỆN',
      key: 'vehicles',
      render: (_, record) => {
        const carCount = record.vehicles.filter((v) => v.vehicle_type === 'CAR').length;
        const motorCount = record.vehicles.filter((v) => v.vehicle_type === 'MOTORBIKE').length;

        if (record.status === 'VACANT') {
          return <span style={{ color: PS_COLORS.ashLight, fontSize: 13 }}>—</span>;
        }

        return (
          <Button
            type="text"
            icon={<CarOutlined style={{ color: PS_COLORS.primary }} />}
            onClick={() => handleOpenVehicles(record)}
            style={{
              borderRadius: PS_ROUNDED.full,
              backgroundColor: 'rgba(0, 112, 209, 0.06)',
              color: PS_COLORS.ink,
              fontWeight: 600,
              fontSize: 13,
              height: 34,
              padding: '0 14px',
            }}
          >
            {record.vehicles.length} xe ({carCount} ô tô, {motorCount} xe máy)
          </Button>
        );
      },
    },
    {
      title: 'THAO TÁC NGHIỆP VỤ',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'VACANT' ? (
            <Button
              type="primary"
              icon={<LoginOutlined />}
              onClick={() => handleOpenMoveIn(record)}
              className="ps-btn-primary"
              style={{
                height: 36,
                padding: '0 18px',
                fontSize: 13,
                borderRadius: PS_ROUNDED.full,
              }}
            >
              Move-in
            </Button>
          ) : (
            <Button
              danger
              icon={<LogoutOutlined />}
              onClick={() => handleOpenMoveOut(record)}
              style={{
                height: 36,
                padding: '0 18px',
                fontSize: 13,
                borderRadius: PS_ROUNDED.full,
                fontWeight: 600,
                borderColor: PS_COLORS.warning,
                color: PS_COLORS.warning,
              }}
            >
              Move-out
            </Button>
          )}

          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={() => handleOpenEditApartment(record)}
            style={{
              height: 36,
              borderRadius: PS_ROUNDED.full,
              borderColor: PS_COLORS.ashLight,
              fontSize: 13,
              padding: '0 14px',
            }}
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* ====================================================================
          PAGE HEADER: PlayStation signature light 300 typography + Primary CTA Pill
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
            PHÂN HỆ QUẢN LÝ MẶT BẰNG & CƯ DÂN (UC-04 • UC-05 • UC-06 • UC-07)
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
            Quản lý Căn hộ, Cư dân & Phương tiện
          </h1>

          <p
            className="ps-body-sm"
            style={{ color: PS_COLORS.bodyLight, margin: 0, maxWidth: 760 }}
          >
            Theo dõi danh mục mặt bằng, tiếp nhận cư dân (Move-in), kiểm tra chặn nợ
            trả phòng (Move-out BR-04) và quản lý định danh phương tiện gửi xe toàn tòa nhà.
          </p>
        </div>

        {/* Primary Action Button: Universal PlayStation CTA Pill (#0070d1, 9999px) */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenAddApartment}
          className="ps-btn-primary"
          style={{
            height: 48,
            padding: '0 28px',
            borderRadius: PS_ROUNDED.full,
          }}
        >
          Thêm căn hộ mới
        </Button>
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
            TỔNG SỐ CĂN HỘ
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
            {totalApartments}
          </div>
          <span style={{ fontSize: 12, color: PS_COLORS.muteLight }}>
            Tòa A và Tòa B
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
            ĐANG CÓ CƯ DÂN (OCCUPIED)
          </span>
          <div
            className="ps-display-md"
            style={{
              fontWeight: 300,
              color: PS_COLORS.primary, // PlayStation Blue
              marginTop: 4,
              lineHeight: 1.2,
            }}
          >
            {occupiedCount}
          </div>
          <span style={{ fontSize: 12, color: PS_COLORS.muteLight }}>
            Tỷ lệ lấp đầy: {totalApartments > 0 ? Math.round((occupiedCount / totalApartments) * 100) : 0}%
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
            CĂN HỘ ĐANG TRỐNG (VACANT)
          </span>
          <div
            className="ps-display-md"
            style={{
              fontWeight: 300,
              color: PS_COLORS.muteLight,
              marginTop: 4,
              lineHeight: 1.2,
            }}
          >
            {vacantCount}
          </div>
          <span style={{ fontSize: 12, color: PS_COLORS.muteLight }}>
            Sẵn sàng tiếp nhận Move-in
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
            PHƯƠNG TIỆN ĐÃ ĐĂNG KÝ
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
            {totalVehiclesCount}
          </div>
          <span style={{ fontSize: 12, color: PS_COLORS.muteLight }}>
            Ô tô & Xe máy có thẻ định danh
          </span>
        </div>
      </div>

      {/* ====================================================================
          MAIN CARD: Filter Bar + Data Table (Level 0 Flat, 8px radius)
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
            {/* Search Input: 4px radius, 44px height */}
            <Input
              prefix={<SearchOutlined style={{ color: PS_COLORS.muteLight }} />}
              placeholder="Tìm theo mã phòng (VD: A-101)..."
              value={searchRoom}
              onChange={(e) => setSearchRoom(e.target.value)}
              style={{
                width: 260,
                height: 44,
                borderRadius: PS_ROUNDED.sm,
                borderColor: PS_COLORS.ashLight,
              }}
              allowClear
            />

            {/* Block Filter Select */}
            <Select
              value={blockFilter}
              onChange={(val) => setBlockFilter(val)}
              style={{
                width: 170,
                height: 44,
                borderRadius: PS_ROUNDED.sm,
              }}
              options={[
                { label: 'Tất cả khối nhà', value: 'ALL' },
                { label: 'Khối Tòa A', value: 'Tòa A' },
                { label: 'Khối Tòa B', value: 'Tòa B' },
              ]}
            />
          </div>

          {/* Status Filter Pills: rounded.full (9999px) */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`ps-filter-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              Tất cả ({apartments.length})
            </button>
            <button
              type="button"
              className={`ps-filter-pill ${statusFilter === 'OCCUPIED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('OCCUPIED')}
            >
              Đang cư trú ({occupiedCount})
            </button>
            <button
              type="button"
              className={`ps-filter-pill ${statusFilter === 'VACANT' ? 'active' : ''}`}
              onClick={() => setStatusFilter('VACANT')}
            >
              Đang trống ({vacantCount})
            </button>
          </div>
        </div>

        {/* Apartments Table */}
        <Table
          columns={columns}
          dataSource={filteredApartments}
          rowKey="id"
          pagination={{
            pageSize: 6,
            showSizeChanger: false,
          }}
          locale={{ emptyText: 'Không tìm thấy căn hộ phù hợp với điều kiện lọc' }}
        />
      </div>

      {/* ====================================================================
          MODAL 1: THÊM / SỬA CĂN HỘ (UC-04)
          ==================================================================== */}
      <Modal
        title={
          <span className="ps-heading-lg" style={{ fontWeight: 300, color: PS_COLORS.ink }}>
            {apartmentEditMode ? 'Chỉnh sửa thông tin căn hộ' : 'Thêm căn hộ mới vào tòa nhà'}
          </span>
        }
        open={apartmentModalOpen}
        onCancel={() => setApartmentModalOpen(false)}
        footer={null}
        destroyOnClose
        style={{ borderRadius: PS_ROUNDED.md }}
      >
        <Form
          form={aptForm}
          layout="vertical"
          onFinish={handleSaveApartment}
          style={{ marginTop: 20 }}
          requiredMark={false}
        >
          <Form.Item
            label={<span style={{ fontWeight: 600, color: PS_COLORS.ink }}>Mã phòng căn hộ</span>}
            name="room_number"
            rules={[{ required: true, message: 'Vui lòng nhập mã phòng (VD: A-101, B-502)!' }]}
          >
            <Input
              placeholder="VD: A-101"
              disabled={apartmentEditMode}
              style={{
                height: 44,
                borderRadius: PS_ROUNDED.sm,
              }}
            />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label={<span style={{ fontWeight: 600, color: PS_COLORS.ink }}>Khối nhà</span>}
              name="building_block"
              rules={[{ required: true, message: 'Vui lòng chọn khối nhà!' }]}
            >
              <Select
                style={{ height: 44, borderRadius: PS_ROUNDED.sm }}
                options={[
                  { label: 'Tòa A', value: 'Tòa A' },
                  { label: 'Tòa B', value: 'Tòa B' },
                ]}
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ fontWeight: 600, color: PS_COLORS.ink }}>Tầng lầu</span>}
              name="floor"
              rules={[{ required: true, message: 'Nhập số tầng!' }]}
            >
              <InputNumber
                min={1}
                max={50}
                style={{ width: '100%', height: 44, borderRadius: PS_ROUNDED.sm }}
              />
            </Form.Item>
          </div>

          <Form.Item
            label={<span style={{ fontWeight: 600, color: PS_COLORS.ink }}>Diện tích sử dụng (m²)</span>}
            name="area_sqm"
            rules={[{ required: true, message: 'Vui lòng nhập diện tích m²!' }]}
          >
            <InputNumber
              min={15}
              max={500}
              step={0.5}
              style={{ width: '100%', height: 44, borderRadius: PS_ROUNDED.sm }}
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button
              onClick={() => setApartmentModalOpen(false)}
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
              Lưu thông tin căn hộ
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ====================================================================
          MODAL 2: MOVE-IN - TIẾP NHẬN CƯ DÂN (UC-05)
          ==================================================================== */}
      <Modal
        title={
          <div>
            <span className="ps-heading-lg" style={{ fontWeight: 300, color: PS_COLORS.ink, display: 'block' }}>
              Tiếp nhận Cư dân mới (Move-in)
            </span>
            <span style={{ fontSize: 14, color: PS_COLORS.primary, fontWeight: 600 }}>
              Căn hộ: {selectedApartment?.room_number} ({selectedApartment?.building_block} • Tầng {selectedApartment?.floor})
            </span>
          </div>
        }
        open={moveInModalOpen}
        onCancel={() => setMoveInModalOpen(false)}
        footer={null}
        destroyOnClose
        style={{ borderRadius: PS_ROUNDED.md }}
      >
        <div style={{ marginTop: 16 }}>
          <Radio.Group
            value={moveInType}
            onChange={(e) => setMoveInType(e.target.value)}
            style={{ marginBottom: 20 }}
          >
            <Radio.Button value="NEW">Đăng ký cư dân mới</Radio.Button>
            <Radio.Button value="EXISTING">Chọn cư dân đã có (UC-03 Multi-unit)</Radio.Button>
          </Radio.Group>

          <Form
            form={moveInForm}
            layout="vertical"
            onFinish={handleConfirmMoveIn}
            requiredMark={false}
          >
            {moveInType === 'EXISTING' ? (
              <Form.Item
                label={<span style={{ fontWeight: 600, color: PS_COLORS.ink }}>Chọn cư dân đại diện</span>}
                name="existing_resident_id"
                rules={[{ required: true, message: 'Vui lòng chọn cư dân!' }]}
              >
                <Select
                  placeholder="Chọn cư dân từ danh sách..."
                  style={{ height: 44, borderRadius: PS_ROUNDED.sm }}
                  options={users
                    .filter((u) => u.role === 'RESIDENT')
                    .map((u) => ({
                      label: `${u.full_name} (${u.phone_number})`,
                      value: u.id,
                    }))}
                />
              </Form.Item>
            ) : (
              <>
                <Form.Item
                  label={<span style={{ fontWeight: 600, color: PS_COLORS.ink }}>Họ và tên cư dân đại diện</span>}
                  name="full_name"
                  rules={[{ required: true, message: 'Vui lòng nhập họ và tên cư dân!' }]}
                >
                  <Input
                    placeholder="VD: Nguyễn Văn An"
                    style={{ height: 44, borderRadius: PS_ROUNDED.sm }}
                  />
                </Form.Item>

                <Form.Item
                  label={<span style={{ fontWeight: 600, color: PS_COLORS.ink }}>Số điện thoại (dùng đăng nhập)</span>}
                  name="phone_number"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại!' },
                    { pattern: /^[0-9]{10}$/, message: 'Số điện thoại gồm 10 chữ số!' },
                  ]}
                >
                  <Input
                    placeholder="VD: 0903123456"
                    style={{ height: 44, borderRadius: PS_ROUNDED.sm }}
                  />
                </Form.Item>

                <Form.Item
                  label={<span style={{ fontWeight: 600, color: PS_COLORS.ink }}>Email liên hệ</span>}
                  name="email"
                  rules={[{ type: 'email', message: 'Email không đúng định dạng!' }]}
                >
                  <Input
                    placeholder="VD: resident@gmail.com"
                    style={{ height: 44, borderRadius: PS_ROUNDED.sm }}
                  />
                </Form.Item>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <Button
                onClick={() => setMoveInModalOpen(false)}
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
                Xác nhận Move-in
              </Button>
            </div>
          </Form>
        </div>
      </Modal>

      {/* ====================================================================
          MODAL 3: MOVE-OUT - TRẢ PHÒNG & CHẶN NỢ BR-04 (UC-06)
          ==================================================================== */}
      <Modal
        title={
          <span className="ps-heading-lg" style={{ fontWeight: 300, color: PS_COLORS.ink }}>
            Thủ tục Bàn giao trả phòng (Move-out)
          </span>
        }
        open={moveOutModalOpen}
        onCancel={() => setMoveOutModalOpen(false)}
        footer={null}
        destroyOnClose
        style={{ borderRadius: PS_ROUNDED.md }}
      >
        <div style={{ marginTop: 16 }}>
          {/* Thông tin căn hộ */}
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: PS_COLORS.surfaceCard,
              borderRadius: PS_ROUNDED.md,
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: PS_COLORS.muteLight, fontSize: 13 }}>Căn hộ:</span>
              <span style={{ fontWeight: 700, color: PS_COLORS.ink }}>
                {selectedApartment?.room_number} ({selectedApartment?.building_block})
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: PS_COLORS.muteLight, fontSize: 13 }}>Cư dân đại diện:</span>
              <span style={{ fontWeight: 600, color: PS_COLORS.ink }}>
                {selectedApartment?.resident?.full_name || '—'}
              </span>
            </div>
          </div>

          {/* KỊCH BẢN CHẶN NỢ THEO BR-04 */}
          {moveOutDebts.length > 0 ? (
            <div>
              <Alert
                message="CHẶN MOVE-OUT: CĂN HỘ CÒN CÔNG NỢ CHƯA THANH TOÁN (BR-04)"
                description="Hệ thống quy định cư dân chỉ được làm thủ tục trả phòng khi đã hoàn tất thanh toán hoặc đối soát gạch nợ xong toàn bộ hóa đơn."
                type="error"
                showIcon
                style={{
                  marginBottom: 16,
                  borderRadius: PS_ROUNDED.sm,
                  borderColor: PS_COLORS.warning,
                }}
              />

              <div style={{ marginBottom: 20 }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 600,
                    color: PS_COLORS.ink,
                    marginBottom: 8,
                  }}
                >
                  Danh sách hóa đơn chưa hoàn tất ({moveOutDebts.length} kỳ nợ):
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {moveOutDebts.map((inv) => (
                    <div
                      key={inv.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px',
                        border: `1px solid ${PS_COLORS.ashLight}`,
                        borderRadius: PS_ROUNDED.sm,
                        backgroundColor: '#fff',
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 700, color: PS_COLORS.ink, display: 'block' }}>
                          {inv.invoice_code}
                        </span>
                        <span style={{ fontSize: 12, color: PS_COLORS.muteLight }}>
                          Kỳ tháng {inv.billing_month} • Hạn trả: {inv.due_date}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            color: PS_COLORS.warning,
                            display: 'block',
                            fontSize: 14,
                          }}
                        >
                          {Number(inv.total_amount).toLocaleString('vi-VN')} đ
                        </span>
                        <Tag color={inv.status === 'PENDING' ? 'orange' : 'red'}>
                          {inv.status === 'PENDING' ? 'Chờ duyệt gạch nợ' : 'Chưa thanh toán'}
                        </Tag>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <Button
                  onClick={() => setMoveOutModalOpen(false)}
                  style={{ height: 44, borderRadius: PS_ROUNDED.full, padding: '0 24px' }}
                >
                  Đóng lại
                </Button>
                <Tooltip title="Vui lòng thanh toán công nợ hoặc duyệt hóa đơn trước khi Move-out">
                  <Button
                    disabled
                    danger
                    style={{ height: 44, borderRadius: PS_ROUNDED.full, padding: '0 24px' }}
                  >
                    Bị chặn Move-out
                  </Button>
                </Tooltip>
              </div>
            </div>
          ) : (
            <div>
              <Alert
                message="ĐỦ ĐIỀU KIỆN TRẢ PHÒNG (0 HÓA ĐƠN NỢ)"
                description="Căn hộ đã hoàn tất toàn bộ nghĩa vụ tài chính. Xác nhận làm thủ tục bàn giao chìa khóa và trả phòng?"
                type="success"
                showIcon
                style={{ marginBottom: 20, borderRadius: PS_ROUNDED.sm }}
              />

              <p style={{ color: PS_COLORS.bodyLight, fontSize: 14, lineHeight: 1.5 }}>
                Khi hoàn tất Move-out:
                <br />• Trạng thái căn hộ sẽ chuyển về <strong>VACANT (Đang trống)</strong>.
                <br />• Toàn bộ đăng ký phương tiện của căn hộ sẽ được giải phóng.
                <br />• Nếu cư dân không còn đứng tên căn hộ nào khác, tài khoản sẽ chuyển sang vô hiệu hóa.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <Button
                  onClick={() => setMoveOutModalOpen(false)}
                  style={{ height: 44, borderRadius: PS_ROUNDED.full, padding: '0 24px' }}
                >
                  Hủy bỏ
                </Button>
                <Button
                  danger
                  type="primary"
                  onClick={handleConfirmMoveOut}
                  style={{
                    height: 44,
                    borderRadius: PS_ROUNDED.full,
                    padding: '0 28px',
                    fontWeight: 700,
                  }}
                >
                  Xác nhận Bàn giao & Move-out
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ====================================================================
          MODAL 4: QUẢN LÝ PHƯƠNG TIỆN XE (UC-07)
          ==================================================================== */}
      <Modal
        title={
          <div>
            <span className="ps-heading-lg" style={{ fontWeight: 300, color: PS_COLORS.ink, display: 'block' }}>
              Quản lý Phương tiện Căn hộ
            </span>
            <span style={{ fontSize: 14, color: PS_COLORS.primary, fontWeight: 600 }}>
              Căn hộ: {selectedApartment?.room_number} ({selectedApartment?.building_block})
            </span>
          </div>
        }
        open={vehicleModalOpen}
        onCancel={() => setVehicleModalOpen(false)}
        footer={null}
        width={680}
        destroyOnClose
        style={{ borderRadius: PS_ROUNDED.md }}
      >
        <div style={{ marginTop: 16 }}>
          {/* Form thêm xe mới */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: PS_COLORS.surfaceCard,
              borderRadius: PS_ROUNDED.md,
              marginBottom: 24,
            }}
          >
            <span
              style={{
                display: 'block',
                fontWeight: 600,
                color: PS_COLORS.ink,
                fontSize: 14,
                marginBottom: 12,
              }}
            >
              Đăng ký thêm xe cho căn hộ:
            </span>

            <Form
              form={vehicleForm}
              layout="inline"
              onFinish={handleAddVehicle}
              requiredMark={false}
              style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}
            >
              <Form.Item
                name="license_plate"
                rules={[{ required: true, message: 'Nhập biển số!' }]}
                style={{ flex: 1, minWidth: 140, margin: 0 }}
              >
                <Input
                  placeholder="Biển số (VD: 30A-999.88)"
                  style={{ height: 40, borderRadius: PS_ROUNDED.sm }}
                />
              </Form.Item>

              <Form.Item
                name="vehicle_type"
                rules={[{ required: true, message: 'Chọn loại xe!' }]}
                style={{ width: 130, margin: 0 }}
              >
                <Select
                  style={{ height: 40, borderRadius: PS_ROUNDED.sm }}
                  options={[
                    { label: '🛵 Xe máy', value: 'MOTORBIKE' },
                    { label: '🚗 Ô tô', value: 'CAR' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="owner_name"
                rules={[{ required: true, message: 'Tên chủ xe!' }]}
                style={{ flex: 1, minWidth: 140, margin: 0 }}
              >
                <Input
                  placeholder="Tên chủ xe"
                  style={{ height: 40, borderRadius: PS_ROUNDED.sm }}
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                icon={<PlusOutlined />}
                className="ps-btn-primary"
                style={{ height: 40, padding: '0 20px', borderRadius: PS_ROUNDED.full }}
              >
                Đăng ký xe
              </Button>
            </Form>
          </div>

          {/* Danh sách xe hiện tại */}
          <span
            style={{
              display: 'block',
              fontWeight: 600,
              color: PS_COLORS.ink,
              fontSize: 14,
              marginBottom: 12,
            }}
          >
            Danh sách phương tiện đã đăng ký (
            {vehicles.filter((v) => v.apartment_id === selectedApartment?.id).length} xe):
          </span>

          <Table
            dataSource={vehicles.filter((v) => v.apartment_id === selectedApartment?.id)}
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: 'BIỂN SỐ XE',
                dataIndex: 'license_plate',
                key: 'license_plate',
                render: (text) => (
                  <span style={{ fontWeight: 700, color: PS_COLORS.ink, fontSize: 14 }}>
                    {text}
                  </span>
                ),
              },
              {
                title: 'LOẠI XE',
                dataIndex: 'vehicle_type',
                key: 'vehicle_type',
                render: (type) =>
                  type === 'CAR' ? (
                    <Tag color="blue" style={{ borderRadius: PS_ROUNDED.full, padding: '2px 10px' }}>
                      🚗 Ô tô
                    </Tag>
                  ) : (
                    <Tag color="green" style={{ borderRadius: PS_ROUNDED.full, padding: '2px 10px' }}>
                      🛵 Xe máy
                    </Tag>
                  ),
              },
              {
                title: 'CHỦ PHƯƠNG TIỆN',
                dataIndex: 'owner_name',
                key: 'owner_name',
              },
              {
                title: 'THAO TÁC',
                key: 'action',
                render: (_, v) => (
                  <Popconfirm
                    title="Xác nhận hủy đăng ký phương tiện này?"
                    onConfirm={() => handleDeleteVehicle(v.id)}
                    okText="Hủy xe"
                    cancelText="Đóng"
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      style={{ borderRadius: PS_ROUNDED.full }}
                    >
                      Hủy xe
                    </Button>
                  </Popconfirm>
                ),
              },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ApartmentManagement;
