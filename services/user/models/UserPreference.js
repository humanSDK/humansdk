const mongoose = require('mongoose');
const userPreferenceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    localTime: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['active', 'away', 'offline','in_meeting','commuting','sick','remote'],
        default: 'offline'
    }
});

module.exports = mongoose.model('UserPreference', userPreferenceSchema);
