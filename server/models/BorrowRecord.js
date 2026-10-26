const mongoose = require('mongoose');

const borrowRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book reference is required']
    },
    requestDate: {
      type: Date,
      default: Date.now
    },
    issueDate: {
      type: Date,
      default: null
    },
    dueDate: {
      type: Date,
      default: null
    },
    returnDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'borrowed', 'returned', 'overdue', 'cancelled'],
      default: 'pending'
    },
    lateFee: {
      type: Number,
      default: 0,
      min: [0, 'Late fee cannot be negative']
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    adminNotes: {
      type: String,
      trim: true,
      default: ''
    },
    userNotes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for user history and inventory verification
borrowRecordSchema.index({ userId: 1, status: 1 });
borrowRecordSchema.index({ bookId: 1, status: 1 });
borrowRecordSchema.index({ dueDate: 1, status: 1 });

module.exports = mongoose.model('BorrowRecord', borrowRecordSchema);
