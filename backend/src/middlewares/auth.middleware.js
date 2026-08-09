import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

export const authUser = async (req, res, next) => {
    try {
        // 1. Try to get token from cookies first
        let token = req.cookies?.token;

        // 2. if not found in cookie then check Authorization header
        if (!token) {
            const authHeader = req.headers.authorization; // "Bearer eyJhbGci..."
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1]; // Remove "Bearer " to get the actual token
            }
        }

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        // Verify JWT Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find User
        const userId = decoded._id || decoded.id || decoded.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User no longer exists' });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('Auth Middleware Error:', err.message);
        return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
    }
};

export default authUser;