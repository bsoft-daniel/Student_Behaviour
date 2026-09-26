import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FileText, Download, Printer, Filter, RefreshCw, 
  Calendar, Award, ShieldAlert, AlertTriangle, Users 
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { PrintableReport } from './PrintableReport';
import { useToast } from '../../context/ToastContext';
import { reportApi } from '../../api/reportApi';
import { masterApi } from '../../api/masterApi';

const REPORT_TYPES = [
  { id: 'daily_attendance', name: 'Daily Attendance Summary', icon: Calendar, desc: 'Daily attendance rates by class' },
  { id: 'attendance_register', name: 'Monthly Attendance Register', icon: FileText, desc: 'Student present/absent breakdown' },
  { id: 'low_attendance', name: 'Low Attendance Warning (< 75%)', icon: AlertTriangle, desc: 'Students needing attendance interventions' },
  { id: 'behaviour_incidents', name: 'Behaviour Incident Log', icon: ShieldAlert, desc: 'Disciplinary events with severity ratings' },
  { id: 'positive_behaviour', name: 'Positive Commendations', icon: Award, desc: 'Academic and leadership merits' },
  { id: 'critical_cases', name: 'Critical Cases & Escalations', icon: AlertTriangle, desc: 'Incidents requiring executive guidance' },
  { id: 'class_analytics', name: 'Class Conduct Analytics', icon: Users, desc: 'Comparative conduct across grade standards' },
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
    masterApi.getClasses().then(res => setClasses(res.data || [])).catch(() => {});
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

  const renderTable = () => {
    if (items.length === 0) {
      return <EmptyState title="No Records" description="No data found for this report configuration." />;
    }

    if (selectedReport.includes('attendance')) {
      return (
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b text-xs font-semibold text-slate-600 uppercase">
            <tr>
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Class</th>
              <th className="py-3 px-4">Total Days</th>
              <th className="py-3 px-4">Present</th>
              <th className="py-3 px-4">Absent</th>
              <th className="py-3 px-4">Attendance %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-800">{r.student_name || `${r.first_name} ${r.last_name || ''}`}</td>
                <td className="py-3 px-4 text-slate-600">{r.class_name}</td>
                <td className="py-3 px-4 font-mono">{r.total_days}</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">{r.present_days}</td>
                <td className="py-3 px-4 text-rose-600 font-bold">{r.absent_days}</td>
                <td className="py-3 px-4 font-bold">{r.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (selectedReport.includes('behaviour') || selectedReport.includes('critical') || selectedReport.includes('positive')) {
      return (
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b text-xs font-semibold text-slate-600 uppercase">
            <tr>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono text-xs text-slate-500">{r.incident_date}</td>
                <td className="py-3 px-4 font-bold text-slate-800">{r.student_name}</td>
                <td className="py-3 px-4">{r.category_name}</td>
                <td className="py-3 px-4">{r.severity_name || 'Normal'}</td>
                <td className="py-3 px-4 text-xs text-slate-600 max-w-xs truncate">{r.description}</td>
                <td className="py-3 px-4"><StatusBadge status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    const keys = Object.keys(items[0]).filter(k => typeof items[0][k] !== 'object');
    return (
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 border-b text-xs font-semibold text-slate-600 uppercase">
          <tr>
            {keys.map(k => <th key={k} className="py-3 px-4 capitalize">{k.replace(/_/g, ' ')}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((row, idx) => (
            <tr key={idx} className="hover:bg-slate-50">
              {keys.map(k => <td key={k} className="py-3 px-4 text-xs">{String(row[k] ?? '-')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

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
        <div className="overflow-x-auto">{renderTable()}</div>
      </PrintableReport>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Official Reports &amp; Analytics Hub"
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {REPORT_TYPES.map((rep) => {
          const Icon = rep.icon;
          const isSelected = selectedReport === rep.id;
          return (
            <button
              key={rep.id}
              onClick={() => {
                setSelectedReport(rep.id);
                setSearchParams({ tab: rep.id });
              }}
              className={`p-3.5 rounded-xl border text-left transition ${
                isSelected
                  ? 'bg-primary text-white border-primary shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon size={16} />
                <span className="font-bold text-xs">{rep.name}</span>
              </div>
              <p className={`text-[11px] line-clamp-2 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                {rep.desc}
              </p>
            </button>
          );
        })}
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:w-64">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Filter Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
            </select>
          </div>
          <Button size="sm" variant="outline" onClick={fetchCurrentReport} icon={<RefreshCw size={14} />}>
            Refresh
          </Button>
        </div>
      </Card>

      <Card padding="none">
        {loading ? (
          <div className="p-8">
            <LoadingState message="Compiling report dataset..." />
          </div>
        ) : (
          <div className="overflow-x-auto">{renderTable()}</div>
        )}
      </Card>
    </div>
  );
};
