import axiosClient from './axiosClient';

export const notificationApi = {
  getAll: (params) => axiosClient.get('/notifications', { params }),
  getNotifications: (params) => axiosClient.get('/notifications', { params }),
  markAsRead: (id) => axiosClient.put(`/notifications/${id}/read`),
  markRead: (id) => axiosClient.put(`/notifications/${id}/read`),
  markAllAsRead: () => axiosClient.put('/notifications/read-all'),
  markAllRead: () => axiosClient.put('/notifications/read-all'),
};
