const express = require('express');
const router = express.Router();
const Innovation = require('../models/Innovation');
const aiService = require('../services/aiService');
const upload = require('../middleware/upload');

// Route: POST /api/innovations/submit
// Purpose: Handles the 4-step Innovation Submission Flow
router.post('/submit', upload.fields([
    { name: 'images', maxCount: 5 }, 
    { name: 'videos', maxCount: 2 }
]), async (req, res) => {
    try {
        const { innovatorId, originalTitle, originalDescription, category } = req.body;

        // Note: Speech-to-Text (Step 3) is usually handled on the frontend via 
        // the Web Speech API before sending 'originalDescription' to this backend.

        // Step 4: AI Professional Enhancement
        console.log("Enhancing description via Nvidia AI...");
        const enhancedData = await aiService.enhanceDescription(originalDescription);

        // Step 5: AI Validation Engine & Scoring System
        console.log("Evaluating and scoring innovation...");
        const evaluationData = await aiService.evaluateInnovation(enhancedData);

        // Get file paths if uploaded
        const imagePaths = req.files['images'] ? req.files['images'].map(f => `/uploads/${f.filename}`) : [];
        const videoPaths = req.files['videos'] ? req.files['videos'].map(f => `/uploads/${f.filename}`) : [];

        // Save to Database
        const newInnovation = new Innovation({
            innovator: innovatorId, // In production, get this from user authentication token
            originalTitle,
            originalDescription,
            category,
            images: imagePaths,
            videos: videoPaths,
            
            // Map AI Enhancement Data
            aiTitle: enhancedData.aiTitle,
            aiSummary: enhancedData.aiSummary,
            aiTechnicalDescription: enhancedData.aiTechnicalDescription,
            aiBenefits: enhancedData.aiBenefits,
            
            // Map AI Evaluation Data
            aiScores: {
                novelty: evaluationData.novelty,
                impact: evaluationData.impact,
                scalability: evaluationData.scalability,
                sustainability: evaluationData.sustainability,
                commercial: evaluationData.commercial,
                feasibility: evaluationData.feasibility,
                overall: evaluationData.overall
            },
            readinessLevel: evaluationData.readinessLevel,
            similarityScore: evaluationData.similarityScore
        });

        const savedInnovation = await newInnovation.save();

        res.status(201).json({
            success: true,
            message: "Innovation successfully submitted, enhanced, and scored by AI.",
            data: savedInnovation
        });

    } catch (error) {
        console.error("Submission Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Route: GET /api/innovations
// Purpose: Fetch innovations for the Innovation Feed
router.get('/', async (req, res) => {
    try {
        const innovations = await Innovation.find().sort({ createdAt: -1 }).populate('innovator', 'name');
        res.status(200).json({ success: true, data: innovations });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Route: GET /api/innovations/explore/search
// Purpose: Advanced Search Engine with Filters
router.get('/explore/search', async (req, res) => {
    try {
        const { query, category, minRating, readinessLevel } = req.query;
        
        // Build a dynamic MongoDB query object
        let dbQuery = { status: 'Active' }; // Only search active projects

        // 1. Text Search (Matches title or AI summary)
        if (query) {
            dbQuery.$or = [
                { originalTitle: { $regex: query, $options: 'i' } },
                { aiTitle: { $regex: query, $options: 'i' } },
                { aiSummary: { $regex: query, $options: 'i' } }
            ];
        }

        // 2. Category Filter
        if (category) {
            dbQuery.category = category;
        }

        // 3. Readiness Level Filter
        if (readinessLevel) {
            dbQuery.readinessLevel = parseInt(readinessLevel);
        }

        // 4. Minimum AI Rating Filter
        if (minRating) {
            dbQuery['aiScores.overall'] = { $gte: parseInt(minRating) };
        }

        const innovations = await Innovation.find(dbQuery)
            .sort({ 'aiScores.overall': -1 }) // Sort highest rated first
            .populate('innovator', 'name');

        res.status(200).json({ success: true, count: innovations.length, data: innovations });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ... keep your existing router.get('/:id', ...) below this ...

// Route: GET /api/innovations/:id
// Purpose: Fetch a single innovation for the Detail Page
router.get('/:id', async (req, res) => {
    try {
        const innovation = await Innovation.findById(req.params.id).populate('innovator', 'name email');
        
        if (!innovation) {
            return res.status(404).json({ success: false, message: 'Innovation not found' });
        }

        // Increment view count [cite: 14]
        innovation.viewCount += 1;
        await innovation.save();

        res.status(200).json({ success: true, data: innovation });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;