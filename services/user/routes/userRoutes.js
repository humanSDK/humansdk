const express = require('express');
const multer = require('multer');
const { 
    updateAvatar, 
    updateProfile, 
    updateUserStatus,
    getUserDetails,
    getAllUsers,
    updatePassword
} = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 
    }
});
router.put('/update-password', authMiddleware, updatePassword);
router.put('/avatar', authMiddleware, upload.single('avatar'), updateAvatar);
router.put('/profile', authMiddleware, updateProfile);
router.put('/status', authMiddleware, updateUserStatus);
router.get('/getUserById', authMiddleware, getUserDetails);
router.get('/getAllUsers', authMiddleware, getAllUsers);
module.exports = router;