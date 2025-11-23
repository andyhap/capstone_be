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

// semua ini diproteksi JWT

// GET /api/users/me
router.get("/me", auth, getProfile);

// PUT /api/users/me
router.put("/me", auth, updateProfile);

// POST /api/users/avatar (body: form-data, field: file)
router.post("/avatar", auth, upload.single("file"), updateAvatar);

// POST /api/users/logout
router.post("/logout", auth, logout);

export default router;
