// src/shared/context/ApartmentContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { MockDB } from '../constants/mockData';

const ApartmentContext = createContext(null);

export const ApartmentProvider = ({ children }) => {
  const { user } = useAuth();
  const [apartments, setApartments] = useState([]);
  const [selectedApartmentId, setSelectedApartmentId] = useState(null);

  // Tải danh sách căn hộ của resident
  const loadApartments = useCallback(() => {
    if (!user || user.role !== 'RESIDENT') {
      setApartments([]);
      setSelectedApartmentId(null);
      return;
    }

    const allApts = MockDB.getApartments();
    const userApts = allApts.filter(
      (apt) => apt.resident_id === user.id && apt.status === 'OCCUPIED'
    );
    setApartments(userApts);

    // Xử lý selectedApartmentId
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
