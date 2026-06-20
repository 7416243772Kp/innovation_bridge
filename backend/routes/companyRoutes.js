const express = require('express');
const router = express.Router();
const Innovation = require('../models/Innovation');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Route: GET /api/companies/matches
// Purpose: AI Matching Engine - Recommends top innovations by industry
router.get('/matches', async (req, res) => {
    try {
        const { industry } = req.query;

        if (!industry) {
            return res.status(400).json({ success: false, message: "Industry parameter is required." });
        }

        // Match the company's industry to the innovation category, sort by highest AI Rating
        const recommendations = await Innovation.find({ 
            category: industry,
            status: 'Active' // Only show available projects
        })
        .sort({ 'aiScores.overall': -1 }) // Top AI scores first
        .populate('innovator', 'name email');

        res.status(200).json({ success: true, data: recommendations });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Route: POST /api/companies/contact
// Purpose: Handles company clicking "Contact Innovator" & sends notifications
router.post('/contact', async (req, res) => {
    try {
        const { innovationId, companyName, actionType } = req.body; 
        // actionType can be 'view' or 'contact'

        const innovation = await Innovation.findById(innovationId).populate('innovator');

        if (!innovation) {
            return res.status(404).json({ success: false, message: "Innovation not found" });
        }

        const innovatorId = innovation.innovator._id;

        // Create a notification for the innovator
        let message = `Company ${companyName} viewed your innovation.`;
        if (actionType === 'contact') {
            message = `Company ${companyName} has requested to contact you regarding ${innovation.originalTitle}.`;
        }

        const newNotification = new Notification({
            recipient: innovatorId,
            senderCompanyName: companyName,
            type: actionType === 'contact' ? 'Contact' : 'View',
            message: message,
            innovationTitle: innovation.originalTitle
        });

        await newNotification.save();

        // Return innovator's contact details to the company
        res.status(200).json({
            success: true,
            message: "Notification sent to innovator.",
            contactDetails: {
                email: innovation.innovator.email || "innovator@example.com",
                phone: "+91 9876543210", // Mock phone
                linkedin: "https://linkedin.com/in/innovator-profile" // Mock LinkedIn
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;