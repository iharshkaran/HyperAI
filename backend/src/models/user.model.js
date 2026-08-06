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
                required: [true, 'First name is required'],
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
            select: false, // Hide password in default queries for security
        },
        avatar: {
            type: String,
            default: '',
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        otp: {
            type: String,
            select: false, // Hide OTP in default queries
        },
        otpExpires: {
            type: Date,
            select: false, // Hide OTP expiration in default queries
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model('User', userSchema);

export default User;