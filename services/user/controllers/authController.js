const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const { signUpTemplate } = require("../utils/htmlTemplates")

// SIGN UP 
exports.signup = async (req, res) => {
    const { email } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already in use' });

        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Setup Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const verifyLink = `${process.env.FRONTEND_URL}/verify-email/${token}`;
        console.log("verify link:", verifyLink)
        await transporter.sendMail({
            to: email,
            subject: 'Email Verification for Signup - costheta',
            html: signUpTemplate(verifyLink)
        });

        res.status(200).json({ error: false, message: 'Verification email sent' });
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong', message: error.message });
    }
};

// EMAIL VERIFICATION 
exports.verifyEmail = async (req, res) => {
    const { token } = req.params;

    try {
        const { email } = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email });

        if (!user) {
            const newUser = await User.create({ email });
            return res.status(200).json({ error: false, redirectUrl: `/complete-registration/${newUser.id}` });
        }
        if (user) {
            // If the user is already verified, redirect to login
            if (user.isVerified) {
                return res.status(200).json({ error: false, redirectUrl: `/login` });
            }
            // If the user exists but is not verified, redirect to complete registration
            return res.status(200).json({ error: false, redirectUrl: `/complete-registration/${user.id}` });
        }

        res.status(400).json({ message: 'Invalid or expired link' });
    } catch (error) {
        res.status(500).json({ message: 'Invalid or expired link' });
    }
};

//COMPLETE REGISTER
exports.completeRegistration = async (req, res) => {

    const { userId, name, role, password, token: rt_token } = req.body;

    try {
        const { email } = jwt.verify(rt_token, process.env.JWT_SECRET);
        if (!userId) {
            return res.status(400).json({ message: 'Invalid request' });
        }
        const user = await User.findById(userId);
        if (user.email != email) return res.status(400).json({ message: 'Invalid Email Request' });
        if (!user || user.isVerified) return res.status(400).json({ message: 'Invalid request' });

        user.name = name;
        user.usageType = role;
        user.password = password;
        user.isVerified = true;


        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30m' });
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
        user.refreshToken = refreshToken;

        await user.save();
        res.status(200).json({ error: false, token: token, refreshToken });
    } catch (error) {
        res.status(500).json({ error: 'Invalid Request' });
    }
};

//LOGIN
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
        user.lastLogin = new Date();

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30m' });
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
        user.refreshToken = refreshToken;

        await user.save();
        res.status(200).json({ token, refreshToken });
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
};

exports.checkTokenValidity = async (req, res) => {
    try {
        return res.status(200).json({ error: false })
    } catch (error) {
        return res.status(500).json({ error: true })
    }
}


exports.getNewAuthToken = async (req, res) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET);
        req.user = verified;

        const user = await User.findById(req.user.id)
        if (!user) return res.status(404).json({ message: 'User not found' });

        const authtoken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30m' });

        return res.status(200).json({ error: false, token: authtoken })


    } catch (error) {
        res.status(400).json({ message: 'Invalid refresh token' });
    }
}

// Add these new controller functions to authController.js:
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !user.isVerified) {
            return res.status(404).json({ message: 'If a user with this email exists, a password reset link has been sent.' });
        }

        const resetToken = jwt.sign(
            { id: user._id, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );
        
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        
        await transporter.sendMail({
            to: email,
            subject: 'Password Reset Request - CosTheta',
            html: `
                <h1>Password Reset Request</h1>
                <p>Hello,</p>
                <p>We received a request to reset your password for your CosTheta account.</p>
                <p>Click the link below to set a new password. This link will expire in 1 hour and can only be used once.</p>
                <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
                <p>If you didn't request this password reset, you can safely ignore this email.</p>
                <p>Best regards,<br>The CosTheta Team</p>
            `
        });

        res.status(200).json({ message: 'If a user with this email exists, a password reset link has been sent.' });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded.id, email: decoded.email });

        if (!user || !user.isVerified) {
            return res.status(400).json({ message: 'Invalid or expired reset link' });
        }

        
        if (user.usedResetTokens && user.usedResetTokens.includes(token)) {
            return res.status(400).json({ 
                message: 'This reset link has already been used. Please request a new password reset.',
                code: 'TOKEN_ALREADY_USED'
            });
        }

   
        if (!user.usedResetTokens) {
            user.usedResetTokens = [];
        }
        user.usedResetTokens.push(token);
        
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password successfully reset' });
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Invalid or expired reset link' });
        }
        res.status(400).json({ message: 'Failed to reset password' });
    }
};