import { Router } from "express";
import { auth } from "../middleware/auth.js";

import { 
    playSong,
    getRecentlyPlayed,
} from "../controllers/music.controller.js";

const router = Router();

// pemutar lagu
router.post("/play/:songId", auth, playSong);

// recently played
router.get("/recent", auth, getRecentlyPlayed);

export default router;
