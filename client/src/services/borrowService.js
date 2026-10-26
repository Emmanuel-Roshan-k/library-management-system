import api from './api';

export const borrowService = {
  // Student / Staff endpoints
  requestBorrow: async (bookId, userNotes = '') => {
    const response = await api.post('/borrowing/request', { bookId, userNotes });
    return response.data;
  },

  getMyRecords: async (params = {}) => {
    const response = await api.get('/borrowing/my-records', { params });
    return response.data;
  },

  cancelRequest: async (id) => {
    const response = await api.patch(`/borrowing/${id}/cancel`);
    return response.data;
  },

  // Librarian endpoints
  getAllRequests: async (params = {}) => {
    const response = await api.get('/borrowing/requests', { params });
    return response.data;
  },

  approveRequest: async (id, adminNotes = '') => {
    const response = await api.patch(`/borrowing/${id}/approve`, { adminNotes });
    return response.data;
  },

  rejectRequest: async (id, rejectionReason = '') => {
    const response = await api.patch(`/borrowing/${id}/reject`, { rejectionReason });
    return response.data;
  },

  issueBookDirectly: async (data) => {
    const response = await api.post('/borrowing/issue', data);
    return response.data;
  },

  returnBook: async (id, adminNotes = '') => {
    const response = await api.patch(`/borrowing/${id}/return`, { adminNotes });
    return response.data;
  },

  getOverdueBooks: async () => {
    const response = await api.get('/borrowing/overdue');
    return response.data;
  },

  getBorrowHistory: async (params = {}) => {
    const response = await api.get('/borrowing/history', { params });
    return response.data;
  }
};
