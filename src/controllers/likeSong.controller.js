import prisma from "../utils/prisma.js";
import { withRetry } from "../utils/retry.js";

const ok = (res, msg, data) => res.status(200).json({ success: true, message: msg, data });
const fail = (res, code, msg) => res.status(code).json({ success: false, message: msg });

// helper: create Favorites playlist if not exists
async function ensureFavoritesPlaylist(userId) {
    let playlist = await prisma.playlist.findFirst({
        where: { userId, name: "Favorites" }
    });

    if (!playlist) {
        playlist = await prisma.playlist.create({
            data: {
                userId,
                name: "Favorites",
                description: "Songs you liked"
            }
        });
    }

    return playlist;
}

// LIKE SONG
export const likeSong = async (req, res) => {
    try {
        const userId = req.user.id;
        const songId = Number(req.params.songId);

        const exists = await prisma.favorite.findFirst({
            where: { userId, songId }
        });

        if (exists) return fail(res, 400, "Song already in favorites");

        // add to favorites table
        await prisma.favorite.create({
            data: { userId, songId }
        });

        // ensure favorites playlist exists
        const playlist = await ensureFavoritesPlaylist(userId);

        // add to playlist
        await prisma.playlistSong.create({
            data: {
                playlistId: playlist.id,
                songId
            }
        });

        return ok(res, "Song added to favorites");
    } catch (err) {
        return fail(res, 500, err.message);
    }
};

// UNLIKE SONG
export const unlikeSong = async (req, res) => {
    try {
        const userId = req.user.id;
        const songId = Number(req.params.songId);

        await prisma.favorite.deleteMany({
            where: { userId, songId }
        });

        // remove from playlist favorites
        const playlist = await prisma.playlist.findFirst({
            where: { userId, name: "Favorites" }
        });

        if (playlist) {
            await prisma.playlistSong.deleteMany({
                where: { playlistId: playlist.id, songId }
            });
        }

        return ok(res, "Song removed from favorites");
    } catch (err) {
        return fail(res, 500, err.message);
    }
};

// GET ALL FAVORITES
export const getFavorites = async (req, res) => {
    try {
        const userId = req.user.id;

        const favorites = await prisma.favorite.findMany({
            where: { userId },
            include: {
                song: {
                    include: { artist: true }
                }
            }
        });

        return ok(res, "Favorite songs fetched", favorites);
    } catch (err) {
        return fail(res, 500, err.message);
    }
};
