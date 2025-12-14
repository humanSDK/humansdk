const mongoose = require('mongoose')
const { Schema } = mongoose;
// Node Schema
const nodeSchema = new Schema({
    id: { type: String, required: true },
    type: { type: String, required: true },

    data: {
        label: { type: String },
        status: { type: String },
        type: { type: String, required: true },
        assignees: { type: [String], default: [] },
    },
}, { _id: false })


const SprintSchema = new mongoose.Schema({
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },

    nodes: [nodeSchema],
}, {
    timestamps: true,
})

module.exports = mongoose.model('Sprint', SprintSchema)

