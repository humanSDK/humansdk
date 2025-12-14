// models/Comment.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommentSchema = new mongoose.Schema({
    taskId: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        default: ""
    },
    attachments: [{
        name: String,
        url: String
    }],
    hiddenFor: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    isPinned: {
        type: Boolean,
        default: false
      },
      pinnedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
      },
      pinnedAt: {
        type: Date,
        default: null
      }
});

module.exports = mongoose.model('Comment', CommentSchema);