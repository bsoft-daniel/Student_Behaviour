import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Eye, EyeOff, Lock, User, ShieldCheck, 
  ArrowRight, School, Users, CheckCircle2, Camera
} from 'lucide-react';
import { SchoolLogo } from '../../components/common/SchoolLogo';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import campusFront from '../../assets/campus_front.jpg';
import campusBuilding from '../../assets/campus_building.jpg';
import campusPlayground from '../../assets/campus_playground.jpg';

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
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const campusPhotos = [
    { src: campusFront, title: 'Main Facade', desc: 'Administrative block and central entrance' },
    { src: campusBuilding, title: 'Academic Wing', desc: 'Secondary & higher secondary classrooms' },
    { src: campusPlayground, title: 'Playground', desc: 'Campus grounds & recreational facilities' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePhotoIdx((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/50 to-slate-200 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* Left Section: Real School Campus Showcase */}
        <div className="lg:col-span-6 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden bg-[#073763]">
          {/* Active Campus Photo */}
          <img 
            src={campusPhotos[activePhotoIdx].src} 
            alt="St. Martin's School Campus"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 opacity-60 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#073763] via-[#073763]/75 to-[#073763]/85" />

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
          <div className="my-6 relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              <Camera size={13} /> {campusPhotos[activePhotoIdx].title}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
              Student Behaviour &amp; Conduct Monitoring System
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-md">
              {campusPhotos[activePhotoIdx].desc}. Official institutional portal for daily attendance, conduct merit logs, and disciplinary updates.
            </p>

            {/* Feature Badges */}
            <div className="pt-2 space-y-1.5">
              {[
                'Strict Role-Based User Access Control',
                'Live Class Attendance Register & Roll Call',
                'Incident Tracking & Disciplinary Oversight'
              ].map((text, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-blue-100">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Campus Thumbnail Strip */}
          <div className="relative z-10 pt-3 border-t border-white/15">
            <div className="text-[10px] uppercase tracking-wider text-blue-200/80 font-bold mb-2 flex items-center justify-between">
              <span>Campus Facilities Gallery</span>
              <span className="text-[9px] text-blue-300">Click to preview</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {campusPhotos.map((photo, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActivePhotoIdx(i)}
                  className={`relative h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    activePhotoIdx === i ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-white/20 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={photo.src} alt={photo.title} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white font-medium text-center py-0.5 truncate">
                    {photo.title}
                  </span>
                </button>
              ))}
            </div>
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
        </div>
      </div>
    </div>
  );
};
