import prisma from "../utils/prisma.js";
import { withRetry } from "../utils/retry.js";

export const getAllPublicArtists = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 25;
        const skip = (page - 1) * limit;

        const [artists, total] = await Promise.all([
            prisma.artist.findMany({
                skip,
                take: limit,
                orderBy: { name: "asc" }
            }),
            prisma.artist.count()
        ]);

        return res.json({
            success: true,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            data: artists
        });

    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};


export const getPublicArtist = async (req, res) => {
    try {
        const artist = await withRetry(() =>
            prisma.artist.findUnique({
                where: { id: Number(req.params.id) },
                include: { songs: true }
            })
        );

        if (!artist) return res.status(404).json({ success: false, message: "Artist not found" });

        return res.json({ success: true, data: artist });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
