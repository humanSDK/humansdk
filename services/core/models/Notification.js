const mongoose = require("mongoose")
const { Schema } = mongoose;
const NotificationSchema = new Schema({
    source: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    destination: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        default: "Untitled"
    },
    message: {
        type: String,
        default: ""
    },
    link: {
        type: String,
        default: '#'
    },
    markAsRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Notification', NotificationSchema)