import express from 'express';
import { Student } from '../models/index.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/students/upload
// @desc    Upload students from CSV/JSON data
// @access  Private
router.post('/upload', protect, async (req, res) => {
    try {
        const { students, batch } = req.body;
        // students should be array: [{ rollNo: "123", name: "John" }, ...]

        if (!students || !Array.isArray(students) || students.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Please provide an array of students'
            });
        }

        const results = {
            added: 0,
            updated: 0,
            errors: []
        };

        for (const student of students) {
            if (!student.rollNo || !student.name) {
                results.errors.push(`Missing rollNo or name: ${JSON.stringify(student)}`);
                continue;
            }

            try {
                // Upsert: update if exists, create if not
                await Student.findOneAndUpdate(
                    { rollNo: student.rollNo.toString().trim(), createdBy: req.admin._id },
                    {
                        name: student.name.trim(),
                        email: student.email || '',
                        phone: student.phone || '',
                        batch: batch || student.batch || '',
                        createdBy: req.admin._id
                    },
                    { upsert: true, new: true }
                );
                results.added++;
            } catch (err) {
                results.errors.push(`Error for ${student.rollNo}: ${err.message}`);
            }
        }

        res.json({
            success: true,
            message: `Processed ${results.added} students`,
            data: results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/students
// @desc    Get all students for logged-in admin
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { batch, search } = req.query;

        let query = { createdBy: req.admin._id };

        if (batch) {
            query.batch = batch;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { rollNo: { $regex: search, $options: 'i' } }
            ];
        }

        const students = await Student.find(query).sort({ rollNo: 1 });

        // Get unique batches
        const batches = await Student.distinct('batch', { createdBy: req.admin._id });

        res.json({
            success: true,
            count: students.length,
            batches: batches.filter(b => b), // Remove empty strings
            data: students
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/students/:id
// @desc    Get single student
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const student = await Student.findOne({
            _id: req.params.id,
            createdBy: req.admin._id
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }

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

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const { name, email, phone, batch } = req.body;

        const student = await Student.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.admin._id },
            { name, email, phone, batch },
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }

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

// @route   DELETE /api/students/:id
// @desc    Delete student
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const student = await Student.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.admin._id
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }

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

// @route   DELETE /api/students/batch/:batch
// @desc    Delete all students in a batch
// @access  Private
router.delete('/batch/:batch', protect, async (req, res) => {
    try {
        const result = await Student.deleteMany({
            batch: req.params.batch,
            createdBy: req.admin._id
        });

        res.json({
            success: true,
            message: `Deleted ${result.deletedCount} students`,
            data: { deletedCount: result.deletedCount }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/students/lookup/:rollNo
// @desc    Find student by roll number (for autocomplete)
// @access  Private
router.get('/lookup/:rollNo', protect, async (req, res) => {
    try {
        const student = await Student.findOne({
            rollNo: req.params.rollNo,
            createdBy: req.admin._id
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }

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

export default router;
