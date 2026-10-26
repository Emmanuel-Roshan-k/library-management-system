const BorrowRecord = require('../models/BorrowRecord');
const Book = require('../models/Book');
const User = require('../models/User');
const { getSettings } = require('../services/settingService');
const { createNotification } = require('../services/notificationService');

// Helper to calculate late fee
const calculateLateFee = (dueDate, returnDate, dailyFeeRate) => {
  const due = new Date(dueDate);
  const returned = returnDate ? new Date(returnDate) : new Date();
  
  if (returned <= due) return 0;
  
  const diffTime = returned.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays * dailyFeeRate);
};

// @desc    Submit a borrowing request (Student / Staff)
// @route   POST /api/borrowing/request
// @access  Private (Student / Staff)
const requestBorrow = async (req, res, next) => {
  try {
    const { bookId, userNotes } = req.body;
    const userId = req.user._id;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: 'Book ID is required'
      });
    }

    // Check user account status
    if (req.user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account is suspended. Borrowing is disabled.'
      });
    }

    const settings = await getSettings();

    // Check maximum active books constraint
    const activeCount = await BorrowRecord.countDocuments({
      userId,
      status: { $in: ['pending', 'approved', 'borrowed', 'overdue'] }
    });

    if (activeCount >= settings.maxBooksPerUser) {
      return res.status(400).json({
        success: false,
        message: `You have reached the maximum allowed limit of ${settings.maxBooksPerUser} active borrowed/requested books.`
      });
    }

    // Check book exists and has available copies
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: `Currently no copies of '${book.title}' are available for borrowing.`
      });
    }

    // Check if user already has an active borrow or pending request for this exact book
    const existingActive = await BorrowRecord.findOne({
      userId,
      bookId,
      status: { $in: ['pending', 'approved', 'borrowed', 'overdue'] }
    });

    if (existingActive) {
      return res.status(400).json({
        success: false,
        message: `You already have an active request or borrowed copy for '${book.title}' (Status: ${existingActive.status}).`
      });
    }

    // Create borrow request
    const borrowRecord = await BorrowRecord.create({
      userId,
      bookId,
      requestDate: new Date(),
      status: 'pending',
      userNotes: userNotes ? userNotes.trim() : ''
    });

    // Notify user
    await createNotification({
      userId,
      title: 'Borrow Request Received',
      message: `Your request to borrow '${book.title}' has been received and is pending librarian review.`,
      type: 'borrow_request',
      link: '/borrowing/history'
    });

    res.status(201).json({
      success: true,
      message: `Borrowing request for '${book.title}' submitted successfully.`,
      borrowRecord
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Directly issue book to user (Admin / Librarian)
// @route   POST /api/borrowing/issue
// @access  Private (Admin / Librarian)
const issueBookDirectly = async (req, res, next) => {
  try {
    const { userId, bookId, adminNotes } = req.body;

    if (!userId || !bookId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Book ID are required to issue a book'
      });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (targetUser.accountStatus === 'suspended') {
      return res.status(400).json({
        success: false,
        message: 'Cannot issue book to a suspended user account.'
      });
    }

    // Check duplicate active
    const existingActive = await BorrowRecord.findOne({
      userId,
      bookId,
      status: { $in: ['pending', 'approved', 'borrowed', 'overdue'] }
    });

    if (existingActive) {
      return res.status(400).json({
        success: false,
        message: `This user already has an active record for this book (Status: ${existingActive.status}).`
      });
    }

    // Safe atomic copy decrement
    const book = await Book.findOneAndUpdate(
      { _id: bookId, availableCopies: { $gt: 0 } },
      { $inc: { availableCopies: -1 } },
      { new: true }
    );

    if (!book) {
      return res.status(400).json({
        success: false,
        message: 'No copies available to issue for this book.'
      });
    }

    const settings = await getSettings();
    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + settings.borrowDays);

    const record = await BorrowRecord.create({
      userId,
      bookId,
      requestDate: issueDate,
      issueDate,
      dueDate,
      status: 'borrowed',
      processedBy: req.user._id,
      adminNotes: adminNotes || 'Directly issued by librarian'
    });

    // Notify user
    await createNotification({
      userId,
      title: 'Book Issued to You',
      message: `'${book.title}' has been issued to you. Due date: ${dueDate.toLocaleDateString()}.`,
      type: 'book_issued',
      link: '/borrowing/history'
    });

    res.status(201).json({
      success: true,
      message: `Book '${book.title}' successfully issued to ${targetUser.name}.`,
      record
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's borrowing records
// @route   GET /api/borrowing/my-records
// @access  Private (Student / Staff / Admin)
const getMyRecords = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const query = { userId: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    const currentPage = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const skip = (currentPage - 1) * pageSize;

    const settings = await getSettings();

    let records = await BorrowRecord.find(query)
      .populate('bookId', 'title author ISBN category coverImage shelfLocation')
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    // Dynamic overdue check & late fee calculation
    records = records.map((rec) => {
      const doc = rec.toObject();
      if (doc.status === 'borrowed' && doc.dueDate && new Date() > new Date(doc.dueDate)) {
        doc.status = 'overdue';
        doc.lateFee = calculateLateFee(doc.dueDate, null, settings.dailyLateFee);
      }
      return doc;
    });

    // Optional search in populated book
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      records = records.filter(
        (r) =>
          r.bookId &&
          (regex.test(r.bookId.title) ||
            regex.test(r.bookId.author) ||
            regex.test(r.bookId.ISBN))
      );
    }

    const total = await BorrowRecord.countDocuments(query);

    res.status(200).json({
      success: true,
      records,
      total,
      currentPage,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel user's own pending request
// @route   PATCH /api/borrowing/:id/cancel
// @access  Private (Student / Staff)
const cancelRequest = async (req, res, next) => {
  try {
    const record = await BorrowRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    if (record.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this request' });
    }

    if (record.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a request that is already ${record.status}.`
      });
    }

    record.status = 'cancelled';
    await record.save();

    res.status(200).json({
      success: true,
      message: 'Borrowing request cancelled successfully',
      record
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all borrowing requests (Admin / Librarian)
// @route   GET /api/borrowing/requests
// @access  Private (Admin / Librarian)
const getAllRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    } else if (!status) {
      query.status = 'pending'; // Default to pending requests for librarian review
    }

    const currentPage = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const skip = (currentPage - 1) * pageSize;

    const [requests, total] = await Promise.all([
      BorrowRecord.find(query)
        .populate('userId', 'name email role studentId staffId phone')
        .populate('bookId', 'title author ISBN category availableCopies totalCopies coverImage shelfLocation')
        .populate('processedBy', 'name email')
        .sort({ requestDate: -1 })
        .skip(skip)
        .limit(pageSize),
      BorrowRecord.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      requests,
      total,
      currentPage,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a borrowing request (Admin / Librarian)
// @route   PATCH /api/borrowing/:id/approve
// @access  Private (Admin / Librarian)
const approveRequest = async (req, res, next) => {
  try {
    const { adminNotes } = req.body;
    const record = await BorrowRecord.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('bookId');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Borrowing request not found' });
    }

    if (record.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Request cannot be approved because status is currently '${record.status}'.`
      });
    }

    // Atomically decrement availableCopies if availableCopies > 0
    const updatedBook = await Book.findOneAndUpdate(
      { _id: record.bookId._id, availableCopies: { $gt: 0 } },
      { $inc: { availableCopies: -1 } },
      { new: true }
    );

    if (!updatedBook) {
      return res.status(400).json({
        success: false,
        message: `Cannot approve request: No copies of '${record.bookId.title}' are currently available.`
      });
    }

    const settings = await getSettings();
    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + settings.borrowDays);

    record.status = 'borrowed';
    record.issueDate = issueDate;
    record.dueDate = dueDate;
    record.processedBy = req.user._id;
    if (adminNotes) record.adminNotes = adminNotes;
    await record.save();

    // Create notification for user
    await createNotification({
      userId: record.userId._id,
      title: 'Borrow Request Approved!',
      message: `Your request for '${record.bookId.title}' has been approved and issued. Due date is ${dueDate.toLocaleDateString()}.`,
      type: 'request_approved',
      link: '/borrowing/history'
    });

    res.status(200).json({
      success: true,
      message: `Request approved and book issued successfully until ${dueDate.toLocaleDateString()}`,
      record
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a borrowing request (Admin / Librarian)
// @route   PATCH /api/borrowing/:id/reject
// @access  Private (Admin / Librarian)
const rejectRequest = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;
    const record = await BorrowRecord.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('bookId', 'title');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Borrowing request not found' });
    }

    if (record.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject request with status '${record.status}'.`
      });
    }

    record.status = 'rejected';
    record.processedBy = req.user._id;
    record.adminNotes = rejectionReason || 'Request rejected by librarian.';
    await record.save();

    // Notify user
    await createNotification({
      userId: record.userId._id,
      title: 'Borrow Request Declined',
      message: `Your request for '${record.bookId.title}' was declined: ${record.adminNotes}`,
      type: 'request_rejected',
      link: '/borrowing/history'
    });

    res.status(200).json({
      success: true,
      message: 'Borrowing request rejected successfully',
      record
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process book return (Admin / Librarian)
// @route   PATCH /api/borrowing/:id/return
// @access  Private (Admin / Librarian)
const returnBook = async (req, res, next) => {
  try {
    const { adminNotes } = req.body;
    const record = await BorrowRecord.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('bookId', 'title availableCopies totalCopies');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Borrow record not found' });
    }

    if (record.status === 'returned') {
      return res.status(400).json({
        success: false,
        message: 'This book has already been marked as returned.'
      });
    }

    if (!['borrowed', 'overdue'].includes(record.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot process return for record with status '${record.status}'.`
      });
    }

    const returnDate = new Date();
    const settings = await getSettings();
    const lateFee = calculateLateFee(record.dueDate, returnDate, settings.dailyLateFee);

    // Atomically increment book available copies
    await Book.findByIdAndUpdate(record.bookId._id, {
      $inc: { availableCopies: 1 }
    });

    record.returnDate = returnDate;
    record.status = 'returned';
    record.lateFee = lateFee;
    record.processedBy = req.user._id;
    if (adminNotes) record.adminNotes = adminNotes;
    await record.save();

    // Notify user
    const feeMessage = lateFee > 0 ? ` A late fee of ₹${lateFee} was assessed.` : ' Returned on time with ₹0 fee.';
    await createNotification({
      userId: record.userId._id,
      title: 'Book Return Confirmed',
      message: `Your return of '${record.bookId.title}' has been processed.${feeMessage}`,
      type: 'book_returned',
      link: '/borrowing/history'
    });

    res.status(200).json({
      success: true,
      message: `Book '${record.bookId.title}' returned successfully.${lateFee > 0 ? ` Late fee: ₹${lateFee}` : ''}`,
      record,
      lateFee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get overdue books list (Admin / Librarian)
// @route   GET /api/borrowing/overdue
// @access  Private (Admin / Librarian)
const getOverdueBooks = async (req, res, next) => {
  try {
    const now = new Date();
    const settings = await getSettings();

    // Find all borrowed records where due date is in the past
    const records = await BorrowRecord.find({
      status: { $in: ['borrowed', 'overdue'] },
      dueDate: { $lt: now }
    })
      .populate('userId', 'name email role studentId staffId phone')
      .populate('bookId', 'title author ISBN category coverImage shelfLocation')
      .sort({ dueDate: 1 });

    // Update overdue status and calculate late fees
    const enriched = records.map((rec) => {
      const doc = rec.toObject();
      const fee = calculateLateFee(rec.dueDate, null, settings.dailyLateFee);
      const diffMs = now.getTime() - new Date(rec.dueDate).getTime();
      const overdueDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return {
        ...doc,
        overdueDays,
        currentLateFee: fee
      };
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      overdueRatePerDay: settings.dailyLateFee,
      records: enriched
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complete borrowing history & all records (Admin / Librarian)
// @route   GET /api/borrowing/history
// @access  Private (Admin / Librarian)
const getBorrowHistory = async (req, res, next) => {
  try {
    const { status, search, startDate, endDate, page = 1, limit = 15 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }

    const currentPage = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const skip = (currentPage - 1) * pageSize;

    const [records, total] = await Promise.all([
      BorrowRecord.find(query)
        .populate('userId', 'name email role studentId staffId phone')
        .populate('bookId', 'title author ISBN category coverImage shelfLocation')
        .populate('processedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      BorrowRecord.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      records,
      total,
      currentPage,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
