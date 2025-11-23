import prisma from "../utils/prisma.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { redis } from "../utils/redis.js";
import { withRetry } from "../utils/retry.js";
import cloudinary from "../config/cloudinary.js";

// Helper response
const ok = (res, message, data) => res.status(200).json({ success: true, message, data });
const fail = (res, status, message) => res.status(status).json({ success: false, message });


// GET PROFILE
export const getProfile = async (req, res) => {
    try {
        const id = req.user.id;

        const user = await withRetry(() =>
            prisma.user.findUnique({
                where: { id },
                include: {
                notificationSettings: true,
                privacySettings: true,
                authMethod: true,
                favorites: true,
                recentlyPlayed: true,
                following: true,
                },
            })
        );

        if (!user) return fail(res, 404, "User not found");

        const { password: _pw, ...safeUser } = user;
        return ok(res, "Profile fetched", { user: safeUser });
    } catch (err) {
        console.error("Get profile error:", err);
        return fail(res, 500, "Internal server error");
    }
};


// UPDATE PROFILE
export const updateProfile = async (req, res) => {
    try {
        const id = req.user.id;
        const { username, email, gender, birthdate } = req.body || {};

        const updated = await withRetry(() =>
            prisma.user.update({
                where: { id },
                data: {
                username,
                email,
                gender,
                birthdate: birthdate ? new Date(birthdate) : undefined,
                },
            })
        );

        const { password: _pw, ...safeUser } = updated;
        return ok(res, "Profile updated", { user: safeUser });
    } catch (err) {
        console.error("Update profile error:", err);
        return fail(res, 500, "Internal server error");
    }
};


// UPDATE AVATAR
export const updateAvatar = async (req, res) => {
    try {
        if (!req.file) return fail(res, 400, "No file uploaded");

        const user = await withRetry(() =>
            prisma.user.findUnique({ where: { id: req.user.id } })
        );

        if (!user) return fail(res, 404, "User not found");

        // Hapus avatar lama
        if (user.avatarPublicId) {
            await cloudinary.uploader.destroy(user.avatarPublicId);
        }

        // Upload baru ke Cloudinary
        const result = await uploadToCloudinary(req.file, "users");

        const updated = await withRetry(() =>
            prisma.user.update({
                where: { id: req.user.id },
                data: {
                    avatarUrl: result.secure_url,
                    avatarPublicId: result.public_id,
                },
            })
        );

        const { password, ...safeUser } = updated;

        return ok(res, "Avatar updated successfully", safeUser);

    } catch (err) {
        console.error("Avatar update error:", err);
        return fail(res, 500, "Internal server error");
    }
};


// LOGOUT
export const logout = async (req, res) => {
    try {
        const id = req.user.id;

        await withRetry(() => redis.del(`session:${id}`));

        return ok(res, "Logout successful");
    } catch (err) {
        console.error("Logout error:", err);
        return fail(res, 500, "Internal server error");
    }
};
