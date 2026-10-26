const express = require('express');
const router = express.Router();
const {
  getBorrowingReport,
  getPopularBooksReport,
  getOverdueReport,
  getUsersReport
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/borrowing', getBorrowingReport);
router.get('/popular-books', getPopularBooksReport);
router.get('/overdue', getOverdueReport);
router.get('/users', getUsersReport);

module.exports = router;
