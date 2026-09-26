import axiosClient from './axiosClient';

export const supportApi = {
  getTickets: () => axiosClient.get('/support/tickets'),
  createTicket: (data) => axiosClient.post('/support/tickets', data),
  replyTicket: (ticketId, data) => axiosClient.post(`/support/tickets/${ticketId}/reply`, data),
  updateTicketStatus: (ticketId, data) => axiosClient.put(`/support/tickets/${ticketId}/status`, data),
};
