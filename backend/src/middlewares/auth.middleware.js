import User from "../models/user.model.js";
import jwt from "jsonwebtoken";


async function authUser(req, res, next) {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET); // if valid then decoded = userId
        const user = await User.findById(decoded.userId);

        req.user = user;

        next();

    } catch (err) {
        res.status(401).json({ message: "Unauthorized" });
    }

}

export default { authUser };