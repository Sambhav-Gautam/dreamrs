// Vercel Serverless Function Entry Point
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Import the database connection that initializes GridFS
const { connectDB } = require('../backend/src/config/database');

// Import routes
const authRoutes = require('../backend/src/routes/auth');
const researchRoutes = require('../backend/src/routes/research');
const teamRoutes = require('../backend/src/routes/team');
const courseRoutes = require('../backend/src/routes/courses');
const openingRoutes = require('../backend/src/routes/openings');
const fileRoutes = require('../backend/src/routes/files');
const phdRoutes = require('../backend/src/routes/phd');
const Settings = require('../backend/src/models/Settings');

const app = express();

// CORS Configuration for Vercel
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow Vercel preview deployments and production
        if (
            origin.includes('.vercel.app') ||
            origin.includes('localhost') ||
            origin.includes('127.0.0.1') ||
            process.env.CORS_ORIGINS?.split(',').includes(origin)
        ) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all for now, restrict in production if needed
        }
    },
    credentials: true
}));

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Database connection middleware
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/login', (req, res, next) => {
    require('../backend/src/controllers/authController').login(req, res, next);
});
app.use('/api/data/research', researchRoutes);
app.use('/api/data/team', teamRoutes);
app.use('/api/data/courses', courseRoutes);
app.use('/api/data/openings', openingRoutes);
app.use('/api/data/phd', phdRoutes);
app.use('/api/files', fileRoutes);

// Settings API
app.get('/api/settings', async (req, res) => {
    try {
        const settings = await Settings.find({});
        const result = {};
        settings.forEach(s => { result[s.key] = s.value; });
        res.json(result);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

app.put('/api/settings', async (req, res) => {
    try {
        const { key, value } = req.body;
        await Settings.findOneAndUpdate(
            { key },
            { key, value },
            { upsert: true, new: true }
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Legacy API compatibility endpoints
app.get('/api/data/:section', async (req, res) => {
    const { section } = req.params;

    try {
        switch (section) {
            case 'research':
                return require('../backend/src/controllers/researchController').getResearch(req, res);
            case 'team':
                return require('../backend/src/controllers/teamController').getTeam(req, res);
            case 'courses':
                return require('../backend/src/controllers/courseController').getCourses(req, res);
            case 'openings':
                return require('../backend/src/controllers/openingController').getOpenings(req, res);
            case 'phd':
                return require('../backend/src/controllers/phdController').getPhd(req, res);
            default:
                return res.status(404).json({ error: 'Section not found' });
        }
    } catch (error) {
        console.error('Error in legacy endpoint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/data/:section', async (req, res) => {
    const { section } = req.params;

    try {
        switch (section) {
            case 'research':
                return require('../backend/src/controllers/researchController').updateResearch(req, res);
            case 'team':
                return require('../backend/src/controllers/teamController').updateTeam(req, res);
            case 'courses':
                return require('../backend/src/controllers/courseController').updateCourses(req, res);
            case 'openings':
                return require('../backend/src/controllers/openingController').updateOpenings(req, res);
            case 'phd':
                return require('../backend/src/controllers/phdController').updatePhd(req, res);
            default:
                return res.status(404).json({ error: 'Section not found' });
        }
    } catch (error) {
        console.error('Error in legacy endpoint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Legacy file upload endpoint
app.post('/api/upload',
    require('multer')({ storage: require('multer').memoryStorage() }).single('file'),
    require('../backend/src/controllers/fileController').uploadFile
);

// Legacy file list endpoint
app.get('/api/files/list', require('../backend/src/controllers/fileController').listFiles);

// Legacy file delete endpoint
app.post('/api/delete-file', require('../backend/src/controllers/fileController').deleteFile);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Export for Vercel
module.exports = app;
