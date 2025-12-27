import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentUser'
    },
    studentId: {
        type: String,
        required: [true, 'Student ID is required'],
        uppercase: true
    },
    studentName: {
        type: String,
        required: true
    },
    // Text response
    content: {
        type: String,
        default: ''
    },
    // File attachments
    attachments: [{
        fileName: String,
        fileUrl: String,
        fileSize: Number,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['DRAFT', 'SUBMITTED', 'GRADED', 'RETURNED'],
        default: 'DRAFT'
    },
    submittedAt: {
        type: Date
    },
    isLate: {
        type: Boolean,
        default: false
    },
    grade: {
        type: Number,
        default: null
    },
    feedback: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Compound index: one submission per student per assignment
SubmissionSchema.index({ assignment: 1, studentId: 1 }, { unique: true });

export default mongoose.model('Submission', SubmissionSchema);
