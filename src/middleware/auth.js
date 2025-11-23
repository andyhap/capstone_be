import jwt from "jsonwebtoken";
import { redis } from "../utils/redis.js";

export const auth = async (req, res, next) => {
    try {
        const header = req.headers.authorization;

        if (!header) {
            return res.status(401).json({
                success: false,
                message: "No authorization header"
            });
        }

        const token = header.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

        // JWT VERIFICATION
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        // SESSION CEK IN REDIS
        const cached = await redis.get(`session:${decoded.id}`);
        if (!cached) {
            return res.status(401).json({
                success: false,
                message: "Session not found. Please login again."
            });
        }

        if (cached !== token) {
            return res.status(401).json({
                success: false,
                message: "Token mismatch. Please login again."
            });
        }

        // SET req.user
        req.user = decoded;

        next();

    } catch (err) {
        console.error("AUTH ERROR:", err);
        return res.status(500).json({
            success: false,
            message: "Internal authentication error"
        });
    }
};
