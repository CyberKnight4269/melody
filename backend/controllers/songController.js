import fs from "fs";
import Song from "../models/Song.js";
import uploadSongToCloudinary from "../services/cloudinaryService.js";

export const uploadSong = async (req, res) => {
  try {
    const result = await uploadSongToCloudinary(req.file.buffer);

    const song = await Song.create({
      title: req.body.title,
      artist: req.body.artist,
      audioUrl: result.secure_url,
      uploadedBy: req.user.id
    });

    res.status(201).json(song);
  }
  catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const getSongs = async (req, res) => {
  try {
    const songs = await Song.find().select(
      "title artist audioUrl"
    );

    res.status(200).json(songs);
  }
  catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};