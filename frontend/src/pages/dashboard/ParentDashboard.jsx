import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, Award, ShieldAlert, CheckCircle, 
  ArrowRight, HelpCircle, PhoneCall, FileText 
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

export const ParentDashboard = () => {
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
      const res = await dashboardApi.getParentStats();
      setData(res.data?.data || res.data || {});
    } catch (err) {
      showError('Failed to load parent portal dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading child records & teacher communications..." />;
  }

  const children = data?.children || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, Parent/Guardian ${user?.first_name || ''}`}
        subtitle="Monitor your child's daily presence, academic behaviour, and discipline logs"
        breadcrumbs={[{ label: 'Parent Portal' }]}
        actions={
          <Button
            variant="primary"
            onClick={() => navigate('/support')}
            icon={<HelpCircle size={16} />}
          >
            Submit Teacher Query
          </Button>
        }
      />

      {children.length > 0 ? (
        children.map((child, idx) => {
          const st = child.student;
          return (
            <div key={idx} className="space-y-6">
              {/* Child Header Card */}
              <div className="bg-gradient-to-r from-[#0B4F8A] to-[#1777C8] text-white p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">
                    {st?.first_name} {st?.last_name || ''}
                  </h2>
                  <p className="text-xs text-blue-100">
                    {st?.class_name ? `${st.class_name} - Section ${st.section_name || 'A'}` : 'Class 10-A'} | Admission No: {st?.admission_number} | Roll No: {st?.roll_number}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                    onClick={() => navigate(`/students/${st.id}`)}
                  >
                    View 360° Profile
                  </Button>
                </div>
              </div>

              {/* Child Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  title="Attendance Percentage"
                  value={`${child.attendance_rate}%`}
                  icon={Calendar}
                  variant={child.attendance_rate >= 75 ? 'green' : 'rose'}
                  subtitle={`${child.present_days} out of ${child.total_days} days present`}
                />
                <StatCard
                  title="Behaviour Records"
                  value={child.incidents_count}
                  icon={ShieldAlert}
                  variant="purple"
                  subtitle="Total recorded events"
                />
                <StatCard
                  title="Parent Alert Status"
                  value="All Clear"
                  icon={Award}
                  variant="blue"
                  subtitle="No active suspensions"
                />
              </div>

              {/* Behaviour Activity */}
              <Card title="Recent Conduct & Teacher Remarks" subtitle="Discipline and merits recorded by teachers">
                {(child.recent_incidents || []).length > 0 ? (
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
                        {child.recent_incidents.map((inc) => (
                          <tr key={inc.id} className="hover:bg-slate-50">
                            <td className="py-3 px-3 font-mono text-slate-500">{inc.incident_date}</td>
                            <td className="py-3 px-3 font-bold text-slate-800">{inc.category_name}</td>
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
                  <div className="text-center py-6">
                    <CheckCircle size={32} className="text-emerald-500 mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-slate-700">No disciplinary incidents recorded.</p>
                  </div>
                )}
              </Card>
            </div>
          );
        })
      ) : (
        <Card className="text-center py-12">
          <p className="text-sm text-slate-500">No linked student records found under your parent account.</p>
        </Card>
      )}
    </div>
  );
};
