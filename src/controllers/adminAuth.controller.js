import prisma from "../utils/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { redis } from "../utils/redis.js";
import { withRetry } from "../utils/retry.js";

// HELPER RESPONSE
const ok = (res, message, data) => res.status(200).json({ success: true, message, data });

const fail = (res, status, message) => res.status(status).json({ success: false, message });

export const adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body || {};

        if (!username || !password) {
            return fail(res, 400, "Username dan password wajib diisi");
        }

        const admin = await withRetry(() =>
            prisma.admin.findUnique({ where: { username } })
        );

        if (!admin) return fail(res, 404, "Admin not found");

        const match = await bcrypt.compare(password, admin.password);
        if (!match) return fail(res, 400, "Wrong password");

        // ADMIN JWT
        const token = jwt.sign(
            { adminId: admin.id },
                process.env.JWT_SECRET_ADMIN,
            {
                algorithm: "HS384",
                expiresIn: "6h",
            }
        );

        // SAVE ADMIN SESSION IN REDIS
        await withRetry(() =>
        redis.set(`admin_session:${admin.id}`, token, { ex: 6 * 3600 })
        );

        return ok(res, "Admin login success", { token });
    } catch (err) {
        console.error("Admin login error:", err);
        return fail(res, 500, "Internal server error");
    }
};


export const adminLogout = async (req, res) => {
    try {
        const adminId = req.admin.adminId;

        await withRetry(() =>
            redis.del(`admin_session:${adminId}`)
        );

        return ok(res, "Admin logout successful");
    } catch (err) {
        console.error("Admin logout error:", err);
        return fail(res, 500, "Internal server error");
    }
};
