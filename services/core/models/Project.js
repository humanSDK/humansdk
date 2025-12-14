const mongoose = require("mongoose")
const { Schema } = mongoose;

const ProjectSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    assignedTeam: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
})

module.exports = mongoose.model('Project', ProjectSchema);
