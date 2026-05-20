import express from "express";
import {uploadSong,getAlbums} from "../controllers/songController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/",authMiddleware, getAlbums);
router.post("/upload",authMiddleware,adminMiddleware,upload.single("audio"),uploadSong);

export default router;