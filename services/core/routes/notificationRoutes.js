const express = require('express');
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware")

const { getAllNotifications, markNotificationsAsRead, deleteNotifications, getUnreadNotificationsCount } = require("../controllers/notificationController")

router.get("/", authMiddleware, getAllNotifications)

router.put("/", authMiddleware, markNotificationsAsRead)

router.delete("/", authMiddleware, deleteNotifications)

router.get("/unread", authMiddleware, getUnreadNotificationsCount)

module.exports = router;