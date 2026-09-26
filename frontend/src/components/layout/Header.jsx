import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Bell, User, LogOut, Menu, Calendar, 
  Settings, ChevronDown 
} from 'lucide-react';
import { SchoolLogo } from '../common/SchoolLogo';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export const Header = ({ onToggleSidebar, onToggleMobile }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-16 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
          aria-label="Toggle navigation drawer"
        >
          <Menu size={20} />
        </button>

        <Link to="/dashboard" className="flex items-center gap-3">
          <SchoolLogo size={36} showText={false} />
          <div className="hidden sm:block">
            <h1 className="text-xs font-bold text-primary tracking-wide leading-none uppercase">
              ST. MARTIN'S MATRICULATION HR.SEC. SCHOOL
            </h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-tight mt-0.5">
              Behaviour & Discipline Monitoring System
            </p>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-slate-700 text-xs font-medium">
          <Calendar size={13} className="text-primary" />
          <span>Academic Year: <strong>2026 - 2027</strong></span>
        </div>

        <Link
          to="/notifications"
          className="relative p-2 rounded-full text-slate-600 hover:bg-slate-100 transition focus:outline-none"
          title="Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
              {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {user?.first_name || user?.username}
              </div>
              <div className="text-[10px] text-slate-500 capitalize">
                {user?.role_name || user?.role || 'Staff'}
              </div>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden md:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 animate-in fade-in-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{user?.first_name} {user?.last_name || ''}</p>
                <p className="text-[11px] text-slate-500 font-mono truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  {user?.role_name || user?.role}
                </span>
              </div>

              <Link
                to="/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
              >
                <User size={14} className="text-slate-500" /> My Profile
              </Link>

              {['admin', 'administrator'].includes((user?.role_name || user?.role || '').toLowerCase()) && (
                <Link
                  to="/masters"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                >
                  <Settings size={14} className="text-slate-500" /> Master Settings
                </Link>
              )}

              <div className="border-t border-slate-100 my-1"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left"
              >
                <LogOut size={14} /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
