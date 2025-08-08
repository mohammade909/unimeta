// routes/bannerRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const BannerController = require('../controllers/banner.controller');

const router = express.Router();
const bannerController = new BannerController();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/banners';

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, 'banner-' + uniqueSuffix + extension);
    }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
};

// Configure multer upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, 
    },
    fileFilter: fileFilter
});

// Middleware to handle multer errors
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 5MB.'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected field name for file upload.'
            });
        }
    }
    
    if (err.message.includes('Only image files are allowed')) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    
    next(err);
};

// Routes

/**
 * @route   POST /api/banners/upload
 * @desc    Upload a new banner
 * @access  Public (you can add authentication middleware here)
 * @body    title, description, alt_text, status, display_order
 * @file    image (required)
 */
router.post('/upload', 
    upload.single('image'), 
    handleMulterError,
    async (req, res) => {
        await bannerController.uploadBanner(req, res);
    }
);

/**
 * @route   GET /api/banners
 * @desc    Get all banners with pagination and filtering
 * @access  Public
 * @query   status, page, limit
 */
router.get('/', async (req, res) => {
    await bannerController.getBanners(req, res);
});

/**
 * @route   GET /api/banners/:id
 * @desc    Get banner by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    await bannerController.getBannerById(req, res);
});

/**
 * @route   PUT /api/banners/:id
 * @desc    Update banner
 * @access  Public (you can add authentication middleware here)
 * @body    title, description, alt_text, status, display_order
 * @file    image (optional)
 */
router.put('/:id', 
    upload.single('image'), 
    handleMulterError,
    async (req, res) => {
        await bannerController.updateBanner(req, res);
    }
);

/**
 * @route   DELETE /api/banners/:id
 * @desc    Delete banner
 * @access  Public (you can add authentication middleware here)
 */
router.delete('/:id', async (req, res) => {
    await bannerController.deleteBanner(req, res);
});

/**
 * @route   PATCH /api/banners/:id/toggle-status
 * @desc    Toggle banner status (active/inactive)
 * @access  Public (you can add authentication middleware here)
 */
router.patch('/:id/toggle-status', async (req, res) => {
    await bannerController.toggleBannerStatus(req, res);
});



// Error handling middleware for this router
router.use((error, req, res, next) => {
    console.error('❌ Banner route error:', error);
    
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

module.exports = router;