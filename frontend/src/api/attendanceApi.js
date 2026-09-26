import axiosClient from './axiosClient';

export const attendanceApi = {
  getAll: (params) => axiosClient.get('/attendance', { params }),
  bulkSave: (data) => axiosClient.post('/attendance/bulk', data),
};
