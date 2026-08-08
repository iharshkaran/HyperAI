import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please enter a valid email address',
            ],
        },
        fullName: {
            firstName: {
                type: String,
                required: [
                    function () {
                        return !this.googleId; // Agar googleId nahi hai tabhi required hoga
                    },
                    'First name is required',
                ],
                trim: true,
            },
            lastName: {
                type: String,
                default: '',
                trim: true,
            },
        },
        password: {
            type: String,
            select: false, // Hide password in default queries
        },
        avatar: {
            type: String,
            default: '',
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true, // Prevents duplicate key errors for non-Google users
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        otp: {
            type: String,
            select: false,
        },
        otpExpires: {
            type: Date,
            select: false,
        },
        resetPasswordToken: {
            type: String,
            select: false, // Added for security
        },
        resetPasswordExpires: {
            type: Date,
            select: false, // Added for security
        }
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model('User', userSchema);

export default User;