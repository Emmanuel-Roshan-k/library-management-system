const User = require('../models/User');
const BorrowRecord = require('../models/BorrowRecord');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, status, page = 1, limit = 15 } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (status && status !== 'all') {
      query.accountStatus = status;
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { email: regex },
        { studentId: regex },
        { staffId: regex }
      ];
    }

    const currentPage = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const skip = (currentPage - 1) * pageSize;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      users,
      total,
      currentPage,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user details & active borrows (Admin only)
// @route   GET /api/users/:id
// @access  Private (Admin)
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [activeBorrows, totalHistory] = await Promise.all([
      BorrowRecord.find({
        userId: user._id,
        status: { $in: ['pending', 'approved', 'borrowed', 'overdue'] }
      }).populate('bookId', 'title ISBN author coverImage'),
      BorrowRecord.countDocuments({ userId: user._id })
    ]);

    res.status(200).json({
      success: true,
      user,
      stats: {
        activeBorrowsCount: activeBorrows.length,
        totalBorrowsCount: totalHistory
      },
      activeBorrows
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin create user (Student, Staff, or Admin)
// @route   POST /api/users
// @access  Private (Admin)
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, studentId, staffId, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists'
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'student',
      studentId,
      staffId,
      phone: phone || ''
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status / details (Admin only)
// @route   PATCH /api/users/:id
// @access  Private (Admin)
const updateUser = async (req, res, next) => {
  try {
    const { name, role, accountStatus, studentId, staffId, phone } = req.body;
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent admin from deactivating self
    if (user._id.toString() === req.user._id.toString() && accountStatus === 'suspended') {
      return res.status(400).json({
        success: false,
        message: 'You cannot suspend your own administrative account.'
      });
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (accountStatus) user.accountStatus = accountStatus;
    if (studentId !== undefined) user.studentId = studentId;
    if (staffId !== undefined) user.staffId = staffId;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account.'
      });
    }

    // Check if user has active borrowings
    const activeBorrows = await BorrowRecord.countDocuments({
      userId: user._id,
      status: { $in: ['pending', 'approved', 'borrowed', 'overdue'] }
    });

    if (activeBorrows > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete user: They currently have ${activeBorrows} active borrow or pending request records.`
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
