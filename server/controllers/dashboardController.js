const Book = require('../models/Book');
const User = require('../models/User');
const BorrowRecord = require('../models/BorrowRecord');

// @desc    Get dashboard statistics for Admin or Student/Staff
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const isLibrarian = req.user.role === 'admin';
    const now = new Date();

    if (isLibrarian) {
      // 1. Core counters
      const [
        totalBooks,
        copiesAggregation,
        currentlyBorrowed,
        registeredStudents,
        registeredStaff,
        pendingRequests,
        overdueCount
      ] = await Promise.all([
        Book.countDocuments(),
        Book.aggregate([
          {
            $group: {
              _id: null,
              totalCopies: { $sum: '$totalCopies' },
              availableCopies: { $sum: '$availableCopies' }
            }
          }
        ]),
        BorrowRecord.countDocuments({ status: { $in: ['borrowed', 'overdue'] } }),
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'staff' }),
        BorrowRecord.countDocuments({ status: 'pending' }),
        BorrowRecord.countDocuments({
          status: { $in: ['borrowed', 'overdue'] },
          dueDate: { $lt: now }
        })
      ]);

      const totalCopies = copiesAggregation[0]?.totalCopies || 0;
      const availableCopies = copiesAggregation[0]?.availableCopies || 0;

      // 2. Recent activities (recent borrows, returns, requests)
      const recentActivities = await BorrowRecord.find()
        .populate('userId', 'name email role')
        .populate('bookId', 'title author coverImage')
        .sort({ updatedAt: -1 })
        .limit(8);

      // 3. Top 5 Popular Books (aggregating borrow records)
      const popularBooksRaw = await BorrowRecord.aggregate([
        { $match: { status: { $in: ['borrowed', 'returned', 'overdue'] } } },
        { $group: { _id: '$bookId', borrowCount: { $sum: 1 } } },
        { $sort: { borrowCount: -1 } },
        { $limit: 5 },
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
            title: '$book.title',
            borrowCount: 1,
            author: '$book.author',
            category: '$book.category'
          }
        }
      ]);

      // 4. Monthly borrowing trends (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      sixMonthsAgo.setHours(0, 0, 0, 0);

      const monthlyTrendsRaw = await BorrowRecord.aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            borrows: {
              $sum: {
                $cond: [{ $in: ['$status', ['borrowed', 'overdue', 'returned']] }, 1, 0]
              }
            },
            returns: {
              $sum: {
                $cond: [{ $eq: ['$status', 'returned'] }, 1, 0]
              }
            },
            requests: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]);

      // Format months nicely
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyTrends = monthlyTrendsRaw.map((item) => ({
        month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        borrows: item.borrows,
        returns: item.returns,
        requests: item.requests
      }));

      // 5. Category breakdown
      const categoryDistribution = await Book.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 }, totalCopies: { $sum: '$totalCopies' } } },
        { $sort: { count: -1 } },
        { $limit: 6 }
      ]);

      return res.status(200).json({
        success: true,
        stats: {
          totalBooks,
          totalCopies,
          availableCopies,
          currentlyBorrowed,
          registeredStudents,
          registeredStaff,
          pendingRequests,
          overdueBooks: overdueCount
        },
        popularBooks: popularBooksRaw,
        monthlyTrends,
        categoryDistribution,
        recentActivities
      });
    }

    // Student or Staff member dashboard stats
    const userId = req.user._id;
    const [
      myCurrentlyBorrowed,
      myPendingRequests,
      myOverdue,
      myTotalHistory,
      myRecentRecords
    ] = await Promise.all([
      BorrowRecord.countDocuments({
        userId,
        status: { $in: ['borrowed', 'overdue'] }
      }),
      BorrowRecord.countDocuments({
        userId,
        status: 'pending'
      }),
      BorrowRecord.countDocuments({
        userId,
        status: { $in: ['borrowed', 'overdue'] },
        dueDate: { $lt: now }
      }),
      BorrowRecord.countDocuments({
        userId
      }),
      BorrowRecord.find({ userId })
        .populate('bookId', 'title author coverImage category')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    // Available books preview
    const recommendedBooks = await Book.find({ availableCopies: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      stats: {
        myCurrentlyBorrowed,
        myPendingRequests,
        myOverdue,
        myTotalHistory
      },
      recentRecords: myRecentRecords,
      recommendedBooks
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
