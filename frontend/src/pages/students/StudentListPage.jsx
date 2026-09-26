import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserPlus, Search, Filter, Eye, Edit, 
  Trash2, RefreshCw, FileText 
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { StudentFormModal } from './StudentFormModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { studentApi } from '../../api/studentApi';
import { masterApi } from '../../api/masterApi';

export const StudentListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteConfirmStudent, setDeleteConfirmStudent] = useState(null);

  const role = (user?.role_name || user?.role || '').toLowerCase();
  const isAdmin = role === 'admin' || role === 'administrator';

  useEffect(() => {
    masterApi.getClasses().then(res => setClasses(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedClass) {
      masterApi.getSections(selectedClass).then(res => setSections(res.data || [])).catch(() => {});
    } else {
      setSections([]);
      setSelectedSection('');
    }
  }, [selectedClass]);

  useEffect(() => {
    fetchStudents();
  }, [page, selectedClass, selectedSection]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await studentApi.getAll({
        page,
        page_size: pageSize,
        class_id: selectedClass || undefined,
        section_id: selectedSection || undefined,
        search: search || undefined
      });
      const data = res.data;
      setStudents(data.items || data || []);
      setTotalStudents(data.total || (data.items ? data.items.length : data.length || 0));
    } catch (err) {
      showError('Failed to fetch student roster');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmStudent) return;
    try {
      await studentApi.delete(deleteConfirmStudent.id);
      showSuccess(`Student record for "${deleteConfirmStudent.first_name}" removed`);
      setDeleteConfirmStudent(null);
      fetchStudents();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to delete student');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Directory"
        subtitle="Manage student profiles, conduct history, and academic class assignments"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Students' }
        ]}
        actions={
          isAdmin ? (
            <Button
              variant="primary"
              onClick={() => { setEditingStudent(null); setIsModalOpen(true); }}
              icon={<UserPlus size={16} />}
            >
              Enrol Student
            </Button>
          ) : null
        }
      />

      {/* Filters Bar */}
      <Card>
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Search Student</label>
            <input
              type="text"
              placeholder="Search by name, admission no, roll no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Class Filter</label>
            <select
              value={selectedClass}
              onChange={(e) => { setSelectedClass(e.target.value); setPage(1); }}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="">All Classes</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.class_name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" variant="primary" className="w-full text-xs justify-center" icon={<Search size={14} />}>
              Filter
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => { setSelectedClass(''); setSelectedSection(''); setSearch(''); setPage(1); }}
              className="text-xs px-2.5"
              title="Reset Filters"
            >
              <RefreshCw size={14} />
            </Button>
          </div>
        </form>
      </Card>

      {/* Student Cards Grid / Table */}
      <Card padding="none">
        {loading ? (
          <div className="p-8">
            <LoadingState message="Loading student records..." />
          </div>
        ) : students.length > 0 ? (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Student Name</th>
                    <th className="py-3.5 px-4">Adm No</th>
                    <th className="py-3.5 px-4">Class &amp; Section</th>
                    <th className="py-3.5 px-4">Roll No</th>
                    <th className="py-3.5 px-4">Gender</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">
                          {st.first_name} {st.last_name || ''}
                        </div>
                        <div className="text-xs text-slate-400">
                          {st.blood_group ? `Blood: ${st.blood_group}` : ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600 font-semibold">
                        {st.admission_number}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {st.class_name || st.class_room?.class_name || '-'} {st.section_name || st.section?.section_name ? `- Sec ${st.section_name || st.section?.section_name}` : ''}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                        {st.roll_number || '-'}
                      </td>
                      <td className="py-3.5 px-4 capitalize text-slate-600">
                        {st.gender || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/students/${st.id}`)}
                            icon={<Eye size={13} />}
                          >
                            360° View
                          </Button>
                          {isAdmin && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => { setEditingStudent(st); setIsModalOpen(true); }}
                                icon={<Edit size={13} />}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-rose-600 hover:bg-rose-50"
                                onClick={() => setDeleteConfirmStudent(st)}
                                icon={<Trash2 size={13} />}
                              />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-200">
              <Pagination
                currentPage={page}
                totalCount={totalStudents}
                pageSize={pageSize}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </div>
        ) : (
          <EmptyState
            title="No Students Found"
            description="No student profiles match your search criteria."
          />
        )}
      </Card>

      {/* Modal */}
      <StudentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchStudents}
        studentToEdit={editingStudent}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmStudent}
        title="Confirm Student Deactivation"
        message={`Are you sure you want to deactivate ${deleteConfirmStudent?.first_name} ${deleteConfirmStudent?.last_name || ''}?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmStudent(null)}
      />
    </div>
  );
};
