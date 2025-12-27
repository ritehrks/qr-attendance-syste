import express from 'express';
import { Course, Announcement } from '../models/index.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/courses/:id/announcements
// @desc    Post an announcement
// @access  Private (Admin)
router.post('/:id/announcements', protect, async (req, res) => {
    try {
        const { content, isPinned } = req.body;

        const course = await Course.findOne({
            _id: req.params.id,
            createdBy: req.admin._id
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }

        const announcement = await Announcement.create({
            course: course._id,
            content,
            isPinned: isPinned || false,
            createdBy: req.admin._id
        });

        res.status(201).json({
            success: true,
            data: announcement
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/courses/:id/announcements
// @desc    Get all announcements for a course
// @access  Public
router.get('/:id/announcements', async (req, res) => {
    try {
        const announcements = await Announcement.find({ course: req.params.id })
            .sort({ isPinned: -1, createdAt: -1 })
            .populate('createdBy', 'name');

        res.json({
            success: true,
            data: announcements
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   PUT /api/announcements/:id
// @desc    Update an announcement
// @access  Private (Admin)
router.put('/:id', protect, async (req, res) => {
    try {
        const { content, isPinned } = req.body;

        const announcement = await Announcement.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.admin._id },
            { content, isPinned },
            { new: true }
        );

        if (!announcement) {
            return res.status(404).json({
                success: false,
                error: 'Announcement not found'
            });
        }

        res.json({
            success: true,
            data: announcement
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   DELETE /api/announcements/:id
// @desc    Delete an announcement
// @access  Private (Admin)
router.delete('/:id', protect, async (req, res) => {
    try {
        const announcement = await Announcement.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.admin._id
        });

        if (!announcement) {
            return res.status(404).json({
                success: false,
                error: 'Announcement not found'
            });
        }

        res.json({
            success: true,
            message: 'Announcement deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
