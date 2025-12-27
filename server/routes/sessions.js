import express from 'express';
import QRCode from 'qrcode';
import { Session } from '../models/index.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/sessions
// @desc    Create a new session
// @access  Private (Admin)
router.post('/', protect, async (req, res) => {
    try {
        const { courseName, description, centerLat, centerLng, radius, startTime, endTime, lateThreshold } = req.body;

        const session = await Session.create({
            courseName,
            description,
            centerLat,
            centerLng,
            radius: radius || 50,
            startTime,
            endTime,
            lateThreshold: lateThreshold || 15,
            createdBy: req.admin._id
        });

        res.status(201).json({
            success: true,
            data: session
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/sessions
// @desc    Get all sessions for logged-in admin
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const sessions = await Session.find({ createdBy: req.admin._id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: sessions.length,
            data: sessions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/sessions/:id
// @desc    Get single session
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);

        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        res.json({
            success: true,
            data: session
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/sessions/:id/qr
// @desc    Get dynamic QR code for session
// @access  Private (displayed by professor)
router.get('/:id/qr', protect, async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);

        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        // Refresh QR token if expired
        if (new Date() >= session.qrExpiresAt) {
            await session.refreshQRToken();
        }

        // Generate QR code URL
        // The QR contains: baseUrl/attend?session=ID&token=TOKEN
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const qrData = `${baseUrl}/attend?session=${session._id}&token=${session.qrToken}`;

        const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
            width: 400,
            margin: 2,
            color: {
                dark: '#1a1a2e',
                light: '#ffffff'
            }
        });

        res.json({
            success: true,
            data: {
                qrCode: qrCodeDataUrl,
                qrToken: session.qrToken,
                expiresAt: session.qrExpiresAt,
                sessionId: session._id
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/sessions/:id/static-qr
// @desc    Get static QR code (no expiry token) for printing/sharing
// @access  Private
router.get('/:id/static-qr', protect, async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);

        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        // Generate static QR code URL without token
        // Students will need to enter details manually or login
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const qrData = `${baseUrl}/attend?session=${session._id}&static=true`;

        const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
            width: 400,
            margin: 2,
            color: {
                dark: '#1a1a2e',
                light: '#ffffff'
            }
        });

        res.json({
            success: true,
            data: {
                qrCode: qrCodeDataUrl,
                sessionId: session._id,
                courseName: session.courseName
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/sessions/:id/refresh-qr
// @desc    Manually refresh QR token
// @access  Private
router.post('/:id/refresh-qr', protect, async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);

        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        await session.refreshQRToken();

        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const qrData = `${baseUrl}/attend?session=${session._id}&token=${session.qrToken}`;

        const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
            width: 400,
            margin: 2
        });

        res.json({
            success: true,
            data: {
                qrCode: qrCodeDataUrl,
                qrToken: session.qrToken,
                expiresAt: session.qrExpiresAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   PUT /api/sessions/:id
// @desc    Update session (location, isActive, times, etc.)
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);

        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        // Check ownership
        if (session.createdBy.toString() !== req.admin._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this session'
            });
        }

        // Fields that can be updated
        const { centerLat, centerLng, radius, isActive, startTime, endTime, lateThreshold, description } = req.body;

        if (centerLat !== undefined) session.centerLat = centerLat;
        if (centerLng !== undefined) session.centerLng = centerLng;
        if (radius !== undefined) session.radius = radius;
        if (isActive !== undefined) session.isActive = isActive;
        if (startTime !== undefined) session.startTime = startTime;
        if (endTime !== undefined) session.endTime = endTime;
        if (lateThreshold !== undefined) session.lateThreshold = lateThreshold;
        if (description !== undefined) session.description = description;

        await session.save();

        res.json({
            success: true,
            data: session
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   DELETE /api/sessions/:id
// @desc    Delete session
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);

        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        await session.deleteOne();

        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
