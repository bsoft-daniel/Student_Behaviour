import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Calendar, Award, ShieldAlert, CheckCircle2, 
  Clock, ArrowRight, HelpCircle, FileText 
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

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await dashboardApi.getStudentStats();
      setData(res.data?.data || res.data || {});
    } catch (err) {
      showError('Failed to load student dashboard records');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading your attendance & conduct record..." />;
  }

  const student = data?.student;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${student?.first_name || user?.first_name || 'Student'}`}
        subtitle={`Admission No: ${student?.admission_number || '-'} | Roll No: ${student?.roll_number || '-'}`}
        breadcrumbs={[{ label: 'My Dashboard' }]}
        actions={
          <Button
            variant="outline"
            onClick={() => navigate('/support')}
            icon={<HelpCircle size={16} />}
          >
            Need Help / Clarification
          </Button>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Rate"
          value={`${data?.attendance_rate ?? 100}%`}
          icon={Calendar}
          variant={data?.attendance_rate >= 75 ? 'green' : 'rose'}
          subtitle={`${data?.present_days ?? 0} days present`}
        />
        <StatCard
          title="Class &amp; Section"
          value={student?.class_name ? `${student.class_name}-${student.section_name || 'A'}` : 'Class 10-A'}
          icon={User}
          variant="blue"
          subtitle="Current Academic Session"
        />
        <StatCard
          title="Conduct Records"
          value={data?.incidents_count ?? 0}
          icon={ShieldAlert}
          variant="purple"
          subtitle="Total recorded entries"
          onClick={() => navigate('/behaviour')}
        />
        <StatCard
          title="Overall Standing"
          value={data?.attendance_rate >= 75 ? 'Good' : 'Warning'}
          icon={Award}
          variant={data?.attendance_rate >= 75 ? 'green' : 'amber'}
          subtitle="Discipline Status"
        />
      </div>

      {/* Profile & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="My Disciplinary &amp; Commendation Logs" subtitle="Historical records entered by faculty">
            {(data?.recent_incidents || []).length > 0 ? (
              <div className="overflow-x-auto pt-1">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs font-semibold text-slate-500 uppercase border-b">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {data.recent_incidents.map((inc) => (
                      <tr key={inc.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-mono text-slate-500">{inc.incident_date}</td>
                        <td className="py-3 px-3 font-semibold text-slate-800">{inc.category_name}</td>
                        <td className="py-3 px-3 text-slate-600">{inc.description}</td>
                        <td className="py-3 px-3">
                          <StatusBadge status={inc.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-2" />
                <h4 className="font-bold text-slate-800 text-sm">Exemplary Conduct Record</h4>
                <p className="text-xs text-slate-500 mt-1">You have no negative disciplinary infractions logged.</p>
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card title="Student Information" subtitle="Your official school profile">
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Full Name</span>
                <span className="font-bold text-slate-800">{student?.first_name} {student?.last_name || ''}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Gender</span>
                <span className="font-semibold text-slate-700 capitalize">{student?.gender || 'Male'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Blood Group</span>
                <span className="font-mono text-slate-700">{student?.blood_group || 'O+'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Academic Year</span>
                <span className="font-semibold text-primary">2026-2027</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
