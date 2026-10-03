import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, AlertTriangle,
  FileText, Shield, Settings, FileSpreadsheet, Bell, MessageSquare, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import schoolLogo from '../assets/school_logo.png';

export const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const userRole = (user?.role_code || user?.role?.role_code || user?.role || '').toLowerCase();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Students', path: '/students', icon: Users },
    { label: 'Behaviour', path: '/behaviour', icon: AlertTriangle },
    { label: 'Attendance', path: '/attendance', icon: UserCheck },
    { label: 'Reports', path: '/reports', icon: FileText },
  ];

  if (['admin', 'administrator'].includes(userRole)) {
    navItems.push(
      { label: 'User Management', path: '/users', icon: Shield },
      { label: 'Master Settings', path: '/masters', icon: Settings },
      { label: 'Audit Logs', path: '/audit', icon: FileSpreadsheet }
    );
  }

  if (['parent', 'guardian'].includes(userRole)) {
    navItems.push(
      { label: 'Support', path: '/support', icon: MessageSquare }
    );
  }

  const getRoleLabel = () => {
    switch (userRole) {
      case 'admin':
      case 'administrator':
        return { title: 'Administrator', sub: 'System Administration' };
      case 'teacher':
        return { title: 'Teacher / Staff', sub: 'Daily Operations' };
      case 'principal':
        return { title: 'Principal', sub: 'Monitoring & Decisions' };
      case 'student':
        return { title: 'Student', sub: 'Personal View' };
      case 'parent':
        return { title: 'Parent / Guardian', sub: 'Child Monitoring' };
      default:
        return { title: userRole || 'User', sub: 'Portal Access' };
    }
  };

  const roleMeta = getRoleLabel();

  return (
    <aside className="sidebar">
      <div className="side-brand">
        <img src={schoolLogo} alt="School Logo" />
        <div>
          <strong>ST. MARTIN'S</strong>
          <small>Matriculation School</small>
        </div>
      </div>

      <div className="role-pill">
        <strong style={{ display: 'block' }}>{roleMeta.title}</strong>
        <small style={{ opacity: 0.8 }}>{roleMeta.sub}</small>
      </div>

      <div className="nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={isActive ? 'active' : ''}
            >
              <span className="nav-icon"><Icon size={18} /></span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="side-footer">
        <button onClick={logout}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
