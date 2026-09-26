import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Key, 
  Save, 
  CheckCircle2, 
  Lock,
  Building,
  Calendar
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { userApi } from '../../api/userApi';

export const UserProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [pwdForm, setPwdForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await userApi.updateProfile(profileForm);
      if (updateUser) {
        updateUser(res.data || { ...user, ...profileForm });
      }
      addToast('Profile updated successfully', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.new_password !== pwdForm.confirm_password) {
      addToast('New passwords do not match', 'error');
      return;
    }
    if (pwdForm.new_password.length < 6) {
      addToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setSavingPwd(true);
    try {
      await userApi.changePassword({
        current_password: pwdForm.current_password,
        new_password: pwdForm.new_password,
      });
      addToast('Password changed successfully', 'success');
      setPwdForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      addToast(err.message || 'Failed to change password', 'error');
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="My Account Profile"
        subtitle="Manage your personal details, role credentials, and security preferences"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card Summary */}
        <div className="space-y-6">
          <Card>
            <div className="flex flex-col items-center text-center p-2">
              <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-bold text-2xl border-4 border-white shadow-md mb-3">
                {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </div>
              <h3 className="font-bold text-lg text-neutral-900">{user?.full_name || 'User'}</h3>
              <p className="text-xs text-neutral-500 font-mono mt-0.5">@{user?.username}</p>

              <div className="mt-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-700 text-white shadow-sm">
                  <Shield className="w-3.5 h-3.5" />
                  {user?.role?.name || 'Authorized User'}
                </span>
              </div>

              <div className="w-full border-t border-neutral-100 mt-5 pt-4 text-left space-y-2 text-xs text-neutral-600">
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <StatusBadge status={user?.is_active ? 'active' : 'inactive'} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Institution</span>
                  <span className="font-medium text-neutral-900">St. Martin's Matriculation</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>User ID</span>
                  <span className="font-mono text-neutral-500">#{user?.id}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Edit Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card
            title="Personal Information"
            subtitle="Update your contact email and telephone number"
          >
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:bg-white focus:border-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.username || ''}
                    className="w-full px-3.5 py-2.5 bg-neutral-100 border border-neutral-300 rounded-lg text-sm text-neutral-500 cursor-not-allowed outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:bg-white focus:border-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:bg-white focus:border-primary-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" loading={savingProfile} icon={Save}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </Card>

          {/* Security & Password */}
          <Card
            title="Account Security & Password"
            subtitle="Ensure strong security credentials for school record protection"
          >
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Current Password *
                </label>
                <input
                  type="password"
                  required
                  value={pwdForm.current_password}
                  onChange={(e) => setPwdForm({ ...pwdForm, current_password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:bg-white focus:border-primary-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={pwdForm.new_password}
                    onChange={(e) => setPwdForm({ ...pwdForm, new_password: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:bg-white focus:border-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={pwdForm.confirm_password}
                    onChange={(e) => setPwdForm({ ...pwdForm, confirm_password: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:bg-white focus:border-primary-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="secondary" loading={savingPwd} icon={Lock}>
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
