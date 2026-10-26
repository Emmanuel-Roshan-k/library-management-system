const Setting = require('../models/Setting');

const getSettings = async () => {
  let settings = await Setting.findOne({ key: 'system_settings' });
  if (!settings) {
    settings = await Setting.create({
      key: 'system_settings',
      borrowDays: Number(process.env.BORROW_DAYS) || 14,
      dailyLateFee: Number(process.env.DAILY_LATE_FEE) || 5,
      maxBooksPerUser: 5,
      libraryName: 'Athena Central Library',
      libraryEmail: 'contact@athenalibrary.edu'
    });
  }
  return settings;
};

module.exports = {
  getSettings
};
