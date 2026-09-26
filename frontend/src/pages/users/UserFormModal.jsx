import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { userApi } from '../../api/userApi';
import { masterApi } from '../../api/masterApi';

export const UserFormModal = ({ isOpen, onClose, onSuccess, userToEdit = null }) => {
  const { showSuccess, showError } = useToast();
  const isEdit = !!userToEdit;

  const [roles, setRoles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    role_id: '',
    password: '',
    is_active: true
  });

  useEffect(() => {
    masterApi.getRoles().then(res => {
      setRoles(res.data || []);
      if (!isEdit && res.data?.length > 0) {
        setFormData(prev => ({ ...prev, role_id: res.data[0].id }));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        username: userToEdit.username || '',
        email: userToEdit.email || '',
        first_name: userToEdit.first_name || '',
        last_name: userToEdit.last_name || '',
        phone: userToEdit.phone || '',
        role_id: userToEdit.role_id || userToEdit.role?.id || '',
        password: '',
        is_active: userToEdit.is_active !== undefined ? userToEdit.is_active : true
      });
    } else {
      setFormData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        role_id: roles[0]?.id || '',
        password: '',
        is_active: true
      });
    }
  }, [userToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEdit) {
        await userApi.update(userToEdit.id, formData);
        showSuccess('User updated successfully');
      } else {
        await userApi.create(formData);
        showSuccess('User account created');
      }
      onSuccess();
      onClose();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to save user account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit User Credentials' : 'Create System User'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={isEdit}
              required
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white disabled:bg-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
            <select
              name="role_id"
              value={formData.role_id}
              onChange={handleChange}
              required
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white"
            >
              {roles.map(r => <option key={r.id} value={r.id}>{r.role_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={isEdit ? 'Leave blank to keep' : 'Account password'}
              required={!isEdit}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={submitting}>Save User</Button>
        </div>
      </form>
    </Modal>
  );
};
