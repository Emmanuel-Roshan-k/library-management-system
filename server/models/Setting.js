const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'system_settings'
    },
    borrowDays: {
      type: Number,
      required: true,
      default: 14,
      min: [1, 'Borrow days must be at least 1']
    },
    dailyLateFee: {
      type: Number,
      required: true,
      default: 5,
      min: [0, 'Daily late fee cannot be negative']
    },
    maxBooksPerUser: {
      type: Number,
      default: 5,
      min: [1, 'Max books per user must be at least 1']
    },
    libraryName: {
      type: String,
      default: 'Athena Central Library'
    },
    libraryEmail: {
      type: String,
      default: 'contact@athenalibrary.edu'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Setting', settingSchema);
