// src/routes/auth.routes.js
import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";

const router = Router();

// /api/auth/users/register
router.post("/register", register);

// /api/auth/users/login
router.post("/login", login);

export default router;
