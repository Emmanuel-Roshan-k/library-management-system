const Notification = require('../models/Notification');

/**
 * Creates an in-app notification.
 * Designed so email/SMS sending hooks can be attached here in the future.
 */
const createNotification = async ({ userId, title, message, type = 'system', link = '' }) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      link
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return null;
  }
};

module.exports = {
  createNotification
};
