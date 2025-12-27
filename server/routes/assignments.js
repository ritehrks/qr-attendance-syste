import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Course, Assignment, Submission, CourseEnrollment } from '../models/index.js';
import { protect } from '../middleware/auth.js';
import { protectStudent } from './studentAuth.js';
import { uploadSubmission, handleUploadError } from '../middleware/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// =====================
// ADMIN ROUTES
// =====================

// @route   POST /api/courses/:id/assignments
// @desc    Create assignment
// @access  Private (Admin)
router.post('/courses/:id/assignments', protect, async (req, res) => {
    try {
        const { title, description, instructions, dueDate, points, attachments, allowLateSubmission } = req.body;

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

        const assignment = await Assignment.create({
            course: course._id,
            title,
            description,
            instructions,
            dueDate: new Date(dueDate),
            points: points || 0,
            attachments: attachments || [],
            allowLateSubmission: allowLateSubmission !== false,
            createdBy: req.admin._id
        });

        res.status(201).json({
            success: true,
            data: assignment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/courses/:id/assignments
// @desc    Get all assignments for a course
// @access  Public (anyone can view)
router.get('/courses/:id/assignments', async (req, res) => {
    try {
        const assignments = await Assignment.find({ course: req.params.id })
            .sort({ dueDate: 1 });

        // Get submission counts
        const assignmentsWithStats = await Promise.all(assignments.map(async (assignment) => {
            const totalSubmissions = await Submission.countDocuments({
                assignment: assignment._id,
                status: { $in: ['SUBMITTED', 'GRADED'] }
            });

            return {
                ...assignment.toObject(),
                submissionCount: totalSubmissions
            };
        }));

        res.json({
            success: true,
            data: assignmentsWithStats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/assignments/:id
// @desc    Get assignment details
// @access  Public
router.get('/assignments/:id', async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id)
            .populate('course', 'courseCode courseName');

        if (!assignment) {
            return res.status(404).json({
                success: false,
                error: 'Assignment not found'
            });
        }

        res.json({
            success: true,
            data: assignment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   PUT /api/assignments/:id
// @desc    Update assignment
// @access  Private (Admin)
router.put('/assignments/:id', protect, async (req, res) => {
    try {
        const { title, description, instructions, dueDate, points, attachments, allowLateSubmission, isPublished } = req.body;

        const assignment = await Assignment.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.admin._id },
            { title, description, instructions, dueDate, points, attachments, allowLateSubmission, isPublished },
            { new: true }
        );

        if (!assignment) {
            return res.status(404).json({
                success: false,
                error: 'Assignment not found'
            });
        }

        res.json({
            success: true,
            data: assignment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   DELETE /api/assignments/:id
// @desc    Delete assignment
// @access  Private (Admin)
router.delete('/assignments/:id', protect, async (req, res) => {
    try {
        const assignment = await Assignment.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.admin._id
        });

        if (!assignment) {
            return res.status(404).json({
                success: false,
                error: 'Assignment not found'
            });
        }

        // Delete all submissions for this assignment
        await Submission.deleteMany({ assignment: assignment._id });

        res.json({
            success: true,
            message: 'Assignment deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/assignments/:id/submissions
// @desc    Get all submissions for an assignment (Admin)
// @access  Private (Admin)
router.get('/assignments/:id/submissions', protect, async (req, res) => {
    try {
        const assignment = await Assignment.findOne({
            _id: req.params.id,
            createdBy: req.admin._id
        });

        if (!assignment) {
            return res.status(404).json({
                success: false,
                error: 'Assignment not found'
            });
        }

        const submissions = await Submission.find({ assignment: assignment._id })
            .sort({ submittedAt: -1 });

        // Get enrolled count
        const enrolledCount = await CourseEnrollment.countDocuments({
            course: assignment.course,
            isActive: true
        });

        res.json({
            success: true,
            data: {
                enrolledCount,
                submissions
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   PUT /api/submissions/:id/grade
// @desc    Grade a submission
// @access  Private (Admin)
router.put('/submissions/:id/grade', protect, async (req, res) => {
    try {
        const { grade, feedback } = req.body;

        const submission = await Submission.findById(req.params.id)
            .populate({
                path: 'assignment',
                match: { createdBy: req.admin._id }
            });

        if (!submission || !submission.assignment) {
            return res.status(404).json({
                success: false,
                error: 'Submission not found'
            });
        }

        submission.grade = grade;
        submission.feedback = feedback || '';
        submission.status = 'GRADED';
        await submission.save();

        res.json({
            success: true,
            data: submission
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// =====================
// STUDENT ROUTES
// =====================

// @route   POST /api/assignments/:id/submit
// @desc    Submit work for an assignment
// @access  Private (Student)
router.post('/assignments/:id/submit', protectStudent, uploadSubmission.single('file'), handleUploadError, async (req, res) => {
    try {
        const { content } = req.body;
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({
                success: false,
                error: 'Assignment not found'
            });
        }

        // Check if already submitted
        let submission = await Submission.findOne({
            assignment: assignment._id,
            studentId: req.student.rollNo.toUpperCase()
        });

        const now = new Date();
        const isLate = now > new Date(assignment.dueDate);

        if (!assignment.allowLateSubmission && isLate) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                error: 'Late submission not allowed for this assignment'
            });
        }

        if (submission) {
            // Update existing submission
            submission.content = content || submission.content;
            if (req.file) {
                submission.attachments.push({
                    fileName: req.file.originalname,
                    fileUrl: `/uploads/submissions/${req.params.id}/${req.file.filename}`,
                    fileSize: req.file.size
                });
            }
            submission.status = 'SUBMITTED';
            submission.submittedAt = now;
            submission.isLate = isLate;
            await submission.save();
        } else {
            // Create new submission
            const attachments = req.file ? [{
                fileName: req.file.originalname,
                fileUrl: `/uploads/submissions/${req.params.id}/${req.file.filename}`,
                fileSize: req.file.size
            }] : [];

            submission = await Submission.create({
                assignment: assignment._id,
                studentId: req.student.rollNo.toUpperCase(),
                studentName: req.student.name,
                student: req.student._id,
                content: content || '',
                attachments,
                status: 'SUBMITTED',
                submittedAt: now,
                isLate
            });
        }

        res.status(201).json({
            success: true,
            data: submission
        });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/student/assignments/:id
// @desc    Get student's submission for an assignment
// @access  Private (Student)
router.get('/student/assignments/:id', protectStudent, async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id)
            .populate('course', 'courseCode courseName');

        if (!assignment) {
            return res.status(404).json({
                success: false,
                error: 'Assignment not found'
            });
        }

        const submission = await Submission.findOne({
            assignment: assignment._id,
            studentId: req.student.rollNo.toUpperCase()
        });

        res.json({
            success: true,
            data: {
                assignment,
                submission
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
