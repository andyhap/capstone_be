import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";

import UserAuthRoutes from "./routes/userAuth.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminAuthRoutes from "./routes/adminAuth.routes.js";
import adminArtistRoutes from "./routes/adminArtist.routes.js";
import adminSongRoutes from "./routes/adminSong.routes.js";
import publicRoutes from "./routes/public.routes.js";
import musicRoutes from "./routes/music.routes.js";

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
app.use("/api/auth/users", UserAuthRoutes);

// USER (profil, avatar, logout)
app.use("/api/users", userRoutes);

// ADMIN (admin login, logout)
app.use("/api/auth/admin", adminAuthRoutes);

// ADMIN ROUTES (manage artists, songs, albums)
app.use("/api/admin", adminArtistRoutes);
app.use("/api/admin", adminSongRoutes);

// PUBLIC ROUTES (browse artists, songs)
app.use("/api/public", publicRoutes);
app.use("/api/music", musicRoutes);

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
