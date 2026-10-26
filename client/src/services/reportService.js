import api from './api';

export const reportService = {
  getBorrowingReport: async (params = {}) => {
    const response = await api.get('/reports/borrowing', { params });
    return response.data;
  },

  getPopularBooksReport: async () => {
    const response = await api.get('/reports/popular-books');
    return response.data;
  },

  getOverdueReport: async () => {
    const response = await api.get('/reports/overdue');
    return response.data;
  },

  getUsersReport: async () => {
    const response = await api.get('/reports/users');
    return response.data;
  }
};
