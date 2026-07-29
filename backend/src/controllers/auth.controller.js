import express from "express";
import User from "../models/user.model.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


async function registerController(req, res) {
    const { fullName: { firstName, lastName }, email, password } = req.body;

    const isUserAlreadyExists = await User.findOne({ email });

    if (isUserAlreadyExists) {
        return res.status(400).json({ message: "User already exists" })
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        email,
        fullName: {
            firstName, lastName
        },
        password: hashPassword
    })

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token);

    res.status(201).json({
        message: "User registered successfully",
        user: {
            _id: user._id,
            email: user.email,
            fullName: user.fullName
        }
    });
}

async function loginController(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" })
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.cookie("token", token);

    res.status(200).json({
        message: "User Logged in successfully",
        user: {
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
        }
    })
}

export default {
    registerController,
    loginController
};