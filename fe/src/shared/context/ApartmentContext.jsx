/**
 * Quản lý ngữ cảnh Căn hộ cho Cư dân (Apartment Context).
 * 
 * Nghiệp vụ cốt lõi:
 * 1. Quan hệ Căn hộ - Cư dân (1-N): Một cư dân có thể đứng tên nhiều căn hộ OCCUPIED.
 * 2. Chuyển đổi căn hộ (UC-03): Cư dân có thể chọn xem dữ liệu hóa đơn, báo hỏng theo từng căn hộ
 *    thông qua `selectedApartmentId`, được đồng bộ bền vững trong LocalStorage.
 * 3. Hỗ trợ nạp từ API GET /api/v1/resident/apartments kèm fallback sang MockDB nếu offline.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import axiosClient from '../api/axiosClient';
import { MockDB, IS_MOCK_FALLBACK_ENABLED } from '../constants/mockData';

const ApartmentContext = createContext(null);

export const ApartmentProvider = ({ children }) => {
  const { user } = useAuth();
  const [apartments, setApartments] = useState([]);
  const [selectedApartmentId, setSelectedApartmentId] = useState(null);

  // Tải danh sách căn hộ của resident từ Backend API (kèm fallback MockDB)
  const loadApartments = useCallback(async () => {
    if (!user || user.role !== 'RESIDENT') {
      setApartments([]);
      setSelectedApartmentId(null);
      return;
    }

    let userApts = [];
    try {
      const res = await axiosClient.get('/resident/apartments');
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        userApts = res.data.map(apt => ({
          id: apt.id,
          room_number: apt.roomNumber,
          building_block: apt.buildingBlock,
          floor: apt.floor,
          area_sqm: apt.areaSqm,
          status: apt.status,
          resident_id: apt.resident ? apt.resident.id : user.id,
        }));
      }
    } catch (e) {
      console.warn('Cannot load apartments from backend, using MockDB:', e);
    }

    // Fallback MockDB chỉ khi được bật cờ offline dev
    if (IS_MOCK_FALLBACK_ENABLED && userApts.length === 0) {
      const allApts = MockDB.getApartments();
      userApts = allApts.filter(
        (apt) => apt.resident_id === user.id && apt.status === 'OCCUPIED'
      );
    }

    setApartments(userApts);

    // Xử lý căn hộ đang được lựa chọn (selectedApartmentId)
    const savedId = localStorage.getItem('selectedApartmentId');
    const parsedSavedId = savedId ? parseInt(savedId, 10) : null;

    const exists = userApts.some((a) => a.id === parsedSavedId);
    if (exists) {
      setSelectedApartmentId(parsedSavedId);
    } else if (userApts.length > 0) {
      const defaultId = userApts[0].id;
      setSelectedApartmentId(defaultId);
      localStorage.setItem('selectedApartmentId', defaultId.toString());
    } else {
      setSelectedApartmentId(null);
      localStorage.removeItem('selectedApartmentId');
    }
  }, [user]);

  useEffect(() => {
    loadApartments();
  }, [loadApartments]);

  // Đổi căn hộ đang thao tác (UC-03)
  const switchApartment = (aptId) => {
    const id = parseInt(aptId, 10);
    setSelectedApartmentId(id);
    localStorage.setItem('selectedApartmentId', id.toString());
  };

  // Đối tượng căn hộ chi tiết đang được chọn
  const selectedApartment = apartments.find((a) => a.id === selectedApartmentId) || null;

  return (
    <ApartmentContext.Provider
      value={{
        apartments,
        selectedApartmentId,
        selectedApartment,
        switchApartment,
        refreshApartments: loadApartments,
      }}
    >
      {children}
    </ApartmentContext.Provider>
  );
};

export const useApartment = () => useContext(ApartmentContext);
