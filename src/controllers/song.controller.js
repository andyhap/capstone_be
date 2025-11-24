import prisma from "../utils/prisma.js";
import { withRetry } from "../utils/retry.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { uploadSongAudio, deleteAudio } from "../utils/uploadAudio.js";
import cloudinary from "../config/cloudinary.js";
import { supabase } from "../config/supabase.js";

// HELPER RESPONSES
const ok = (res, msg, data) => res.status(200).json({ success: true, message: msg, data });
const created = (res, msg, data) => res.status(201).json({ success: true, message: msg, data });
const fail = (res, status, msg) => res.status(status).json({ success: false, message: msg });


// ADD SONG
export const addSong = async (req, res) => {
    try {
        const { title, artistId } = req.body;

        if (!title || !artistId)
            return fail(res, 400, "Title and artistId are required");

        const artist = await prisma.artist.findUnique({
            where: { id: Number(artistId) }
        });

        if (!artist) return fail(res, 404, "Artist not found");

        // --- Upload cover ---
        let coverUrl = null;
        let coverPublicId = null;

        if (req.files?.cover?.[0]) {
            const result = await uploadToCloudinary(req.files.cover[0], "song_covers");
            coverUrl = result.secure_url;
            coverPublicId = result.public_id;
        }

        // --- Upload audio ke Supabase ---
        let audioUrl = null;
        let audioPath = null;

        if (req.files?.audio?.[0]) {
            const file = req.files.audio[0];
            const filePath = `${Date.now()}-${file.originalname}`;

            const { data, error } = await supabase.storage
                .from(process.env.SUPABASE_BUCKET)
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype
                });

            if (error) return fail(res, 500, error.message);

            audioPath = data.path;
            audioUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/${data.path}`;
        }

        const song = await prisma.song.create({
            data: {
                title,
                artistId: Number(artistId),
                coverUrl,
                coverPublicId,
                audioUrl,
                audioPath
            },
        });

        return created(res, "Song added", song);

    } catch (err) {
        console.error("Song upload error:", err);
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


// GET ONE SONG
export const getSong = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const song = await withRetry(() =>
            prisma.song.findUnique({
                where: { id },
                include: { artist: true },
            })
        );

        if (!song) return fail(res, 404, "Song not found");

        return ok(res, "Song fetched", song);
    } catch (err) {
        return fail(res, 500, err.message);
    }
};


// UPDATE SONG COVER
export const updateSongCover = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!req.file)
            return fail(res, 400, "No cover uploaded");

        const song = await prisma.song.findUnique({ where: { id } });
        if (!song) return fail(res, 404, "Song not found");

        // Delete old cover
        if (song.coverPublicId) {
            await cloudinary.uploader.destroy(song.coverPublicId);
        }

        const result = await uploadToCloudinary(req.file, "song_covers");

        const updated = await prisma.song.update({
            where: { id },
            data: {
                coverUrl: result.secure_url,
                coverPublicId: result.public_id,
            },
        });

        return ok(res, "Song cover updated", updated);
    } catch (err) {
        return fail(res, 500, err.message);
    }
};


// UPDATE SONG AUDIO
export const updateSongAudio = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!req.file)
            return fail(res, 400, "No audio uploaded");

        const song = await prisma.song.findUnique({ where: { id } });
        if (!song) return fail(res, 404, "Song not found");

        // Delete old audio
        await deleteAudio(song.audioPath);

        const audioResult = await uploadSongAudio(req.file);

        const updated = await prisma.song.update({
            where: { id },
            data: {
                audioUrl: audioResult.url,
                audioPath: audioResult.path,
            },
        });

        return ok(res, "Song audio updated", updated);
    } catch (err) {
        return fail(res, 500, err.message);
    }
};


// DELETE SONG
export const deleteSong = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const song = await prisma.song.findUnique({ where: { id } });
        if (!song) return fail(res, 404, "Song not found");

        await deleteAudio(song.audioPath);
        if (song.coverPublicId) await cloudinary.uploader.destroy(song.coverPublicId);

        await withRetry(() =>
            prisma.song.delete({ where: { id } })
        );

        return ok(res, "Song deleted");
    } catch (err) {
        return fail(res, 500, err.message);
    }
};
