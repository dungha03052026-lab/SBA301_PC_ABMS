/**
 * Phân hệ Quản lý Căn hộ & Cư dân (Apartment Management Module - Admin).
 * 
 * Các ca sử dụng và nghiệp vụ trọng tâm:
 * 1. UC-04: Tra cứu, thêm mới, sửa, xóa thông tin căn hộ (Số phòng, tòa, tầng, diện tích).
 * 2. UC-05: Thủ tục dọn vào (Move-In):
 *    - Gán cư dân đã có trên hệ thống (Hỗ trợ 1 cư dân sở hữu nhiều căn hộ BR-02).
 *    - Tạo mới cư dân với mật khẩu mặc định '123456'.
 * 3. UC-06: Thủ tục dọn đi (Move-Out):
 *    - Ràng buộc BR-04: Kiểm tra và chặn Move-out nếu căn hộ còn hóa đơn UNPAID hoặc PENDING.
 *    - Xóa các phương tiện xe đã đăng ký của căn hộ.
 *    - Chuyển trạng thái căn hộ về VACANT.
 *    - Tự động khóa mềm tài khoản cư dân (is_active = 0) nếu người đó không còn sở hữu căn hộ nào khác.
 * 4. UC-07: Đăng ký và quản lý phương tiện gửi xe (Xe máy, Ô tô) gắn liền với căn hộ.
 * 5. Bộ lọc đa tiêu chí: Lọc theo Tòa nhà, Tầng, Trạng thái (Trống / Đang ở), và ô tìm kiếm tức thì.
 */
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
import axiosClient from '../../shared/api/axiosClient';
import { PS_COLORS, PS_ROUNDED } from '../../shared/theme/playstationTheme';

