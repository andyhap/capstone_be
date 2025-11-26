import { Router } from "express";
import { register, login } from "../controllers/userAuth.controller.js";

const router = Router();

// --- AUTH ROUTES ---
// USER REGISTER
router.post("/register", register);
// USER LOGIN
router.post("/login", login);
// --- END AUTH ROUTES ---

export default router;
