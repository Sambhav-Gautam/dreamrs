const jwt = require('jsonwebtoken');

// Simple in-memory token validation
// In production, use proper JWT with expiration
const generateToken = (userId) => {
    return `admin-token-${Date.now()}`;
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'password';

        if (username === adminUsername && password === adminPassword) {
            const token = generateToken(username);
            res.json({
                success: true,
                token,
                message: 'Login successful'
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

exports.verifyToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token || !token.startsWith('admin-token-')) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        res.json({
            success: true,
            message: 'Token is valid'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Token verification failed'
        });
    }
};
