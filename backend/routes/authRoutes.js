const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { sendWelcomeEmail } = require('../services/emailService');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper function to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

// Route: POST /api/auth/register
// Purpose: Standard Email/Password Signup
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, industry } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ success: false, message: 'User already exists' });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'Innovator',
            industry
        });

        // Send Welcome Email asynchronously
        sendWelcomeEmail(user.email, user.name);

        res.status(201).json({
            success: true,
            token: generateToken(user._id),
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Route: POST /api/auth/login
// Purpose: Standard Email/Password Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

        res.status(200).json({
            success: true,
            token: generateToken(user._id),
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Route: POST /api/auth/google
// Purpose: Google One-Tap / OAuth Login & Signup
router.post('/google', async (req, res) => {
    try {
        const { credential, role } = req.body; // Google sends a 'credential' JWT token

        // Verify token with Google
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        const { name, email, sub: googleId } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            // Create new user if they don't exist
            const randomPassword = await bcrypt.hash(googleId + process.env.JWT_SECRET, 10); // Dummy password for schema validation
            user = await User.create({
                name,
                email,
                password: randomPassword,
                role: role || 'Innovator',
                verified: true // Google users are pre-verified via email
            });
            sendWelcomeEmail(user.email, user.name);
        }

        res.status(200).json({
            success: true,
            token: generateToken(user._id),
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(401).json({ success: false, message: 'Google Authentication failed' });
    }
});

module.exports = router;