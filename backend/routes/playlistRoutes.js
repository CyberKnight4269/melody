import express from "express";

import {createPlaylist,getPlaylists,addSongsToPlaylist,removeSongsFromPlaylist} from "../controllers/playlistController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/",authMiddleware,getPlaylists);
// router.post("/",authMiddleware,createPlaylist);
router.post("/",authMiddleware, upload.fields([{name: "cover",maxCount: 1}]), createPlaylist);
router.put("/:playlistId/add-songs",authMiddleware,addSongsToPlaylist);
router.put("/:playlistId/remove-songs",authMiddleware,removeSongsFromPlaylist);

export default router;