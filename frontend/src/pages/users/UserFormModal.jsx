import React, { useState, useEffect } from 'react';
import { AppModal } from '../../components/common/AppModal';
import { FormInput, FormSelect } from '../../components/common/FormField';
import { useToast } from '../../context/ToastContext';
import { userApi } from '../../api/userApi';
import { masterApi } from '../../api/masterApi';
import { User } from 'lucide-react';

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
      const list = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      setRoles(list);
      if (!isEdit && list.length > 0) {
        setFormData(prev => ({ ...prev, role_id: list[0].id }));
      }
    }).catch(() => setRoles([]));
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
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit User Credentials' : 'Create System User'}
      size="md"
      onConfirm={handleSubmit}
      confirmText={isEdit ? 'Save User' : 'Create User'}
      cancelText="Cancel"
      loading={submitting}
    >
      <form id="user-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
          <FormInput
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            icon={User}
            disabled={isEdit}
            required
          />

          <FormInput
            type="email"
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <FormInput
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />

          <FormInput
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
          />

          <FormSelect
            label="Role"
            name="role_id"
            value={formData.role_id}
            onChange={handleChange}
            placeholder={null}
            required
            options={(Array.isArray(roles) ? roles : []).map(r => ({
              value: r.id,
              label: r.role_name
            }))}
          />

          <FormInput
            type="password"
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={isEdit ? 'Leave blank to keep' : 'Account password'}
            required={!isEdit}
          />
        </div>
      </form>
    </AppModal>
  );
};
