import axiosClient from './axiosClient';

export const userApi = {
  getAll: (params) => axiosClient.get('/users', { params }),
  getById: (id) => axiosClient.get(`/users/${id}`),
  create: (data) => axiosClient.post('/users', data),
  update: (id, data) => axiosClient.put(`/users/${id}`, data),
  delete: (id) => axiosClient.delete(`/users/${id}`),
  updateProfile: (data) => axiosClient.put('/users/profile', data),
  changePassword: (data) => axiosClient.put('/users/change-password', data),
};
