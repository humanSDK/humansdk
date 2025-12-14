const express = require('express');
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware")
const { validatePageAccess } = require("../middleware/validatePageAccess")
const { getAllPages, getPageDetail, getAllTasksForPage } = require("../controllers/analyticController")
const { 
    getDashboardStats, 
    getProjectAnalytics,
    getTaskAnalytics,
    getRecentActivities
} = require('../controllers/homeController');

// Dashboard routes
router.get('/stats', authMiddleware, getDashboardStats);
router.get('/project', authMiddleware, getProjectAnalytics);
router.get('/tasks', authMiddleware, getTaskAnalytics);
router.get('/recent', authMiddleware, getRecentActivities);
//get all pags of project
router.get("/pages", authMiddleware, validatePageAccess, getAllPages);

//get details of a page in project
router.get("/page", authMiddleware, validatePageAccess, getPageDetail);

//get all tasks in a page
router.get("/page/tasks", authMiddleware, validatePageAccess, getAllTasksForPage)


module.exports = router;