const express = require('express');
const router = express.Router();
const {
  requestBorrow,
  issueBookDirectly,
  getMyRecords,
  cancelRequest,
  getAllRequests,
  approveRequest,
  rejectRequest,
  returnBook,
  getOverdueBooks,
  getBorrowHistory
} = require('../controllers/borrowController');
const { protect, authorize } = require('../middleware/auth');

// All borrow routes require authentication
router.use(protect);

// Student & Staff endpoints
router.post('/request', requestBorrow);
router.get('/my-records', getMyRecords);
router.patch('/:id/cancel', cancelRequest);

// Admin & Librarian endpoints
router.post('/issue', authorize('admin'), issueBookDirectly);
router.get('/requests', authorize('admin'), getAllRequests);
router.patch('/:id/approve', authorize('admin'), approveRequest);
router.patch('/:id/reject', authorize('admin'), rejectRequest);
router.patch('/:id/return', authorize('admin'), returnBook);
router.get('/overdue', authorize('admin'), getOverdueBooks);
router.get('/history', authorize('admin'), getBorrowHistory);

module.exports = router;
