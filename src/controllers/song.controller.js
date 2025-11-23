import prisma from "../utils/prisma.js";
import { withRetry } from "../utils/retry.js";
import upload from "../middleware/upload.js";
import { uploadToCloud } from "../utils/cloudinaryUpload.js";

const ok = (res, msg, data) => res.status(200).json({ success: true, message: msg, data });
const created = (res, msg, data) => res.status(201).json({ success: true, message: msg, data });
const fail = (res, status, msg) => res.status(status).json({ success: false, message: msg });


// ADD SONG
export const addSong = async (req, res) => {
    try {
        const { title, coverUrl, audioUrl, artistId } = req.body;

        if (!title || !audioUrl || !artistId)
            return fail(res, 400, "Title, audioUrl, and artistId are required");

        const artistExists = await withRetry(() =>
            prisma.artist.findUnique({ where: { id: Number(artistId) } })
        );

        if (!artistExists) return fail(res, 404, "Artist not found");

        const song = await withRetry(() =>
            prisma.song.create({
                data: {
                    title,
                    coverUrl,
                    audioUrl,
                    artistId: Number(artistId),
                },
            })
        );

        return created(res, "Song added", song);
    } catch (err) {
        return fail(res, 500, err.message);
    }
};


// GET ALL SONGS
export const getAllSongs = async (req, res) => {
    try {
        const songs = await withRetry(() =>
            prisma.song.findMany({
                orderBy: { createdAt: "desc" },
                include: { artist: true }
            })
        );

        return ok(res, "All songs", songs);
    } catch (err) {
        return fail(res, 500, err.message);
    }
};


// GET SONG
export const getSong = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const song = await withRetry(() =>
            prisma.song.findUnique({
                where: { id },
                include: { artist: true }
            })
        );

        if (!song) return fail(res, 404, "Song not found");

        return ok(res, "Song fetched", song);
    } catch (err) {
        return fail(res, 500, err.message);
    }
};


// UPDATE SONG
export const updateSongAudio = async (req, res) => {
    try {
        if (!req.file)
            return fail(res, 400, "No audio uploaded");

        const id = Number(req.params.id);

        const audioUrl = await uploadToCloud(req.file, "song_audio");

        const updated = await withRetry(() =>
            prisma.song.update({
                where: { id },
                data: { audioUrl }
            })
        );

        return ok(res, "Song audio updated", updated);
    } catch (err) {
        return fail(res, 500, err.message);
    }
};



// SONG UPLOAD COVER
export const updateSongCover = async (req, res) => {
    try {
        if (!req.file)
            return fail(res, 400, "No file uploaded");

        const id = Number(req.params.id);

        const coverUrl = await uploadToCloud(req.file, "song_covers");

        const updated = await withRetry(() =>
            prisma.song.update({
                where: { id },
                data: { coverUrl }
            })
        );

        return ok(res, "Song cover updated", updated);
    } catch (err) {
        return fail(res, 500, err.message);
    }
};


// DELETE SONG
export const deleteSong = async (req, res) => {
    try {
        const id = Number(req.params.id);

        await withRetry(() =>
            prisma.song.delete({ where: { id } })
        );

        return ok(res, "Song deleted");
    } catch (err) {
        return fail(res, 500, err.message);
    }
};
