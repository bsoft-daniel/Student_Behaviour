import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, Award, Plus, Search, 
  Eye, RefreshCw, AlertTriangle, LayoutGrid 
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Pagination } from '../../components/common/Pagination';
import { DataTable } from '../../components/common/DataTable';
import { CommonFilter } from '../../components/common/CommonFilter';
import { RecordBehaviourModal } from './RecordBehaviourModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { behaviourApi } from '../../api/behaviourApi';

export const BehaviourListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState([]);
  const [totalIncidents, setTotalIncidents] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);

  const [selectedUnit, setSelectedUnit] = useState('');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const role = (user?.role_name || user?.role || '').toLowerCase();
  const canRecord = ['admin', 'administrator', 'teacher', 'staff', 'principal'].includes(role);

  const CATEGORY_OPTIONS = [
    { value: 'Discipline', label: 'Discipline Infraction', count: 12 },
    { value: 'Academic', label: 'Academic Concern', count: 8 },
    { value: 'Attendance', label: 'Unexcused Absence', count: 5 },
    { value: 'Commendation', label: 'Merit Commendation', count: 14 }
  ];

  useEffect(() => {
    fetchIncidents();
  }, [page, selectedUnit]);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await behaviourApi.getAll({
        page,
        page_size: pageSize
      });
      const dataPayload = res.data?.data || res.data;
      const incidentItems = dataPayload?.items || (Array.isArray(dataPayload) ? dataPayload : []);
      let filtered = incidentItems;
      if (selectedUnit) {
        filtered = incidentItems.filter(i => i.category_name?.includes(selectedUnit) || i.type_name?.includes(selectedUnit));
      }
      setIncidents(filtered);
      setTotalIncidents(dataPayload?.total || filtered.length);
    } catch (err) {
      showError('Failed to fetch behaviour records');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Student Conduct & Discipline Logs"
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

      {/* Unified Filter Bar */}
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
          options={CATEGORY_OPTIONS}
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
        data={incidents}
        loading={loading}
        entityName="behaviour incidents"
        searchValue={search}
        onSearchChange={(val) => setSearch(val)}
        actionsPosition="left"
        actions={[
          { type: 'view', label: 'View Incident', icon: Eye, onClick: (row) => navigate(`/behaviour/${row.id}`) },
          { type: 'edit', label: 'Edit Incident', onClick: (row) => navigate(`/behaviour/${row.id}`) },
          { type: 'delete', label: 'Delete Incident', variant: 'danger', onClick: (row) => {
            if (window.confirm(`Delete record for ${row.student_name}?`)) {
              setIncidents(prev => prev.filter(i => i.id !== row.id));
            }
          }}
        ]}
        columns={[
          {
            header: 'Date',
            accessor: 'incident_date',
            cellClassName: 'font-mono text-slate-500 whitespace-nowrap',
            sortable: true
          },
          {
            header: 'Student',
            accessor: (row) => (
              <div>
                <div className="font-bold text-slate-800">{row.student_name}</div>
                <div className="text-xs text-slate-400 font-mono">
                  {row.class_name ? row.class_name : ''} ({row.admission_number || '-'})
                </div>
              </div>
            ),
            sortable: true
          },
          {
            header: 'Category & Type',
            accessor: (row) => (
              <div>
                <div className="font-semibold text-slate-800 text-xs">{row.type_name}</div>
                <div className="text-[11px] text-slate-500">{row.category_name}</div>
              </div>
            ),
            sortable: true
          },
          {
            header: 'Severity',
            accessor: (row) => (
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ${
                row.is_critical || row.severity_name?.toLowerCase().includes('critical')
                  ? 'bg-rose-100 text-rose-800 font-bold'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {row.severity_name || 'Normal'}
              </span>
            ),
            sortable: true
          },
          {
            header: 'Description',
            accessor: (row) => (
              <span className="text-xs text-slate-600 line-clamp-1 max-w-xs" title={row.description}>
                {row.description}
              </span>
            )
          },
          {
            header: 'Status',
            accessor: (row) => <StatusBadge status={row.status} />,
            sortable: true
          }
        ]}
        pagination={{
          currentPage: page,
          pageSize: pageSize,
          totalCount: totalIncidents,
          onPageChange: (p) => setPage(p)
        }}
      />

      {/* Record Modal */}
      <RecordBehaviourModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchIncidents}
      />
    </div>
  );
};
