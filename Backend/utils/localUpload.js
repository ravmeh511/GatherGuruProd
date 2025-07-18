const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure local storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = 'uploads/';
        
        // Determine upload directory based on file type
        if (file.fieldname === 'eventBanner') {
            uploadPath += 'event-banners/';
        } else if (file.fieldname === 'profileImage') {
            uploadPath += 'profile-images/';
        } else {
            uploadPath += 'general/';
        }
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, name + '-' + uniqueSuffix + ext);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Allow only images
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

// Multer configuration for local storage
const localMulter = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit for free tier
    },
    fileFilter: fileFilter
});

// Generate local URL
const getLocalUrl = (filename, folder = 'uploads') => {
    return `/uploads/${folder}/${filename}`;
};

// Delete local file
const deleteLocalFile = (filepath) => {
    try {
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting local file:', error);
        return false;
    }
};

// Get file size
const getFileSize = (filepath) => {
    try {
        const stats = fs.statSync(filepath);
        return stats.size;
    } catch (error) {
        console.error('Error getting file size:', error);
        return 0;
    }
};

// Get upload directory size (for monitoring)
const getUploadDirSize = (dir = 'uploads') => {
    try {
        const getSize = (path) => {
            const stats = fs.statSync(path);
            if (stats.isDirectory()) {
                const files = fs.readdirSync(path);
                return files.reduce((size, file) => {
                    return size + getSize(path + '/' + file);
                }, 0);
            }
            return stats.size;
        };
        return getSize(dir);
    } catch (error) {
        console.error('Error getting upload directory size:', error);
        return 0;
    }
};

// Clean up old files (optional maintenance function)
const cleanupOldFiles = (dir = 'uploads', maxAge = 30 * 24 * 60 * 60 * 1000) => {
    try {
        const cleanup = (path) => {
            const stats = fs.statSync(path);
            if (stats.isDirectory()) {
                const files = fs.readdirSync(path);
                files.forEach(file => {
                    cleanup(path + '/' + file);
                });
            } else {
                const age = Date.now() - stats.mtime.getTime();
                if (age > maxAge) {
                    fs.unlinkSync(path);
                    console.log(`Deleted old file: ${path}`);
                }
            }
        };
        cleanup(dir);
    } catch (error) {
        console.error('Error cleaning up old files:', error);
    }
};

module.exports = {
    localMulter,
    getLocalUrl,
    deleteLocalFile,
    getFileSize,
    getUploadDirSize,
    cleanupOldFiles
}; 