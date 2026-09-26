import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, CheckSquare, ShieldAlert, Plus, 
  ArrowRight, Award, Clock, FileText 
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { dashboardApi } from '../../api/dashboardApi';

export const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await dashboardApi.getTeacherStats();
      setStats(res.data?.data || res.data || {});
    } catch (err) {
      showError('Failed to load teacher dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading your class assignments & roll call status..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.first_name || 'Teacher'}`}
        subtitle="Manage assigned class attendance, track conduct records, and submit follow-up remarks"
        breadcrumbs={[{ label: 'Dashboard' }]}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/attendance/mark')}
              icon={<CheckSquare size={16} />}
            >
              Mark Class Roll Call
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate('/behaviour')}
              icon={<Plus size={16} />}
            >
              Record Incident / Commendation
            </Button>
          </div>
        }
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Classes"
          value={stats?.my_classes_count ?? 0}
          icon={Users}
          variant="blue"
          subtitle="Authorized teaching sections"
        />
        <StatCard
          title="My Students"
          value={stats?.my_students_count ?? 0}
          icon={Users}
          variant="green"
          subtitle="Enrolled under your classes"
          onClick={() => navigate('/students')}
        />
        <StatCard
          title="Today's Attendance"
          value="Roll Call"
          icon={Calendar}
          variant="amber"
          subtitle="Ready to register"
          onClick={() => navigate('/attendance/mark')}
        />
        <StatCard
          title="My Incident Logs"
          value={stats?.recent_incidents?.length ?? 0}
          icon={ShieldAlert}
          variant="purple"
          subtitle="Recent submissions"
          onClick={() => navigate('/behaviour')}
        />
      </div>

      {/* Class Rosters & Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="My Assigned Classes" subtitle="Classes you are authorized to mark attendance and manage">
            {(stats?.my_classes || []).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {stats.my_classes.map((cls) => (
                  <div
                    key={cls.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-primary/40 hover:shadow-sm transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-slate-800 text-base">
                        {cls.class_name} - Section {cls.section_name}
                      </h4>
                      {cls.is_class_teacher && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-primary">
                          Class Teacher
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mb-4">Academic Session 2026-2027</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => navigate(`/attendance/mark?class_id=${cls.class_id}&section_id=${cls.section_id}`)}
                        className="flex-1 text-xs"
                      >
                        Mark Roll Call
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/students?class_id=${cls.class_id}&section_id=${cls.section_id}`)}
                        className="text-xs"
                      >
                        Students
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No assigned classes found. Please contact administration.</p>
            )}
          </Card>
        </div>

        <div>
          <Card title="Teacher Quick Links" subtitle="Frequent academic workflows">
            <div className="space-y-2 pt-1">
              <button
                onClick={() => navigate('/attendance/mark')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left text-xs font-semibold text-slate-700 transition"
              >
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  <span>Mark Daily Attendance</span>
                </div>
                <ArrowRight size={14} className="text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/behaviour')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left text-xs font-semibold text-slate-700 transition"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert size={16} className="text-primary" />
                  <span>Record Behaviour Incident</span>
                </div>
                <ArrowRight size={14} className="text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/reports?tab=attendance_register')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left text-xs font-semibold text-slate-700 transition"
              >
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-primary" />
                  <span>Class Attendance Register</span>
                </div>
                <ArrowRight size={14} className="text-slate-400" />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
