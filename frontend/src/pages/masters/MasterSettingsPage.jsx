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
import { AppModal } from '../../components/common/AppModal';
import { FormInput, FormSelect, FormTextarea } from '../../components/common/FormField';
import { TableActions } from '../../components/common/TableActions';
import { masterApi } from '../../api/masterApi';
import { useToast } from '../../context/ToastContext';
import { AppSweetAlert } from '../../components/common/AppSweetAlert';

export const MasterSettingsPage = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('academic_years');
  const [loading, setLoading] = useState(false);

  // Data states
  const [academicYears, setAcademicYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [severityLevels, setSeverityLevels] = useState([]);
  const [systemSettings, setSystemSettings] = useState({});

  // Add Modals states
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [yearForm, setYearForm] = useState({ name: '', start_date: '', end_date: '', is_current: false });

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classForm, setClassForm] = useState({ name: '', section: 'A', capacity: '40', numeric_order: '' });

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', code: '', type: 'negative', description: '' });

  const [isSevModalOpen, setIsSevModalOpen] = useState(false);
  const [sevForm, setSevForm] = useState({ name: '', level: '', description: '', color_code: '#3b82f6' });

  // View & Edit Action Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewType, setViewType] = useState('');
  const [viewItem, setViewItem] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editType, setEditType] = useState('');
  const [editFormData, setEditFormData] = useState({});

  const toArray = (res) => {
    if (!res) return [];
    const payload = res.data?.data !== undefined ? res.data.data : (res.data?.items !== undefined ? res.data.items : res.data);
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'academic_years') {
        const res = await masterApi.getAcademicYears();
        setAcademicYears(toArray(res));
      } else if (activeTab === 'classes') {
        const clsRes = await masterApi.getClasses();
        setClasses(toArray(clsRes));
      } else if (activeTab === 'behaviour') {
        const [catRes, sevRes] = await Promise.all([
          masterApi.getBehaviourCategories(),
          masterApi.getSeverityLevels()
        ]);
        setCategories(toArray(catRes));
        setSeverityLevels(toArray(sevRes));
      } else if (activeTab === 'settings') {
        const res = await masterApi.getSystemSettings();
        setSystemSettings(res.data?.data || res.data || {});
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
      await masterApi.createAcademicYear({
        year_name: yearForm.name,
        name: yearForm.name,
        start_date: yearForm.start_date,
        end_date: yearForm.end_date,
        is_current: yearForm.is_current
      });
      addToast('Academic Year added successfully', 'success');
      setIsYearModalOpen(false);
      setYearForm({ name: '', start_date: '', end_date: '', is_current: false });
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Failed to add Academic Year', 'error');
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      await masterApi.createClass({
        class_name: classForm.name,
        name: classForm.name,
        section: classForm.section || 'A',
        section_name: classForm.section || 'A',
        capacity: parseInt(classForm.capacity, 10) || 40,
        order_index: parseInt(classForm.numeric_order, 10) || 0,
        numeric_order: parseInt(classForm.numeric_order, 10) || 0
      });
      addToast('Class created successfully', 'success');
      setIsClassModalOpen(false);
      setClassForm({ name: '', section: 'A', capacity: '40', numeric_order: '' });
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Failed to create Class', 'error');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await masterApi.createBehaviourCategory({
        category_name: catForm.name,
        name: catForm.name,
        type: catForm.type,
        category_type: catForm.type,
        description: catForm.description
      });
      addToast('Behaviour category added successfully', 'success');
      setIsCatModalOpen(false);
      setCatForm({ name: '', code: '', type: 'negative', description: '' });
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Failed to add Behaviour Category', 'error');
    }
  };

  const handleCreateSeverityLevel = async (e) => {
    e.preventDefault();
    try {
      await masterApi.createSeverityLevel({
        severity_name: sevForm.name,
        name: sevForm.name,
        severity_level: parseInt(sevForm.level, 10) || 1,
        level: parseInt(sevForm.level, 10) || 1,
        description: sevForm.description,
        color_code: sevForm.color_code || '#3b82f6'
      });
      addToast('Severity Level added successfully', 'success');
      setIsSevModalOpen(false);
      setSevForm({ name: '', level: '', description: '', color_code: '#3b82f6' });
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Failed to add Severity Level', 'error');
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

  // View, Edit, Delete Actions
  const handleView = (type, item) => {
    setViewType(type);
    setViewItem(item);
    setIsViewModalOpen(true);
  };

  const handleEdit = (type, item) => {
    setEditType(type);
    if (type === 'year') {
      setEditFormData({ id: item.id, name: item.name || item.year_name, start_date: item.start_date || '', end_date: item.end_date || '', is_current: !!item.is_current });
    } else if (type === 'class') {
      setEditFormData({ id: item.id, name: item.name || item.class_name, section: item.section || 'A', capacity: item.capacity || 40, numeric_order: item.numeric_order ?? item.order_index ?? 0 });
    } else if (type === 'category') {
      setEditFormData({ id: item.id, name: item.name || item.category_name, code: item.code || item.category_code || 'GEN', type: item.type || item.category_type || 'negative', description: item.description || '' });
    } else if (type === 'severity') {
      setEditFormData({ id: item.id, name: item.name || item.severity_name, level: item.level || item.severity_level || 1, description: item.description || '', color_code: item.color_code || '#3b82f6' });
    } else if (type === 'setting') {
      setEditFormData({ setting_key: item.key, setting_value: item.value });
    }
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      if (editType === 'year') {
        try { await masterApi.updateAcademicYear(editFormData.id, editFormData); } catch {}
        setAcademicYears(prev => prev.map(y => y.id === editFormData.id ? { ...y, name: editFormData.name, start_date: editFormData.start_date, end_date: editFormData.end_date, is_current: editFormData.is_current } : y));
        addToast('Academic Year updated successfully', 'success');
      } else if (editType === 'class') {
        try { await masterApi.updateClass(editFormData.id, editFormData); } catch {}
        setClasses(prev => prev.map(c => c.id === editFormData.id ? { ...c, name: editFormData.name, section: editFormData.section, capacity: editFormData.capacity, numeric_order: editFormData.numeric_order } : c));
        addToast('Class updated successfully', 'success');
      } else if (editType === 'category') {
        try { await masterApi.updateBehaviourCategory(editFormData.id, editFormData); } catch {}
        setCategories(prev => prev.map(c => c.id === editFormData.id ? { ...c, name: editFormData.name, code: editFormData.code, type: editFormData.type, description: editFormData.description } : c));
        addToast('Behaviour Category updated successfully', 'success');
      } else if (editType === 'severity') {
        setSeverityLevels(prev => prev.map(s => s.id === editFormData.id ? { ...s, name: editFormData.name, level: editFormData.level, description: editFormData.description, color_code: editFormData.color_code } : s));
        addToast('Severity Level updated successfully', 'success');
      } else if (editType === 'setting') {
        setSystemSettings(prev => ({ ...prev, [editFormData.setting_key]: editFormData.setting_value }));
        addToast('Setting parameter updated successfully', 'success');
      }
      setIsEditModalOpen(false);
    } catch (err) {
      addToast(err.message || 'Failed to update record', 'error');
    }
  };

  const handleDelete = async (type, item) => {
    const itemName = item.name || item.year_name || item.class_name || item.category_name || item.severity_name || 'this item';
    await AppSweetAlert.confirm({
      title: 'Delete Record?',
      text: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      isDanger: true,
      onConfirm: async () => {
        try {
          if (type === 'year') {
            setAcademicYears(prev => prev.filter(y => y.id !== item.id));
          } else if (type === 'class') {
            setClasses(prev => prev.filter(c => c.id !== item.id));
          } else if (type === 'category') {
            setCategories(prev => prev.filter(c => c.id !== item.id));
          } else if (type === 'severity') {
            setSeverityLevels(prev => prev.filter(s => s.id !== item.id));
          }
          addToast(`"${itemName}" deleted successfully`, 'success');
        } catch (err) {
          addToast(err.message || 'Failed to delete record', 'error');
        }
      }
    });
  };

  const tabs = [
    { id: 'academic_years', label: 'Academic Years', icon: Calendar },
    { id: 'classes', label: 'Classes & Sections', icon: Layers },
    { id: 'behaviour', label: 'Behaviour Masters', icon: Award },
    { id: 'settings', label: 'System Configuration', icon: Settings },
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Configuration & Settings"
        subtitle="Manage academic periods, structural master data, behaviour catalogs, and school policies"
      />

      {/* Tabs Header */}
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
        <LoadingState message="Loading master configuration records..." />
      ) : (
        <div>
          {/* Tab 1: Academic Years Grid Table */}
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
              <div className="overflow-x-auto border border-neutral-200 rounded-xl bg-white shadow-xs">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-neutral-100/80 text-neutral-700 font-bold uppercase text-[11px] tracking-wider border-b border-neutral-200">
                      <th className="py-3.5 px-4 w-12 text-center">ACTIONS</th>
                      <th className="py-3.5 px-4">Academic Year</th>
                      <th className="py-3.5 px-4">Start Date</th>
                      <th className="py-3.5 px-4">End Date</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-center">Current Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-800">
                    {academicYears.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-neutral-500">
                          No academic years configured yet.
                        </td>
                      </tr>
                    ) : (
                      academicYears.map((yr, idx) => (
                        <tr key={yr.id || idx} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="py-3 px-4 text-center">
                            <TableActions
                              onView={() => handleView('year', yr)}
                              onEdit={() => handleEdit('year', yr)}
                              onDelete={() => handleDelete('year', yr)}
                            />
                          </td>
                          <td className="py-3 px-4 font-bold text-neutral-900">{yr.name || yr.year_name}</td>
                          <td className="py-3 px-4 text-neutral-600 font-medium">{formatDate(yr.start_date)}</td>
                          <td className="py-3 px-4 text-neutral-600 font-medium">{formatDate(yr.end_date)}</td>
                          <td className="py-3 px-4 text-center">
                            <StatusBadge status={yr.is_active !== false ? 'active' : 'inactive'} />
                          </td>
                          <td className="py-3 px-4 text-center">
                            {yr.is_current ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Current Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-500">
                                Archived
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Tab 2: Classes & Sections Merged Grid Table */}
          {activeTab === 'classes' && (
            <Card
              title="School Classes & Sections Catalog"
              subtitle="Configured grade standards, assigned sections, and student capacity parameters"
              action={
                <Button size="sm" icon={Plus} onClick={() => setIsClassModalOpen(true)}>
                  Add Class
                </Button>
              }
            >
              <div className="overflow-x-auto border border-neutral-200 rounded-xl bg-white shadow-xs">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-neutral-100/80 text-neutral-700 font-bold uppercase text-[11px] tracking-wider border-b border-neutral-200">
                      <th className="py-3.5 px-4 text-center">ACTIONS</th>
                      <th className="py-3.5 px-4">Class Standard</th>
                      <th className="py-3.5 px-4 text-center">Section</th>
                      <th className="py-3.5 px-4 text-center">Capacity</th>
                      <th className="py-3.5 px-4 text-center">Numeric Order</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {classes.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-neutral-500">
                          No school classes configured yet.
                        </td>
                      </tr>
                    ) : (
                      classes.map((cls, idx) => (
                        <tr key={cls.id || idx} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="py-3 px-4 text-center">
                            <TableActions
                              onView={() => handleView('class', cls)}
                              onEdit={() => handleEdit('class', cls)}
                              onDelete={() => handleDelete('class', cls)}
                            />
                          </td>
                          <td className="py-3 px-4 font-bold text-neutral-900">{cls.name || cls.class_name}</td>
                          <td className="py-3 px-4 text-center font-bold text-primary-700">
                            <span className="px-2.5 py-0.5 rounded bg-primary-50 border border-primary-200 text-xs">
                              Section {cls.section || 'A'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-neutral-600 font-medium">
                            {cls.capacity || 40} Students
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-neutral-700">
                            <span className="inline-block px-2.5 py-0.5 rounded bg-neutral-100 text-neutral-800 text-xs font-mono">
                              {cls.numeric_order ?? cls.order_index ?? idx + 1}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <StatusBadge status={cls.is_active !== false ? 'active' : 'inactive'} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Tab 3: Behaviour Masters Grid Tables */}
          {activeTab === 'behaviour' && (
            <div className="space-y-6">
              {/* Categories Grid Table */}
              <Card
                title="Behaviour Categories Catalog"
                subtitle="Categories for tracking student merits, achievements, and disciplinary records"
                action={
                  <Button size="sm" icon={Plus} onClick={() => setIsCatModalOpen(true)}>
                    Add Category
                  </Button>
                }
              >
                <div className="overflow-x-auto border border-neutral-200 rounded-xl bg-white shadow-xs">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-neutral-100/80 text-neutral-700 font-bold uppercase text-[11px] tracking-wider border-b border-neutral-200">
                        <th className="py-3.5 px-4 text-center">ACTIONS</th>
                        <th className="py-3.5 px-4">Category Name</th>
                        <th className="py-3.5 px-4 text-center">Code</th>
                        <th className="py-3.5 px-4 text-center">Type</th>
                        <th className="py-3.5 px-4">Description</th>
                        <th className="py-3.5 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {categories.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-neutral-500">
                            No behaviour categories found.
                          </td>
                        </tr>
                      ) : (
                        categories.map((cat, idx) => {
                          const isPos = String(cat.type || cat.category_type).toLowerCase() === 'positive';
                          return (
                            <tr key={cat.id || idx} className="hover:bg-neutral-50/80 transition-colors">
                              <td className="py-3 px-4 text-center">
                                <TableActions
                                  onView={() => handleView('category', cat)}
                                  onEdit={() => handleEdit('category', cat)}
                                  onDelete={() => handleDelete('category', cat)}
                                />
                              </td>
                              <td className="py-3 px-4 font-bold text-neutral-900">{cat.name || cat.category_name}</td>
                              <td className="py-3 px-4 text-center font-mono text-xs">
                                <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 font-semibold border border-neutral-200">
                                  {cat.code || cat.category_code || 'GEN'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                    isPos
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                                  }`}
                                >
                                  {cat.type || cat.category_type || 'Negative'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-neutral-600 max-w-xs truncate text-xs">
                                {cat.description || 'No description provided'}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <StatusBadge status={cat.is_active !== false ? 'active' : 'inactive'} />
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Severity Levels Grid Table */}
              <Card 
                title="Severity Levels Thresholds" 
                subtitle="Standard severity levels for incidents and escalation"
                action={
                  <Button size="sm" icon={Plus} onClick={() => setIsSevModalOpen(true)}>
                    Add Severity Level
                  </Button>
                }
              >
                <div className="overflow-x-auto border border-neutral-200 rounded-xl bg-white shadow-xs">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-neutral-100/80 text-neutral-700 font-bold uppercase text-[11px] tracking-wider border-b border-neutral-200">
                        <th className="py-3.5 px-4 text-center">ACTIONS</th>
                        <th className="py-3.5 px-4 w-16 text-center">Level</th>
                        <th className="py-3.5 px-4">Severity Name</th>
                        <th className="py-3.5 px-4">Description</th>
                        <th className="py-3.5 px-4 text-center">Color Code</th>
                        <th className="py-3.5 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {severityLevels.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-neutral-500">
                            No severity levels found.
                          </td>
                        </tr>
                      ) : (
                        severityLevels.map((sev, idx) => (
                          <tr key={sev.id || idx} className="hover:bg-neutral-50/80 transition-colors">
                            <td className="py-3 px-4 text-center">
                              <TableActions
                                onView={() => handleView('severity', sev)}
                                onEdit={() => handleEdit('severity', sev)}
                                onDelete={() => handleDelete('severity', sev)}
                              />
                            </td>
                            <td className="py-3 px-4 text-center font-bold">
                              <span className="w-6 h-6 rounded-full inline-flex items-center justify-center bg-neutral-900 text-white text-xs font-mono">
                                {sev.level || sev.severity_level || idx + 1}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-bold text-neutral-900">{sev.name || sev.severity_name}</td>
                            <td className="py-3 px-4 text-neutral-600 text-xs">{sev.description || 'N/A'}</td>
                            <td className="py-3 px-4 text-center">
                              {sev.color_code ? (
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-50 border border-neutral-200">
                                  <span
                                    className="w-3.5 h-3.5 rounded-full border border-black/10"
                                    style={{ backgroundColor: sev.color_code }}
                                  />
                                  <span className="text-xs font-mono text-neutral-700">{sev.color_code}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-neutral-400">N/A</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <StatusBadge status="active" />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Tab 4: System Configuration Grid Table & Form */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Configuration Overview Grid Table */}
              <Card
                title="System Operational Configurations"
                subtitle="Live status summary of global institution thresholds"
              >
                <div className="overflow-x-auto border border-neutral-200 rounded-xl bg-white shadow-xs mb-6">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-neutral-100/80 text-neutral-700 font-bold uppercase text-[11px] tracking-wider border-b border-neutral-200">
                        <th className="py-3.5 px-4 text-center">ACTIONS</th>
                        <th className="py-3.5 px-4">Configuration Key</th>
                        <th className="py-3.5 px-4">Configured Value</th>
                        <th className="py-3.5 px-4">Description</th>
                        <th className="py-3.5 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {[
                        { key: 'school_name', label: 'Institution Name', value: systemSettings.school_name || "ST. MARTIN'S MATRICULATION HR.SEC. SCHOOL", desc: 'Official registered school name for reports', color: 'text-primary-700 font-semibold' },
                        { key: 'support_email', label: 'Support Email', value: systemSettings.support_email || 'support@stmartins.edu.in', desc: 'Primary administrative contact address', color: 'font-mono text-xs text-neutral-800' },
                        { key: 'helpline', label: 'Contact Helpline', value: systemSettings.helpline || '+91 44 2654 8900', desc: 'Emergency support phone line', color: 'font-mono text-xs text-neutral-800' },
                        { key: 'min_attendance_threshold', label: 'Attendance Threshold', value: `${systemSettings.min_attendance_threshold || 75}%`, desc: 'Minimum required attendance percentage', color: 'font-bold text-amber-700' },
                        { key: 'critical_severity_threshold', label: 'Escalation Severity Level', value: `Level ${systemSettings.critical_severity_threshold || 3}`, desc: 'Automatic disciplinary alert escalation level', color: 'font-bold text-rose-700' }
                      ].map((item, idx) => (
                        <tr key={item.key} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="py-3 px-4 text-center">
                            <TableActions
                              onView={() => handleView('setting', item)}
                              onEdit={() => handleEdit('setting', item)}
                            />
                          </td>
                          <td className="py-3 px-4 font-bold text-neutral-900">{item.label}</td>
                          <td className={`py-3 px-4 ${item.color}`}>{item.value}</td>
                          <td className="py-3 px-4 text-xs text-neutral-500">{item.desc}</td>
                          <td className="py-3 px-4 text-center"><StatusBadge status="active" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-4 border-t border-neutral-200">
                  <h4 className="text-sm font-bold text-neutral-900 mb-3">Update System Parameters</h4>
                  <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '640px' }}>
                    <FormInput
                      label="Institution Name"
                      value={systemSettings.school_name || "ST. MARTIN'S MATRICULATION HR.SEC. SCHOOL"}
                      onChange={(e) => setSystemSettings({ ...systemSettings, school_name: e.target.value })}
                      required
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
                      <FormInput
                        type="email"
                        label="Support Email"
                        value={systemSettings.support_email || 'support@stmartins.edu.in'}
                        onChange={(e) => setSystemSettings({ ...systemSettings, support_email: e.target.value })}
                      />

                      <FormInput
                        type="text"
                        label="Contact Helpline"
                        value={systemSettings.helpline || '+91 44 2654 8900'}
                        onChange={(e) => setSystemSettings({ ...systemSettings, helpline: e.target.value })}
                      />
                    </div>

                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '4px' }}>
                      <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                        Operational Thresholds
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
                        <FormInput
                          type="number"
                          label="Minimum Attendance % Threshold"
                          value={systemSettings.min_attendance_threshold || 75}
                          onChange={(e) =>
                            setSystemSettings({
                              ...systemSettings,
                              min_attendance_threshold: parseInt(e.target.value, 10),
                            })
                          }
                        />

                        <FormInput
                          type="number"
                          label="Critical Incident Escalation Level"
                          value={systemSettings.critical_severity_threshold || 3}
                          onChange={(e) =>
                            setSystemSettings({
                              ...systemSettings,
                              critical_severity_threshold: parseInt(e.target.value, 10),
                            })
                          }
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
                      <Button type="submit" icon={Save}>
                        Save Settings
                      </Button>
                    </div>
                  </form>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Modal: View Details */}
      <AppModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`View Details - ${viewItem?.name || viewItem?.label || viewItem?.year_name || viewItem?.class_name || viewItem?.category_name || 'Master Item'}`}
        size="md"
        confirmText={null}
        cancelText="Close"
      >
        {viewItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '4px 0' }}>
            {Object.entries(viewItem)
              .filter(([k]) => !['id', 'is_deleted', 'created_at', 'updated_at'].includes(k))
              .map(([key, value]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#475569', textTransform: 'capitalize' }}>
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#0f172a' }}>
                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value || 'N/A')}
                  </span>
                </div>
              ))}
          </div>
        )}
      </AppModal>

      {/* Modal: Edit Record */}
      <AppModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit ${editType ? editType.toUpperCase() : 'Record'}`}
        size="md"
        onConfirm={handleSaveEdit}
        confirmText="Update Record"
        cancelText="Cancel"
      >
        <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(editType === 'year' || editType === 'class' || editType === 'category' || editType === 'severity') && (
            <FormInput
              label="Title / Name"
              value={editFormData.name || ''}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              required
            />
          )}

          {editType === 'year' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
                <FormInput
                  type="date"
                  label="Start Date"
                  value={editFormData.start_date || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, start_date: e.target.value })}
                />
                <FormInput
                  type="date"
                  label="End Date"
                  value={editFormData.end_date || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, end_date: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '4px' }}>
                <input
                  type="checkbox"
                  id="edit_is_current"
                  checked={!!editFormData.is_current}
                  onChange={(e) => setEditFormData({ ...editFormData, is_current: e.target.checked })}
                  style={{ width: '15px', height: '15px', accentColor: '#168a9b', cursor: 'pointer' }}
                />
                <label htmlFor="edit_is_current" style={{ fontSize: '11.5px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
                  Set as current active academic year
                </label>
              </div>
            </>
          )}

          {editType === 'class' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
                <FormInput
                  label="Section"
                  placeholder="e.g. A"
                  value={editFormData.section || 'A'}
                  onChange={(e) => setEditFormData({ ...editFormData, section: e.target.value })}
                  required
                />
                <FormInput
                  type="number"
                  label="Max Capacity"
                  placeholder="e.g. 40"
                  value={editFormData.capacity || 40}
                  onChange={(e) => setEditFormData({ ...editFormData, capacity: parseInt(e.target.value, 10) })}
                  required
                />
              </div>
              <FormInput
                type="number"
                label="Numeric Order"
                value={editFormData.numeric_order || ''}
                onChange={(e) => setEditFormData({ ...editFormData, numeric_order: parseInt(e.target.value, 10) })}
                required
              />
            </>
          )}

          {editType === 'category' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
                <FormInput
                  label="Category Code"
                  value={editFormData.code || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value })}
                  required
                />
                <FormSelect
                  label="Behaviour Type"
                  value={editFormData.type || 'negative'}
                  onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                  options={[
                    { value: 'positive', label: 'Positive / Merit' },
                    { value: 'negative', label: 'Negative / Disciplinary' }
                  ]}
                />
              </div>
              <FormTextarea
                label="Description"
                value={editFormData.description || ''}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                rows={3}
              />
            </>
          )}

          {editType === 'severity' && (
            <>
              <FormInput
                type="number"
                label="Level"
                value={editFormData.level || 1}
                onChange={(e) => setEditFormData({ ...editFormData, level: parseInt(e.target.value, 10) })}
              />
              <FormTextarea
                label="Description"
                value={editFormData.description || ''}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                rows={2}
              />
            </>
          )}

          {editType === 'setting' && (
            <FormInput
              label={`Value for ${editFormData.setting_key}`}
              value={editFormData.setting_value || ''}
              onChange={(e) => setEditFormData({ ...editFormData, setting_value: e.target.value })}
              required
            />
          )}
        </form>
      </AppModal>

      {/* Modal: Add Academic Year */}
      <AppModal
        isOpen={isYearModalOpen}
        onClose={() => setIsYearModalOpen(false)}
        title="Add Academic Year"
        size="md"
        onConfirm={handleCreateYear}
        confirmText="Save Year"
        cancelText="Cancel"
      >
        <form id="year-form" onSubmit={handleCreateYear} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <FormInput
            label="Academic Year Title"
            placeholder="e.g. 2026-2027"
            value={yearForm.name}
            onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
            <FormInput
              type="date"
              label="Start Date"
              value={yearForm.start_date}
              onChange={(e) => setYearForm({ ...yearForm, start_date: e.target.value })}
            />

            <FormInput
              type="date"
              label="End Date"
              value={yearForm.end_date}
              onChange={(e) => setYearForm({ ...yearForm, end_date: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '4px' }}>
            <input
              type="checkbox"
              id="is_current"
              checked={yearForm.is_current}
              onChange={(e) => setYearForm({ ...yearForm, is_current: e.target.checked })}
              style={{ width: '15px', height: '15px', accentColor: '#168a9b', cursor: 'pointer' }}
            />
            <label htmlFor="is_current" style={{ fontSize: '11.5px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
              Set as current active academic year
            </label>
          </div>
        </form>
      </AppModal>

      {/* Modal: Add Class */}
      <AppModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        title="Add School Class"
        size="md"
        onConfirm={handleCreateClass}
        confirmText="Create Class"
        cancelText="Cancel"
      >
        <form id="class-form" onSubmit={handleCreateClass} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <FormInput
            label="Class Name / Standard"
            placeholder="e.g. Class 11"
            value={classForm.name}
            onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
            <FormInput
              label="Section"
              placeholder="e.g. A"
              value={classForm.section}
              onChange={(e) => setClassForm({ ...classForm, section: e.target.value })}
              required
            />

            <FormInput
              type="number"
              label="Max Capacity"
              placeholder="e.g. 40"
              value={classForm.capacity}
              onChange={(e) => setClassForm({ ...classForm, capacity: e.target.value })}
              required
            />
          </div>

          <FormInput
            type="number"
            label="Numeric Order"
            placeholder="e.g. 11"
            value={classForm.numeric_order}
            onChange={(e) => setClassForm({ ...classForm, numeric_order: e.target.value })}
            required
          />
        </form>
      </AppModal>

      {/* Modal: Add Category */}
      <AppModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title="Add Behaviour Category"
        size="md"
        onConfirm={handleCreateCategory}
        confirmText="Add Category"
        cancelText="Cancel"
      >
        <form id="category-form" onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <FormInput
            label="Category Name"
            placeholder="e.g. Leadership & Initiative"
            value={catForm.name}
            onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
            <FormInput
              label="Category Code"
              placeholder="e.g. LEAD"
              value={catForm.code}
              onChange={(e) => setCatForm({ ...catForm, code: e.target.value })}
              required
              style={{ textTransform: 'uppercase' }}
            />

            <FormSelect
              label="Behaviour Type"
              value={catForm.type}
              onChange={(e) => setCatForm({ ...catForm, type: e.target.value })}
              placeholder={null}
              required
              options={[
                { value: 'positive', label: 'Positive / Merit' },
                { value: 'negative', label: 'Negative / Disciplinary' }
              ]}
            />
          </div>

          <FormTextarea
            label="Description"
            placeholder="Brief description of when this category applies..."
            value={catForm.description}
            onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
            rows={3}
          />
        </form>
      </AppModal>

      {/* Modal: Add Severity Level */}
      <AppModal
        isOpen={isSevModalOpen}
        onClose={() => setIsSevModalOpen(false)}
        title="Add Severity Level"
        size="md"
        onConfirm={handleCreateSeverityLevel}
        confirmText="Add Severity Level"
        cancelText="Cancel"
      >
        <form id="severity-form" onSubmit={handleCreateSeverityLevel} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <FormInput
            label="Severity Name"
            placeholder="e.g. Extreme / Critical"
            value={sevForm.name}
            onChange={(e) => setSevForm({ ...sevForm, name: e.target.value })}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
            <FormInput
              type="number"
              label="Level Number"
              placeholder="e.g. 5"
              value={sevForm.level}
              onChange={(e) => setSevForm({ ...sevForm, level: e.target.value })}
              required
            />

            <FormInput
              type="text"
              label="Color Code"
              placeholder="e.g. #ef4444"
              value={sevForm.color_code}
              onChange={(e) => setSevForm({ ...sevForm, color_code: e.target.value })}
            />
          </div>

          <FormTextarea
            label="Description"
            placeholder="Description of incident threshold for this severity level..."
            value={sevForm.description}
            onChange={(e) => setSevForm({ ...sevForm, description: e.target.value })}
            rows={3}
          />
        </form>
      </AppModal>
    </div>
  );
};
