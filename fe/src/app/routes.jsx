// src/app/routes.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../shared/context/AuthContext';
import { ApartmentProvider } from '../shared/context/ApartmentContext';
import ProtectedRoute from '../shared/components/ProtectedRoute';

// Layouts
import AdminLayout from '../shared/layouts/AdminLayout';
import ResidentLayout from '../shared/layouts/ResidentLayout';
import TechLayout from '../shared/layouts/TechLayout';

// Auth Pages
import LoginPage from '../modules/auth/LoginPage';

// Admin Pages
import ApartmentManagement from '../modules/admin/ApartmentManagement';
import MeterReading from '../modules/admin/MeterReading';
import InvoiceApproval from '../modules/admin/InvoiceApproval';
import TicketManagement from '../modules/admin/TicketManagement';
import Announcements from '../modules/admin/Announcements';

// Resident Pages
import MyInvoices from '../modules/resident/MyInvoices';
import ReportTicket from '../modules/resident/ReportTicket';
import ResidentAnnouncements from '../modules/resident/ResidentAnnouncements';

// Technician Pages
import TaskPool from '../modules/technician/TaskPool';
import MyTasks from '../modules/technician/MyTasks';

const AppRoutes = () => {
  return (
    <AuthProvider>
      <ApartmentProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Phân hệ ADMIN */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="apartments" replace />} />
              <Route path="apartments" element={<ApartmentManagement />} />
              <Route path="meter-reading" element={<MeterReading />} />
              <Route path="invoices" element={<InvoiceApproval />} />
              <Route path="tickets" element={<TicketManagement />} />
              <Route path="announcements" element={<Announcements />} />
            </Route>

            {/* Phân hệ RESIDENT (Cư dân) */}
            <Route
              path="/resident"
              element={
                <ProtectedRoute allowedRoles={['RESIDENT']}>
                  <ResidentLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="invoices" replace />} />
              <Route path="invoices" element={<MyInvoices />} />
              <Route path="tickets" element={<ReportTicket />} />
              <Route path="announcements" element={<ResidentAnnouncements />} />
            </Route>

            {/* Phân hệ TECHNICIAN (Kỹ thuật) */}
            <Route
              path="/technician"
              element={
                <ProtectedRoute allowedRoles={['TECHNICIAN']}>
                  <TechLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="task-pool" replace />} />
              <Route path="task-pool" element={<TaskPool />} />
              <Route path="my-tasks" element={<MyTasks />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ApartmentProvider>
    </AuthProvider>
  );
};

export default AppRoutes;
