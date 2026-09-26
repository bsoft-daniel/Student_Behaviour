import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { RoleRoute } from '../components/layout/RoleRoute';
import { MainLayout } from '../components/layout/MainLayout';

// Auth
import { LoginPage } from '../pages/auth/LoginPage';

// Dashboards
import { DashboardDispatcher } from '../pages/dashboard/DashboardDispatcher';

// Students
import { StudentListPage } from '../pages/students/StudentListPage';
import { StudentDetailPage } from '../pages/students/StudentDetailPage';

// Attendance
import { AttendanceListPage } from '../pages/attendance/AttendanceListPage';
import { AttendanceMarkPage } from '../pages/attendance/AttendanceMarkPage';

// Behaviour
import { BehaviourListPage } from '../pages/behaviour/BehaviourListPage';
import { BehaviourDetailPage } from '../pages/behaviour/BehaviourDetailPage';

// Reports
import { ReportsHubPage } from '../pages/reports/ReportsHubPage';

// Users & Roles
import { UserListPage } from '../pages/users/UserListPage';
import { RolePermissionsPage } from '../pages/users/RolePermissionsPage';

// Masters
import { MasterSettingsPage } from '../pages/masters/MasterSettingsPage';

// Common
import { NotificationCenterPage } from '../pages/notifications/NotificationCenterPage';
import { SupportTicketsPage } from '../pages/support/SupportTicketsPage';
import { AuditLogsPage } from '../pages/audit/AuditLogsPage';
import { UserProfilePage } from '../pages/profile/UserProfilePage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardDispatcher />} />

        {/* Student Management */}
        <Route path="students" element={<StudentListPage />} />
        <Route path="students/:id" element={<StudentDetailPage />} />

        {/* Attendance */}
        <Route path="attendance" element={<AttendanceListPage />} />
        <Route
          path="attendance/mark"
          element={
            <RoleRoute allowedRoles={['admin', 'administrator', 'teacher', 'staff']}>
              <AttendanceMarkPage />
            </RoleRoute>
          }
        />

        {/* Behaviour */}
        <Route path="behaviour" element={<BehaviourListPage />} />
        <Route path="behaviour/:id" element={<BehaviourDetailPage />} />

        {/* Reports */}
        <Route path="reports" element={<ReportsHubPage />} />

        {/* Admin Section */}
        <Route
          path="users"
          element={
            <RoleRoute allowedRoles={['admin', 'administrator']}>
              <UserListPage />
            </RoleRoute>
          }
        />
        <Route
          path="roles"
          element={
            <RoleRoute allowedRoles={['admin', 'administrator']}>
              <RolePermissionsPage />
            </RoleRoute>
          }
        />
        <Route
          path="masters"
          element={
            <RoleRoute allowedRoles={['admin', 'administrator']}>
              <MasterSettingsPage />
            </RoleRoute>
          }
        />

        {/* Audit Logs */}
        <Route
          path="audit"
          element={
            <RoleRoute allowedRoles={['admin', 'administrator', 'principal', 'management']}>
              <AuditLogsPage />
            </RoleRoute>
          }
        />

        {/* Common Profiles & Desks */}
        <Route path="notifications" element={<NotificationCenterPage />} />
        <Route path="support" element={<SupportTicketsPage />} />
        <Route path="profile" element={<UserProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
