import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Shield, Edit, Trash2, LayoutGrid, Eye } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { CommonFilter } from '../../components/common/CommonFilter';
import { UserFormModal } from './UserFormModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { userApi } from '../../api/userApi';
import { masterApi } from '../../api/masterApi';

export const UserListPage = () => {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);

  const DEFAULT_ROLES = [
    { value: 'Admin', label: 'Administrator', count: 3 },
    { value: 'Teacher', label: 'Teacher / Instructor', count: 12 },
    { value: 'Staff', label: 'Staff / Operator', count: 5 },
    { value: 'Principal', label: 'Principal', count: 1 }
  ];

  useEffect(() => {
    masterApi.getRoles().then(res => {
      const list = res.data?.data || res.data || [];
      if (Array.isArray(list) && list.length > 0) {
        setRoles(list.map(r => ({ value: r.role_name, label: r.role_name })));
      } else {
        setRoles(DEFAULT_ROLES);
      }
    }).catch(() => setRoles(DEFAULT_ROLES));
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page, selectedUnit]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userApi.getAll({
        page,
        page_size: pageSize,
        search: search || undefined
      });
      const dataPayload = res.data?.data || res.data;
      const userItems = dataPayload?.items || (Array.isArray(dataPayload) ? dataPayload : []);
      let filtered = userItems;
      if (selectedUnit) {
        filtered = userItems.filter(u => (u.role_name || u.role?.role_name || '').toLowerCase().includes(selectedUnit.toLowerCase()));
      }
      setUsers(filtered);
      setTotalUsers(dataPayload?.total || filtered.length);
    } catch (err) {
      showError('Failed to fetch user accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmUser) return;
    try {
      await userApi.delete(deleteConfirmUser.id);
      showSuccess(`User "${deleteConfirmUser.username}" removed`);
      setDeleteConfirmUser(null);
      fetchUsers();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="System User Accounts"
        subtitle="Manage credentials, database roles, and account statuses"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings', href: '/masters' },
          { label: 'Users' }
        ]}
        actions={
          <Button variant="primary" onClick={() => { setEditingUser(null); setIsModalOpen(true); }} icon={<UserPlus size={16} />}>
            Create User
          </Button>
        }
      />

      {/* Unified Common Filter Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px',
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '12px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
      }}>
        <CommonFilter
          label="Unit Name"
          placeholder="All Units"
          options={roles}
          value={selectedUnit}
          multiple={false}
          searchable={true}
          showCount={true}
          icon={LayoutGrid}
          onChange={(val) => {
            setSelectedUnit(val);
            setPage(1);
          }}
          onClear={() => {
            setSelectedUnit('');
            setPage(1);
          }}
        />
      </div>

      {/* Reusable Data Grid */}
      <DataTable
        data={users}
        loading={loading}
        entityName="users"
        searchValue={search}
        onSearchChange={(val) => setSearch(val)}
        actionsPosition="left"
        actions={[
          { type: 'view', label: 'View Profile', icon: Eye, onClick: (u) => { setEditingUser(u); setIsModalOpen(true); } },
          { type: 'edit', label: 'Edit User', icon: Edit, onClick: (u) => { setEditingUser(u); setIsModalOpen(true); } },
          { type: 'delete', label: 'Deactivate', icon: Trash2, variant: 'danger', onClick: (u) => setDeleteConfirmUser(u) }
        ]}
        columns={[
          {
            header: 'Full Name',
            accessor: (u) => <span className="font-bold text-slate-800">{u.first_name || u.full_name} {u.last_name || ''}</span>,
            sortable: true
          },
          {
            header: 'Username',
            accessor: (u) => <span className="font-mono text-slate-600">@{u.username}</span>,
            sortable: true
          },
          {
            header: 'Role',
            accessor: (u) => (
              <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {u.role_name || u.role?.role_name || 'User'}
              </span>
            ),
            sortable: true
          },
          {
            header: 'Email Address',
            accessor: (u) => <span className="text-slate-600">{u.email}</span>,
            sortable: true
          },
          {
            header: 'Status',
            accessor: (u) => (
              <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                u.is_active !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {u.is_active !== false ? 'Active' : 'Disabled'}
              </span>
            ),
            sortable: true
          }
        ]}
      />

      {isModalOpen && (
        <UserFormModal
          isOpen={isModalOpen}
          user={editingUser}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => { setIsModalOpen(false); fetchUsers(); }}
        />
      )}

      {deleteConfirmUser && (
        <ConfirmDialog
          isOpen={!!deleteConfirmUser}
          title="Deactivate Account"
          message={`Are you sure you want to deactivate user "${deleteConfirmUser.username}"?`}
          confirmText="Deactivate"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteConfirmUser(null)}
        />
      )}
    </div>
  );
};


