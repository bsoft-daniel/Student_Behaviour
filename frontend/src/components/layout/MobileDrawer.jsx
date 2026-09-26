import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  X, LayoutDashboard, Users, CalendarCheck, ShieldAlert, 
  FileText, UserCheck, Shield, Settings, Activity, 
  HelpCircle, Bell, User, LogOut 
} from 'lucide-react';
import { SchoolLogo } from '../common/SchoolLogo';
import { useAuth } from '../../context/AuthContext';

export const MobileDrawer = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  if (!isOpen) return null;

  const role = (user?.role_name || user?.role || '').toLowerCase();
  const isAdmin = role === 'admin' || role === 'administrator';
  const isStudent = role === 'student';
  const isParent = role === 'parent' || role === 'guardian';

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition ${
      isActive
        ? 'bg-primary text-white shadow-sm'
        : 'text-slate-700 hover:bg-slate-100'
    }`;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col justify-between p-4 z-10 overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <SchoolLogo size={32} showText={false} />
              <div>
                <h2 className="text-xs font-bold text-primary leading-tight">ST. MARTIN'S</h2>
                <p className="text-[10px] text-slate-500">Matriculation Hr.Sec. School</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-1">
            <NavLink to="/dashboard" onClick={onClose} className={navItemClass}>
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>
            <NavLink to="/students" onClick={onClose} className={navItemClass}>
              <Users size={18} /> {isParent ? 'My Children' : isStudent ? 'My Profile' : 'Students'}
            </NavLink>
            <NavLink to="/attendance" onClick={onClose} className={navItemClass}>
              <CalendarCheck size={18} /> Attendance
            </NavLink>
            <NavLink to="/behaviour" onClick={onClose} className={navItemClass}>
              <ShieldAlert size={18} /> Behaviour Logs
            </NavLink>
            <NavLink to="/reports" onClick={onClose} className={navItemClass}>
              <FileText size={18} /> Reports Hub
            </NavLink>

            {isAdmin && (
              <>
                <div className="pt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3">
                  Admin
                </div>
                <NavLink to="/users" onClick={onClose} className={navItemClass}>
                  <UserCheck size={18} /> User Accounts
                </NavLink>
                <NavLink to="/roles" onClick={onClose} className={navItemClass}>
                  <Shield size={18} /> RBAC Permissions
                </NavLink>
                <NavLink to="/masters" onClick={onClose} className={navItemClass}>
                  <Settings size={18} /> Master Settings
                </NavLink>
                <NavLink to="/audit" onClick={onClose} className={navItemClass}>
                  <Activity size={18} /> Audit Trail
                </NavLink>
              </>
            )}

            <div className="pt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3">
              Help & Settings
            </div>
            <NavLink to="/notifications" onClick={onClose} className={navItemClass}>
              <Bell size={18} /> Notifications
            </NavLink>
            <NavLink to="/support" onClick={onClose} className={navItemClass}>
              <HelpCircle size={18} /> Support Desk
            </NavLink>
            <NavLink to="/profile" onClick={onClose} className={navItemClass}>
              <User size={18} /> Profile & Security
            </NavLink>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3 px-2">
            <div>
              <div className="font-bold text-xs text-slate-800">{user?.first_name || user?.username}</div>
              <div className="text-[11px] text-slate-500 capitalize">{user?.role_name || user?.role}</div>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Online
            </span>
          </div>
          <button
            onClick={() => { logout(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition"
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
};
