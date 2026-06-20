const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Basic health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ message: "InnovationBridge API is running" });
});

// API Routes
app.use('/api/innovations', require('./routes/innovationRoutes'));
app.use('/api/companies', require('./routes/companyRoutes'));
app.use('/api/funding', require('./routes/fundingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/leaderboards', require('./routes/leaderboardRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});