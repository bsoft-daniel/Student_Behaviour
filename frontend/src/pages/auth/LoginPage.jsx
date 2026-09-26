import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Eye, EyeOff, Lock, User, ShieldCheck, 
  ArrowRight, School, Users, CheckCircle2 
} from 'lucide-react';
import { SchoolLogo } from '../../components/common/SchoolLogo';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      showError('Please enter your username/email and password');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(username.trim(), password);
      showSuccess(`Welcome back, ${loggedUser.first_name || loggedUser.username}!`);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid credentials. Please try again.';
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (user, pass) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/50 to-slate-200 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* Left Section: School Branding */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#073763] via-[#0B4F8A] to-[#1777C8] p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Shapes */}
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />

          {/* Top Brand */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15">
              <SchoolLogo size={32} showText={false} />
              <div>
                <h2 className="text-xs font-bold tracking-wider uppercase text-blue-100 leading-none">
                  ST. MARTIN'S
                </h2>
                <p className="text-[10px] text-blue-200/80 uppercase font-semibold">
                  Matriculation Hr.Sec. School
                </p>
              </div>
            </div>
          </div>

          {/* Center Showcase */}
          <div className="my-8 relative z-10 space-y-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
              Student Behaviour &amp; Discipline Monitoring System
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-md">
              A comprehensive institutional platform designed to foster positive discipline, streamline roll-call attendance, and strengthen parent-teacher collaboration.
            </p>

            {/* Feature Badges */}
            <div className="pt-2 space-y-2">
              {[
                'Database-driven Role Security (5 Access Levels)',
                'Instant Conflict-Free Attendance Register',
                'Comprehensive Incident Tracking & Follow-up Plans',
                'Automated Parent Disciplinary Notifications'
              ].map((text, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-blue-100">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="relative z-10 pt-4 border-t border-white/15 text-[11px] text-blue-200/70 flex items-center justify-between">
            <span>Official School Management Portal</span>
            <span>Academic Year 2026-2027</span>
          </div>
        </div>

        {/* Right Section: Modern SaaS Login Form */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between bg-white">
          <div>
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Account Sign In
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Enter your authorized school credentials to access your dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Username or Email
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username or email"
                    required
                    className="w-full text-sm pl-10 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); showSuccess('Please contact the School IT Administrator to reset your password.'); }} className="text-xs font-semibold text-primary hover:underline">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    required
                    className="w-full text-sm pl-10 pr-10 py-2.5 bg-slate-50/70 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                  />
                  Remember my session
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full justify-center mt-2 shadow-md"
              >
                Sign In to Portal <ArrowRight size={16} className="ml-1" />
              </Button>
            </form>
          </div>

          {/* Quick Demo Role Picker Chips */}
          <div className="mt-8 pt-4 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-primary" /> Quick Demo Role Switcher:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { role: 'Admin', user: 'admin', pass: 'Admin@123', bg: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
                { role: 'Teacher', user: 'teacher', pass: 'Teacher@123', bg: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
                { role: 'Principal', user: 'principal', pass: 'Principal@123', bg: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
                { role: 'Student', user: 'student', pass: 'Student@123', bg: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
                { role: 'Parent', user: 'parent', pass: 'Parent@123', bg: 'bg-rose-50 text-rose-700 hover:bg-rose-100' },
              ].map((chip) => (
                <button
                  key={chip.role}
                  type="button"
                  onClick={() => handleQuickFill(chip.user, chip.pass)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border border-transparent transition cursor-pointer ${chip.bg}`}
                >
                  {chip.role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
