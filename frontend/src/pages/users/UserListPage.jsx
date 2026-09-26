import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Shield, Edit, Trash2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { UserFormModal } from './UserFormModal';
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
  const [selectedRole, setSelectedRole] = useState('');
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);

  useEffect(() => {
    masterApi.getRoles().then(res => setRoles(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page, selectedRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userApi.getAll({
        page,
        page_size: pageSize,
        role_id: selectedRole || undefined,
        search: search || undefined
      });
      const data = res.data;
      setUsers(data.items || data || []);
      setTotalUsers(data.total || (data.items ? data.items.length : data.length || 0));
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
    <div className="space-y-6">
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

      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search username, email, full name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
          />
          <select
            value={selectedRole}
            onChange={(e) => { setSelectedRole(e.target.value); setPage(1); }}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">All Roles</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.role_name}</option>)}
          </select>
          <Button variant="outline" size="sm" onClick={() => { setPage(1); fetchUsers(); }}>Filter</Button>
        </div>
      </Card>

      <Card padding="none">
        {loading ? (
          <div className="p-8"><LoadingState message="Loading users..." /></div>
        ) : users.length > 0 ? (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b text-xs font-semibold text-slate-600 uppercase">
                  <tr>
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{u.first_name} {u.last_name || ''}</div>
                        <div className="text-xs text-slate-400 font-mono">@{u.username}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                          {u.role_name || u.role?.role_name || 'User'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {u.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="outline" onClick={() => { setEditingUser(u); setIsModalOpen(true); }} icon={<Edit size={12} />}>Edit</Button>
                          <Button size="sm" variant="outline" className="text-rose-600" onClick={() => setDeleteConfirmUser(u)} icon={<Trash2 size={12} />} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t">
              <Pagination currentPage={page} totalCount={totalUsers} pageSize={pageSize} onPageChange={setPage} />
            </div>
          </div>
        ) : (
          <EmptyState title="No Users" description="No accounts found." />
        )}
      </Card>

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUsers}
        userToEdit={editingUser}
      />

      <ConfirmDialog
        isOpen={!!deleteConfirmUser}
        title="Deactivate Account"
        message={`Are you sure you want to deactivate ${deleteConfirmUser?.username}?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmUser(null)}
      />
    </div>
  );
};
