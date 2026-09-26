import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingState } from '../common/LoadingState';

export const RoleRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingState message="Checking security authorization..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = (user?.role_name || user?.role || '').toLowerCase();
  const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());

  if (normalizedAllowed.length > 0 && !normalizedAllowed.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
