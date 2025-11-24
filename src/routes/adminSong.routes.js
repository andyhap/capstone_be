import { Router } from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import multer from "multer";

import {
    addSong,
    getSong,
    getAllSongs,
    updateSongCover,
    updateSongAudio,
    deleteSong
} from "../controllers/song.controller.js";

const upload = multer();

const router = Router();

router.post("/songs", adminAuth, upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "audio", maxCount: 1 },
]), addSong);

router.get("/songs", adminAuth, getAllSongs);
router.get("/songs/:id", adminAuth, getSong);

router.put("/songs/:id/cover", adminAuth, upload.single("cover"), updateSongCover);
router.put("/songs/:id", adminAuth, upload.single("audio"), updateSongAudio);

router.delete("/songs/:id", adminAuth, deleteSong);

export default router;
