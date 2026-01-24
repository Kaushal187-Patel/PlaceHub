const express = require('express');
const { getUserNotifications, getNotificationStats } = require('../controllers/notifications');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getUserNotifications);
router.get('/stats', getNotificationStats);

module.exports = router;