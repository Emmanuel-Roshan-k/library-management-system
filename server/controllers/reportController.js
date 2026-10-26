const BorrowRecord = require('../models/BorrowRecord');
const Book = require('../models/Book');
const User = require('../models/User');
const { getSettings } = require('../services/settingService');

// @desc    Get borrowing report (with date filters)
// @route   GET /api/reports/borrowing
// @access  Private (Admin)
const getBorrowingReport = async (req, res, next) => {
  try {
    const { startDate, endDate, status } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }

    const records = await BorrowRecord.find(filter)
      .populate('userId', 'name email role studentId staffId phone')
      .populate('bookId', 'title ISBN author category')
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 });

    const formatted = records.map((r) => ({
      id: r._id,
      userName: r.userId ? r.userId.name : 'Unknown User',
      userEmail: r.userId ? r.userId.email : 'N/A',
      userRole: r.userId ? r.userId.role : 'N/A',
      userIdentifier: r.userId ? (r.userId.studentId || r.userId.staffId || 'N/A') : 'N/A',
      bookTitle: r.bookId ? r.bookId.title : 'Deleted Book',
      bookISBN: r.bookId ? r.bookId.ISBN : 'N/A',
      bookCategory: r.bookId ? r.bookId.category : 'N/A',
      status: r.status,
      requestDate: r.requestDate ? r.requestDate.toISOString().split('T')[0] : '',
      issueDate: r.issueDate ? r.issueDate.toISOString().split('T')[0] : '',
      dueDate: r.dueDate ? r.dueDate.toISOString().split('T')[0] : '',
      returnDate: r.returnDate ? r.returnDate.toISOString().split('T')[0] : '',
      lateFee: r.lateFee || 0,
      processedBy: r.processedBy ? r.processedBy.name : 'Self/System'
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get popular books report
// @route   GET /api/reports/popular-books
// @access  Private (Admin)
const getPopularBooksReport = async (req, res, next) => {
  try {
    const popularRaw = await BorrowRecord.aggregate([
      { $match: { status: { $in: ['borrowed', 'returned', 'overdue'] } } },
      {
        $group: {
          _id: '$bookId',
          totalBorrows: { $sum: 1 },
          returnedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'returned'] }, 1, 0] }
          },
          currentActive: {
            $sum: { $cond: [{ $in: ['$status', ['borrowed', 'overdue']] }, 1, 0] }
          }
        }
      },
      { $sort: { totalBorrows: -1 } },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'book'
        }
      },
      { $unwind: '$book' },
      {
        $project: {
          bookId: '$_id',
          title: '$book.title',
          author: '$book.author',
          ISBN: '$book.ISBN',
          category: '$book.category',
          totalCopies: '$book.totalCopies',
          availableCopies: '$book.availableCopies',
          shelfLocation: '$book.shelfLocation',
          totalBorrows: 1,
          returnedCount: 1,
          currentActive: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: popularRaw.length,
      data: popularRaw
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get overdue report
// @route   GET /api/reports/overdue
// @access  Private (Admin)
const getOverdueReport = async (req, res, next) => {
  try {
    const now = new Date();
    const settings = await getSettings();

    const overdueRecords = await BorrowRecord.find({
      status: { $in: ['borrowed', 'overdue'] },
      dueDate: { $lt: now }
    })
      .populate('userId', 'name email role phone studentId staffId')
      .populate('bookId', 'title ISBN author category')
      .sort({ dueDate: 1 });

    const formatted = overdueRecords.map((r) => {
      const diffTime = now.getTime() - new Date(r.dueDate).getTime();
      const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const calculatedLateFee = overdueDays * settings.dailyLateFee;

      return {
        id: r._id,
        userName: r.userId ? r.userId.name : 'Unknown User',
        userEmail: r.userId ? r.userId.email : 'N/A',
        userPhone: r.userId ? r.userId.phone : 'N/A',
        userRole: r.userId ? r.userId.role : 'N/A',
        bookTitle: r.bookId ? r.bookId.title : 'N/A',
        bookISBN: r.bookId ? r.bookId.ISBN : 'N/A',
        issueDate: r.issueDate ? r.issueDate.toISOString().split('T')[0] : '',
        dueDate: r.dueDate ? r.dueDate.toISOString().split('T')[0] : '',
        overdueDays,
        lateFee: calculatedLateFee,
        dailyRate: settings.dailyLateFee
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get registered users report
// @route   GET /api/reports/users
// @access  Private (Admin)
const getUsersReport = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    const userStats = await Promise.all(
      users.map(async (u) => {
        const [activeBorrows, totalHistory] = await Promise.all([
          BorrowRecord.countDocuments({
            userId: u._id,
            status: { $in: ['borrowed', 'overdue'] }
          }),
          BorrowRecord.countDocuments({ userId: u._id })
        ]);

        return {
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          identifier: u.studentId || u.staffId || 'N/A',
          phone: u.phone || 'N/A',
          accountStatus: u.accountStatus,
          activeBorrows,
          totalHistory,
          joinedDate: u.createdAt.toISOString().split('T')[0]
        };
      })
    );

    res.status(200).json({
      success: true,
      count: userStats.length,
      data: userStats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBorrowingReport,
  getPopularBooksReport,
  getOverdueReport,
  getUsersReport
};
