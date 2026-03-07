require('dotenv').config({ path: './backend/.env' });
const express = require('express');
const path = require('path');

// Initialize the main proxy application
const app = express();

// Load the exported Vercel serverless function (which is an Express app)
const backendApp = require('./api/index.js');

// Map API routes to the backend function
// Vercel routes /api/* to api/index.js. Since api/index.js defines endpoints with /api/ prefix, mount it conditionally.
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        return backendApp(req, res, next);
    }
    next();
});

// Mount static file serving for the frontend
app.use(express.static(__dirname));

// Send remaining routes to root (to behave like dest: /$1)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, req.path), (err) => {
        if (err) {
            res.status(404).send('Not found');
        }
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Unified Local Server is running at http://localhost:${PORT}`);
    console.log(`Backend is accessible at http://localhost:${PORT}/api/health`);
    console.log(`Frontend is accessible at http://localhost:${PORT}`);
});
