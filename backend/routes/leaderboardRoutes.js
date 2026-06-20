const express = require('express');
const router = express.Router();
const Innovation = require('../models/Innovation');

// Helper function to fetch top 5 innovations based on a sort criteria
const fetchTopInnovations = async (sortCriteria) => {
    return await Innovation.find({ status: 'Active' })
        .sort(sortCriteria)
        .limit(5)
        .populate('innovator', 'name');
};

// Route: GET /api/leaderboards
// Purpose: Fetches data for all leaderboards simultaneously
router.get('/', async (req, res) => {
    try {
        // Highest Rated [cite: 224]
        const highestRated = await fetchTopInnovations({ 'aiScores.overall': -1 });
        
        // Most Funded [cite: 225]
        const mostFunded = await fetchTopInnovations({ fundingRaised: -1 });
        
        // Most Viewed [cite: 226]
        const mostViewed = await fetchTopInnovations({ viewCount: -1 });

        res.status(200).json({
            success: true,
            data: {
                highestRated,
                mostFunded,
                mostViewed
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;