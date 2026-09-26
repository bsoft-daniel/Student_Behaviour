import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import { TeacherDashboard } from './TeacherDashboard';
import { PrincipalDashboard } from './PrincipalDashboard';
import { StudentDashboard } from './StudentDashboard';
import { ParentDashboard } from './ParentDashboard';
import { LoadingState } from '../../components/common/LoadingState';

export const DashboardDispatcher = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState message="Loading your dashboard..." />;
  }

  const role = (user?.role_name || user?.role || '').toLowerCase();

  switch (role) {
    case 'admin':
    case 'administrator':
      return <AdminDashboard />;
    case 'teacher':
    case 'staff':
      return <TeacherDashboard />;
    case 'principal':
    case 'management':
      return <PrincipalDashboard />;
    case 'student':
      return <StudentDashboard />;
    case 'parent':
    case 'guardian':
      return <ParentDashboard />;
    default:
      return <AdminDashboard />;
  }
};
