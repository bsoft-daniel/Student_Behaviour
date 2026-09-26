import React, { useState, useEffect } from 'react';
import { Shield, Key, Lock, Info } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingState } from '../../components/common/LoadingState';
import { useToast } from '../../context/ToastContext';
import { masterApi } from '../../api/masterApi';

export const RolePermissionsPage = () => {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        masterApi.getRoles(),
        masterApi.getPermissions()
      ]);
      const roleList = rolesRes.data || [];
      const permList = permsRes.data || [];
      setRoles(roleList);
      setPermissions(permList);

      if (roleList.length > 0) {
        selectRole(roleList[0]);
      }
    } catch (err) {
      showError('Failed to load RBAC permissions');
    } finally {
      setLoading(false);
    }
  };

  const selectRole = (role) => {
    setSelectedRole(role);
    const perms = new Set((role.permissions || []).map(p => typeof p === 'object' ? p.id : p));
    setRolePermissions(perms);
  };

  const togglePermission = (permId) => {
    setRolePermissions(prev => {
      const updated = new Set(prev);
      if (updated.has(permId)) updated.delete(permId);
      else updated.add(permId);
      return updated;
    });
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      await masterApi.updateRolePermissions(selectedRole.id, {
        permission_ids: Array.from(rolePermissions)
      });
      showSuccess(`Permissions for ${selectedRole.role_name} updated`);
    } catch (err) {
      showError('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role Permissions Matrix (RBAC)"
        subtitle="Configure functional database permissions for user roles"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings', href: '/masters' },
          { label: 'Roles & Permissions' }
        ]}
      />

      {loading ? (
        <LoadingState message="Loading permissions matrix..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Roles</h3>
            {roles.map(r => (
              <button
                key={r.id}
                onClick={() => selectRole(r)}
                className={`w-full text-left p-3.5 rounded-xl border transition ${
                  selectedRole?.id === r.id ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-xs">{r.role_name}</div>
                <div className={`text-[11px] ${selectedRole?.id === r.id ? 'text-blue-100' : 'text-slate-400'}`}>{r.role_code}</div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-3">
            <Card>
              <div className="flex items-center justify-between border-b pb-4 mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{selectedRole?.role_name} Permissions</h3>
                  <p className="text-xs text-slate-500">Toggle capabilities assigned to this role</p>
                </div>
                <Button variant="primary" onClick={handleSave} loading={saving} icon={<Key size={14} />}>
                  Save Permissions
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {permissions.map(p => {
                  const isChecked = rolePermissions.has(p.id) || rolePermissions.has(p.permission_code);
                  return (
                    <label
                      key={p.id}
                      className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition ${
                        isChecked ? 'bg-primary/5 border-primary/30' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePermission(p.id)}
                        className="w-4 h-4 text-primary rounded mt-0.5"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-800">{p.permission_name || p.permission_code}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{p.permission_code}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
