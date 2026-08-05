import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
    return jwt.sign(
        { userId },process.env.JWT_SECRET,{ expiresIn: "7d"}
    );
};

export const setTokenCookie = (res, token) => {
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

export const clearTokenCookie = (res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });
};