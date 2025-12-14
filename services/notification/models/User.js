const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String },
    usageType: { type: String, enum: ['personal', 'organization'] },
    password: { type: String },
    isVerified: { type: Boolean, default: false },
    avatar: { type: String }, // URL for the profile image
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date }
});


module.exports = mongoose.model('User', userSchema);
