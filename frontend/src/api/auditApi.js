import axiosClient from './axiosClient';

export const auditApi = {
  getAll: (params) => axiosClient.get('/audit/logs', { params }),
};
