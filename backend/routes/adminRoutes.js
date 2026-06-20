const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Innovation = require('../models/Innovation');

// Note: In a production environment, you MUST add authentication middleware here 
// to ensure ONLY users with role === 'Admin' can access these routes.

// Route: GET /api/admin/dashboard-stats
// Purpose: Fetch high-level platform metrics for the admin overview
router.get('/dashboard-stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const pendingUsers = await User.countDocuments({ verified: false });
        const totalInnovations = await Innovation.countDocuments();
        
        // AI flags projects if the overall score is below 40 or similarity is > 85%
        const flaggedInnovations = await Innovation.countDocuments({
            $or: [
                { 'aiScores.overall': { $lt: 40 } },
                { similarityScore: { $gt: 85 } }
            ]
        });

        res.status(200).json({ success: true, data: { totalUsers, pendingUsers, totalInnovations, flaggedInnovations } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Route: GET /api/admin/pending-users
// Purpose: List users (Companies/Innovators) awaiting manual verification 
router.get('/pending-users', async (req, res) => {
    try {
        const users = await User.find({ verified: false }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Route: GET /api/admin/flagged-innovations
// Purpose: List projects flagged by the AI Validation Engine for review [cite: 33, 239]
router.get('/flagged-innovations', async (req, res) => {
    try {
        const flagged = await Innovation.find({
            $or: [
                { 'aiScores.overall': { $lt: 40 } },
                { similarityScore: { $gt: 85 } } // Copyright/Plagiarism risk [cite: 240]
            ],
            status: { $ne: 'Archived' } // Don't show already removed spam
        }).populate('innovator', 'name email');
        
        res.status(200).json({ success: true, data: flagged });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Route: PUT /api/admin/verify-user/:id
// Purpose: Approve a user account
router.put('/verify-user/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { verified: true }, { new: true });
        res.status(200).json({ success: true, message: "User verified successfully.", data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Route: PUT /api/admin/moderate-innovation/:id
// Purpose: Admin decision on an innovation (e.g., remove spam) 
router.put('/moderate-innovation/:id', async (req, res) => {
    try {
        const { action } = req.body; // 'approve' or 'remove'
        
        let newStatus = action === 'remove' ? 'Archived' : 'Active';
        const project = await Innovation.findByIdAndUpdate(req.params.id, { status: newStatus }, { new: true });
        
        res.status(200).json({ success: true, message: `Project ${action}d successfully.`, data: project });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;