import mongoose from 'mongoose';

const MaterialSchema = new mongoose.Schema({
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
    type: {
        type: String,
        enum: ['LINK', 'FILE'],
        required: true
    },
    // For links
    url: {
        type: String
    },
    // For files
    fileName: {
        type: String
    },
    fileUrl: {
        type: String
    },
    fileSize: {
        type: Number
    },
    mimeType: {
        type: String
    },
    // Organization
    topic: {
        type: String,
        default: ''
    },
    order: {
        type: Number,
        default: 0
    },
    // Stats
    downloadCount: {
        type: Number,
        default: 0
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
MaterialSchema.index({ course: 1, order: 1 });

export default mongoose.model('Material', MaterialSchema);
