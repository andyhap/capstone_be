import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express();

// Security
app.use(helmet());
app.use(cors());

// Logging
if (process.env.NODE_ENV !== "test") {
    app.use(morgan("combined"));
}

// Body parser 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// AUTH (register & login)
app.use("/api/auth/users", authRoutes);

// USER (profil, avatar, logout)
app.use("/api/users", userRoutes);

// 404
app.use((req, res, next) => {
    return res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err);

    return res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
    });
});

export default app;
