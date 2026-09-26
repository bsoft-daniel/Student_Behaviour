import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Layers, 
  Tag, 
  Settings, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Edit2, 
  Save, 
  RefreshCw,
  Building,
  Clock,
  ShieldAlert,
  Award
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { Modal } from '../../components/common/Modal';
import { masterApi } from '../../api/masterApi';
import { useToast } from '../../context/ToastContext';

export const MasterSettingsPage = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('academic_years');
  const [loading, setLoading] = useState(false);

  // Data states
  const [academicYears, setAcademicYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [severityLevels, setSeverityLevels] = useState([]);
  const [attendanceTypes, setAttendanceTypes] = useState([]);
  const [systemSettings, setSystemSettings] = useState({});

  // Modal states
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [yearForm, setYearForm] = useState({ name: '', start_date: '', end_date: '', is_current: false });

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classForm, setClassForm] = useState({ name: '', numeric_order: '' });

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', code: '', type: 'negative', description: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'academic_years') {
        const res = await masterApi.getAcademicYears();
        setAcademicYears(res.data || []);
      } else if (activeTab === 'classes') {
        const [clsRes, secRes] = await Promise.all([
          masterApi.getClasses(),
          masterApi.getSections()
        ]);
        setClasses(clsRes.data || []);
        setSections(secRes.data || []);
      } else if (activeTab === 'behaviour') {
        const [catRes, sevRes] = await Promise.all([
          masterApi.getBehaviourCategories(),
          masterApi.getSeverityLevels()
        ]);
        setCategories(catRes.data || []);
        setSeverityLevels(sevRes.data || []);
      } else if (activeTab === 'settings') {
        const res = await masterApi.getSystemSettings();
        setSystemSettings(res.data || {});
      }
    } catch (err) {
      addToast(err.message || 'Failed to load master configuration', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleCreateYear = async (e) => {
    e.preventDefault();
    try {
      await masterApi.createAcademicYear(yearForm);
      addToast('Academic Year added successfully', 'success');
      setIsYearModalOpen(false);
      setYearForm({ name: '', start_date: '', end_date: '', is_current: false });
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to add Academic Year', 'error');
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      await masterApi.createClass({ ...classForm, numeric_order: parseInt(classForm.numeric_order, 10) });
      addToast('Class created successfully', 'success');
      setIsClassModalOpen(false);
      setClassForm({ name: '', numeric_order: '' });
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to create Class', 'error');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await masterApi.createBehaviourCategory(catForm);
      addToast('Behaviour category added successfully', 'success');
      setIsCatModalOpen(false);
      setCatForm({ name: '', code: '', type: 'negative', description: '' });
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to add Behaviour Category', 'error');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await masterApi.updateSystemSettings(systemSettings);
      addToast('System settings updated successfully', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to save settings', 'error');
    }
  };

  const tabs = [
    { id: 'academic_years', label: 'Academic Years', icon: Calendar },
    { id: 'classes', label: 'Classes & Sections', icon: Layers },
    { id: 'behaviour', label: 'Behaviour Masters', icon: Award },
    { id: 'settings', label: 'System Configuration', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Configuration & Settings"
        subtitle="Manage academic periods, structural master data, behaviour catalogs, and school policies"
      />

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 bg-white rounded-t-xl px-4 pt-3 gap-2 shadow-sm overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-primary-600 text-primary-700 bg-primary-50/50 rounded-t-lg'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 rounded-t-lg'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary-600' : 'text-neutral-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <LoadingState message="Loading configuration records..." />
      ) : (
        <div>
          {/* Tab 1: Academic Years */}
          {activeTab === 'academic_years' && (
            <Card
              title="Academic Calendar Years"
              subtitle="Define and activate academic cycles for student attendance and records"
              action={
                <Button size="sm" icon={Plus} onClick={() => setIsYearModalOpen(true)}>
                  Add Academic Year
                </Button>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50 text-neutral-600 uppercase text-xs border-b">
                    <tr>
                      <th className="py-3 px-4">Academic Year</th>
                      <th className="py-3 px-4">Start Date</th>
                      <th className="py-3 px-4">End Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Current Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {academicYears.map((yr) => (
                      <tr key={yr.id} className="hover:bg-neutral-50/50">
                        <td className="py-3 px-4 font-semibold text-neutral-900">{yr.name}</td>
                        <td className="py-3 px-4 text-neutral-600">{yr.start_date || 'N/A'}</td>
                        <td className="py-3 px-4 text-neutral-600">{yr.end_date || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <StatusBadge status={yr.is_active ? 'active' : 'inactive'} />
                        </td>
                        <td className="py-3 px-4">
                          {yr.is_current ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Current Active
                            </span>
                          ) : (
                            <span className="text-xs text-neutral-400">Archived</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Tab 2: Classes & Sections */}
          {activeTab === 'classes' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card
                title="School Classes (Standards)"
                subtitle="Configured grade standards"
                action={
                  <Button size="sm" icon={Plus} onClick={() => setIsClassModalOpen(true)}>
                    Add Class
                  </Button>
                }
              >
                <div className="divide-y divide-neutral-100">
                  {classes.map((cls) => (
                    <div key={cls.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-neutral-900">{cls.name}</p>
                        <p className="text-xs text-neutral-500">Order: {cls.numeric_order}</p>
                      </div>
                      <StatusBadge status={cls.is_active ? 'active' : 'inactive'} />
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Configured Sections" subtitle="Sections assigned to classes">
                <div className="divide-y divide-neutral-100">
                  {sections.map((sec) => (
                    <div key={sec.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-neutral-900">
                          {sec.class_room?.name} - Section {sec.name}
                        </p>
                        <p className="text-xs text-neutral-500">Max Capacity: {sec.capacity || 40}</p>
                      </div>
                      <StatusBadge status="active" />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Tab 3: Behaviour Masters */}
          {activeTab === 'behaviour' && (
            <div className="space-y-6">
              <Card
                title="Behaviour Categories"
                subtitle="Categories for tracking student merits and disciplinary records"
                action={
                  <Button size="sm" icon={Plus} onClick={() => setIsCatModalOpen(true)}>
                    Add Category
                  </Button>
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className={`p-4 rounded-xl border ${
                        cat.type === 'positive'
                          ? 'border-emerald-200 bg-emerald-50/40'
                          : 'border-amber-200 bg-amber-50/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                            cat.type === 'positive'
                              ? 'bg-emerald-200 text-emerald-800'
                              : 'bg-amber-200 text-amber-800'
                          }`}
                        >
                          {cat.type}
                        </span>
                        <span className="text-xs text-neutral-400 font-mono">{cat.code}</span>
                      </div>
                      <h4 className="font-bold text-neutral-900">{cat.name}</h4>
                      <p className="text-xs text-neutral-600 mt-1">{cat.description || 'No description provided'}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Severity Levels" subtitle="Standard severity thresholds for incidents">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {severityLevels.map((sev) => (
                    <div key={sev.id} className="p-4 rounded-xl border border-neutral-200 bg-white">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-neutral-900">{sev.name}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded">
                          Level {sev.level}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500">{sev.description}</p>
                      {sev.color_code && (
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: sev.color_code }}
                          />
                          <span className="text-xs font-mono text-neutral-500">{sev.color_code}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Tab 4: System Configuration */}
          {activeTab === 'settings' && (
            <Card
              title="Institution & Portal Settings"
              subtitle="Global operational thresholds and notification parameters"
            >
              <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Institution Name
                  </label>
                  <input
                    type="text"
                    value={systemSettings.school_name || "ST. MARTIN'S MATRICULATION HR.SEC. SCHOOL"}
                    onChange={(e) => setSystemSettings({ ...systemSettings, school_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:bg-white focus:border-primary-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={systemSettings.support_email || 'support@stmartins.edu.in'}
                      onChange={(e) => setSystemSettings({ ...systemSettings, support_email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:bg-white focus:border-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      Contact Helpline
                    </label>
                    <input
                      type="text"
                      value={systemSettings.helpline || '+91 44 2654 8900'}
                      onChange={(e) => setSystemSettings({ ...systemSettings, helpline: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:bg-white focus:border-primary-500 outline-none"
                    />
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-4">
                  <h4 className="font-bold text-neutral-900 mb-3">Operational Thresholds</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                        Minimum Attendance % Threshold
                      </label>
                      <input
                        type="number"
                        value={systemSettings.min_attendance_threshold || 75}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            min_attendance_threshold: parseInt(e.target.value, 10),
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:bg-white focus:border-primary-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                        Critical Incident Escalation Level
                      </label>
                      <input
                        type="number"
                        value={systemSettings.critical_severity_threshold || 3}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            critical_severity_threshold: parseInt(e.target.value, 10),
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:bg-white focus:border-primary-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="submit" icon={Save}>
                    Save Settings
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      )}

      {/* Modal: Add Academic Year */}
      <Modal
        isOpen={isYearModalOpen}
        onClose={() => setIsYearModalOpen(false)}
        title="Add Academic Year"
      >
        <form onSubmit={handleCreateYear} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              Academic Year Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 2026-2027"
              value={yearForm.name}
              onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:bg-white focus:border-primary-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={yearForm.start_date}
                onChange={(e) => setYearForm({ ...yearForm, start_date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:bg-white focus:border-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                End Date
              </label>
              <input
                type="date"
                value={yearForm.end_date}
                onChange={(e) => setYearForm({ ...yearForm, end_date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:bg-white focus:border-primary-500 outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_current"
              checked={yearForm.is_current}
              onChange={(e) => setYearForm({ ...yearForm, is_current: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
            />
            <label htmlFor="is_current" className="text-sm font-medium text-neutral-700">
              Set as current active academic year
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setIsYearModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Year</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Class */}
      <Modal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        title="Add School Class"
      >
        <form onSubmit={handleCreateClass} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              Class Name / Standard *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Class 11"
              value={classForm.name}
              onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:bg-white focus:border-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              Numeric Order *
            </label>
            <input
              type="number"
              required
              placeholder="e.g. 11"
              value={classForm.numeric_order}
              onChange={(e) => setClassForm({ ...classForm, numeric_order: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:bg-white focus:border-primary-500 outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setIsClassModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Class</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Category */}
      <Modal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title="Add Behaviour Category"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Leadership & Initiative"
              value={catForm.name}
              onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:bg-white focus:border-primary-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Category Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. LEAD"
                value={catForm.code}
                onChange={(e) => setCatForm({ ...catForm, code: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:bg-white focus:border-primary-500 outline-none uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Behaviour Type *
              </label>
              <select
                value={catForm.type}
                onChange={(e) => setCatForm({ ...catForm, type: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:bg-white focus:border-primary-500 outline-none"
              >
                <option value="positive">Positive / Merit</option>
                <option value="negative">Negative / Disciplinary</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief description of when this category applies..."
              value={catForm.description}
              onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:bg-white focus:border-primary-500 outline-none resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setIsCatModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Category</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
