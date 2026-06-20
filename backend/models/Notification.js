const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The Innovator
    senderCompanyName: { type: String, required: true }, // E.g., "ABC Agriculture Pvt Ltd"
    type: { 
        type: String, 
        enum: ['View', 'Contact', 'Funding', 'System'], 
        required: true 
    },
    message: { type: String, required: true },
    innovationTitle: { type: String },
    read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
