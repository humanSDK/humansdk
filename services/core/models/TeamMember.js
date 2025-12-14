const mongoose = require('mongoose');
const { Schema } = mongoose;

const TeamMemberSchema = new Schema({
    teamId: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    email: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['invited', 'accepted', 'removed'],
        default: 'invited',
    },
    inviteToken: {
        type: String,
    },
    inviteExpiresAt: {
        type: Date,
    },
});

module.exports = mongoose.model('TeamMember', TeamMemberSchema);
