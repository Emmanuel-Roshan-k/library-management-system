const Setting = require('../models/Setting');
const { getSettings } = require('../services/settingService');

// @desc    Get system settings
// @route   GET /api/settings
// @access  Public (or Authenticated)
const fetchSettings = async (req, res, next) => {
  try {
    const settings = await getSettings();
    res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update system settings (Admin only)
// @route   PUT /api/settings
// @access  Private (Admin)
const updateSettings = async (req, res, next) => {
  try {
    const { borrowDays, dailyLateFee, maxBooksPerUser, libraryName, libraryEmail } = req.body;

    let settings = await Setting.findOne({ key: 'system_settings' });
    if (!settings) {
      settings = new Setting({ key: 'system_settings' });
    }

    if (borrowDays !== undefined) settings.borrowDays = Math.max(1, parseInt(borrowDays, 10));
    if (dailyLateFee !== undefined) settings.dailyLateFee = Math.max(0, parseFloat(dailyLateFee));
    if (maxBooksPerUser !== undefined) settings.maxBooksPerUser = Math.max(1, parseInt(maxBooksPerUser, 10));
    if (libraryName) settings.libraryName = libraryName.trim();
    if (libraryEmail) settings.libraryEmail = libraryEmail.trim();

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'System settings updated successfully',
      settings
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  fetchSettings,
  updateSettings
};
