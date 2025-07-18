const AWS = require('aws-sdk');
const multer = require('multer');
const path = require('path');

// Configure AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();
const bucketName = process.env.S3_BUCKET_NAME || 'gatherguru-uploads';

// Generate S3 URL
const getS3Url = (key) => {
    if (process.env.CLOUDFRONT_DISTRIBUTION_ID) {
        return `https://${process.env.CLOUDFRONT_DISTRIBUTION_ID}.cloudfront.net/${key}`;
    }
    return `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
};

// Upload file to S3
const uploadToS3 = async (file, folder = 'uploads') => {
    try {
        const key = `${folder}/${Date.now()}-${path.basename(file.originalname)}`;
        
        const params = {
            Bucket: bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read',
            Metadata: {
                originalName: file.originalname
            }
        };

        const result = await s3.upload(params).promise();
        return {
            url: getS3Url(key),
            key: key,
            originalName: file.originalname
        };
    } catch (error) {
        console.error('S3 upload error:', error);
        throw new Error('Failed to upload file to S3');
    }
};

// Delete file from S3
const deleteFromS3 = async (key) => {
    try {
        const params = {
            Bucket: bucketName,
            Key: key
        };

        await s3.deleteObject(params).promise();
        return true;
    } catch (error) {
        console.error('S3 delete error:', error);
        throw new Error('Failed to delete file from S3');
    }
};

// Multer configuration for S3
const s3Multer = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow only images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

module.exports = {
    uploadToS3,
    deleteFromS3,
    s3Multer,
    getS3Url
}; 