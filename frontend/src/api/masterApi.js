import axiosClient from './axiosClient';

export const masterApi = {
  getAcademicYears: () => axiosClient.get('/masters/academic-years'),
  createAcademicYear: (data) => axiosClient.post('/masters/academic-years', data),
  updateAcademicYear: (id, data) => axiosClient.put(`/masters/academic-years/${id}`, data),
  
  getClasses: () => axiosClient.get('/masters/classes'),
  createClass: (data) => axiosClient.post('/masters/classes', data),
  updateClass: (id, data) => axiosClient.put(`/masters/classes/${id}`, data),

  getSections: (classId) => axiosClient.get('/masters/sections', { params: { class_id: classId } }),
  
  getBehaviourCategories: () => axiosClient.get('/masters/behaviour-categories'),
  createBehaviourCategory: (data) => axiosClient.post('/masters/behaviour-categories', data),
  updateBehaviourCategory: (id, data) => axiosClient.put(`/masters/behaviour-categories/${id}`, data),

  getBehaviourTypes: (categoryId) => axiosClient.get('/masters/behaviour-types', { params: { category_id: categoryId } }),
  getSeverityLevels: () => axiosClient.get('/masters/severity-levels'),
  getAttendanceTypes: () => axiosClient.get('/masters/attendance-types'),
  getRoles: () => axiosClient.get('/masters/roles'),
  getPermissions: () => axiosClient.get('/masters/permissions'),
  updateRolePermissions: (roleId, data) => axiosClient.put(`/masters/roles/${roleId}/permissions`, data),
  getSystemSettings: () => axiosClient.get('/masters/system-settings'),
  updateSystemSettings: (data) => axiosClient.put('/masters/system-settings', data),
};
