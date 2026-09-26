import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, CheckCircle, XCircle, Clock, AlertTriangle, 
  Save, RefreshCw, Users, ArrowRight 
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingState } from '../../components/common/LoadingState';
import { useToast } from '../../context/ToastContext';
import { attendanceApi } from '../../api/attendanceApi';
import { masterApi } from '../../api/masterApi';
import { studentApi } from '../../api/studentApi';

export const AttendanceMarkPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();

  const [academicYears, setAcademicYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [attendanceTypes, setAttendanceTypes] = useState([]);

  const [selectedYear, setSelectedYear] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});

  useEffect(() => {
    loadMasters();
  }, []);

  const loadMasters = async () => {
    try {
      const [yearsRes, classesRes, typesRes] = await Promise.all([
        masterApi.getAcademicYears(),
        masterApi.getClasses(),
        masterApi.getAttendanceTypes()
      ]);
      setAcademicYears(yearsRes.data || []);
      const activeYear = (yearsRes.data || []).find(y => y.is_current) || yearsRes.data?.[0];
      if (activeYear) setSelectedYear(activeYear.id);

      setClasses(classesRes.data || []);
      if (classesRes.data && classesRes.data.length > 0) {
        setSelectedClass(classesRes.data[0].id);
      }
      setAttendanceTypes(typesRes.data || []);
    } catch (err) {
      showError('Failed to load master filters');
    }
  };

  useEffect(() => {
    if (selectedClass) {
      masterApi.getSections(selectedClass).then(res => {
        const secs = res.data || [];
        setSections(secs);
        if (secs.length > 0) setSelectedSection(secs[0].id);
      }).catch(() => {});
    } else {
      setSections([]);
    }
  }, [selectedClass]);

  const handleFetchRollCall = async (e) => {
    if (e) e.preventDefault();
    if (!selectedClass || !selectedSection || !selectedDate) {
      showWarning('Please select Class, Section and Date');
      return;
    }

    setLoading(true);
    try {
      const stdRes = await studentApi.getAll({
        class_id: selectedClass,
        section_id: selectedSection,
        page_size: 100
      });
      const studentList = stdRes.data?.items || stdRes.data || [];
      setStudents(studentList);

      const attRes = await attendanceApi.getAll({
        class_id: selectedClass,
        section_id: selectedSection,
        date: selectedDate
      });
      const existing = attRes.data?.items || attRes.data || [];
      
      const presentType = attendanceTypes.find(t => t.type_name.toLowerCase() === 'present') || attendanceTypes[0];
      const initialMap = {};

      studentList.forEach(st => {
        const rec = existing.find(e => e.student_id === st.id);
        if (rec) {
          initialMap[st.id] = {
            attendance_type_id: rec.attendance_type_id || rec.attendance_type?.id,
            remarks: rec.remarks || ''
          };
        } else {
          initialMap[st.id] = {
            attendance_type_id: presentType?.id || 1,
            remarks: ''
          };
        }
      });

      setRecords(initialMap);
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to fetch student roll call');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, typeId) => {
    setRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        attendance_type_id: parseInt(typeId)
      }
    }));
  };

  const handleRemarkChange = (studentId, remarks) => {
    setRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks
      }
    }));
  };

  const markAllAs = (typeName) => {
    const targetType = attendanceTypes.find(t => t.type_name.toLowerCase() === typeName.toLowerCase());
    if (!targetType) return;

    setRecords(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(id => {
        updated[id] = {
          ...updated[id],
          attendance_type_id: targetType.id
        };
      });
      return updated;
    });
  };

  const handleSaveAttendance = async () => {
    if (students.length === 0) return;
    
    const recordsPayload = students.map(st => {
      const rec = records[st.id] || {};
      return {
        student_id: st.id,
        attendance_type_id: rec.attendance_type_id,
        remarks: rec.remarks || null
      };
    });

    const payload = {
      academic_year_id: parseInt(selectedYear),
      class_id: parseInt(selectedClass),
      section_id: parseInt(selectedSection),
      attendance_date: selectedDate,
      records: recordsPayload
    };

    setSubmitting(true);
    try {
      await attendanceApi.bulkSave(payload);
      showSuccess(`Attendance for ${selectedDate} saved successfully!`);
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to save attendance records');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Attendance Register"
        subtitle="Mark, verify, and submit class attendance with live conflict prevention"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'Mark Attendance' }
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate('/attendance')}>
            View Attendance Logs <ArrowRight size={16} className="ml-1" />
          </Button>
        }
      />

      <Card>
        <form onSubmit={handleFetchRollCall} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Academic Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none"
              required
            >
              {academicYears.map(y => (
                <option key={y.id} value={y.id}>{y.year_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none"
              required
            >
              <option value="">-- Select Class --</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.class_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none"
              required
            >
              <option value="">-- Select Section --</option>
              {sections.map(s => (
                <option key={s.id} value={s.id}>Section {s.section_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center"
              loading={loading}
              icon={<RefreshCw size={16} />}
            >
              Load Register
            </Button>
          </div>
        </form>
      </Card>

      {loading ? (
        <LoadingState message="Loading class roll call sheet..." />
      ) : students.length > 0 ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-200 rounded-xl p-4 shadow-sm gap-4">
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
              <span>Total: {students.length}</span>
              <span className="text-emerald-700">Present: {Object.values(records).filter(r => r.attendance_type_id === 1).length}</span>
              <span className="text-rose-700">Absent: {Object.values(records).filter(r => r.attendance_type_id === 2).length}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => markAllAs('present')}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition"
              >
                All Present
              </button>
              <button
                type="button"
                onClick={() => markAllAs('absent')}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 transition"
              >
                All Absent
              </button>
              <Button
                variant="primary"
                onClick={handleSaveAttendance}
                loading={submitting}
                icon={<Save size={16} />}
              >
                Save Attendance
              </Button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 w-16">Roll No</th>
                    <th className="py-3.5 px-4">Student Details</th>
                    <th className="py-3.5 px-4 min-w-[280px]">Status</th>
                    <th className="py-3.5 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => {
                    const currentRecord = records[student.id] || {};
                    const currentStatusId = currentRecord.attendance_type_id;

                    return (
                      <tr key={student.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                          {student.roll_number || '-'}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">
                            {student.first_name} {student.last_name || ''}
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            Adm: {student.admission_number}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            {attendanceTypes.map((type) => {
                              const isSelected = currentStatusId === type.id;
                              let btnClass = 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50';
                              
                              if (isSelected) {
                                if (type.type_name.toLowerCase() === 'present') {
                                  btnClass = 'border-emerald-600 bg-emerald-600 text-white shadow-sm';
                                } else if (type.type_name.toLowerCase() === 'absent') {
                                  btnClass = 'border-rose-600 bg-rose-600 text-white shadow-sm';
                                } else {
                                  btnClass = 'border-amber-600 bg-amber-600 text-white shadow-sm';
                                }
                              }

                              return (
                                <button
                                  key={type.id}
                                  type="button"
                                  onClick={() => handleStatusChange(student.id, type.id)}
                                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${btnClass}`}
                                >
                                  {type.type_name}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <input
                            type="text"
                            placeholder="Optional remark..."
                            value={currentRecord.remarks || ''}
                            onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:ring-1 focus:ring-primary focus:outline-none"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <Button
                variant="primary"
                onClick={handleSaveAttendance}
                loading={submitting}
                icon={<Save size={16} />}
              >
                Save Attendance Register
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Card className="text-center py-12">
          <Calendar size={32} className="text-primary mx-auto mb-2 opacity-60" />
          <h4 className="font-bold text-slate-800 text-sm">Select Class &amp; Section</h4>
          <p className="text-xs text-slate-500 mt-1">Choose your parameters above and click "Load Register".</p>
        </Card>
      )}
    </div>
  );
};
