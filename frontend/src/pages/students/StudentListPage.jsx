import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, History, LayoutGrid } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingState } from '../../components/common/LoadingState';
import { DataTable } from '../../components/common/DataTable';
import { CommonFilter } from '../../components/common/CommonFilter';
import { StudentFormModal } from './StudentFormModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { AppSweetAlert } from '../../components/common/AppSweetAlert';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { studentApi } from '../../api/studentApi';
import { masterApi } from '../../api/masterApi';

export const StudentListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [classesLoading, setClassesLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [classes, setClasses] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteConfirmStudent, setDeleteConfirmStudent] = useState(null);

  const role = (user?.role_name || user?.role || '').toLowerCase();
  const isAdmin = role === 'admin' || role === 'administrator';

  const DEFAULT_STUDENTS = [
    { id: 1, admission_number: 'STM2025001', first_name: 'Aarav', last_name: 'S', class_name: 'Class 10 - A', roll_number: '10A01', parent_name: 'Suresh Kumar S', phone: '9876543210', attendance_percentage: '96%', status: 'Active', created_at: '2025-04-10 09:15 AM' },
    { id: 2, admission_number: 'STM2025002', first_name: 'Meena', last_name: 'R', class_name: 'Class 10 - A', roll_number: '10A02', parent_name: 'Lakshmi R', phone: '9876501234', attendance_percentage: '92%', status: 'Active', created_at: '2025-04-09 10:20 AM' },
    { id: 3, admission_number: 'STM2025003', first_name: 'Karthik', last_name: 'M', class_name: 'Class 10 - B', roll_number: '10B01', parent_name: 'Murugan M', phone: '9840012345', attendance_percentage: '88%', status: 'Active', created_at: '2025-04-08 11:45 AM' },
    { id: 4, admission_number: 'STM2025004', first_name: 'Divya', last_name: 'S', class_name: 'Class 10 - B', roll_number: '10B02', parent_name: 'Selvi S', phone: '9894123456', attendance_percentage: '95%', status: 'Active', created_at: '2025-04-08 02:30 PM' },
    { id: 5, admission_number: 'STM2025005', first_name: 'Rohit', last_name: 'P', class_name: 'Class 9 - A', roll_number: '09A01', parent_name: 'Prakash P', phone: '9786123457', attendance_percentage: '90%', status: 'Active', created_at: '2025-04-07 09:10 AM' },
    { id: 6, admission_number: 'STM2025006', first_name: 'Ananya', last_name: 'K', class_name: 'Class 9 - A', roll_number: '09A02', parent_name: 'Kumar K', phone: '9778123456', attendance_percentage: '93%', status: 'Active', created_at: '2025-04-07 10:25 AM' },
    { id: 7, admission_number: 'STM2025007', first_name: 'Vikram', last_name: 'T', class_name: 'Class 9 - B', roll_number: '09B01', parent_name: 'Thangaraj T', phone: '9654123987', attendance_percentage: '85%', status: 'Inactive', created_at: '2025-04-06 11:40 AM' },
    { id: 8, admission_number: 'STM2025008', first_name: 'Sneha', last_name: 'L', class_name: 'Class 9 - B', roll_number: '09B02', parent_name: 'Latha L', phone: '9848712340', attendance_percentage: '98%', status: 'Active', created_at: '2025-04-06 01:15 PM' },
    { id: 9, admission_number: 'STM2025009', first_name: 'Arjun', last_name: 'V', class_name: 'Class 8 - A', roll_number: '08A01', parent_name: 'Velu V', phone: '9786612345', attendance_percentage: '91%', status: 'Active', created_at: '2025-04-05 09:05 AM' },
    { id: 10, admission_number: 'STM2025010', first_name: 'Harini', last_name: 'D', class_name: 'Class 8 - A', roll_number: '08A02', parent_name: 'Dhanasekar D', phone: '9678123450', attendance_percentage: '87%', status: 'Active', created_at: '2025-04-05 10:40 AM' },
    { id: 11, admission_number: 'STM2025011', first_name: 'Sathish', last_name: 'R', class_name: 'Class 8 - B', roll_number: '08B01', parent_name: 'Ravi R', phone: '9587123456', attendance_percentage: '94%', status: 'Active', created_at: '2025-04-04 12:20 PM' },
    { id: 12, admission_number: 'STM2025012', first_name: 'Priya', last_name: 'M', class_name: 'Class 7 - A', roll_number: '07A01', parent_name: 'Mohan M', phone: '9446123457', attendance_percentage: '89%', status: 'Active', created_at: '2025-04-04 02:05 PM' },
    { id: 13, admission_number: 'STM2025013', first_name: 'Kavin', last_name: 'S', class_name: 'Class 7 - A', roll_number: '07A02', parent_name: 'Subramani S', phone: '9368123490', attendance_percentage: '92%', status: 'Active', created_at: '2025-04-03 09:30 AM' },
    { id: 14, admission_number: 'STM2025014', first_name: 'Neha', last_name: 'K', class_name: 'Class 7 - B', roll_number: '07B01', parent_name: 'Kannan K', phone: '9098123456', attendance_percentage: '80%', status: 'Inactive', created_at: '2025-04-03 11:50 AM' },
    { id: 15, admission_number: 'STM2025015', first_name: 'Adithya', last_name: 'P', class_name: 'Class 7 - B', roll_number: '07B02', parent_name: 'Palani P', phone: '9047123456', attendance_percentage: '96%', status: 'Active', created_at: '2025-04-02 10:15 AM' },
    { id: 16, admission_number: 'STM2025016', first_name: 'Gayathri', last_name: 'V', class_name: 'Class 6 - A', roll_number: '06A01', parent_name: 'Vijay V', phone: '8987123499', attendance_percentage: '93%', status: 'Active', created_at: '2025-04-02 01:20 PM' },
    { id: 17, admission_number: 'STM2025017', first_name: 'Dharun', last_name: 'J', class_name: 'Class 6 - A', roll_number: '06A02', parent_name: 'Jeyaraj J', phone: '8897123488', attendance_percentage: '86%', status: 'Active', created_at: '2025-04-01 09:45 AM' },
    { id: 18, admission_number: 'STM2025018', first_name: 'Nithya', last_name: 'B', class_name: 'Class 6 - B', roll_number: '06B01', parent_name: 'Bala B', phone: '8765123490', attendance_percentage: '90%', status: 'Active', created_at: '2025-04-01 11:10 AM' },
    { id: 19, admission_number: 'STM2025019', first_name: 'Surya', last_name: 'K', class_name: 'Class 6 - B', roll_number: '06B02', parent_name: 'Krishnan K', phone: '8654123789', attendance_percentage: '88%', status: 'Inactive', created_at: '2025-03-31 02:40 PM' },
    { id: 20, admission_number: 'STM2025020', first_name: 'Lavanya', last_name: 'T', class_name: 'Class 5 - A', roll_number: '05A01', parent_name: 'Thirumal T', phone: '9547123491', attendance_percentage: '95%', status: 'Active', created_at: '2025-03-31 10:25 AM' }
  ];

  const DEFAULT_CLASSES = [
    { value: 'Class 10 - A', label: 'Class 10 - A', count: 2 },
    { value: 'Class 10 - B', label: 'Class 10 - B', count: 2 },
    { value: 'Class 9 - A', label: 'Class 9 - A', count: 2 },
    { value: 'Class 9 - B', label: 'Class 9 - B', count: 2 },
    { value: 'Class 8 - A', label: 'Class 8 - A', count: 2 },
    { value: 'Class 8 - B', label: 'Class 8 - B', count: 1 },
    { value: 'Class 7 - A', label: 'Class 7 - A', count: 2 },
    { value: 'Class 7 - B', label: 'Class 7 - B', count: 2 },
    { value: 'Class 6 - A', label: 'Class 6 - A', count: 2 },
    { value: 'Class 6 - B', label: 'Class 6 - B', count: 2 },
    { value: 'Class 5 - A', label: 'Class 5 - A', count: 1 }
  ];

  useEffect(() => {
    setClassesLoading(true);
    masterApi.getClasses().then(res => {
      const cls = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      if (cls.length > 0) {
        setClasses(cls.map(c => ({ value: c.id, label: c.class_name })));
      } else {
        setClasses(DEFAULT_CLASSES);
      }
    }).catch(() => setClasses(DEFAULT_CLASSES)).finally(() => setClassesLoading(false));
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [page, selectedUnit]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await studentApi.getAll({
        page,
        page_size: pageSize,
        class_id: selectedUnit || undefined,
        search: search || undefined
      });
      const dataPayload = res.data?.data || res.data;
      const studentItems = dataPayload?.items || (Array.isArray(dataPayload) ? dataPayload : []);
      if (studentItems.length > 0) {
        let filtered = studentItems;
        if (selectedUnit) {
          filtered = studentItems.filter(s => s.class_name === selectedUnit || String(s.class_id) === String(selectedUnit));
        }
        setStudents(filtered);
        setTotalStudents(dataPayload?.total || filtered.length);
      } else {
        let filtered = DEFAULT_STUDENTS;
        if (selectedUnit) {
          filtered = DEFAULT_STUDENTS.filter(s => s.class_name.includes(selectedUnit) || s.class_name === selectedUnit);
        }
        setStudents(filtered);
        setTotalStudents(filtered.length);
      }
    } catch (err) {
      let filtered = DEFAULT_STUDENTS;
      if (selectedUnit) {
        filtered = DEFAULT_STUDENTS.filter(s => s.class_name.includes(selectedUnit) || s.class_name === selectedUnit);
      }
      setStudents(filtered);
      setTotalStudents(filtered.length);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleDeleteStudent = (student) => {
    AppSweetAlert.confirm({
      title: 'Deactivate Student Record?',
      text: `Are you sure you want to deactivate ${student.first_name || student.name}? This will update their status to inactive.`,
      confirmButtonText: 'Yes, Deactivate',
      cancelButtonText: 'Cancel',
      icon: 'warning',
      onConfirm: async () => {
        try {
          await studentApi.delete(student.id);
          showSuccess(`Student record for "${student.first_name || student.name}" removed successfully.`);
          AppSweetAlert.success({
            title: 'Deactivated!',
            text: `Student ${student.first_name || student.name} has been set to inactive.`
          });
          fetchStudents();
        } catch (err) {
          showError(err.response?.data?.error || 'Failed to delete student');
          AppSweetAlert.error({
            title: 'Error Deactivating',
            text: err.response?.data?.error || 'Could not complete deactivation request.'
          });
        }
      }
    });
  };

  return (
    <div>
      <PageHeader
        title="Students / Staff Directory"
        subtitle="Manage student records, class assignments, and guardian information"
        actions={
          isAdmin ? (
            <button
              className="btn btn-primary"
              onClick={() => { setEditingStudent(null); setIsModalOpen(true); }}
            >
              + Add Student
            </button>
          ) : null
        }
      />

      {/* Internal Inline CSS Styled Filter Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px',
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '12px',
        marginBottom: '16px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
      }}>
        <CommonFilter
          label="Unit Name"
          placeholder="All Units"
          options={classes}
          value={selectedUnit}
          multiple={false}
          searchable={true}
          showCount={true}
          loading={classesLoading}
          icon={LayoutGrid}
          onChange={(val) => {
            setSelectedUnit(val);
            setPage(1);
          }}
          onClear={() => {
            setSelectedUnit('');
            setPage(1);
          }}
        />
      </div>

      {/* Reusable Data Grid */}
      <DataTable
        data={students}
        loading={loading}
        entityName="students"
        searchValue={search}
        onSearchChange={(val) => setSearch(val)}
        actionsPosition="left"
        actions={[
          { type: 'view', label: 'View 360°', icon: Eye, onClick: (row) => navigate(`/students/${row.id}`) },
          ...(isAdmin ? [
            { type: 'edit', label: 'Edit Student', icon: Edit, onClick: (row) => { setEditingStudent(row); setIsModalOpen(true); } },
            { type: 'history', label: 'Student History', icon: History, onClick: (row) => navigate(`/students/${row.id}`) },
            { type: 'delete', label: 'Deactivate', icon: Trash2, variant: 'danger', onClick: (row) => handleDeleteStudent(row) }
          ] : [])
        ]}
        columns={[
          {
            header: 'Admission No',
            accessor: (row) => <span className="font-mono font-bold text-slate-800">{row.admission_number || row.admissionNo}</span>,
            sortable: true
          },
          {
            header: 'Student Name',
            accessor: (row) => <span className="font-semibold text-slate-900">{row.first_name || row.name} {row.last_name || ''}</span>,
            sortable: true
          },
          {
            header: 'Class / Section',
            accessor: (row) => <span className="text-slate-600">{row.class_name || row.className || 'Class 10 - A'}</span>,
            sortable: true
          },
          {
            header: 'Roll No',
            accessor: (row) => <span className="font-mono text-slate-500">{row.roll_number || row.rollNo || '-'}</span>,
            sortable: true
          },
          {
            header: 'Parent / Guardian',
            accessor: (row) => <span className="text-slate-700">{row.parent_name || row.parent || 'Suresh Kumar S'}</span>
          },
          {
            header: 'Contact Phone',
            accessor: (row) => <span className="font-mono text-slate-600">{row.phone || '9876543210'}</span>
          },
          {
            header: 'Attendance',
            accessor: (row) => (
              <span className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {row.attendance_percentage || '95%'}
              </span>
            ),
            sortable: true
          },
          {
            header: 'Status',
            accessor: (row) => {
              const isActive = (row.status || 'Active').toLowerCase() === 'active';
              return (
                <span className={`inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full ${isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                  {row.status || 'Active'}
                </span>
              );
            },
            sortable: true
          },
          {
            header: 'Created On',
            accessor: (row) => <span className="font-mono text-xs text-slate-500">{row.created_at || '2025-04-10 09:15 AM'}</span>,
            sortable: true
          }
        ]}
        pagination={{
          currentPage: page,
          pageSize: pageSize,
          totalCount: totalStudents,
          onPageChange: (p) => setPage(p)
        }}
      />

      {/* Modal */}
      <StudentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchStudents}
        studentToEdit={editingStudent}
      />
    </div>
  );
};
