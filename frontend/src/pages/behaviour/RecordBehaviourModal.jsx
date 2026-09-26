import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { behaviourApi } from '../../api/behaviourApi';
import { studentApi } from '../../api/studentApi';
import { masterApi } from '../../api/masterApi';

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

  useEffect(() => {
    if (formData.category_id) {
      masterApi.getBehaviourTypes(formData.category_id).then(res => {
        setTypes(res.data || []);
        if (res.data && res.data.length > 0) {
          setFormData(prev => ({ ...prev, type_id: res.data[0].id }));
        }
      }).catch(() => {});
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

      setStudents(stdRes.data?.items || stdRes.data || []);
      setCategories(catRes.data || []);
      setSeverities(sevRes.data || []);
      
      const yrs = yrsRes.data || [];
      setAcademicYears(yrs);
      const currYear = yrs.find(y => y.is_current) || yrs[0];
      
      if (catRes.data && catRes.data.length > 0) {
        setFormData(prev => ({
          ...prev,
          category_id: catRes.data[0].id,
          severity_id: sevRes.data?.[0]?.id || '',
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Student Behaviour / Commendation"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!preselectedStudentId && (
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Student <span className="text-rose-500">*</span>
              </label>
              <select
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                required
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="">-- Choose Student --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name || ''} ({s.class_name || s.class_room?.class_name || 'Class'} - {s.admission_number})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.category_name} ({c.category_type})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Behaviour Type <span className="text-rose-500">*</span>
            </label>
            <select
              name="type_id"
              value={formData.type_id}
              onChange={handleChange}
              required
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {types.map(t => (
                <option key={t.id} value={t.id}>{t.type_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Severity Level <span className="text-rose-500">*</span>
            </label>
            <select
              name="severity_id"
              value={formData.severity_id}
              onChange={handleChange}
              required
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {severities.map(s => (
                <option key={s.id} value={s.id}>{s.severity_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Incident Date</label>
            <input
              type="date"
              name="incident_date"
              value={formData.incident_date}
              onChange={handleChange}
              required
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Classroom, Playground, Library"
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Description of Incident / Commendation <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide complete and objective facts..."
            required
            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Immediate Action Taken / Faculty Remarks
          </label>
          <textarea
            rows={2}
            name="action_taken"
            value={formData.action_taken}
            onChange={handleChange}
            placeholder="e.g. Verbal warning issued, seat rearranged, commendation badge awarded"
            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-4 pt-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              name="is_critical"
              checked={formData.is_critical}
              onChange={handleChange}
              className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
            />
            <span>Mark as Critical Case (Escalate to Principal)</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              name="parent_notified"
              checked={formData.parent_notified}
              onChange={handleChange}
              className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
            />
            <span>Parent Notified</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={submitting}>
            Save Record
          </Button>
        </div>
      </form>
    </Modal>
  );
};
