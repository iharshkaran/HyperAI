import jwt from "jsonwebtoken";

// Generate JWT Token
export const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};


// Set Token Cookie
export const setTokenCookie = (res, token) => {

    const isProduction = process.env.NODE_ENV === "production" || process.env.BACKEND_URL?.includes("render.com");

    res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};


// Clear Token Cookie
export const clearTokenCookie = (res) => {
    const isProduction = process.env.NODE_ENV === "production" || process.env.BACKEND_URL?.includes("render.com");

    res.clearCookie("token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
    });
};