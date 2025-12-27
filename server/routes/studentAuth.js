import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { StudentUser, Attendance } from '../models/index.js';
import config from '../config/index.js';
import { sendPasswordResetEmail } from '../utils/email.js';

const router = express.Router();

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id, type: 'student' }, config.jwtSecret, {
        expiresIn: config.jwtExpire
    });
};

// Protect student routes middleware
export const protectStudent = async (req, res, next) => {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret);

        if (decoded.type !== 'student') {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        req.student = await StudentUser.findById(decoded.id);
        if (!req.student) {
            return res.status(401).json({ success: false, error: 'Student not found' });
        }
        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Not authorized' });
    }
};

// @route   POST /api/student-auth/register
// @desc    Register student
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { rollNo, name, email, password, phone, batch } = req.body;

        // Check if already exists
        const existingEmail = await StudentUser.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                error: 'Email already registered'
            });
        }

        const existingRoll = await StudentUser.findOne({ rollNo });
        if (existingRoll) {
            return res.status(400).json({
                success: false,
                error: 'Roll number already registered'
            });
        }

        // Create student
        const student = await StudentUser.create({
            rollNo,
            name,
            email,
            password,
            phone: phone || '',
            batch: batch || ''
        });

        const token = generateToken(student._id);

        res.status(201).json({
            success: true,
            data: {
                _id: student._id,
                rollNo: student.rollNo,
                name: student.name,
                email: student.email,
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/student-auth/login
// @desc    Login student
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide email and password'
            });
        }

        const student = await StudentUser.findOne({ email }).select('+password');
        if (!student) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const isMatch = await student.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const token = generateToken(student._id);

        res.json({
            success: true,
            data: {
                _id: student._id,
                rollNo: student.rollNo,
                name: student.name,
                email: student.email,
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/student-auth/me
// @desc    Get current student profile
// @access  Private
router.get('/me', protectStudent, async (req, res) => {
    res.json({
        success: true,
        data: req.student
    });
});

// @route   PUT /api/student-auth/profile
// @desc    Update student profile
// @access  Private
router.put('/profile', protectStudent, async (req, res) => {
    try {
        const { name, phone, batch } = req.body;

        const student = await StudentUser.findByIdAndUpdate(
            req.student._id,
            { name, phone, batch },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            data: student
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   PUT /api/student-auth/password
// @desc    Change password (with current password)
// @access  Private
router.put('/password', protectStudent, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Please provide current and new password'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'New password must be at least 6 characters'
            });
        }

        const student = await StudentUser.findById(req.student._id).select('+password');

        const isMatch = await student.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                error: 'Current password is incorrect'
            });
        }

        student.password = newPassword;
        await student.save();

        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/student-auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        const student = await StudentUser.findOne({ email });
        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'No account found with this email'
            });
        }

        // Generate reset token
        const resetToken = student.getResetPasswordToken();
        await student.save({ validateBeforeSave: false });

        // Create reset URL
        const resetUrl = `${config.frontendUrl}/reset-password/${resetToken}`;

        // Send email
        const emailSent = await sendPasswordResetEmail(student.email, resetUrl, student.name);

        if (!emailSent) {
            student.resetPasswordToken = undefined;
            student.resetPasswordExpire = undefined;
            await student.save({ validateBeforeSave: false });

            return res.status(500).json({
                success: false,
                error: 'Email could not be sent. Please try again later.'
            });
        }

        res.json({
            success: true,
            message: 'Password reset email sent'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   PUT /api/student-auth/reset-password/:token
// @desc    Reset password with token
// @access  Public
router.put('/reset-password/:token', async (req, res) => {
    try {
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters'
            });
        }

        // Hash the token from URL
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const student = await StudentUser.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!student) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired reset token'
            });
        }

        // Set new password
        student.password = password;
        student.resetPasswordToken = undefined;
        student.resetPasswordExpire = undefined;
        await student.save();

        res.json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/student-auth/attendance
// @desc    Get student's attendance history
// @access  Private
router.get('/attendance', protectStudent, async (req, res) => {
    try {
        const attendance = await Attendance.find({
            studentId: req.student.rollNo
        })
            .populate('session', 'courseName description startTime')
            .sort({ createdAt: -1 });

        // Calculate stats
        const stats = {
            total: attendance.length,
            present: attendance.filter(a => a.status === 'PRESENT').length,
            late: attendance.filter(a => a.status === 'LATE').length,
            invalid: attendance.filter(a => a.status === 'INVALID').length
        };

        res.json({
            success: true,
            stats,
            data: attendance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
