import { Router } from "express";
import { adminLogin, adminLogout } from "../controllers/adminAuth.controller.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = Router();

// AUTH ADMIN
router.post("/login", adminLogin);
router.post("/logout", adminAuth, adminLogout);

export default router;
