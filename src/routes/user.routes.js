import { Router } from "express";
import {
    getProfile,
    updateProfile,
    updateAvatar,
    logout,
} from "../controllers/user.controller.js";
import { auth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();


// --- PROFILE ROUTES---
// USER PROFILE
router.get("/me", auth, getProfile);

// UPDATE USER PROFILE
router.put("/me", auth, updateProfile);

// USER AVATAR
router.post("/avatar", auth, upload.single("file"), updateAvatar);

// USER LOGOUT
router.post("/logout", auth, logout);
// --- END PROFILE ROUTES ---

export default router;
