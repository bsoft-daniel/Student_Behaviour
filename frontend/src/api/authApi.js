import axiosClient from './axiosClient';

export const authApi = {
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  getMe: () => axiosClient.get('/auth/me'),
  logout: () => axiosClient.post('/auth/logout'),
};
