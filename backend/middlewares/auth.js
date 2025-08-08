const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming you have a User model

class AuthMiddleware {
    // Authentication middleware - verifies JWT token
    static authenticate = async (req, res, next) => {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');
            
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Access denied. No token provided.'
                });
            }
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
             
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token or user inactive.'
                });
            }

            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
    };

    // Authorization middleware - checks user roles
    static authorize = (...roles) => {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required.'
                });
            }

            if (!roles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Insufficient permissions.'
                });
            }

            next();
        };
    };

    // Check if user owns the resource or is admin
    static checkOwnership = (req, res, next) => {
        const resourceUserId = req.params.id || req.params.userId;
        
        if (req.user.role === 'admin' || req.user.id == resourceUserId) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'Access denied. You can only access your own resources.'
        });
    };

    // Rate limiting middleware
    static rateLimit = (maxRequests = 10, windowMs = 15 * 60 * 1000) => {
        const requests = new Map();
        
        return (req, res, next) => {
            const key = req.ip;
            const now = Date.now();
            const windowStart = now - windowMs;
            
            if (!requests.has(key)) {
                requests.set(key, []);
            }
            
            const userRequests = requests.get(key);
            const validRequests = userRequests.filter(time => time > windowStart);
            
            if (validRequests.length >= maxRequests) {
                return res.status(429).json({
                    success: false,
                    message: 'Too many requests. Please try again later.'
                });
            }
            
            validRequests.push(now);
            requests.set(key, validRequests);
            next();
        };
    };
}

module.exports = AuthMiddleware;