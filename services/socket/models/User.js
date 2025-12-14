const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
