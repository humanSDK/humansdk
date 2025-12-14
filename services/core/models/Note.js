const mongoose = require('mongoose');
const { Schema } = mongoose;

const NoteSchema = new Schema({
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
    editorContent: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
});



module.exports = mongoose.model('Note', NoteSchema);

