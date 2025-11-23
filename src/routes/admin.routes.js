import { Router } from "express";
import { adminLogin, adminLogout } from "../controllers/admin.controller.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = Router();

// AUTH ADMIN
router.post("/login", adminLogin);
router.post("/logout", adminAuth, adminLogout);

// for other admin routes, e.g. managing artists, songs, etc.
// router.post("/artists", adminAuth, createArtist);
// router.post("/songs", adminAuth, createSong);
// dll

export default router;
