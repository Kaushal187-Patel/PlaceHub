const { fn, col, literal } = require('sequelize');
const { Notification, Application } = require('../models');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getUserNotifications = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const offset = parseInt(req.query.offset, 10) || 0;

    const { rows: notifications, count } = await Notification.findAndCountAll({
      where: { userId: req.user.id },
      include: [{ model: Application, as: 'application' }],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.status(200).json({
      status: 'success',
      count,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private
const getNotificationStats = async (req, res, next) => {
  try {
    const stats = await Notification.findAll({
      where: { userId: req.user.id },
      attributes: [
        'type',
        [fn('COUNT', col('id')), 'total'],
        [fn('SUM', literal("CASE WHEN status = 'sent' THEN 1 ELSE 0 END")), 'sent'],
        [fn('SUM', literal("CASE WHEN status = 'failed' THEN 1 ELSE 0 END")), 'failed']
      ],
      group: ['type']
    });

    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserNotifications,
  getNotificationStats
};
