import prisma from "../utils/prisma.js";
import { withRetry } from "../utils/retry.js";

export const getAllPublicSongs = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 25;
        const skip = (page - 1) * limit;

        const [songs, total] = await Promise.all([
            prisma.song.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: { artist: true }
            }),
            prisma.song.count()
        ]);

        return res.json({
            success: true,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            data: songs
        });

    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};


export const getPublicSong = async (req, res) => {
    try {
        const song = await withRetry(() =>
            prisma.song.findUnique({
                where: { id: Number(req.params.id) },
                include: { artist: true }
            })
        );

        if (!song) return res.status(404).json({ success: false, message: "Song not found" });

        return res.json({ success: true, data: song });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
