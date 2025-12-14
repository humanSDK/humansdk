const Notification = require("../models/Notification");

// Get all notifications
const getAllNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        const notifications = await Notification.find({
            destination: req.user.id,
            source: { $ne: req.user.id },
        })
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .populate({ path: "source", select: "avatar name email" });

        const total = await Notification.countDocuments({
            destination: req.user.id,
            source: { $ne: req.user.id },
        });

        return res.status(200).json({
            notifications,
            total,
            page: pageNumber,
            pages: Math.ceil(total / limitNumber),
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Mark notifications as read
const markNotificationsAsRead = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "No notification IDs provided" });
        }

        const result = await Notification.updateMany(
            { _id: { $in: ids }, destination: req.user.id },
            { $set: { markAsRead: true } }
        );

        return res.status(200).json({
            message: "Notifications marked as read",
            updatedCount: result.modifiedCount,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Delete notifications
const deleteNotifications = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "No notification IDs provided" });
        }

        const result = await Notification.deleteMany({
            _id: { $in: ids },
            destination: req.user.id,
        });

        return res.status(200).json({
            message: "Notifications deleted successfully",
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
// Get count of unread notifications
const getUnreadNotificationsCount = async (req, res) => {
    try {
        const unreadCount = await Notification.countDocuments({
            destination: req.user.id,
            source: { $ne: req.user.id },
            markAsRead: false, // Ensure this field exists in your schema
        });

        return res.status(200).json({ unreadCount });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllNotifications, markNotificationsAsRead, deleteNotifications, getUnreadNotificationsCount };
