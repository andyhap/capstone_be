import prisma from "../utils/prisma.js";

// SEARCH ALL ARTISTS AND SONGS
export const searchAll = async (req, res) => {
    try {
        const query = req.query.query || "";

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 25;
        const skip = (page - 1) * limit;

        if (!query.trim()) {
            return res.json({
                success: true,
                pagination: { page, limit, total: 0, totalPages: 0 },
                data: { artists: [], songs: [] }
            });
        }

        const [artists, songs, totalArtists, totalSongs] = await Promise.all([
            prisma.artist.findMany({
                where: { name: { contains: query, mode: "insensitive" }},
                skip,
                take: limit,
                orderBy: { name: "asc" },
                include: { songs: true }
            }),

            prisma.song.findMany({
                where: { title: { contains: query, mode: "insensitive" }},
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: { artist: true }
            }),

            prisma.artist.count({
                where: { name: { contains: query, mode: "insensitive" }}
            }),

            prisma.song.count({
                where: { title: { contains: query, mode: "insensitive" }}
            })
        ]);

        return res.json({
            success: true,
            pagination: {
                page,
                limit,
                totalArtists,
                totalSongs,
                totalPagesArtists: Math.ceil(totalArtists / limit),
                totalPagesSongs: Math.ceil(totalSongs / limit)
            },
            data: { artists, songs }
        });

    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
