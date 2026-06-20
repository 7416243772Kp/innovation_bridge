const mongoose = require('mongoose');

const innovationSchema = new mongoose.Schema({
    innovator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalTitle: { type: String, required: true },
    originalDescription: { type: String, required: true },
    category: { 
        type: String, 
        enum: ['Agriculture', 'Healthcare', 'Education', 'Transportation', 'Sustainability', 'Energy', 'Manufacturing', 'Technology'] 
    },
    
    // Media
    images: [{ type: String }], // Array of URLs
    videos: [{ type: String }],
    
    // AI Generated Content
    aiTitle: { type: String },
    aiSummary: { type: String },
    aiTechnicalDescription: { type: String },
    aiBenefits: { type: String },
    
    // AI Scoring System (0-100)
    aiScores: {
        novelty: { type: Number },
        impact: { type: Number },
        scalability: { type: Number },
        sustainability: { type: Number },
        commercial: { type: Number },
        feasibility: { type: Number },
        overall: { type: Number }
    },
    
    readinessLevel: { 
        type: Number, 
        enum: [1, 2, 3, 4, 5] // 1: Idea to 5: Commercial Ready
    },
    similarityScore: { type: Number }, // Percentage

    // Platform Metrics
    status: { 
        type: String, 
        enum: ['Active', 'Under Discussion', 'Acquired', 'Archived'], 
        default: 'Active' 
    },
    fundingRaised: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 }
    
}, { timestamps: true });

module.exports = mongoose.model('Innovation', innovationSchema);