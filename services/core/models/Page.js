const mongoose = require('mongoose');
const { Schema } = mongoose;

// Team Schema
const PageSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    softDelete: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date
    }
});

// Middleware to update 'updatedAt' before saving
PageSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Middleware to update 'updatedAt' before findOneAndUpdate
PageSchema.pre('findOneAndUpdate', function (next) {
    this.set({ updatedAt: Date.now() });
    next();
});

module.exports = mongoose.model('Page', PageSchema);

