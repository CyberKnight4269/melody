import fs from "fs";
import Song from "../models/Song.js";
import Playlist from "../models/Playlist.js";
import {uploadSongToCloudinary, uploadImageToCloudinary} from "../services/cloudinaryService.js";

export const getAllSongs = async (req, res) => {
  try {

    const { search } = req.query;
    if (search) {
      const songs = await Song.find({
        $or: [
          {
            title: {
              $regex: search,
              $options: "i"
            }
          },
          {
            artist: {
              $regex: search,
              $options: "i"
            }
          }]
      }).select(
        "title artist audioUrl coverUrl"
      );
      return res.status(200).json(songs);
    }

    const result = await Song.find().select("title artist audioUrl coverUrl");
    res.status(200).json(result);
  }
  catch(error) {
    res.status(500).json({message: error.message});
  }
};

export const uploadSong = async (req, res) => {
  try {
    const audio = await uploadSongToCloudinary(req.files.audio[0].buffer);
    const cover = await uploadImageToCloudinary(req.files.cover[0].buffer);

    const song = await Song.create({
      title: req.body.title,
      artist: req.body.artist,
      audioUrl: audio.secure_url,
      coverUrl: cover.secure_url,
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
        select: "title artist audioUrl coverUrl"
      })
      .select("title description songs coverUrl type");
    res.status(200).json(albums);
  }
  catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};