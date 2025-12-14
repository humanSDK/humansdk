const express = require('express');
const { signup, verifyEmail, login, completeRegistration, checkTokenValidity, getNewAuthToken,forgotPassword, resetPassword } = require('../controllers/authController');
const { authMiddleware } = require("../middleware/authMiddleware")
const router = express.Router();

router.post('/signup', signup);
router.get('/verify-email/:token', verifyEmail);
router.post('/complete-registration', completeRegistration)
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get("/check-token-validity", authMiddleware, checkTokenValidity)
router.get("/new-auth-token", getNewAuthToken)

module.exports = router;
