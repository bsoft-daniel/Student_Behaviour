import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserCheck, Calendar, ShieldAlert, Award, 
  AlertTriangle, Clock, TrendingUp, Plus, ArrowRight, 
  CheckCircle, FileText 
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { useToast } from '../../context/ToastContext';
import { dashboardApi } from '../../api/dashboardApi';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await dashboardApi.getAdminStats();
      setStats(res.data?.data || res.data || {});
    } catch (err) {
      showError('Failed to load administrator dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading administrator analytics & school statistics..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administrator Overview"
        subtitle="Institution-wide behaviour monitoring, attendance metrics & master system controls"
        breadcrumbs={[{ label: 'Dashboard' }]}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/attendance/mark')}
              icon={<Calendar size={16} />}
            >
              Daily Register
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate('/behaviour')}
              icon={<Plus size={16} />}
            >
              Record Behaviour
            </Button>
          </div>
        }
      />

      {/* Top 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats?.total_students ?? 0}
          icon={Users}
          variant="blue"
          subtitle="Enrolled across Classes 6-12"
          onClick={() => navigate('/students')}
        />
        <StatCard
          title="Present Today"
          value={stats?.present_today ?? 0}
          icon={UserCheck}
          variant="green"
          subtitle={`Absent: ${stats?.absent_today ?? 0} | Late: ${stats?.late_today ?? 0}`}
          onClick={() => navigate('/attendance')}
        />
        <StatCard
          title="Behaviour Incidents"
          value={stats?.behaviour_records_today ?? 0}
          icon={ShieldAlert}
          variant="amber"
          subtitle="Logged today"
          onClick={() => navigate('/behaviour')}
        />
        <StatCard
          title="Critical Cases"
          value={stats?.critical_cases ?? 0}
          icon={AlertTriangle}
          variant="rose"
          subtitle={`${stats?.pending_followups ?? 0} Pending Follow-ups`}
          onClick={() => navigate('/reports?tab=critical_cases')}
        />
      </div>

      {/* Behaviour & Attendance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Summary Breakdown */}
        <Card title="Today's Attendance Pulse" subtitle="Real-time check-in vs absence ratio">
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Present Rate</span>
                <span className="text-emerald-600">
                  {stats?.total_students > 0 ? Math.round((stats.present_today / stats.total_students) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full"
                  style={{ width: `${stats?.total_students > 0 ? (stats.present_today / stats.total_students) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
                <div className="font-bold text-emerald-700 text-base">{stats?.present_today ?? 0}</div>
                <div className="text-slate-500 text-[11px]">Present</div>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-100">
                <div className="font-bold text-rose-700 text-base">{stats?.absent_today ?? 0}</div>
                <div className="text-slate-500 text-[11px]">Absent</div>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-100">
                <div className="font-bold text-amber-700 text-base">{stats?.late_today ?? 0}</div>
                <div className="text-slate-500 text-[11px]">Late</div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center"
                onClick={() => navigate('/reports?tab=daily_attendance')}
              >
                View Detailed Attendance Register <ArrowRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Conduct Distribution */}
        <Card title="Conduct & Commendations" subtitle="Positive recognition vs disciplinary cases">
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex flex-col items-center text-center">
                <Award className="text-primary mb-1" size={24} />
                <span className="text-xl font-extrabold text-primary">{stats?.positive_behaviour ?? 0}</span>
                <span className="text-xs text-slate-600 font-semibold mt-0.5">Commendations</span>
              </div>
              <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-100 flex flex-col items-center text-center">
                <ShieldAlert className="text-rose-600 mb-1" size={24} />
                <span className="text-xl font-extrabold text-rose-700">{stats?.negative_behaviour ?? 0}</span>
                <span className="text-xs text-slate-600 font-semibold mt-0.5">Infractions</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <span>Open Follow-up Actions</span>
              <span className="font-bold text-amber-600 px-2 py-0.5 rounded-full bg-amber-100">
                {stats?.pending_followups ?? 0} Pending
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center"
              onClick={() => navigate('/behaviour')}
            >
              Manage Behaviour Records <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
        </Card>

        {/* Quick Administrative Actions */}
        <Card title="Administrative Shortcuts" subtitle="Fast access to core school workflows">
          <div className="grid grid-cols-1 gap-2 pt-1">
            <button
              onClick={() => navigate('/students')}
              className="p-3 rounded-lg border border-slate-200 hover:border-primary/40 hover:bg-slate-50 transition flex items-center justify-between text-left text-xs font-semibold text-slate-700"
            >
              <div className="flex items-center gap-2">
                <Users size={16} className="text-primary" />
                <span>Student Directory &amp; Enrolment</span>
              </div>
              <ArrowRight size={14} className="text-slate-400" />
            </button>

            <button
              onClick={() => navigate('/reports')}
              className="p-3 rounded-lg border border-slate-200 hover:border-primary/40 hover:bg-slate-50 transition flex items-center justify-between text-left text-xs font-semibold text-slate-700"
            >
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                <span>11 Official School Reports</span>
              </div>
              <ArrowRight size={14} className="text-slate-400" />
            </button>

            <button
              onClick={() => navigate('/users')}
              className="p-3 rounded-lg border border-slate-200 hover:border-primary/40 hover:bg-slate-50 transition flex items-center justify-between text-left text-xs font-semibold text-slate-700"
            >
              <div className="flex items-center gap-2">
                <UserCheck size={16} className="text-primary" />
                <span>User Accounts &amp; RBAC Matrix</span>
              </div>
              <ArrowRight size={14} className="text-slate-400" />
            </button>

            <button
              onClick={() => navigate('/masters')}
              className="p-3 rounded-lg border border-slate-200 hover:border-primary/40 hover:bg-slate-50 transition flex items-center justify-between text-left text-xs font-semibold text-slate-700"
            >
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-primary" />
                <span>Master Classes &amp; Academic Years</span>
              </div>
              <ArrowRight size={14} className="text-slate-400" />
            </button>
          </div>
        </Card>
      </div>

      {/* Recent Behaviour Activity Table */}
      <Card
        title="Recent Behaviour Incidents"
        subtitle="Latest disciplinary logs recorded by faculty"
        action={
          <Button variant="ghost" size="sm" onClick={() => navigate('/behaviour')}>
            View All
          </Button>
        }
      >
        {(stats?.recent_incidents || []).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs font-semibold text-slate-500 uppercase border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">Category / Type</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recent_incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 text-xs text-slate-500 font-mono">{inc.incident_date}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{inc.student_name}</td>
                    <td className="py-3 px-3 text-xs text-slate-600">{inc.class_name || '-'}</td>
                    <td className="py-3 px-3">
                      <div className="text-xs font-medium text-slate-800">{inc.type_name}</div>
                      <div className="text-[11px] text-slate-400">{inc.category_name}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {inc.severity_name || 'Normal'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={inc.status} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/behaviour/${inc.id}`)}
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-6">No recent incidents recorded today.</p>
        )}
      </Card>
    </div>
  );
};
