const mongoose = require('mongoose');
const { Schema } = mongoose;

const ActivityLogSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    entityType: {
        type: String,
        required: true,
        enum: ['project', 'page', 'canvas', 'note', 'team', 'sprint']
    },
    entityId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['created', 'updated', 'deleted']
    },
    changes: {
        type: Object,
        default: {}
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);