import Notification from '../models/Notification.js';
import { successResponse } from '../utils/apiResponse.js';

export const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unread } = req.query;
    const query = { userId: req.user._id };
    if (unread === 'true') query.read = false;

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });
    const notifications = await Notification.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    successResponse(res, { notifications, unreadCount, pagination: { page: Number(page), limit: Number(limit), total } });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true }
    );
    successResponse(res, null, 'Marked as read');
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );
    successResponse(res, null, 'All marked as read');
  } catch (error) {
    next(error);
  }
};
