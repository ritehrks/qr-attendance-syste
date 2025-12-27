import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    rollNo: {
        type: String,
        required: [true, 'Please add roll number'],
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Please add student name'],
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    // Which admin uploaded this student
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    // Optional: group students by class/batch
    batch: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Ensure roll number is unique per admin
studentSchema.index({ rollNo: 1, createdBy: 1 }, { unique: true });

export default mongoose.model('Student', studentSchema);
