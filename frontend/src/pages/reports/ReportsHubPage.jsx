import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText, Download, Printer, Filter, RefreshCw,
  Calendar, Award, ShieldAlert, AlertTriangle, Users, Sparkles, CheckCircle
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { DataTable } from '../../components/common/DataTable';
import { PrintableReport } from './PrintableReport';
import { useToast } from '../../context/ToastContext';
import { reportApi } from '../../api/reportApi';
import { masterApi } from '../../api/masterApi';

const REPORT_TYPES = [
  {
    id: 'daily_attendance',
    name: 'Daily Attendance Summary',
    icon: Calendar,
    desc: 'Daily attendance rates breakdown by class & section',
    color: 'from-blue-600 to-indigo-700',
    bgLight: '#eff6ff',
    badge: 'Attendance',
    badgeBg: '#dbeafe',
    badgeColor: '#1e40af'
  },
  {
    id: 'attendance_register',
    name: 'Monthly Attendance Register',
    icon: FileText,
    desc: 'Detailed student present/absent monthly register',
    color: 'from-teal-500 to-emerald-700',
    bgLight: '#f0fdf4',
    badge: 'Register',
    badgeBg: '#dcfce7',
    badgeColor: '#166534'
  },
  {
    id: 'low_attendance',
    name: 'Low Attendance Warning (<75%)',
    icon: AlertTriangle,
    desc: 'Students below 75% requiring urgent intervention',
    color: 'from-amber-500 to-orange-600',
    bgLight: '#fffbebf',
    badge: 'Warning',
    badgeBg: '#fef3c7',
    badgeColor: '#92400e'
  },
  {
    id: 'behaviour_incidents',
    name: 'Behaviour Incident Log',
    icon: ShieldAlert,
    desc: 'Recorded disciplinary infractions & severity ratings',
    color: 'from-rose-500 to-red-700',
    bgLight: '#fff1f2',
    badge: 'Discipline',
    badgeBg: '#ffe4e6',
    badgeColor: '#9f1239'
  },
  {
    id: 'positive_behaviour',
    name: 'Positive Commendations',
    icon: Award,
    desc: 'Academic excellence and leadership merit awards',
    color: 'from-purple-600 to-indigo-800',
    bgLight: '#faf5ff',
    badge: 'Merits',
    badgeBg: '#f3e8ff',
    badgeColor: '#6b21a8'
  },
  {
    id: 'critical_cases',
    name: 'Critical Cases & Escalations',
    icon: AlertTriangle,
    desc: 'High-severity incidents requiring principal guidance',
    color: 'from-pink-600 to-rose-800',
    bgLight: '#fff1f2',
    badge: 'Escalations',
    badgeBg: '#fecdd3',
    badgeColor: '#9f1239'
  },
  {
    id: 'class_analytics',
    name: 'Class Conduct Analytics',
    icon: Users,
    desc: 'Comparative conduct analytics across all grade levels',
    color: 'from-cyan-600 to-blue-700',
    bgLight: '#ecfeff',
    badge: 'Analytics',
    badgeBg: '#cffafe',
    badgeColor: '#155e75'
  },
];

