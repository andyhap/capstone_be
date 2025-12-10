import { Router } from "express";
import {
    getProfile,
    updateProfile,
    updateAvatar,
    logout,
} from "../controllers/user.controller.js";
import {
    createPlaylist,
    getMyPlaylists,
    getPlaylistDetail,
    addSongToPlaylist,
    removeSongFromPlaylist,
    deletePlaylist,
    generateRecommendedPlaylist,
} from "../controllers/playlist.controller.js";
import {
    likeSong,
    unlikeSong,
    getFavorites,
} from "../controllers/likeSong.controller.js";
import {
    followArtist,
    unfollowArtist,
    getFollowingArtists,
} from "../controllers/follow.controller.js";
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


// --- PLAYLIST ROUTES ---
// CREATE PLAYLIST
router.post("/playlist", auth, createPlaylist);

// LIST PLAYLISTS
router.get("/playlist", auth, getMyPlaylists);
router.get("/playlist/:id", auth, getPlaylistDetail);

// ADD & REMOVE SONG TO/FROM PLAYLIST
router.post("/playlist/:playlistId/addsong/:songId", auth, addSongToPlaylist);
router.delete("/playlist/song/:playlistSongId", auth, removeSongFromPlaylist);

// DELETE PLAYLIST
router.delete("/playlist/:id", auth, deletePlaylist);

// GENERATE RECOMMENDED PLAYLIST
router.post("/playlist/recommend", auth, generateRecommendedPlaylist);
// --- END PLAYLIST ROUTES ---

// --- FAVORITES ---
router.post("/favorites/:songId", auth, likeSong);
router.delete("/favorites/:songId", auth, unlikeSong);
router.get("/favorites", auth, getFavorites);
// --- END FAVORITES ---

// --- FOLLOWING ARTISTS ---
router.post("/follow/:artistId", auth, followArtist);
router.delete("/follow/:artistId", auth, unfollowArtist);
router.get("/following", auth, getFollowingArtists);
// --- END FOLLOWING ARTISTS ---

export default router;
