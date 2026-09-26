import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, Award, Plus, Search, Filter, 
  Eye, RefreshCw, AlertTriangle 
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { RecordBehaviourModal } from './RecordBehaviourModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { behaviourApi } from '../../api/behaviourApi';
import { masterApi } from '../../api/masterApi';

export const BehaviourListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState([]);
  const [totalIncidents, setTotalIncidents] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const role = (user?.role_name || user?.role || '').toLowerCase();
  const canRecord = ['admin', 'administrator', 'teacher', 'staff', 'principal'].includes(role);

  useEffect(() => {
    masterApi.getBehaviourCategories().then(res => setCategories(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [page, selectedCategory, selectedStatus]);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await behaviourApi.getAll({
        page,
        page_size: pageSize,
        category_id: selectedCategory || undefined,
        status: selectedStatus || undefined
      });
      const data = res.data;
      setIncidents(data.items || data || []);
      setTotalIncidents(data.total || (data.items ? data.items.length : data.length || 0));
    } catch (err) {
      showError('Failed to fetch behaviour records');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Conduct &amp; Discipline Logs"
        subtitle="Track behavioural infractions, merit commendations, and follow-up interventions"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Behaviour Logs' }
        ]}
        actions={
          canRecord ? (
            <Button
              variant="primary"
              onClick={() => setIsModalOpen(true)}
              icon={<Plus size={16} />}
            >
              Record Behaviour Entry
            </Button>
          ) : null
        }
      />

      {/* Filter Bar */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Category Filter</label>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.category_name} ({c.category_type})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Status Filter</label>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setSelectedCategory(''); setSelectedStatus(''); setPage(1); }}
              className="w-full text-xs justify-center"
              icon={<RefreshCw size={14} />}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Incidents Table */}
      <Card padding="none">
        {loading ? (
          <div className="p-8">
            <LoadingState message="Loading behaviour records..." />
          </div>
        ) : incidents.length > 0 ? (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Category &amp; Type</th>
                    <th className="py-3.5 px-4">Severity</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {incidents.map((inc) => (
                    <tr key={inc.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                        {inc.incident_date}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{inc.student_name}</div>
                        <div className="text-xs text-slate-400 font-mono">
                          {inc.class_name ? `${inc.class_name}` : ''} ({inc.admission_number || '-'})
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 text-xs">{inc.type_name}</div>
                        <div className="text-[11px] text-slate-500">{inc.category_name}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ${
                          inc.is_critical || inc.severity_name?.toLowerCase().includes('critical')
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {inc.severity_name || 'Normal'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate" title={inc.description}>
                        {inc.description}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={inc.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/behaviour/${inc.id}`)}
                          icon={<Eye size={13} />}
                        >
                          View / Follow-up
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-200">
              <Pagination
                currentPage={page}
                totalCount={totalIncidents}
                pageSize={pageSize}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </div>
        ) : (
          <EmptyState
            title="No Behaviour Records"
            description="No conduct or disciplinary entries match your filter."
            actionText={canRecord ? "Record First Incident" : null}
            onAction={canRecord ? () => setIsModalOpen(true) : null}
          />
        )}
      </Card>

      {/* Record Modal */}
      <RecordBehaviourModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchIncidents}
      />
    </div>
  );
};
