const mongoose = require('mongoose');

const fundingRecordSchema = new mongoose.Schema({
    innovation: { type: mongoose.Schema.Types.ObjectId, ref: 'Innovation', required: true },
    funderName: { type: String, required: true },
    funderEmail: { type: String, required: true },
    amount: { type: Number, required: true }, // Stored in INR
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String },
    status: { 
        type: String, 
        enum: ['Created', 'Successful', 'Failed'], 
        default: 'Created' 
    }
}, { timestamps: true });

module.exports = mongoose.model('FundingRecord', fundingRecordSchema);