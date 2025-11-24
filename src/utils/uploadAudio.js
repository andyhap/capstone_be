import { supabase } from "../config/supabase.js";
import { randomUUID } from "crypto";

const BUCKET = process.env.SUPABASE_BUCKET_NAME ?? "musicstorage";

// Upload audio ke Supabase
export const uploadSongAudio = async (file) => {
    const ext = file.originalname.split(".").pop();
    const filename = `${randomUUID()}.${ext}`;

    // Upload binary
    const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(filename, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });

    if (error) throw new Error("Supabase upload failed: " + error.message);

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename);

    return {
        url: urlData.publicUrl,
        path: filename,
    };
};

// Delete file
export const deleteAudio = async (path) => {
    if (!path) return;

    await supabase.storage.from(BUCKET).remove([path]);
};
