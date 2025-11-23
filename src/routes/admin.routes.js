import { Router } from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import { upload } from "../middleware/upload.js";

import {
    createArtist,
    getAllArtists,
    getArtist,
    updateArtist,
    deleteArtist,
    updateArtistAvatar,
} from "../controllers/artist.controller.js";

const router = Router();

// --- ARTISTS ROUTES ---
// CREATE
router.post("/artists", adminAuth, createArtist);

// READ
router.get("/artists", adminAuth, getAllArtists);
router.get("/artists/:id", adminAuth, getArtist);

// UPDATE
router.put("/artists/:id", adminAuth, updateArtist);
router.post("/artists/:id/avatar", adminAuth, upload.single("file"), updateArtistAvatar);

// DELETE
router.delete("/artists/:id", adminAuth, deleteArtist);
// --- END ARTISTS ROUTES ---

export default router;
