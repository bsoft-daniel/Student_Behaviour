import React, { useState, useEffect } from 'react';
import { AppModal } from '../../components/common/AppModal';
import { FormInput, FormSelect, FormTextarea } from '../../components/common/FormField';
import { useToast } from '../../context/ToastContext';
import { AppSweetAlert } from '../../components/common/AppSweetAlert';
import { User, Calendar, MapPin } from 'lucide-react';
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
    masterApi.getClasses().then(res => {
      const cls = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      setClasses(cls);
    }).catch(() => setClasses([]));

    masterApi.getAcademicYears().then(res => {
      const yrs = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      setAcademicYears(yrs);
      if (!isEdit && yrs.length > 0) {
        const curr = yrs.find(y => y.is_current) || yrs[0];
        setFormData(prev => ({ ...prev, academic_year_id: curr.id }));
      }
    }).catch(() => setAcademicYears([]));
  }, []);

  useEffect(() => {
    if (formData.class_id) {
      masterApi.getSections(formData.class_id).then(res => {
        const secs = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
        setSections(secs);
      }).catch(() => setSections([]));
    } else {
      setSections([]);
    }
  }, [formData.class_id]);

  const formatDateForInput = (d) => {
    if (!d) return '';
    try {
      const date = new Date(d);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        admission_number: studentToEdit.admission_number || '',
        roll_number: studentToEdit.roll_number || '',
        first_name: studentToEdit.first_name || '',
        last_name: studentToEdit.last_name || '',
        gender: studentToEdit.gender || 'Male',
        date_of_birth: formatDateForInput(studentToEdit.date_of_birth),
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
    if (e) e.preventDefault();
    setSubmitting(true);
    try {
      if (isEdit) {
        await studentApi.update(studentToEdit.id, formData);
        showSuccess(`Updated student profile for ${formData.first_name}`);
        AppSweetAlert.success({
          title: 'Student Profile Updated!',
          text: `Record for ${formData.first_name} ${formData.last_name} saved successfully.`
        });
      } else {
        await studentApi.create(formData);
        showSuccess(`Enrolled student ${formData.first_name}`);
        AppSweetAlert.success({
          title: 'Student Enrolled!',
          text: `Student ${formData.first_name} ${formData.last_name} registered successfully.`
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to save student details');
      AppSweetAlert.error({
        title: 'Save Failed',
        text: err.response?.data?.error || 'Could not save student details.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Student Profile' : 'Enrol New Student'}
      size="lg"
      onConfirm={handleSubmit}
      confirmText={isEdit ? 'Save Changes' : 'Enrol Student'}
      cancelText="Cancel"
      loading={submitting}
    >
      <form id="student-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
          {/* Admission Number */}
          <FormInput
            label="Admission Number"
            name="admission_number"
            value={formData.admission_number}
            onChange={handleChange}
            disabled={isEdit}
            required
          />

          {/* Roll Number */}
          <FormInput
            label="Roll Number"
            name="roll_number"
            value={formData.roll_number}
            onChange={handleChange}
          />

          {/* First Name */}
          <FormInput
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            icon={User}
            required
          />

          {/* Last Name */}
          <FormInput
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            icon={User}
            required
          />

          {/* Gender */}
          <FormSelect
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            placeholder={null}
            options={[
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Other', label: 'Other' }
            ]}
          />

          {/* Date of Birth */}
          <FormInput
            type="date"
            label="Date of Birth"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            rightIcon={Calendar}
          />

          {/* Class */}
          <FormSelect
            label="Class"
            name="class_id"
            value={formData.class_id}
            onChange={handleChange}
            placeholder="Select Class"
            required
            options={(Array.isArray(classes) ? classes : []).map(c => ({
              value: c.id,
              label: c.class_name
            }))}
          />

          {/* Section */}
          <FormSelect
            label="Section"
            name="section_id"
            value={formData.section_id}
            onChange={handleChange}
            placeholder="Select Section"
            disabled={!formData.class_id}
            required
            options={(Array.isArray(sections) && sections.length > 0 ? sections : [
              { id: 1, section_name: 'A' },
              { id: 2, section_name: 'B' },
              { id: 3, section_name: 'C' }
            ]).map(s => {
              if (typeof s === 'string') {
                return { value: s, label: `Section ${s}` };
              }
              const name = s.section_name || s.name || s.label || s.id;
              return {
                value: s.id || name,
                label: name.toString().startsWith('Section') ? name : `Section ${name}`
              };
            })}
          />

          {/* Emergency Contact Phone */}
          <FormInput
            type="tel"
            label="Emergency Contact Phone"
            name="emergency_contact"
            value={formData.emergency_contact}
            onChange={handleChange}
          />

          {/* Blood Group */}
          <FormSelect
            label="Blood Group"
            name="blood_group"
            value={formData.blood_group}
            onChange={handleChange}
            placeholder={null}
            options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']}
          />
        </div>

        {/* Address */}
        <FormTextarea
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          icon={MapPin}
          rows={2}
        />
      </form>
    </AppModal>
  );
};
