import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, ArrowLeft, Plus, CheckCircle, Clock, 
  User, Calendar, MapPin, Send, MessageSquare 
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { AppModal } from '../../components/common/AppModal';
import { FormInput, FormTextarea } from '../../components/common/FormField';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { behaviourApi } from '../../api/behaviourApi';

export const BehaviourDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [incident, setIncident] = useState(null);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [submittingFollowUp, setSubmittingFollowUp] = useState(false);

  const [followUpData, setFollowUpData] = useState({
    follow_up_date: new Date().toISOString().split('T')[0],
    remarks: '',
    resolve_incident: false
  });

  const role = (user?.role_name || user?.role || '').toLowerCase();
  const canManage = ['admin', 'administrator', 'teacher', 'staff', 'principal'].includes(role);

  useEffect(() => {
    loadIncident();
  }, [id]);

  const loadIncident = async () => {
    setLoading(true);
    try {
      const res = await behaviourApi.getById(id);
      setIncident(res.data?.data || res.data);
    } catch (err) {
      showError('Failed to load incident detail');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFollowUp = async (e) => {
    e.preventDefault();
    if (!followUpData.remarks.trim()) {
      showError('Please enter follow-up remarks');
      return;
    }

    setSubmittingFollowUp(true);
    try {
      await behaviourApi.addFollowUp(id, followUpData);
      showSuccess('Follow-up recorded successfully');
      setIsFollowUpModalOpen(false);
      setFollowUpData({
        follow_up_date: new Date().toISOString().split('T')[0],
        remarks: '',
        resolve_incident: false
      });
      loadIncident();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to record follow-up');
    } finally {
      setSubmittingFollowUp(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading incident and follow-up timeline..." />;
  }

  if (!incident) {
    return (
      <Card className="text-center py-12">
        <p className="text-sm text-slate-500">Incident not found.</p>
        <Button className="mt-4" variant="outline" onClick={() => navigate('/behaviour')}>
          Back to Behaviour Logs
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Incident #${incident.id} - ${incident.type_name || 'Disciplinary Record'}`}
        subtitle={`Logged on ${incident.incident_date} for student ${incident.student_name}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Behaviour Logs', href: '/behaviour' },
          { label: `Case #${incident.id}` }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/behaviour')} icon={<ArrowLeft size={16} />}>
              Back
            </Button>
            {canManage && (
              <Button variant="primary" onClick={() => setIsFollowUpModalOpen(true)} icon={<Plus size={16} />}>
                Add Follow-up / Guidance
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident Summary Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Incident Details" subtitle="Verified factual report">
            <div className="space-y-4 pt-2">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</h4>
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{incident.description}</p>
              </div>

              {incident.action_taken && (
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Immediate Action Taken</h4>
                  <p className="text-sm text-slate-800 leading-relaxed">{incident.action_taken}</p>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
                <div>
                  <span className="text-slate-400 block font-medium">Category</span>
                  <span className="font-bold text-slate-800">{incident.category_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Severity</span>
                  <span className="font-bold text-rose-700">{incident.severity_name || 'Normal'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Location</span>
                  <span className="font-bold text-slate-800">{incident.location || 'Classroom'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Parent Alert</span>
                  <span className="font-bold text-slate-800">{incident.parent_notified ? 'Notified' : 'Pending'}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Follow-up Timeline */}
          <Card title="Intervention &amp; Follow-up History" subtitle="Faculty and principal counseling timeline">
            {(incident.follow_ups || []).length > 0 ? (
              <div className="space-y-4 pt-2">
                {incident.follow_ups.map((f, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">
                        Follow-up Action #{idx + 1}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">{f.follow_up_date}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{f.remarks}</p>
                    <div className="text-[11px] text-slate-400 pt-1">
                      Status: <strong className="text-slate-600">{f.status || 'Completed'}</strong>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No follow-up actions recorded yet.</p>
            )}
          </Card>
        </div>

        {/* Student & Status Sidebar */}
        <div className="space-y-6">
          <Card title="Student Information">
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Student</span>
                <button
                  onClick={() => navigate(`/students/${incident.student_id}`)}
                  className="font-bold text-primary hover:underline text-right"
                >
                  {incident.student_name}
                </button>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Admission No</span>
                <span className="font-mono text-slate-700">{incident.admission_number || '-'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Class &amp; Section</span>
                <span className="font-semibold text-slate-700">{incident.class_name || '-'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Incident Status</span>
                <StatusBadge status={incident.status} />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Follow-up Modal */}
      <AppModal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        title="Add Disciplinary Follow-up Remark"
        size="md"
        onConfirm={handleAddFollowUp}
        confirmText="Save Follow-up"
        cancelText="Cancel"
        loading={submittingFollowUp}
      >
        <form id="followup-form" onSubmit={handleAddFollowUp} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <FormInput
            type="date"
            label="Follow-up Date"
            value={followUpData.follow_up_date}
            onChange={(e) => setFollowUpData({ ...followUpData, follow_up_date: e.target.value })}
            rightIcon={Calendar}
            required
          />

          <FormTextarea
            label="Counseling / Follow-up Remarks"
            value={followUpData.remarks}
            onChange={(e) => setFollowUpData({ ...followUpData, remarks: e.target.value })}
            placeholder="Enter meeting outcomes, behavioral improvements, or action plan..."
            required
            rows={4}
          />

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: '600', color: '#334155', cursor: 'pointer', paddingTop: '4px' }}>
            <input
              type="checkbox"
              checked={followUpData.resolve_incident}
              onChange={(e) => setFollowUpData({ ...followUpData, resolve_incident: e.target.checked })}
              style={{ width: '15px', height: '15px', accentColor: '#10b981', cursor: 'pointer' }}
            />
            <span>Mark incident status as Resolved</span>
          </label>
        </form>
      </AppModal>
    </div>
  );
};
