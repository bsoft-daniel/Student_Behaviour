import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, CalendarCheck, ShieldAlert, 
  FileText, UserCheck, Shield, Settings, Activity, 
  HelpCircle, Bell, User, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isCollapsed, onToggleCollapse }) => {
  const { user } = useAuth();
  const role = (user?.role_name || user?.role || '').toLowerCase();

  const isAdmin = role === 'admin' || role === 'administrator';
  const isTeacher = role === 'teacher' || role === 'staff';
  const isPrincipal = role === 'principal' || role === 'management';
  const isStudent = role === 'student';
  const isParent = role === 'parent' || role === 'guardian';

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
      isActive
        ? 'bg-primary text-white shadow-sm'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <aside
      className={`hidden lg:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      } min-h-[calc(100vh-4rem)] p-4 justify-between`}
    >
      <div className="space-y-6">
        <div className="space-y-1">
          <div className={`px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider ${isCollapsed ? 'sr-only' : ''}`}>
            Core Navigation
          </div>

          <NavLink to="/dashboard" className={navItemClass} title="Dashboard">
            <LayoutDashboard size={18} className="shrink-0" />
            {!isCollapsed && <span>Dashboard</span>}
          </NavLink>

          <NavLink to="/students" className={navItemClass} title="Students">
            <Users size={18} className="shrink-0" />
            {!isCollapsed && <span>{isParent ? 'My Children' : isStudent ? 'My Profile' : 'Students'}</span>}
          </NavLink>

          <NavLink to="/attendance" className={navItemClass} title="Attendance">
            <CalendarCheck size={18} className="shrink-0" />
            {!isCollapsed && <span>Attendance</span>}
          </NavLink>

          <NavLink to="/behaviour" className={navItemClass} title="Behaviour & Discipline">
            <ShieldAlert size={18} className="shrink-0" />
            {!isCollapsed && <span>Behaviour Log</span>}
          </NavLink>

          <NavLink to="/reports" className={navItemClass} title="Reports Hub">
            <FileText size={18} className="shrink-0" />
            {!isCollapsed && <span>Reports & Analytics</span>}
          </NavLink>
        </div>

        {isAdmin && (
          <div className="space-y-1 pt-3 border-t border-slate-100">
            <div className={`px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider ${isCollapsed ? 'sr-only' : ''}`}>
              Administration
            </div>

            <NavLink to="/users" className={navItemClass} title="User Accounts">
              <UserCheck size={18} className="shrink-0" />
              {!isCollapsed && <span>User Management</span>}
            </NavLink>

            <NavLink to="/roles" className={navItemClass} title="Roles & Permissions">
              <Shield size={18} className="shrink-0" />
              {!isCollapsed && <span>RBAC Permissions</span>}
            </NavLink>

            <NavLink to="/masters" className={navItemClass} title="Master Data Settings">
              <Settings size={18} className="shrink-0" />
              {!isCollapsed && <span>Master Settings</span>}
            </NavLink>

            <NavLink to="/audit" className={navItemClass} title="Audit Trail">
              <Activity size={18} className="shrink-0" />
              {!isCollapsed && <span>Security Audit Logs</span>}
            </NavLink>
          </div>
        )}

        {isPrincipal && !isAdmin && (
          <div className="space-y-1 pt-3 border-t border-slate-100">
            <div className={`px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider ${isCollapsed ? 'sr-only' : ''}`}>
              Governance
            </div>
            <NavLink to="/audit" className={navItemClass} title="Audit Trail">
              <Activity size={18} className="shrink-0" />
              {!isCollapsed && <span>System Audit Logs</span>}
            </NavLink>
          </div>
        )}

        <div className="space-y-1 pt-3 border-t border-slate-100">
          <div className={`px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider ${isCollapsed ? 'sr-only' : ''}`}>
            Communications
          </div>

          <NavLink to="/notifications" className={navItemClass} title="Notifications">
            <Bell size={18} className="shrink-0" />
            {!isCollapsed && <span>Notifications</span>}
          </NavLink>

          <NavLink to="/support" className={navItemClass} title="Support Desk">
            <HelpCircle size={18} className="shrink-0" />
            {!isCollapsed && <span>Support & Desk</span>}
          </NavLink>

          <NavLink to="/profile" className={navItemClass} title="My Profile">
            <User size={18} className="shrink-0" />
            {!isCollapsed && <span>Profile & Security</span>}
          </NavLink>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <ChevronLeft size={18} /> Collapse Navigation
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
