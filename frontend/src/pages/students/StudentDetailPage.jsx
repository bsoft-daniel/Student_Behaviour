import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, Calendar, ShieldAlert, Award, ArrowLeft, 
  Phone, Mail, MapPin, Heart, Plus, Edit 
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { RecordBehaviourModal } from '../behaviour/RecordBehaviourModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { studentApi } from '../../api/studentApi';
import { behaviourApi } from '../../api/behaviourApi';
import { attendanceApi } from '../../api/attendanceApi';

export const StudentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  const role = (user?.role_name || user?.role || '').toLowerCase();
  const canRecord = ['admin', 'administrator', 'teacher', 'staff', 'principal'].includes(role);

  useEffect(() => {
    loadStudentData();
  }, [id]);

  const loadStudentData = async () => {
    setLoading(true);
    try {
      const [stdRes, incRes, attRes] = await Promise.all([
        studentApi.getById(id),
        behaviourApi.getAll({ student_id: id }),
        attendanceApi.getAll({ student_id: id })
      ]);
      setStudent(stdRes.data?.data || stdRes.data);
      setIncidents(incRes.data?.items || incRes.data || []);
      setAttendanceRecords(attRes.data?.items || attRes.data || []);
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to load student dossier');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading student 360° profile..." />;
  }

  if (!student) {
    return (
      <Card className="text-center py-12">
        <p className="text-sm text-slate-500">Student not found or access unauthorized.</p>
        <Button className="mt-4" variant="outline" onClick={() => navigate('/students')}>
          Back to Students
        </Button>
      </Card>
    );
  }

  // Attendance metrics
  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter(a => (a.attendance_type?.type_name || a.status || '').toLowerCase() === 'present').length;
  const attPct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${student.first_name} ${student.last_name || ''}`}
        subtitle={`Class: ${student.class_name || student.class_room?.class_name || '-'} | Adm No: ${student.admission_number} | Roll No: ${student.roll_number || '-'}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Students', href: '/students' },
          { label: student.first_name }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/students')} icon={<ArrowLeft size={16} />}>
              Back
            </Button>
            {canRecord && (
              <Button variant="primary" onClick={() => setIsRecordModalOpen(true)} icon={<Plus size={16} />}>
                Record Incident / Commendation
              </Button>
            )}
          </div>
        }
      />

      {/* Top Banner Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <div className="text-center py-2">
            <div className="w-20 h-20 bg-primary/10 text-primary font-bold text-2xl rounded-full flex items-center justify-center mx-auto mb-3">
              {student.first_name?.charAt(0)}
            </div>
            <h3 className="font-bold text-base text-slate-800">{student.first_name} {student.last_name || ''}</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Adm: {student.admission_number}</p>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-4 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <User size={14} className="text-primary" />
              <span>Gender: <strong className="text-slate-800 capitalize">{student.gender || 'Male'}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Heart size={14} className="text-rose-500" />
              <span>Blood Group: <strong className="text-slate-800">{student.blood_group || 'O+'}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Phone size={14} className="text-emerald-500" />
              <span>Emergency: <strong className="text-slate-800">{student.emergency_contact || '-'}</strong></span>
            </div>
            <div className="flex items-start gap-2 text-slate-600">
              <MapPin size={14} className="text-amber-500 mt-0.5" />
              <span>Address: <strong className="text-slate-800">{student.address || '-'}</strong></span>
            </div>
          </div>
        </Card>

        {/* Conduct & Attendance Stats */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card title="Attendance Performance" subtitle="Total verified days">
            <div className="text-center py-4">
              <div className={`text-3xl font-extrabold ${attPct < 75 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {attPct}%
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {presentDays} present out of {totalDays} sessions
              </p>
            </div>
          </Card>

          <Card title="Disciplinary Profile" subtitle="Recorded events">
            <div className="text-center py-4">
              <div className="text-3xl font-extrabold text-primary">
                {incidents.length}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Total behavioural entries logged
              </p>
            </div>
          </Card>

          {/* Incidents table */}
          <div className="sm:col-span-2">
            <Card title="Behaviour &amp; Discipline Logs" subtitle="Historical records entered by faculty">
              {incidents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {incidents.map((inc) => (
                        <tr key={inc.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-mono text-slate-500">{inc.incident_date}</td>
                          <td className="py-3 px-3 font-bold text-slate-800">{inc.category_name}</td>
                          <td className="py-3 px-3 text-slate-600">{inc.type_name}</td>
                          <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{inc.description}</td>
                          <td className="py-3 px-3">
                            <StatusBadge status={inc.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">No conduct infractions or incidents logged.</p>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Record Modal */}
      <RecordBehaviourModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSuccess={loadStudentData}
        preselectedStudentId={student.id}
      />
    </div>
  );
};
