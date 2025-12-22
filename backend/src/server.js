require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const { connectDB } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const researchRoutes = require('./routes/research');
const teamRoutes = require('./routes/team');
const courseRoutes = require('./routes/courses');
const openingRoutes = require('./routes/openings');
const fileRoutes = require('./routes/files');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:8080', 'http://127.0.0.1:8080'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (corsOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/login', (req, res, next) => {
    // Redirect for backward compatibility
    require('./controllers/authController').login(req, res, next);
});
app.use('/api/data/research', researchRoutes);
app.use('/api/data/team', teamRoutes);
app.use('/api/data/courses', courseRoutes);
app.use('/api/data/openings', openingRoutes);
app.use('/api/files', fileRoutes);

// Settings API
const Settings = require('./models/Settings');

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
                return require('./controllers/researchController').getResearch(req, res);
            case 'team':
                return require('./controllers/teamController').getTeam(req, res);
            case 'courses':
                return require('./controllers/courseController').getCourses(req, res);
            case 'openings':
                return require('./controllers/openingController').getOpenings(req, res);
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
                return require('./controllers/researchController').updateResearch(req, res);
            case 'team':
                return require('./controllers/teamController').updateTeam(req, res);
            case 'courses':
                return require('./controllers/courseController').updateCourses(req, res);
            case 'openings':
                return require('./controllers/openingController').updateOpenings(req, res);
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
    require('./controllers/fileController').uploadFile
);

// Legacy file list endpoint
app.get('/api/files/list', require('./controllers/fileController').listFiles);

// Legacy file delete endpoint
app.post('/api/delete-file', require('./controllers/fileController').deleteFile);

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

// Start server after database connection
const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`
╔═══════════════════════════════════════════════════════╗
║         DREAMRS Backend Server Started                ║
╠═══════════════════════════════════════════════════════╣
║  Port: ${PORT}                                          ║
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(38)}║
║  MongoDB: Connected                                   ║
╚═══════════════════════════════════════════════════════╝
      `);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
