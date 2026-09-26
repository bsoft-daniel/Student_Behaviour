import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserCheck, ShieldAlert, Award, AlertTriangle, 
  FileText, ArrowRight, Activity, TrendingUp, CheckCircle 
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { useToast } from '../../context/ToastContext';
import { dashboardApi } from '../../api/dashboardApi';

export const PrincipalDashboard = () => {
  const navigate = useNavigate();
  const { showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await dashboardApi.getPrincipalStats();
      setStats(res.data?.data || res.data || {});
    } catch (err) {
      showError('Failed to load principal management analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Compiling executive school discipline analytics..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Principal &amp; Management Oversight"
        subtitle="Institutional governance, critical case reviews, and academic discipline metrics"
        breadcrumbs={[{ label: 'Dashboard' }]}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/reports?tab=critical_cases')}
              icon={<AlertTriangle size={16} />}
            >
              Critical Incidents
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate('/reports')}
              icon={<FileText size={16} />}
            >
              Official Reports Hub
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Enrolment"
          value={stats?.total_students ?? 0}
          icon={Users}
          variant="blue"
          subtitle="Classes 6 to 12"
          onClick={() => navigate('/students')}
        />
        <StatCard
          title="Daily Attendance"
          value={`${stats?.total_students > 0 ? Math.round((stats.present_today / stats.total_students) * 100) : 0}%`}
          icon={UserCheck}
          variant="green"
          subtitle={`${stats?.present_today ?? 0} Present Today`}
          onClick={() => navigate('/reports?tab=daily_attendance')}
        />
        <StatCard
          title="Critical Cases"
          value={stats?.critical_cases ?? 0}
          icon={AlertTriangle}
          variant="rose"
          subtitle="Requires Principal Guidance"
          onClick={() => navigate('/reports?tab=critical_cases')}
        />
        <StatCard
          title="Discipline Ratio"
          value={`${stats?.positive_behaviour ?? 0} / ${stats?.negative_behaviour ?? 0}`}
          icon={Award}
          variant="amber"
          subtitle="Commendations vs Infractions"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card
            title="Urgent Disciplinary Review Queue"
            subtitle="Incidents flagged as critical or pending executive review"
            action={
              <Button size="sm" variant="outline" onClick={() => navigate('/behaviour')}>
                Review All
              </Button>
            }
          >
            {(stats?.recent_incidents || []).length > 0 ? (
              <div className="overflow-x-auto pt-1">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs font-semibold text-slate-500 uppercase border-b">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-3">Class</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Severity</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {stats.recent_incidents.map((inc) => (
                      <tr key={inc.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-mono text-slate-500">{inc.incident_date}</td>
                        <td className="py-3 px-3 font-bold text-slate-800">{inc.student_name}</td>
                        <td className="py-3 px-3 text-slate-600">{inc.class_name || '-'}</td>
                        <td className="py-3 px-3 max-w-xs truncate text-slate-600">{inc.description}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            {inc.severity_name || 'Critical'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Button size="sm" variant="outline" onClick={() => navigate(`/behaviour/${inc.id}`)}>
                            Guidance / Action
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No pending critical incidents requiring intervention.</p>
            )}
          </Card>
        </div>

        <div>
          <Card title="Governance Shortcuts" subtitle="Executive oversight tools">
            <div className="space-y-2 pt-1">
              <button
                onClick={() => navigate('/reports?tab=low_attendance')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left text-xs font-semibold text-slate-700 transition"
              >
                <span>Low Attendance Warning (&lt; 75%)</span>
                <ArrowRight size={14} className="text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/reports?tab=class_analytics')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left text-xs font-semibold text-slate-700 transition"
              >
                <span>Class-wise Conduct Trends</span>
                <ArrowRight size={14} className="text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/audit')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left text-xs font-semibold text-slate-700 transition"
              >
                <span>System Security &amp; Audit Logs</span>
                <ArrowRight size={14} className="text-slate-400" />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