const ApartmentManagement = () => {
  // ==========================================
  // 1. STATE & DATA INITIALIZATION
  // ==========================================
  const [apartments, setApartments] = useState([]);
  const [backendApartments, setBackendApartments] = useState([]);
  const [backendResidents, setBackendResidents] = useState(null);
  const [isBackendLive, setIsBackendLive] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);
  const [backendStats, setBackendStats] = useState({ total: 0, occupied: 0, vacant: 0, vehicles: 0 });

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
  const [modalVehicles, setModalVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  // Forms
  const [aptForm] = Form.useForm();
  const [moveInForm] = Form.useForm();
  const [vehicleForm] = Form.useForm();

  // Load data from LocalStorage MockDB (offline baseline)
  const reloadData = () => {
    setApartments(MockDB.getApartments());
    setUsers(MockDB.getUsers());
    setVehicles(MockDB.getVehicles());
    setInvoices(MockDB.getInvoices());
  };

  // Tải danh sách cư dân (role RESIDENT) từ Backend cho modal Move-in (UC-05)
  const fetchResidentsFromBackend = async () => {
    try {
      const res = await axiosClient.get('/admin/users/residents');
      const dataList = res?.data || res;
      if (Array.isArray(dataList)) {
        setBackendResidents(
          dataList.map((r) => ({
            id: r.id,
            full_name: r.fullName,
            phone_number: r.phoneNumber,
            email: r.email,
            role: r.role || 'RESIDENT',
            is_active: r.isActive,
          }))
        );
      }
    } catch (err) {
      console.warn('Không thể tải danh sách cư dân từ Backend, dùng MockDB:', err);
    }
  };

  useEffect(() => {
    reloadData();
    fetchResidentsFromBackend();
  }, []);

  // Gọi REST API Backend Spring Boot (JPA Criteria API / ApartmentSpecification)
  const fetchApartmentsFromBackend = async (block, status, search) => {
    setLoadingTable(true);
    try {
      const params = {};
      if (search && search.trim()) {
        params.search = search.trim();
      }
      if (block && block !== 'ALL') {
        params.buildingBlock = block;
      }
      if (status && status !== 'ALL') {
        params.status = status;
      }

      // axiosClient interceptor đã trả về response.data (ApiResponse)
      const res = await axiosClient.get('/admin/apartments/all', { params });
      const dataList = res?.data || res;

      if (Array.isArray(dataList)) {
        const mapped = dataList.map((apt) => ({
          id: apt.id,
          room_number: apt.roomNumber,
          floor: apt.floor,
          building_block: apt.buildingBlock,
          area_sqm: apt.areaSqm,
          status: apt.status,
          resident_id: apt.resident?.id || null,
          resident: apt.resident
            ? {
                id: apt.resident.id,
                full_name: apt.resident.fullName,
                phone_number: apt.resident.phoneNumber,
                email: apt.resident.email,
              }
            : null,
          vehicles: [],
          vehicleCount: apt.vehicleCount || 0,
          updated_at: apt.updatedAt,
        }));

        setBackendApartments(mapped);
        setIsBackendLive(true);

        // Lưu thông số tổng quan khi không lọc
        if ((!search || !search.trim()) && block === 'ALL' && status === 'ALL') {
          const occ = mapped.filter((a) => a.status === 'OCCUPIED').length;
          const vac = mapped.filter((a) => a.status === 'VACANT').length;
          const totalVeh = mapped.reduce((sum, a) => sum + (a.vehicleCount || 0), 0);
          setBackendStats({
            total: mapped.length,
            occupied: occ,
            vacant: vac,
            vehicles: totalVeh,
          });
        }
        return;
      }
    } catch (err) {
      console.warn('Backend Criteria API offline hoặc chưa đăng nhập, sử dụng MockDB:', err);
      setIsBackendLive(false);
    } finally {
      setLoadingTable(false);
    }
  };

  // Debounce gọi API Criteria mỗi khi người dùng thay đổi bộ lọc
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApartmentsFromBackend(blockFilter, statusFilter, searchRoom);
    }, 250);

    return () => clearTimeout(timer);
  }, [blockFilter, statusFilter, searchRoom]);

  // Map resident and vehicle count cho MockDB
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

  // Filtered List fallback (Offline Client-side)
  const filteredApartments = useMemo(() => {
    return apartmentListWithMeta.filter((apt) => {
      const q = searchRoom.trim().toLowerCase();
      const matchRoom = (apt.room_number || '').toLowerCase().includes(q) ||
        (apt.resident?.full_name || '').toLowerCase().includes(q) ||
        (apt.resident?.phone_number || '').includes(q);
      const matchBlock =
        blockFilter === 'ALL' || apt.building_block === blockFilter;
      const matchStatus =
        statusFilter === 'ALL' || apt.status === statusFilter;
      return matchRoom && matchBlock && matchStatus;
    });
  }, [apartmentListWithMeta, searchRoom, blockFilter, statusFilter]);

  // Dữ liệu hiển thị cuối cùng: Ưu tiên dữ liệu lọc từ Backend Criteria API
  const displayedApartments = useMemo(() => {
    if (isBackendLive) {
      return backendApartments;
    }
    return filteredApartments;
  }, [isBackendLive, backendApartments, filteredApartments]);

  // Danh sách cư dân hiển thị trong dropdown "Chọn cư dân đã có (UC-05)"
  const residentOptions = useMemo(() => {
    const mapOption = (u) => ({
      label: `${u.full_name} (${u.phone_number})`,
      value: u.id,
    });

    if (isBackendLive && Array.isArray(backendResidents)) {
      return backendResidents.map(mapOption);
    }

    if (isBackendLive) {
      const byId = new Map();
      backendApartments.forEach((apt) => {
        if (apt.resident?.id) {
          byId.set(apt.resident.id, apt.resident);
        }
      });
      return Array.from(byId.values()).map(mapOption);
    }

    return users.filter((u) => u.role === 'RESIDENT').map(mapOption);
  }, [isBackendLive, backendResidents, backendApartments, users]);

  // Metrics summary
  const totalApartments = isBackendLive ? (backendStats.total || backendApartments.length) : apartments.length;
  const occupiedCount = isBackendLive ? (backendStats.occupied || backendApartments.filter((a) => a.status === 'OCCUPIED').length) : apartments.filter((a) => a.status === 'OCCUPIED').length;
  const vacantCount = isBackendLive ? (backendStats.vacant || backendApartments.filter((a) => a.status === 'VACANT').length) : apartments.filter((a) => a.status === 'VACANT').length;
  const totalVehiclesCount = isBackendLive ? backendStats.vehicles : vehicles.length;

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
    const payload = {
      roomNumber: values.room_number?.trim(),
      buildingBlock: values.building_block,
      floor: values.floor,
      areaSqm: values.area_sqm,
    };

    try {
      if (apartmentEditMode && selectedApartment) {
        // 1. Thử gọi API Backend Cập nhật vào MSSQL
        try {
          await axiosClient.put(`/admin/apartments/${selectedApartment.id}`, payload);
          message.success(`Cập nhật căn hộ ${values.room_number} thành công trên CSDL!`);
          setApartmentModalOpen(false);
          await fetchApartmentsFromBackend(blockFilter, statusFilter, searchRoom);
          return;
        } catch (apiErr) {
          if (apiErr.response?.data?.message) {
            message.error(apiErr.response.data.message);
            return;
          }
          console.warn('API update failed, fallback to MockDB', apiErr);
        }

        // Fallback MockDB
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
        // 2. Thử gọi API Backend Thêm mới vào MSSQL
        try {
          await axiosClient.post('/admin/apartments', payload);
          message.success(`Thêm mới căn hộ ${payload.roomNumber} thành công vào CSDL MSSQL!`);
          setApartmentModalOpen(false);
          await fetchApartmentsFromBackend(blockFilter, statusFilter, searchRoom);
          return;
        } catch (apiErr) {
          if (apiErr.response?.data?.message) {
            message.error(apiErr.response.data.message);
            return;
          }
          console.warn('API create failed, fallback to MockDB', apiErr);
        }

        // Tạo mới - kiểm tra trùng mã phòng (Offline MockDB)
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
    fetchResidentsFromBackend();
  };

  const handleConfirmMoveIn = async (values) => {
    try {
      const moveInPayload =
        moveInType === 'EXISTING'
          ? { residentId: values.existing_resident_id }
          : {
              fullName: values.full_name?.trim(),
              phoneNumber: values.phone_number?.trim(),
              email: values.email?.trim() || undefined,
            };

      // 1. Thử gọi API Backend Spring Boot
      try {
        await axiosClient.post(`/admin/apartments/${selectedApartment.id}/move-in`, moveInPayload);
        message.success(`Tiếp nhận Move-in thành công cho căn hộ ${selectedApartment.room_number} trên CSDL!`);
        setMoveInModalOpen(false);
        await Promise.all([
          fetchApartmentsFromBackend(blockFilter, statusFilter, searchRoom),
          fetchResidentsFromBackend(),
        ]);
        return;
      } catch (apiErr) {
        if (apiErr.response?.data?.message) {
          message.error(apiErr.response.data.message);
          return;
        }
        console.warn('Move-in API failed, fallback MockDB', apiErr);
      }

      // Fallback MockDB
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

  const handleConfirmMoveOut = async () => {
    if (moveOutDebts.length > 0) {
      message.error('Không thể thực hiện Move-out vì căn hộ còn công nợ chưa thanh toán!');
      return;
    }

    try {
      // 1. Thử gọi API Backend Spring Boot
      try {
        await axiosClient.post(`/admin/apartments/${selectedApartment.id}/move-out`);
        message.success(`Đã hoàn tất bàn giao Move-out cho căn hộ ${selectedApartment.room_number} trên CSDL!`);
        setMoveOutModalOpen(false);
        await Promise.all([
          fetchApartmentsFromBackend(blockFilter, statusFilter, searchRoom),
          fetchResidentsFromBackend(),
        ]);
        return;
      } catch (apiErr) {
        if (apiErr.response?.data?.message) {
          message.error(apiErr.response.data.message);
          return;
        }
        console.warn('Move-out API failed, fallback MockDB', apiErr);
      }

      const oldResidentId = selectedApartment.resident_id;

      // 1. Cập nhật căn hộ về VACANT (Fallback MockDB)
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
  const resetVehicleForm = (apt) => {
    vehicleForm.resetFields();
    if (apt?.resident) {
      vehicleForm.setFieldsValue({
        owner_name: apt.resident.full_name,
        vehicle_type: 'MOTORBIKE',
      });
    }
  };

  const fetchVehiclesForApartment = async (apartmentId) => {
    setLoadingVehicles(true);
    try {
      const res = await axiosClient.get(`/admin/apartments/${apartmentId}/vehicles`);
      const dataList = res?.data || res;
      if (Array.isArray(dataList)) {
        const mapped = dataList.map((v) => ({
          id: v.id,
          apartment_id: v.apartmentId ?? apartmentId,
          license_plate: v.licensePlate,
          vehicle_type: v.vehicleType,
          owner_name: v.ownerName,
          created_at: v.createdAt,
        }));
        setModalVehicles(mapped);
        return;
      }
    } catch (err) {
      console.warn('Cannot load vehicles from backend, using MockDB:', err);
    } finally {
      setLoadingVehicles(false);
    }
    setModalVehicles(MockDB.getVehicles().filter((v) => v.apartment_id === apartmentId));
  };

  const handleOpenVehicles = (record) => {
    setSelectedApartment(record);
    setModalVehicles([]);
    resetVehicleForm(record);
    setVehicleModalOpen(true);
    fetchVehiclesForApartment(record.id);
  };

  const handleAddVehicle = async (values) => {
    try {
      const vehiclePayload = {
        licensePlate: values.license_plate.trim().toUpperCase(),
        vehicleType: values.vehicle_type,
        ownerName: values.owner_name?.trim(),
      };

      // 1. Thử gọi API Backend Spring Boot
      try {
        await axiosClient.post(`/admin/apartments/${selectedApartment.id}/vehicles`, vehiclePayload);
        message.success(`Đăng ký phương tiện ${vehiclePayload.licensePlate} thành công trên CSDL!`);
        resetVehicleForm(selectedApartment);
        await fetchVehiclesForApartment(selectedApartment.id);
        await fetchApartmentsFromBackend(blockFilter, statusFilter, searchRoom);
        return;
      } catch (apiErr) {
        if (apiErr.response?.data?.message) {
          message.error(apiErr.response.data.message);
          return;
        }
        console.warn('Add vehicle API failed, fallback MockDB', apiErr);
      }

      // Fallback MockDB
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
      setModalVehicles(updatedVehicles.filter((v) => v.apartment_id === selectedApartment.id));
      message.success(`Đăng ký phương tiện ${newVehicle.license_plate} thành công!`);

      resetVehicleForm(selectedApartment);
      reloadData();
    } catch {
      message.error('Lỗi khi đăng ký xe!');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      try {
        await axiosClient.delete(`/admin/apartments/${selectedApartment.id}/vehicles/${vehicleId}`);
        message.success('Đã hủy đăng ký phương tiện trên CSDL!');
        await fetchVehiclesForApartment(selectedApartment.id);
        await fetchApartmentsFromBackend(blockFilter, statusFilter, searchRoom);
        return;
      } catch (apiErr) {
        if (apiErr.response?.data?.message) {
          message.error(apiErr.response.data.message);
          return;
        }
        console.warn('Delete vehicle API failed, fallback MockDB', apiErr);
      }

      const updated = vehicles.filter((v) => v.id !== vehicleId);
      MockDB.saveVehicles(updated);
      setModalVehicles(updated.filter((v) => v.apartment_id === selectedApartment.id));
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
        const vehiclesList = record.vehicles || [];
        const count = record.vehicleCount !== undefined ? record.vehicleCount : vehiclesList.length;
        const carCount = vehiclesList.filter((v) => v.vehicle_type === 'CAR').length;
        const motorCount = vehiclesList.filter((v) => v.vehicle_type === 'MOTORBIKE').length;

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
            {count} xe {vehiclesList.length > 0 ? `(${carCount} ô tô, ${motorCount} xe máy)` : ''}
          </Button>
        );
      },
    },
    {
      title: 'THAO TÁC NGHIỆP VỤ',
      key: 'actions',
      render: (_, record) => {
        const primaryRowActionStyle = {
          height: 36,
          minWidth: 116,
          padding: '0 16px',
          fontSize: 13,
          fontWeight: 600,
          borderRadius: PS_ROUNDED.full,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        };

        return (
          <Space size="small">
            {record.status === 'VACANT' ? (
              <Button
                type="primary"
                icon={<LoginOutlined />}
                onClick={() => handleOpenMoveIn(record)}
                style={{
                  ...primaryRowActionStyle,
                  backgroundColor: PS_COLORS.primary,
                  borderColor: PS_COLORS.primary,
                  color: PS_COLORS.onPrimary,
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
                  ...primaryRowActionStyle,
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
                fontWeight: 600,
                padding: '0 16px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Sửa
            </Button>
          </Space>
        );
      },
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
            PHÂN HỆ QUẢN LÝ MẶT BẰNG & CƯ DÂN
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
            trả phòng (Move-out) và quản lý định danh phương tiện gửi xe toàn tòa nhà.
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
              placeholder="Tìm theo phòng, cư dân, SĐT..."
              value={searchRoom}
              onChange={(e) => setSearchRoom(e.target.value)}
              style={{
                width: 280,
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
                width: 160,
                height: 44,
                borderRadius: PS_ROUNDED.sm,
              }}
              options={[
                { label: 'Tất cả khối nhà', value: 'ALL' },
                { label: 'Khối Tòa A', value: 'Tòa A' },
                { label: 'Khối Tòa B', value: 'Tòa B' },
              ]}
            />

            {/* Status Filter Select (Dropdown Trạng thái phòng) */}
            <Select
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              style={{
                width: 200,
                height: 44,
                borderRadius: PS_ROUNDED.sm,
              }}
              options={[
                { label: 'Tất cả trạng thái', value: 'ALL' },
                { label: 'Đang cư trú (OCCUPIED)', value: 'OCCUPIED' },
                { label: 'Đang trống (VACANT)', value: 'VACANT' },
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
              Tất cả ({totalApartments})
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
          dataSource={displayedApartments}
          rowKey="id"
          loading={loadingTable}
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
            <Radio.Button value="EXISTING">Chọn cư dân đã có (Nhiều căn hộ)</Radio.Button>
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
                  showSearch
                  optionFilterProp="label"
                  placeholder="Chọn cư dân từ danh sách..."
                  style={{ height: 44, borderRadius: PS_ROUNDED.sm }}
                  options={residentOptions}
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
                message="CHẶN MOVE-OUT: CĂN HỘ CÒN CÔNG NỢ CHƯA THANH TOÁN"
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
            Danh sách phương tiện đã đăng ký ({modalVehicles.length} xe):
          </span>

          <Table
            dataSource={modalVehicles}
            loading={loadingVehicles}
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
