import prisma from "../utils/prisma.js";
import { withRetry } from "../utils/retry.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import cloudinary from "../config/cloudinary.js";

const ok = (res, msg, data) => res.status(200).json({ success: true, message: msg, data });
const created = (res, msg, data) => res.status(201).json({ success: true, message: msg, data });
const fail = (res, code, msg) => res.status(code).json({ success: false, message: msg });


// CREATE ARTIST
export const createArtist = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) return fail(res, 400, "Artist name is required");

        const artist = await withRetry(() =>
            prisma.artist.create({
                data: {
                    name,
                    description,
                },
            })
        );

        return created(res, "Artist created", artist);
    } catch (err) {
        return fail(res, 500, err.message);
    }
};


// GET ALL ARTISTS
export const getAllArtists = async (req, res) => {
    try {
        const artists = await withRetry(() =>
            prisma.artist.findMany({
                orderBy: { createdAt: "desc" },
                include: { songs: true },
            })
        );

        return ok(res, "All artists fetched", artists);
    } catch (err) {
        return fail(res, 500, err.message);
    }
};


// GET ONE ARTIST
export const getArtist = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const artist = await withRetry(() =>
            prisma.artist.findUnique({
                where: { id },
                include: { songs: true },
            })
        );

        if (!artist) return fail(res, 404, "Artist not found");

        return ok(res, "Artist fetched", artist);
    } catch (err) {
        return fail(res, 500, err.message);
    }
};


// UPDATE ARTIST
export const updateArtist = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, description } = req.body;

        const updated = await withRetry(() =>
            prisma.artist.update({
                where: { id },
                data: { name, description },
            })
        );

        return ok(res, "Artist updated", updated);
    } catch (err) {
        return fail(res, 500, err.message);
    }
};


// UPDATE ARTIST AVATAR
export const updateArtistAvatar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!req.file) return fail(res, 400, "No file uploaded");

        const artist = await withRetry(() =>
            prisma.artist.findUnique({ where: { id } })
        );

        if (!artist) return fail(res, 404, "Artist not found");

        // Hapus avatar lama
        if (artist.avatarPublicId) {
            await cloudinary.uploader.destroy(artist.avatarPublicId);
        }

        // Upload baru
        const result = await uploadToCloudinary(req.file, "artists");

        const updated = await withRetry(() =>
            prisma.artist.update({
                where: { id },
                data: {
                    avatarUrl: result.secure_url,
                    avatarPublicId: result.public_id,
                },
            })
        );

        return ok(res, "Artist avatar updated", updated);

    } catch (err) {
        console.error("Artist avatar update error:", err);
        return fail(res, 500, "Internal server error");
    }
};


// DELETE ARTIST
export const deleteArtist = async (req, res) => {
    try {
        const id = Number(req.params.id);

        await withRetry(() =>
            prisma.artist.delete({ where: { id } })
        );

        return ok(res, "Artist deleted");
    } catch (err) {
        return fail(res, 500, err.message);
    }
};

