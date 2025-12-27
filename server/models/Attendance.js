import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: true
    },
    studentName: {
        type: String,
        required: [true, 'Please add student name']
    },
    studentId: {
        type: String,
        required: [true, 'Please add student ID']
    },
    // Student's GPS coordinates
    latitude: {
        type: Number,
        required: [true, 'Please add latitude']
    },
    longitude: {
        type: Number,
        required: [true, 'Please add longitude']
    },
    // Calculated distance from center
    distance: {
        type: Number,
        required: true
    },
    // Device fingerprint for anti-cheating
    deviceFingerprint: {
        type: String,
        default: ''
    },
    // Attendance status
    status: {
        type: String,
        enum: ['PRESENT', 'LATE', 'INVALID'],
        required: true
    },
    // IP address (optional, for campus verification)
    ipAddress: {
        type: String,
        default: ''
    }
}, {
    timestamps: true // Auto adds createdAt (timestamp)
});

// Prevent duplicate attendance from same student in same session
attendanceSchema.index({ session: 1, studentId: 1 }, { unique: true });

// Prevent same device submitting multiple times per session
attendanceSchema.index({ session: 1, deviceFingerprint: 1 });

export default mongoose.model('Attendance', attendanceSchema);
