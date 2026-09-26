import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { studentApi } from '../../api/studentApi';
import { masterApi } from '../../api/masterApi';

export const StudentFormModal = ({ isOpen, onClose, onSuccess, studentToEdit = null }) => {
  const { showSuccess, showError } = useToast();
  const isEdit = !!studentToEdit;

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    admission_number: '',
    roll_number: '',
    first_name: '',
    last_name: '',
    gender: 'Male',
    date_of_birth: '',
    blood_group: 'O+',
    address: '',
    emergency_contact: '',
    class_id: '',
    section_id: '',
    academic_year_id: ''
  });

  useEffect(() => {
    masterApi.getClasses().then(res => setClasses(res.data || [])).catch(() => {});
    masterApi.getAcademicYears().then(res => {
      const yrs = res.data || [];
      setAcademicYears(yrs);
      if (!isEdit && yrs.length > 0) {
        const curr = yrs.find(y => y.is_current) || yrs[0];
        setFormData(prev => ({ ...prev, academic_year_id: curr.id }));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (formData.class_id) {
      masterApi.getSections(formData.class_id).then(res => setSections(res.data || [])).catch(() => {});
    } else {
      setSections([]);
    }
  }, [formData.class_id]);

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        admission_number: studentToEdit.admission_number || '',
        roll_number: studentToEdit.roll_number || '',
        first_name: studentToEdit.first_name || '',
        last_name: studentToEdit.last_name || '',
        gender: studentToEdit.gender || 'Male',
        date_of_birth: studentToEdit.date_of_birth || '',
        blood_group: studentToEdit.blood_group || 'O+',
        address: studentToEdit.address || '',
        emergency_contact: studentToEdit.emergency_contact || '',
        class_id: studentToEdit.class_id || '',
        section_id: studentToEdit.section_id || '',
        academic_year_id: studentToEdit.academic_year_id || ''
      });
    } else {
      setFormData({
        admission_number: '',
        roll_number: '',
        first_name: '',
        last_name: '',
        gender: 'Male',
        date_of_birth: '',
        blood_group: 'O+',
        address: '',
        emergency_contact: '',
        class_id: classes[0]?.id || '',
        section_id: '',
        academic_year_id: academicYears.find(y => y.is_current)?.id || ''
      });
    }
  }, [studentToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEdit) {
        await studentApi.update(studentToEdit.id, formData);
        showSuccess('Student profile updated successfully');
      } else {
        await studentApi.create(formData);
        showSuccess('Student enrolled successfully');
      }
      onSuccess();
      onClose();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to save student details');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Student Profile' : 'Enrol New Student'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Admission Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="admission_number"
              value={formData.admission_number}
              onChange={handleChange}
              disabled={isEdit}
              required
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Roll Number</label>
            <input
              type="text"
              name="roll_number"
              value={formData.roll_number}
              onChange={handleChange}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              First Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Class</label>
            <select
              name="class_id"
              value={formData.class_id}
              onChange={handleChange}
              required
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="">-- Select Class --</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.class_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Section</label>
            <select
              name="section_id"
              value={formData.section_id}
              onChange={handleChange}
              required
              disabled={!formData.class_id}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-slate-100"
            >
              <option value="">-- Select Section --</option>
              {sections.map(s => (
                <option key={s.id} value={s.id}>Section {s.section_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Phone</label>
            <input
              type="tel"
              name="emergency_contact"
              value={formData.emergency_contact}
              onChange={handleChange}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
            <select
              name="blood_group"
              value={formData.blood_group}
              onChange={handleChange}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
          <textarea
            rows={2}
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={submitting}>
            {isEdit ? 'Save Changes' : 'Enrol Student'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
