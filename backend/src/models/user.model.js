import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true
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
    }
},{
    timestamps: true
})

const User = mongoose.model("User", userSchema);

export default User;