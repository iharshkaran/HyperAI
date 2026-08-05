import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            default: "",
            trim: true
        }
    },
    password: {
        type: String
    },

    avatar: {
        type: String,
        default: ""
    },
    
    googleId: {
        type: String,
        unique: true,
        sparse: true 
    },
    isVerified: {
        type: Boolean,
        default: false,
    },

    verificationToken: String,
    verificationTokenExpires: Date,
}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema);

export default User;