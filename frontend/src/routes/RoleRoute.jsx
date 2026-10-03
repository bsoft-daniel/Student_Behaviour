import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RoleRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useAuth();
  if (!allowedRoles || allowedRoles.length === 0) return children;

  const rawRole = user?.role_code || user?.role_name || user?.role?.role_code || user?.role?.role_name || user?.role || '';
  const userRole = String(rawRole).toLowerCase().trim();

  const isAllowed = allowedRoles.some(r => {
    const target = String(r).toLowerCase().trim();
    return userRole === target || userRole.includes(target) || target.includes(userRole);
  });

  if (!isAllowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

