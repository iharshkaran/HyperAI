import mongoose, { Schema } from "mongoose";

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
            required: true
        },
        lastName: {
            type: String,
            required: true
        }
    },

    password: {
        type: String
    },

    isVerified: {
        type: Boolean,
        default: false,
    },

    verificationToken: String,

    verificationTokenExpires: Date,

}, {
    timestamps: true
})

const User = mongoose.model("User", userSchema);

export default User;