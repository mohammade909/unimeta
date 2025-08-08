const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/auth.controller');
const AuthMiddleware = require('../middlewares/auth');

const router = express.Router();

const registerValidation = [

    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 4 })
        .withMessage('Password must be at least 8 characters long')
        // .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('full_name')
        .isLength({ min: 2, max: 255 })
        .withMessage('Full name must be between 2 and 255 characters'),
    body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    body('country_code')
        .optional()
        .isLength({ min: 2, max: 5 })
        .withMessage('Country code must be 2 characters')
];

const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

const changePasswordValidation = [
    body('current_password')
        .notEmpty()
        .withMessage('Current password is required'),
    body('new_password')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

// Public routes
router.post('/register', AuthMiddleware.rateLimit(5), registerValidation, AuthController.register);
router.post('/login', AuthMiddleware.rateLimit(10), loginValidation, AuthController.login);
router.post('/admin/login', AuthMiddleware.rateLimit(10),  AuthController.adminLogin);
router.get('/verify-email/:token', AuthController.verifyEmail);

// Protected routes
router.use(AuthMiddleware.authenticate);
router.get('/profile', AuthController.getProfile);
router.post('/change-password', changePasswordValidation, AuthController.changePassword);
router.post('/logout', AuthController.logout);

module.exports = router;

// routes/users.js