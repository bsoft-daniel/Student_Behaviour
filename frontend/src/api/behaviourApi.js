import axiosClient from './axiosClient';

export const behaviourApi = {
  getAll: (params) => axiosClient.get('/behaviour', { params }),
  getById: (id) => axiosClient.get(`/behaviour/${id}`),
  create: (data) => axiosClient.post('/behaviour', data),
  update: (id, data) => axiosClient.put(`/behaviour/${id}`, data),
  addFollowUp: (incidentId, data) => axiosClient.post(`/behaviour/${incidentId}/follow-ups`, data),
};
