const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Load env vars
dotenv.config();

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// Compression middleware
app.use(compression());

// Rate limiting (reduced for free tier)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 requests per windowMs (reduced for free tier)
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Middleware
app.use(express.json({ limit: '5mb' })); // Reduced for free tier
app.use(express.urlencoded({ extended: true, limit: '5mb' })); // Reduced for free tier
app.use(cookieParser());

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:5173'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Create uploads directory if it doesn't exist (for both dev and production)
const uploadsDir = path.join(__dirname, 'uploads');
const eventBannersDir = path.join(uploadsDir, 'event-banners');
const profileImagesDir = path.join(uploadsDir, 'profile-images');

if (!require('fs').existsSync(uploadsDir)) {
    require('fs').mkdirSync(uploadsDir);
}
if (!require('fs').existsSync(eventBannersDir)) {
    require('fs').mkdirSync(eventBannersDir);
}
if (!require('fs').existsSync(profileImagesDir)) {
    require('fs').mkdirSync(profileImagesDir);
}

// Serve uploaded files (both development and production)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        memory: process.memoryUsage(),
        storage: {
            uploadsDir: uploadsDir,
            eventBannersDir: eventBannersDir,
            profileImagesDir: profileImagesDir
        }
    });
});

// Test API endpoint
// app.get('/test', (req, res) => {
//     res.status(200).json({
//         message: 'GatherGuru API is working!',
//         timestamp: new Date().toISOString(),
//         server: 'GatherGuru Backend',
//         version: '1.0.0',
//         status: 'success'
//     });
// });

// Simple test endpoint
app.get('/api/test', (req, res) => {
    res.status(200).json({
        message: 'API endpoint is working!',
        data: {
            test: true,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        }
    });
});

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gatherguru', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

connectDB();

// Routes
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api', require('./routes/authRoutes'));
app.use('/api/organizer', require('./routes/organizerRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));

// Serve static files in production (if needed)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../Frontend/dist')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../Frontend/dist/index.html'));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // Handle CORS errors
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            message: 'CORS policy violation'
        });
    }
    
    res.status(500).json({
        success: false,
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Handle 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`Health check available at: http://localhost:${PORT}/health`);
    console.log(`Uploads directory: ${uploadsDir}`);
}); 