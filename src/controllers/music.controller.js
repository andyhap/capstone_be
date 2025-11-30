import prisma from "../utils/prisma.js";
import { withRetry } from "../utils/retry.js";

const ok = (res, msg, data) => res.status(200).json({ success: true, message: msg, data });
const fail = (res, code, msg) => res.status(code).json({ success: false, message: msg });

// PLAY SONG
export const playSong = async (req, res) => {
    try {
        const songId = Number(req.params.songId);
        const userId = req.user.id;

        const song = await prisma.song.findUnique({ where: { id: songId } });
        if (!song) return fail(res, 404, "Song not found");

        // +1 playCount
        await withRetry(() =>
            prisma.song.update({
                where: { id: songId },
                data: { playCount: { increment: 1 } }
            })
        );

        // Insert recently played
        await withRetry(() =>
            prisma.recentlyPlayed.create({
                data: {
                    userId,
                    songId,
                }
            })
        );

        return ok(res, "Song played", song);
    } catch (err) {
        return fail(res, 500, err.message);
    }
};

// GET RECENTLY PLAYED
export const getRecentlyPlayed = async (req, res) => {
    try {
        const userId = req.user.id;

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const data = await prisma.recentlyPlayed.findMany({
            where: { userId },
            orderBy: { playedAt: "desc" },
            skip,
            take: limit,
            include: {
                song: {
                    include: { artist: true }
                }
            }
        });

        return ok(res, "Recently played fetched", data);
    } catch (err) {
        return fail(res, 500, err.message);
    }
};

