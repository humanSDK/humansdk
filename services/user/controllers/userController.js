
const AWS = require('aws-sdk');
const User= require('../models/User');
const UserPreference=require('../models/UserPreference')
require('dotenv').config()
const bcrypt = require('bcrypt');
const s3Config = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    signatureVersion: 'v4'
};
console.log("cred", s3Config)
const s3 = new AWS.S3(s3Config);

// Verify credentials
s3.config.getCredentials((err) => {
    if (err) {
        console.log('AWS Credentials error:', err);
    } else {
        console.log('AWS Credentials loaded successfully');
    }
});

exports.updateAvatar = async (req, res) => {
    try {
        const userId = req.user.id;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Upload to S3
        const uploadParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `${userId}/${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read'
        };

        const uploadResult = await s3.upload(uploadParams).promise();

        // Update user avatar URL in database
        await User.findByIdAndUpdate(userId, {
            avatar: uploadResult.Location
        });

        res.status(200).json({
            error: false,
            avatarUrl: uploadResult.Location
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update avatar' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, description, localTime } = req.body;

        // Update user details
        const user = await User.findById(userId);
        if (name) user.name = name;
        await user.save();

        // Update or create user preferences
        let userPreference = await UserPreference.findOne({ userId });
        if (!userPreference) {
            userPreference = new UserPreference({ userId });
        }

        if (description) userPreference.description = description;
        if (localTime) userPreference.localTime = localTime;
        await userPreference.save();

        res.status(200).json({
            error: false,
            user,
            preferences: userPreference
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.body;
        
        let userPreference = await UserPreference.findOne({ userId });
        if (!userPreference) {
            userPreference = new UserPreference({ userId });
        }

        userPreference.status = status;
        await userPreference.save();

        res.status(200).json({
            error: false,
            preferences: userPreference
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update status' });
    }
};

exports.getUserDetails = async (req, res) => {
    try {
        const userId = req.user.id;

        
        const user = await User.findById(userId)
            .select('email name usageType avatar createdAt lastLogin');

     
        const preferences = await UserPreference.findOne({ userId })
            .select('description localTime status createdAt');

       
        if (!preferences) {
            const newPreferences = await UserPreference.create({
                userId,
                description: '',
                localTime: '',
                status: 'offline'
            });

            return res.status(200).json({
                error: false,
                data: {
                    user,
                    preferences: newPreferences
                }
            });
        }

        res.status(200).json({
            error: false,
            data: {
                user,
                preferences
            }
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ 
            error: true, 
            message: 'Failed to fetch user details' 
        });
    }
};


exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('email name usageType avatar createdAt lastLogin');

        const usersWithPreferences = await Promise.all(
            users.map(async (user) => {
                const preferences = await UserPreference.findOne({ userId: user._id })
                    .select('description localTime status createdAt');
                
                return {
                    user,
                    preferences: preferences || {
                        description: '',
                        localTime: '',
                        status: 'offline',
                        createdAt: user.createdAt
                    }
                };
            })
        );

        res.status(200).json({
            error: false,
            data: usersWithPreferences
        });
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ 
            error: true, 
            message: 'Failed to fetch users' 
        });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                error: true, 
                message: 'User not found' 
            });
        }

       
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ 
                error: true, 
                message: 'Current password is incorrect' 
            });
        }

       
        user.password = newPassword; // Will be hashed by the pre-save middleware
        await user.save();

        res.status(200).json({
            error: false,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ 
            error: true, 
            message: 'Failed to update password' 
        });
    }
};