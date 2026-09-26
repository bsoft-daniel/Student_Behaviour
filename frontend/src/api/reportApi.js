import axiosClient from './axiosClient';

export const reportApi = {
  getDailyAttendance: (params) => axiosClient.get('/reports/daily-attendance', { params }),
  getAttendanceRegister: (params) => axiosClient.get('/reports/attendance-register', { params }),
  getLowAttendance: (params) => axiosClient.get('/reports/low-attendance', { params }),
  getBehaviourIncidents: (params) => axiosClient.get('/reports/behaviour-incidents', { params }),
  getPositiveBehaviour: (params) => axiosClient.get('/reports/positive-behaviour', { params }),
  getCriticalIncidents: (params) => axiosClient.get('/reports/critical-cases', { params }),
  getClassAnalytics: (params) => axiosClient.get('/reports/class-analytics', { params }),
  getParentFollowups: (params) => axiosClient.get('/reports/behaviour-incidents', { params: { ...params, status: 'Open' } }),
  getAuditLogs: (params) => axiosClient.get('/audit/logs', { params }),
};
