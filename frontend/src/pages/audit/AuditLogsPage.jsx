import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Clock, 
  Activity, 
  RefreshCw,
  Eye
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { DataTable } from '../../components/common/DataTable';
import { Pagination } from '../../components/common/Pagination';
import { LoadingState } from '../../components/common/LoadingState';
import { Modal } from '../../components/common/Modal';
import { auditApi } from '../../api/auditApi';
import { useToast } from '../../context/ToastContext';

export const AuditLogsPage = () => {
  const { addToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');

  // Log detail modal
  const [selectedLog, setSelectedLog] = useState(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await auditApi.getAll({
        page,
        page_size: pageSize,
        search: search || undefined,
        action: actionFilter || undefined,
        module: moduleFilter || undefined,
      });
      setLogs(res.data?.items || res.data || []);
      setTotal(res.data?.total || (res.data?.items ? res.data.items.length : 0));
    } catch (err) {
      addToast(err.message || 'Failed to fetch system audit logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, pageSize, actionFilter, moduleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadLogs();
  };

  const getActionBadge = (action) => {
    const act = (action || '').toUpperCase();
    if (act.includes('DELETE') || act.includes('REMOVE')) {
      return <span className="px-2 py-0.5 rounded text-xs font-bold bg-danger-100 text-danger-800">{act}</span>;
    }
    if (act.includes('CREATE') || act.includes('ADD') || act.includes('LOGIN')) {
      return <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">{act}</span>;
    }
    if (act.includes('UPDATE') || act.includes('EDIT')) {
      return <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800">{act}</span>;
    }
    return <span className="px-2 py-0.5 rounded text-xs font-bold bg-neutral-100 text-neutral-800">{act}</span>;
  };

  const columns = [
    {
      header: 'Timestamp',
      accessor: (row) => (
        <span className="text-xs font-medium text-neutral-500 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {row.created_at ? new Date(row.created_at).toLocaleString() : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Actor / User',
      accessor: (row) => (
        <div>
          <p className="font-semibold text-neutral-900 text-xs">{row.user?.full_name || row.username || 'System'}</p>
          <p className="text-[10px] text-neutral-400 font-mono">ID: {row.user_id || 'System'}</p>
        </div>
      ),
    },
    {
      header: 'Action',
      accessor: (row) => getActionBadge(row.action),
    },
    {
      header: 'Module / Target',
      accessor: (row) => (
        <span className="text-xs font-semibold text-neutral-700 capitalize">
          {row.entity_name || row.module || 'General'}
        </span>
      ),
    },
    {
      header: 'Details / Summary',
      accessor: (row) => (
        <p className="text-xs text-neutral-600 line-clamp-1 max-w-xs">
          {row.description || row.details || JSON.stringify(row.meta_data || {})}
        </p>
      ),
    },
    {
      header: 'IP Address',
      accessor: (row) => <span className="text-xs font-mono text-neutral-500">{row.ip_address || '127.0.0.1'}</span>,
    },
    {
      header: 'Inspect',
      accessor: (row) => (
        <button
          onClick={() => setSelectedLog(row)}
          className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-neutral-100 rounded-lg transition-all"
          title="Inspect log details"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security & System Audit Logs"
        subtitle="Immutable chronological trail of security events, administrative changes, and incident entries"
        action={
          <Button variant="secondary" icon={RefreshCw} onClick={loadLogs} loading={loading}>
            Refresh Logs
          </Button>
        }
      />

      {/* Filters Bar */}
      <Card>
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search user, action or IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:bg-white focus:border-primary-500 outline-none"
            />
          </div>

          <div>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:bg-white focus:border-primary-500 outline-none"
            >
              <option value="">All Actions</option>
              <option value="LOGIN">LOGIN</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="EXPORT">EXPORT</option>
            </select>
          </div>

          <div>
            <select
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:bg-white focus:border-primary-500 outline-none"
            >
              <option value="">All Modules</option>
              <option value="auth">Authentication</option>
              <option value="student">Students</option>
              <option value="behaviour">Behaviour</option>
              <option value="attendance">Attendance</option>
              <option value="user">User Management</option>
            </select>
          </div>

          <div>
            <Button type="submit" size="sm" icon={Filter} className="w-full">
              Apply Filter
            </Button>
          </div>
        </form>
      </Card>

      {/* Log Table */}
      <Card>
        {loading ? (
          <LoadingState message="Loading audit stream..." />
        ) : (
          <div>
            <DataTable
              columns={columns}
              data={logs}
              keyExtractor={(row) => row.id}
              emptyMessage="No audit logs matched your search criteria."
            />
            <div className="pt-4">
              <Pagination
                currentPage={page}
                totalItems={total}
                pageSize={pageSize}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Detail Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Audit Event #${selectedLog.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
              <div>
                <span className="text-neutral-400 font-semibold uppercase">Action</span>
                <p className="font-bold text-neutral-900 mt-0.5">{selectedLog.action}</p>
              </div>
              <div>
                <span className="text-neutral-400 font-semibold uppercase">Module / Entity</span>
                <p className="font-bold text-neutral-900 mt-0.5">{selectedLog.entity_name || selectedLog.module || 'N/A'}</p>
              </div>
              <div>
                <span className="text-neutral-400 font-semibold uppercase">Actor User</span>
                <p className="font-bold text-neutral-900 mt-0.5">{selectedLog.user?.full_name || selectedLog.username || 'System'}</p>
              </div>
              <div>
                <span className="text-neutral-400 font-semibold uppercase">IP Address</span>
                <p className="font-mono text-neutral-900 mt-0.5">{selectedLog.ip_address || '127.0.0.1'}</p>
              </div>
            </div>

            <div>
              <span className="text-neutral-400 font-semibold uppercase">Event Description</span>
              <p className="p-3 bg-neutral-100 rounded-lg text-neutral-800 mt-1 font-mono">
                {selectedLog.description || 'No raw string description recorded'}
              </p>
            </div>

            {selectedLog.meta_data && (
              <div>
                <span className="text-neutral-400 font-semibold uppercase">Payload Metadata</span>
                <pre className="p-3 bg-neutral-900 text-emerald-400 rounded-lg overflow-x-auto text-[11px] font-mono mt-1 max-h-48">
                  {typeof selectedLog.meta_data === 'string'
                    ? selectedLog.meta_data
                    : JSON.stringify(selectedLog.meta_data, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
