const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['Innovator', 'Company', 'Investor', 'Admin'], 
        required: true 
    },
    // Company specific fields
    industry: { 
        type: String, 
        enum: ['Agriculture', 'Healthcare', 'Education', 'Transportation', 'Sustainability', 'Energy', 'Manufacturing', 'Technology', 'Other'] 
    },
    verified: { type: Boolean, default: false } // Admin verification
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
