import React, { useState, useEffect } from 'react';
import { AppModal } from '../../components/common/AppModal';
import { FormInput, FormSelect, FormTextarea } from '../../components/common/FormField';
import { useToast } from '../../context/ToastContext';
import { behaviourApi } from '../../api/behaviourApi';
import { studentApi } from '../../api/studentApi';
import { masterApi } from '../../api/masterApi';
import { User, Calendar, MapPin } from 'lucide-react';

export const RecordBehaviourModal = ({ isOpen, onClose, onSuccess, preselectedStudentId = null }) => {
  const { showSuccess, showError } = useToast();

  const [students, setStudents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [severities, setSeverities] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    student_id: preselectedStudentId || '',
    academic_year_id: '',
    category_id: '',
    type_id: '',
    severity_id: '',
    incident_date: new Date().toISOString().split('T')[0],
    location: 'Classroom',
    description: '',
    action_taken: '',
    is_critical: false,
    parent_notified: false
  });

  useEffect(() => {
    loadMasters();
  }, []);

  useEffect(() => {
    if (preselectedStudentId) {
      setFormData(prev => ({ ...prev, student_id: preselectedStudentId }));
    }
  }, [preselectedStudentId]);

  const toArray = (res) => {
    if (!res) return [];
    const payload = res.data?.data || res.data?.items || res.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  };

  useEffect(() => {
    if (formData.category_id) {
      masterApi.getBehaviourTypes(formData.category_id).then(res => {
        const tList = toArray(res);
        setTypes(tList);
        if (tList.length > 0) {
          setFormData(prev => ({ ...prev, type_id: tList[0].id }));
        }
      }).catch(() => setTypes([]));
    } else {
      setTypes([]);
    }
  }, [formData.category_id]);

  const loadMasters = async () => {
    try {
      const [stdRes, catRes, sevRes, yrsRes] = await Promise.all([
        studentApi.getAll({ page_size: 200 }),
        masterApi.getBehaviourCategories(),
        masterApi.getSeverityLevels(),
        masterApi.getAcademicYears()
      ]);

      const sList = toArray(stdRes);
      const cList = toArray(catRes);
      const vList = toArray(sevRes);
      const yList = toArray(yrsRes);

      setStudents(sList);
      setCategories(cList);
      setSeverities(vList);
      setAcademicYears(yList);

      const currYear = yList.find(y => y.is_current) || yList[0];
      
      if (cList.length > 0) {
        setFormData(prev => ({
          ...prev,
          category_id: cList[0].id,
          severity_id: vList[0]?.id || '',
          academic_year_id: currYear?.id || ''
        }));
      }
    } catch (err) {
      showError('Failed to load behaviour master data');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.student_id) {
      showError('Please select a student');
      return;
    }

    setSubmitting(true);
    try {
      await behaviourApi.create({
        ...formData,
        student_id: parseInt(formData.student_id),
        academic_year_id: parseInt(formData.academic_year_id),
        category_id: parseInt(formData.category_id),
        type_id: parseInt(formData.type_id),
        severity_id: parseInt(formData.severity_id)
      });
      showSuccess('Behaviour record logged successfully');
      onSuccess();
      onClose();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to record behaviour incident');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Student Behaviour / Commendation"
      size="lg"
      onConfirm={handleSubmit}
      confirmText="Save Record"
      cancelText="Cancel"
      loading={submitting}
    >
      <form id="behaviour-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
          {!preselectedStudentId && (
            <div style={{ gridColumn: 'span 2' }}>
              <FormSelect
                label="Select Student"
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                icon={User}
                placeholder="-- Choose Student --"
                required
                options={(Array.isArray(students) ? students : []).map(s => ({
                  value: s.id,
                  label: `${s.first_name} ${s.last_name || ''} (${s.class_name || s.class_room?.class_name || 'Class'} - ${s.admission_number})`
                }))}
              />
            </div>
          )}

          <FormSelect
            label="Category"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            placeholder={null}
            required
            options={(Array.isArray(categories) ? categories : []).map(c => ({
              value: c.id,
              label: `${c.category_name} (${c.category_type})`
            }))}
          />

          <FormSelect
            label="Behaviour Type"
            name="type_id"
            value={formData.type_id}
            onChange={handleChange}
            placeholder={null}
            required
            options={(Array.isArray(types) ? types : []).map(t => ({
              value: t.id,
              label: t.type_name
            }))}
          />

          <FormSelect
            label="Severity Level"
            name="severity_id"
            value={formData.severity_id}
            onChange={handleChange}
            placeholder={null}
            required
            options={(Array.isArray(severities) ? severities : []).map(s => ({
              value: s.id,
              label: s.severity_name
            }))}
          />

          <FormInput
            type="date"
            label="Incident Date"
            name="incident_date"
            value={formData.incident_date}
            onChange={handleChange}
            rightIcon={Calendar}
            required
          />

          <div style={{ gridColumn: 'span 2' }}>
            <FormInput
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              icon={MapPin}
              placeholder="e.g. Classroom, Playground, Library"
            />
          </div>
        </div>

        <FormTextarea
          label="Description of Incident / Commendation"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Provide complete and objective facts..."
          required
          rows={3}
        />

        <FormTextarea
          label="Immediate Action Taken / Faculty Remarks"
          name="action_taken"
          value={formData.action_taken}
          onChange={handleChange}
          placeholder="e.g. Verbal warning issued, seat rearranged, commendation badge awarded"
          rows={2}
        />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', paddingTop: '4px' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="is_critical"
              checked={formData.is_critical}
              onChange={handleChange}
              style={{ width: '15px', height: '15px', accentColor: '#ef4444', borderRadius: '4px', cursor: 'pointer' }}
            />
            <span>Mark as Critical Case (Escalate to Principal)</span>
          </label>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="parent_notified"
              checked={formData.parent_notified}
              onChange={handleChange}
              style={{ width: '15px', height: '15px', accentColor: '#168a9b', borderRadius: '4px', cursor: 'pointer' }}
            />
            <span>Parent Notified</span>
          </label>
        </div>
      </form>
    </AppModal>
  );
};
