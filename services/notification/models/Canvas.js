const mongoose = require('mongoose')
const { Schema } = mongoose;
// Node Schema
const nodeSchema = new Schema({
    id: { type: String, required: true },
    type: { type: String, required: true },
    position: {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
    },
    data: {
        // COMPOENTN SCHEMA 
        label: { type: String },
        status: { type: String },
        type: { type: String, required: true },
        assignees: { type: [String], default: [] },
        // NOTE SCHEMA 
        text: { type: String },
        color: { type: String },
        lastChangedBy: { type: String },
        onChange: { type: String },
    },
    width: { type: Number },
    height: { type: Number },
    selected: { type: Boolean, default: false },
    positionAbsolute: {
        x: { type: Number },
        y: { type: Number },
    },
    dragging: { type: Boolean, default: false },
}, { _id: false })

// Edge Schema
const edgeSchema = new mongoose.Schema({
    source: { type: String, required: true },
    target: { type: String, required: true },
    sourceHandle: { type: String },
    targetHandle: { type: String },
    markerEnd: {
        type: { type: String, enum: ['arrowclosed'], default: 'arrowclosed' },
    },
}, { _id: false })

// Canvas Schema
const canvasSchema = new mongoose.Schema({
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    pageId: {
        type: Schema.Types.ObjectId,
        ref: 'Page',
        required: true,
    },
    nodes: [nodeSchema],
    edges: [edgeSchema],
}, {
    timestamps: true,
})

module.exports = mongoose.model('Canvas', canvasSchema)

