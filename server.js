const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    }
});
app.use(limiter);

// CORS - Allow frontend to access backend
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running securely! 🔒',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

//test route
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'Backend is working! ✅',
        data: {
            server: 'online',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            database: 'Check MongoDB connection ',
            time: new Date().toISOString
        }
    });
});

// Handle undefined routes
app.all('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found on this server`
    });
});

//error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'An unexpected error occurred on the server.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Secure Server running on port ${PORT}`);
    console.log(`🔒 Environment: ${process.env.NODE_ENV}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Backend API ready for frontend connections`);
});