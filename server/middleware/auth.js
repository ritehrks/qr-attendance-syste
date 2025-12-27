import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { Admin } from '../models/index.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Not authorized to access this route'
        });
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.admin = await Admin.findById(decoded.id);

        if (!req.admin) {
            return res.status(401).json({
                success: false,
                error: 'Admin not found'
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Not authorized to access this route'
        });
    }
};

// Generate JWT token
export const generateToken = (id) => {
    return jwt.sign({ id }, config.jwtSecret, {
        expiresIn: config.jwtExpire
    });
};
