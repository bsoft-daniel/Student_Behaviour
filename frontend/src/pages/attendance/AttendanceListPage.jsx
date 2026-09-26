import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, CheckCircle, XCircle, Clock, Plus, 
  Search, RefreshCw, FileText 
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { useToast } from '../../context/ToastContext';
import { attendanceApi } from '../../api/attendanceApi';
import { masterApi } from '../../api/masterApi';

export const AttendanceListPage = () => {
  const navigate = useNavigate();
  const { showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    masterApi.getClasses().then(res => setClasses(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedClass) {
      masterApi.getSections(selectedClass).then(res => setSections(res.data || [])).catch(() => {});
    } else {
      setSections([]);
    }
  }, [selectedClass]);

  useEffect(() => {
    fetchRecords();
  }, [page, selectedClass, selectedSection, selectedDate]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getAll({
        page,
        page_size: pageSize,
        class_id: selectedClass || undefined,
        section_id: selectedSection || undefined,
        date: selectedDate || undefined
      });
      const data = res.data;
      setRecords(data.items || data || []);
      setTotalRecords(data.total || (data.items ? data.items.length : data.length || 0));
    } catch (err) {
      showError('Failed to load attendance logs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Attendance Records"
        subtitle="Historical roll-call logs, student check-in details, and absence excuses"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Attendance' }
        ]}
        actions={
          <Button
            variant="primary"
            onClick={() => navigate('/attendance/mark')}
            icon={<Plus size={16} />}
          >
            Mark Daily Register
          </Button>
        }
      />

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => { setSelectedClass(e.target.value); setPage(1); }}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => { setSelectedSection(e.target.value); setPage(1); }}
              disabled={!selectedClass}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-slate-100"
            >
              <option value="">All Sections</option>
              {sections.map(s => <option key={s.id} value={s.id}>Section {s.section_name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setPage(1); }}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => { setSelectedClass(''); setSelectedSection(''); setSelectedDate(''); setPage(1); }}
              className="w-full text-xs justify-center"
              icon={<RefreshCw size={14} />}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      <Card padding="none">
        {loading ? (
          <div className="p-8">
            <LoadingState message="Loading attendance records..." />
          </div>
        ) : records.length > 0 ? (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Class</th>
                    <th className="py-3.5 px-4">Roll No</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((r) => {
                    const statusName = r.attendance_type?.type_name || r.status || 'Present';
                    const isPresent = statusName.toLowerCase() === 'present';
                    const isAbsent = statusName.toLowerCase() === 'absent';
                    const isLate = statusName.toLowerCase() === 'late';

                    return (
                      <tr key={r.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-mono text-xs text-slate-500">{r.attendance_date}</td>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {r.student?.first_name ? `${r.student.first_name} ${r.student.last_name || ''}` : `Student #${r.student_id}`}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {r.student?.class_room?.class_name || r.class_name || '-'}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-slate-500">{r.student?.roll_number || '-'}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                            isPresent ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            isAbsent ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            isLate ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {statusName}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate">{r.remarks || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-200">
              <Pagination
                currentPage={page}
                totalCount={totalRecords}
                pageSize={pageSize}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </div>
        ) : (
          <EmptyState
            title="No Attendance Logs Found"
            description="No roll call records match your current filter."
            actionText="Mark Register"
            onAction={() => navigate('/attendance/mark')}
          />
        )}
      </Card>
    </div>
  );
};
