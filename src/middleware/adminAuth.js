import jwt from "jsonwebtoken";
import { redis } from "../utils/redis.js";

// HELPER RESPONSES
const fail = (res, status, message) => res.status(status).json({ success: false, message });

export const adminAuth = async (req, res, next) => {
    try {
        const header = req.headers.authorization;

        if (!header) {
            return fail(res, 401, "No authorization header");
        }

        const parts = header.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return fail(res, 401, "Invalid auth header format");
        }

        const token = parts[1];

        // JWT VERIFICATION
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN, {
                algorithms: ["HS384"],
            });
        } catch (err) {
            return fail(res, 401, "Invalid or expired admin token");
        }

        if (!decoded.adminId) {
            return fail(res, 403, "Admin only access");
        }

        // SESSION CEK IN REDIS
        const cached = await redis.get(`admin_session:${decoded.adminId}`);
        if (!cached) {
            return fail(res, 401, "Admin session not found. Please login again.");
        }

        if (cached !== token) {
            return fail(res, 401, "Admin token mismatch. Please login again.");
        }

        // SET req.admin
        req.admin = decoded;

        next();
    } catch (err) {
        console.error("ADMIN AUTH ERROR:", err);
        return fail(res, 500, "Internal admin auth error");
    }
};
