import prisma from "../utils/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { redis } from "../utils/redis.js";
import { withRetry } from "../utils/retry.js";

// Helper response 
const ok = (res, message, data) => res.status(200).json({ success: true, message, data });
const created = (res, message, data) => res.status(201).json({ success: true, message, data });
const fail = (res, status, message) => res.status(status).json({ success: false, message });

// REGISTER
export const register = async (req, res) => {
    try {
        const { username, email, phone, password } = req.body || {};

        if (!username || !password) {
            return fail(res, 400, "Username dan password wajib diisi");
        }

        const hashed = await bcrypt.hash(password, 10);

        const user = await withRetry(() =>
            prisma.user.create({
                data: {
                    username,
                    email,
                    phone,
                    password: hashed,
                    notificationSettings: { create: {} },
                    privacySettings: { create: {} },
                    authMethod: {
                            create: {
                            currentMethod: "email",
                            email: email,
                        },
                    },
                },
            })
        );

        const { password: _pw, ...safeUser } = user;
        return created(res, "Register success", { user: safeUser });
    } catch (err) {
        console.error("Register error:", err);
        if (err.code === "P2002") {
            return fail(res, 409, "Username atau email sudah digunakan");
        }
        return fail(res, 500, "Internal server error");
    }
};

// LOGIN
export const login = async (req, res) => {
    try {
        const { username, password } = req.body || {};

        if (!username || !password) {
            return fail(res, 400, "Username dan password wajib diisi");
        }

        const user = await withRetry(() =>
            prisma.user.findUnique({ where: { username } })
        );

        if (!user) return fail(res, 404, "User not found");

        const match = await bcrypt.compare(password, user.password);
        if (!match) return fail(res, 400, "Wrong password");

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });

        await withRetry(() =>
            redis.set(`session:${user.id}`, token, { ex: 86400 })
        );

        return ok(res, "Login success", { token });
        } catch (err) {
            console.error("Login error:", err);
        return fail(res, 500, "Internal server error");
    }
};
