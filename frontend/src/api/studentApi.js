import axiosClient from './axiosClient';

export const studentApi = {
  getAll: (params) => axiosClient.get('/students', { params }),
  getById: (id) => axiosClient.get(`/students/${id}`),
  create: (data) => axiosClient.post('/students', data),
  update: (id, data) => axiosClient.put(`/students/${id}`, data),
  delete: (id) => axiosClient.delete(`/students/${id}`),
};
