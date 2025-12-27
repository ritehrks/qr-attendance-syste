import mongoose from 'mongoose';

const AssignmentSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    description: {
        type: String,
        default: ''
    },
    instructions: {
        type: String,
        default: ''
    },
    dueDate: {
        type: Date,
        required: [true, 'Please add a due date']
    },
    points: {
        type: Number,
        default: 0  // 0 = ungraded
    },
    attachments: [{
        type: {
            type: String,
            enum: ['LINK', 'FILE']
        },
        title: String,
        url: String,
        fileName: String,
        fileSize: Number
    }],
    allowLateSubmission: {
        type: Boolean,
        default: true
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    }
}, {
    timestamps: true
});

// Index for faster queries
AssignmentSchema.index({ course: 1, dueDate: 1 });

export default mongoose.model('Assignment', AssignmentSchema);
