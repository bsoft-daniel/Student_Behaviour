import axiosClient from './axiosClient';

const unwrap = (promise) => promise.then(res => {
  const payload = res?.data?.data !== undefined ? res.data.data : res?.data;
  return { ...res, data: payload };
});

export const masterApi = {
  getAcademicYears: () => unwrap(axiosClient.get('/masters/academic-years')),
  createAcademicYear: (data) => axiosClient.post('/masters/academic-years', data),
  updateAcademicYear: (id, data) => axiosClient.put(`/masters/academic-years/${id}`, data),
  
  getClasses: () => unwrap(axiosClient.get('/masters/classes')),
  createClass: (data) => axiosClient.post('/masters/classes', data),
  updateClass: (id, data) => axiosClient.put(`/masters/classes/${id}`, data),

  getSections: (classId) => unwrap(axiosClient.get('/masters/sections', { params: { class_id: classId } })),
  
  getBehaviourCategories: () => unwrap(axiosClient.get('/masters/behaviour-categories')),
  createBehaviourCategory: (data) => axiosClient.post('/masters/behaviour-categories', data),
  updateBehaviourCategory: (id, data) => axiosClient.put(`/masters/behaviour-categories/${id}`, data),

  getBehaviourTypes: (categoryId) => unwrap(axiosClient.get('/masters/behaviour-types', { params: { category_id: categoryId } })),
  getSeverityLevels: () => unwrap(axiosClient.get('/masters/severity-levels')),
  createSeverityLevel: (data) => axiosClient.post('/masters/severity-levels', data),
  getAttendanceTypes: () => unwrap(axiosClient.get('/masters/attendance-types')),
  getRoles: () => unwrap(axiosClient.get('/masters/roles')),
  getPermissions: () => unwrap(axiosClient.get('/masters/permissions')),
  updateRolePermissions: (roleId, data) => axiosClient.put(`/masters/roles/${roleId}/permissions`, data),
  getSystemSettings: () => unwrap(axiosClient.get('/masters/system-settings')),
  updateSystemSettings: (data) => axiosClient.put('/masters/system-settings', data),
};

