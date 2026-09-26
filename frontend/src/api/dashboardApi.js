import axiosClient from './axiosClient';

export const dashboardApi = {
  getAdminStats: () => axiosClient.get('/dashboard/admin'),
  getTeacherStats: () => axiosClient.get('/dashboard/teacher'),
  getPrincipalStats: () => axiosClient.get('/dashboard/principal'),
  getStudentStats: () => axiosClient.get('/dashboard/student'),
  getParentStats: () => axiosClient.get('/dashboard/parent'),
};
