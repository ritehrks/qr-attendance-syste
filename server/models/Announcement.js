import mongoose from 'mongoose';

const AnnouncementSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Please add content']
    },
    isPinned: {
        type: Boolean,
        default: false
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
AnnouncementSchema.index({ course: 1, isPinned: -1, createdAt: -1 });

export default mongoose.model('Announcement', AnnouncementSchema);
