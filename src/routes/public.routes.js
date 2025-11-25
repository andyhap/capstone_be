import { Router } from "express";
import { getAllPublicArtists, getPublicArtist } from "../controllers/publicArtist.controller.js";
import { getAllPublicSongs, getPublicSong } from "../controllers/publicSong.controller.js";
import { searchAll } from "../controllers/search.controller.js";

const router = Router();

// ARTISTS (PUBLIC)
router.get("/artists", getAllPublicArtists);
router.get("/artists/:id", getPublicArtist);

// SONGS (PUBLIC)
router.get("/songs", getAllPublicSongs);
router.get("/songs/:id", getPublicSong);

// SEARCH
router.get("/search", searchAll);

export default router;
