import fs from "fs";
import Song from "../models/Song.js";
import Playlist from "../models/Playlist.js";
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

export const getAlbums = async (req, res) => {
  try {
    const albums = await Playlist.find({
      type: "album"
    })
      .populate({
        path: "songs",
        select: "title artist audioUrl"
      })
      .select("title description songs type");
    res.status(200).json(albums);
  }
  catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};