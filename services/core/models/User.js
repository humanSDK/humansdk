const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String },
    usageType: { type: String, enum: ['personal', 'organization'] },
    password: { type: String },
    isVerified: { type: Boolean, default: false },
    avatar: { type: String },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date },
    refreshToken: { type: String },
    googleOAuthToken: {
      access_token: { type: String },
      token_type: { type: String },
      scope: { type: String },
      expiry_date: { type: Number },
    },
  });

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

module.exports = mongoose.model('User', userSchema);