export const ReportsHubPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showError, showSuccess } = useToast();

  const [selectedReport, setSelectedReport] = useState(searchParams.get('tab') || 'daily_attendance');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    masterApi.getClasses().then(res => {
      const list = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      setClasses(list);
    }).catch(() => setClasses([]));
  }, []);

  useEffect(() => {
    fetchCurrentReport();
  }, [selectedReport, selectedClass]);

  const fetchCurrentReport = async () => {
    setLoading(true);
    setReportData(null);
    try {
      const params = { class_id: selectedClass || undefined };
      let res;
      switch (selectedReport) {
        case 'daily_attendance':
          res = await reportApi.getDailyAttendance(params);
          break;
        case 'attendance_register':
          res = await reportApi.getAttendanceRegister(params);
          break;
        case 'low_attendance':
          res = await reportApi.getLowAttendance({ ...params, threshold: 75 });
          break;
        case 'behaviour_incidents':
          res = await reportApi.getBehaviourIncidents(params);
          break;
        case 'positive_behaviour':
          res = await reportApi.getPositiveBehaviour(params);
          break;
        case 'critical_cases':
          res = await reportApi.getCriticalIncidents(params);
          break;
        case 'class_analytics':
          res = await reportApi.getClassAnalytics(params);
          break;
        default:
          res = await reportApi.getDailyAttendance(params);
      }
      setReportData(res.data?.data || res.data || []);
    } catch (err) {
      showError('Failed to generate report data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const items = Array.isArray(reportData) ? reportData : reportData?.items || [];
    if (items.length === 0) {
      showError('No records to export');
      return;
    }

    const headers = Object.keys(items[0]).filter(k => typeof items[0][k] !== 'object');
    const rows = [headers.join(',')];

    items.forEach(row => {
      const vals = headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`);
      rows.push(vals.join(','));
    });

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedReport}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('CSV export generated');
  };

  const currentRep = REPORT_TYPES.find(r => r.id === selectedReport) || REPORT_TYPES[0];
  const items = Array.isArray(reportData) ? reportData : reportData?.items || [];

  if (isPreviewMode) {
    return (
      <PrintableReport
        title={currentRep.name}
        subtitle={currentRep.desc}
        metadata={{
          'Generated On': new Date().toLocaleDateString(),
          'Class Filter': selectedClass ? classes.find(c => String(c.id) === String(selectedClass))?.class_name : 'All Classes'
        }}
        onBack={() => setIsPreviewMode(false)}
      >
        <div className="overflow-x-auto">
          <DataTable
            data={items}
            loading={false}
            entityName={currentRep.name}
            enableExport={false}
            columns={
              selectedReport.includes('attendance') ? [
                { header: 'Student Name', accessor: (r) => r.student_name || `${r.first_name || ''} ${r.last_name || ''}` },
                { header: 'Class', accessor: 'class_name' },
                { header: 'Total Days', accessor: 'total_days' },
                { header: 'Present', accessor: 'present_days' },
                { header: 'Absent', accessor: 'absent_days' },
                { header: 'Attendance %', accessor: (r) => `${r.percentage || 0}%` },
              ] : [
                { header: 'Date', accessor: 'incident_date' },
                { header: 'Student', accessor: 'student_name' },
                { header: 'Category', accessor: 'category_name' },
                { header: 'Severity', accessor: (r) => r.severity_name || 'Normal' },
                { header: 'Description', accessor: 'description' },
                { header: 'Status', accessor: (r) => <StatusBadge status={r.status} /> },
              ]
            }
          />
        </div>
      </PrintableReport>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Official Reports & Analytics Hub"
        subtitle="Generate official institution reports, compliance registers, and CSV datasets"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Reports Hub' }
        ]}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsPreviewMode(true)}
              icon={<Printer size={16} />}
              disabled={items.length === 0}
            >
              Print Preview
            </Button>
            <Button
              variant="primary"
              onClick={handleExportCSV}
              icon={<Download size={16} />}
              disabled={items.length === 0}
            >
              Export CSV
            </Button>
          </div>
        }
      />

      {/* Vibrant Report Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {REPORT_TYPES.map((rep) => {
          const Icon = rep.icon;
          const isSelected = selectedReport === rep.id;
          return (
            <div
              key={rep.id}
              onClick={() => {
                setSelectedReport(rep.id);
                setSearchParams({ tab: rep.id });
              }}
              style={{
                position: 'relative',
                cursor: 'pointer',
                borderRadius: '16px',
                padding: '20px',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isSelected ? 'translateY(-3px)' : 'none',
                background: isSelected
                  ? `linear-gradient(135deg, ${rep.color.includes('blue') ? '#0b3c74, #1d4ed8' : rep.color.includes('teal') ? '#0f766e, #059669' : rep.color.includes('amber') ? '#d97706, #b45309' : rep.color.includes('rose') ? '#be123c, #9f1239' : rep.color.includes('purple') ? '#7e22ce, #6b21a8' : rep.color.includes('pink') ? '#be185d, #9f1239' : '#0369a1, #0284c7'})`
                  : '#ffffff',
                border: isSelected ? 'none' : '1px solid #e2e8f0',
                color: isSelected ? '#ffffff' : '#1e293b',
                boxShadow: isSelected
                  ? '0 12px 24px -6px rgba(0, 0, 0, 0.25)'
                  : '0 2px 6px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : rep.bgLight,
                  color: isSelected ? '#ffffff' : rep.badgeColor
                }}>
                  <Icon size={22} />
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '20px',
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : rep.badgeBg,
                  color: isSelected ? '#ffffff' : rep.badgeColor
                }}>
                  {rep.badge}
                </span>
              </div>

              <h4 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '6px', lineHeight: '1.3' }}>
                {rep.name}
              </h4>

              <p style={{
                fontSize: '12px',
                lineHeight: '1.4',
                color: isSelected ? 'rgba(255,255,255,0.85)' : '#64748b'
              }}>
                {rep.desc}
              </p>

              {isSelected && (
                <div style={{ position: 'absolute', bottom: '12px', right: '12px' }}>
                  <CheckCircle size={18} style={{ color: '#ffffff', opacity: 0.9 }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Filter & Refresh Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '14px',
        padding: '14px 20px',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Filter size={18} className="text-slate-500" />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Filter Dataset by Class:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            style={{
              fontSize: '13px',
              fontWeight: 600,
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '6px 14px',
              backgroundColor: '#f8fafc',
              color: '#0f172a',
              outline: 'none'
            }}
          >
            <option value="">All Classes</option>
            {(Array.isArray(classes) ? classes : []).map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
          </select>
        </div>

        <button
          type="button"
          onClick={fetchCurrentReport}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            backgroundColor: '#f1f5f9',
            color: '#334155',
            fontWeight: 700,
            fontSize: '13px',
            borderRadius: '10px',
            cursor: 'pointer',
            border: '1px solid #cbd5e1',
            transition: 'all 0.2s'
          }}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Grid Table Container */}
      <Card padding="none">
        {loading ? (
          <div className="p-12">
            <LoadingState message={`Compiling dataset for ${currentRep.name}...`} />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <EmptyState title="No Report Records Found" description="No data matched the selected class or report configuration." />
          </div>
        ) : (
          <DataTable
            data={items}
            loading={false}
            entityName={currentRep.name}
            actionsPosition="left"
            columns={
              selectedReport.includes('attendance') ? [
                {
                  header: 'Student Name',
                  accessor: (r) => <span className="font-bold text-slate-900">{r.student_name || `${r.first_name || ''} ${r.last_name || ''}`}</span>,
                  sortable: true
                },
                {
                  header: 'Class Standard',
                  accessor: (r) => <span className="text-slate-600 font-semibold">{r.class_name || 'Class 8'}</span>,
                  sortable: true
                },
                {
                  header: 'Total Days',
                  accessor: (r) => <span className="font-mono text-slate-700">{r.total_days || 30}</span>,
                  sortable: true
                },
                {
                  header: 'Present Days',
                  accessor: (r) => <span className="font-bold text-emerald-600">{r.present_days || 0}</span>,
                  sortable: true
                },
                {
                  header: 'Absent Days',
                  accessor: (r) => <span className="font-bold text-rose-600">{r.absent_days || 0}</span>,
                  sortable: true
                },
                {
                  header: 'Attendance %',
                  accessor: (r) => {
                    const pct = r.percentage || 0;
                    return (
                      <span className={`inline-flex items-center text-xs font-extrabold px-2.5 py-0.5 rounded-full ${pct >= 90 ? 'bg-emerald-100 text-emerald-800' :
                          pct >= 75 ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                        {pct}%
                      </span>
                    );
                  },
                  sortable: true
                }
              ] : [
                {
                  header: 'Incident Date',
                  accessor: (r) => <span className="font-mono text-slate-500">{r.incident_date || '2026-10-01'}</span>,
                  sortable: true
                },
                {
                  header: 'Student Name',
                  accessor: (r) => <span className="font-bold text-slate-900">{r.student_name || 'Student'}</span>,
                  sortable: true
                },
                {
                  header: 'Category',
                  accessor: (r) => <span className="font-semibold text-slate-800">{r.category_name || 'General'}</span>,
                  sortable: true
                },
                {
                  header: 'Severity',
                  accessor: (r) => <span className="text-slate-600 font-medium">{r.severity_name || 'Normal'}</span>,
                  sortable: true
                },
                {
                  header: 'Description Note',
                  accessor: (r) => <span className="text-xs text-slate-600 max-w-xs truncate" title={r.description}>{r.description || '-'}</span>
                },
                {
                  header: 'Status',
                  accessor: (r) => <StatusBadge status={r.status || 'Active'} />,
                  sortable: true
                }
              ]
            }
          />
        )}
      </Card>
    </div>
  );
};
