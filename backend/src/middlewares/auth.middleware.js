import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

export const authUser = async (req, res, next) => {
    try {
        // Extract Token
        let token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        // Verify JWT Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find User
        const userId = decoded._id || decoded.id || decoded.userId;
        const user = await User.findById(userId);

        // If User Not Found
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User no longer exists' });
        }

        // Attach User to Request Object
        req.user = user;

        next();
    } catch (err) {
        console.error('Auth Middleware Error:', err.message);
        return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
    }
};

export default authUser;