import prisma from "../utils/prisma.js";
import { withRetry } from "../utils/retry.js";

// RESPONSE HELPERS
const ok = (res, msg, data) => res.status(200).json({ success: true, message: msg, data });
const created = (res, msg, data) => res.status(201).json({ success: true, message: msg, data });
const fail = (res, code, msg) => res.status(code).json({ success: false, message: msg });


// HELPER FUNCTION: UPDATE PLAYLIST COVER
async function updatePlaylistCover(playlistId) {
    const firstSong = await prisma.playlistSong.findFirst({
        where: { playlistId },
        orderBy: { id: "asc" },
        include: {
            song: true
        }
    });

    // jika tidak ada lagu, set coverUrl ke null
    if (!firstSong) {
        await prisma.playlist.update({
            where: { id: playlistId },
            data: { coverUrl: null }
        });
        return null;
    }

    const coverUrl = firstSong.song.coverUrl || null;

    await prisma.playlist.update({
        where: { id: playlistId },
        data: { coverUrl }
    });

    return coverUrl;
}


// CREATE PLAYLIST
export const createPlaylist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, description } = req.body;

        if (!name) return fail(res, 400, "Playlist name required");

        const playlist = await prisma.playlist.create({
            data: { userId, name, description, coverUrl: null }
        });

        return created(res, "Playlist created", playlist);

    } catch (err) {
        return fail(res, 500, err.message);
    }
};


// GET MY PLAYLISTS 
export const getMyPlaylists = async (req, res) => {
    try {
        const userId = req.user.id;

        const playlists = await prisma.playlist.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" }
        });

        return ok(res, "Playlists fetched", playlists);

    } catch (err) {
        return fail(res, 500, err.message);
    }
};


// GET PLAYLIST DETAIL 
export const getPlaylistDetail = async (req, res) => {
    try {
        const playlistId = Number(req.params.id);
        const userId = req.user.id;

        const playlist = await prisma.playlist.findUnique({
            where: { id: playlistId },
            include: {
                songs: {
                    include: {
                        song: {
                            include: { artist: true }
                        }
                    }
                }
            }
        });

        if (!playlist || playlist.userId !== userId)
            return fail(res, 404, "Playlist not found");

        return ok(res, "Playlist detail", playlist);

    } catch (err) {
        return fail(res, 500, err.message);
    }
};


// ADD SONG
export const addSongToPlaylist = async (req, res) => {
    try {
        const playlistId = Number(req.params.playlistId);
        const songId = Number(req.params.songId);

        if (isNaN(playlistId) || isNaN(songId)) {
            return fail(res, 400, "Invalid playlist or song ID");
        }

        // cek playlist
        const playlist = await prisma.playlist.findUnique({
            where: { id: playlistId }
        });

        if (!playlist || playlist.userId !== req.user.id) {
            return fail(res, 404, "Playlist not found");
        }

        // cek apakah lagu sudah ada di playlist
        const exists = await prisma.playlistSong.findFirst({
            where: { playlistId, songId }
        });

        if (exists) return fail(res, 400, "Song already in playlist");

        // tambahkan lagu
        const added = await prisma.playlistSong.create({
            data: { playlistId, songId }
        });

        // update cover playlist setelah tambah lagu
        await updatePlaylistCover(playlistId);

        return ok(res, "Song added to playlist", added);

    } catch (err) {
        return fail(res, 500, err.message);
    }
};



// REMOVE SONG 
export const removeSongFromPlaylist = async (req, res) => {
    try {
        const playlistSongId = Number(req.params.playlistSongId);

        const entry = await prisma.playlistSong.findUnique({
            where: { id: playlistSongId }
        });

        if (!entry) return fail(res, 404, "Song not found in playlist");

        const playlistId = entry.playlistId;

        await prisma.playlistSong.delete({ where: { id: playlistSongId } });

        // update cover playlist setelah hapus lagu
        await updatePlaylistCover(playlistId);

        return ok(res, "Song removed");

    } catch (err) {
        return fail(res, 500, err.message);
    }
};


// DELETE PLAYLIST
export const deletePlaylist = async (req, res) => {
    try {
        const playlistId = Number(req.params.id);

        await prisma.playlistSong.deleteMany({ where: { playlistId } });
        await prisma.playlist.delete({ where: { id: playlistId } });

        return ok(res, "Playlist deleted");

    } catch (err) {
        return fail(res, 500, err.message);
    }
};


// GENERATE RECOMMENDED PLAYLIST
export const generateRecommendedPlaylist = async (req, res) => {
    try {
        const userId = req.user.id;

        // Ambil semua history play user
        const history = await prisma.recentlyPlayed.findMany({
            where: { userId },
            include: { song: true },
        });

        // Minimal 10 total play
        if (history.length < 10) {
            return fail(res, 400, "Play at least 10 times to generate recommendations");
        }

        // Hitung frekuensi play
        const freq = {};
        history.forEach(h => {
            freq[h.songId] = (freq[h.songId] || 0) + 1;
        });

        // Filter lagu yang minimal 3 play
        const filtered = Object.entries(freq)
            .filter(([songId, count]) => count >= 3);

        if (filtered.length === 0) {
            return fail(res, 400, "Not enough listening data for recommendations");
        }

        // Ambil 10 lagu paling sering
        const topSongs = filtered
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(item => Number(item[0]));

        // Cek apakah playlist rekomendasi sudah ada
        let playlist = await prisma.playlist.findFirst({
            where: { userId, name: "Recommended for You" }
        });

        // Jika belum ada → buat
        if (!playlist) {
            playlist = await prisma.playlist.create({
                data: {
                    userId,
                    name: "Recommended for You",
                    description: "Automatically generated playlist"
                }
            });
        }

        // Kosongkan playlist lama
        await prisma.playlistSong.deleteMany({
            where: { playlistId: playlist.id }
        });

        // Insert lagu-lagu
        const inserts = topSongs.map(songId => ({
            playlistId: playlist.id,
            songId
        }));

        await prisma.playlistSong.createMany({ data: inserts });

        // Set COVER playlist → cover lagu pertama
        const firstSong = await prisma.song.findUnique({
            where: { id: topSongs[0] }
        });

        if (firstSong?.coverUrl) {
            await prisma.playlist.update({
                where: { id: playlist.id },
                data: { coverUrl: firstSong.coverUrl }
            });
        }

        return ok(res, "Recommended playlist created", playlist);

    } catch (err) {
        return fail(res, 500, err.message);
    }
};



