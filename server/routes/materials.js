import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Course, Material, CourseEnrollment } from '../models/index.js';
import { protect } from '../middleware/auth.js';
import { uploadMaterial, handleUploadError } from '../middleware/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// @route   POST /api/courses/:id/materials
// @desc    Add a link material
// @access  Private (Admin)
router.post('/:id/materials', protect, async (req, res) => {
    try {
        const { title, description, url, topic } = req.body;

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

        const material = await Material.create({
            course: course._id,
            title,
            description,
            type: 'LINK',
            url,
            topic,
            createdBy: req.admin._id
        });

        res.status(201).json({
            success: true,
            data: material
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/courses/:id/materials/upload
// @desc    Upload a file material
// @access  Private (Admin)
router.post('/:id/materials/upload', protect, uploadMaterial.single('file'), handleUploadError, async (req, res) => {
    try {
        const { title, description, topic } = req.body;

        const course = await Course.findOne({
            _id: req.params.id,
            createdBy: req.admin._id
        });

        if (!course) {
            // Delete uploaded file
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Please upload a file'
            });
        }

        const material = await Material.create({
            course: course._id,
            title: title || req.file.originalname,
            description,
            type: 'FILE',
            fileName: req.file.originalname,
            fileUrl: `/uploads/materials/${req.params.id}/${req.file.filename}`,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            topic,
            createdBy: req.admin._id
        });

        res.status(201).json({
            success: true,
            data: material
        });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/courses/:id/materials
// @desc    Get all materials for a course
// @access  Private (Admin or enrolled student)
router.get('/:id/materials', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }

        const materials = await Material.find({ course: course._id })
            .sort({ topic: 1, order: 1, createdAt: -1 });

        res.json({
            success: true,
            data: materials
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   DELETE /api/courses/:id/materials/:mid
// @desc    Delete a material
// @access  Private (Admin)
router.delete('/:id/materials/:mid', protect, async (req, res) => {
    try {
        const material = await Material.findOne({
            _id: req.params.mid,
            course: req.params.id,
            createdBy: req.admin._id
        });

        if (!material) {
            return res.status(404).json({
                success: false,
                error: 'Material not found'
            });
        }

        // Delete file if exists
        if (material.type === 'FILE' && material.fileUrl) {
            const filePath = path.join(__dirname, '..', material.fileUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await material.deleteOne();

        res.json({
            success: true,
            message: 'Material deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/courses/:id/materials/:mid/download
// @desc    Download a file and increment counter
// @access  Public (anyone with link)
router.get('/:id/materials/:mid/download', async (req, res) => {
    try {
        const material = await Material.findById(req.params.mid);

        if (!material || material.type !== 'FILE') {
            return res.status(404).json({
                success: false,
                error: 'File not found'
            });
        }

        // Increment download count
        material.downloadCount += 1;
        await material.save();

        const filePath = path.join(__dirname, '..', material.fileUrl);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: 'File not found on server'
            });
        }

        res.download(filePath, material.fileName);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
