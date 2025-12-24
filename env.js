/**
 * Frontend Environment Configuration
 * 
 * This file contains environment variables for the frontend.
 * Update these values when deploying to production.
 */

window.ENV = {
    // API Base URL - Update this when deploying backend separately
    // For local development: 'http://localhost:5000'
    // For production: '' for same origin (Vercel deployment)
    API_BASE_URL: '',

    // Environment mode
    NODE_ENV: 'production',

    // Feature flags (optional)
    ENABLE_DEBUG: true
};

// Also set API_CONFIG for backward compatibility
window.API_CONFIG = {
    API_BASE_URL: window.ENV.API_BASE_URL
};

console.log(`[ENV] API configured: ${window.ENV.API_BASE_URL}`);
