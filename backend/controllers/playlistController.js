import Playlist from "../models/Playlist.js";

export const createPlaylist = async (req, res) => {

  try {

    const {
      title,
      description,
      type,
      songs
    } = req.body;

    if (
      type === "album" &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Only admins can create albums"
      });
    }

    const playlist = await Playlist.create({
      title,
      description,
      type,
      songs,
      createdBy: req.user.id
    });

    res.status(201).json(playlist);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

export const getPlaylists = async (req,res) => {
  try {
    const playlists = await Playlist.find(
        {
          type: "list",
          createdBy: req.user.id
        }
    )
      .populate({
        path: "songs",
        select: "title artist audioUrl"
      })
      .populate(
        "createdBy",
        "name email"
      );

    res.status(200).json(playlists);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

export const addSongsToPlaylist = async (
  req,
  res
) => {
    try {

    const { playlistId } = req.params;

    const { songs } = req.body;

    const playlist = await Playlist.findById(
      playlistId
    );

    if (!playlist) {
      return res.status(404).json({
        message: "Playlist not found"
      });
    }
    const isOwner = playlist.createdBy.toString() === req.user.id;

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "Not authorized"
      });
    }

    if (
      playlist.type === "album" &&
      !isAdmin
    ) {
      return res.status(403).json({
        message:
          "Only admins can modify albums"
      });
    }

    playlist.songs.push(...songs);

    await playlist.save();

    const updatedPlaylist = await Playlist.findById(
      playlistId
    ).populate({
      path: "songs",
      select: "title artist audioUrl"
    });
    res.status(200).json(updatedPlaylist);
    } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

export const removeSongsFromPlaylist = async (
  req,
  res
) => {

  try {

    const { playlistId } = req.params;

    const { songs } = req.body;

    const playlist = await Playlist.findById(
      playlistId
    );

    if (!playlist) {
      return res.status(404).json({
        message: "Playlist not found"
      });
    }

    const isOwner =
      playlist.createdBy.toString() ===
      req.user.id;

    if (!isOwner) {
      return res.status(403).json({
        message:
          "Only playlist creator can modify playlist"
      });
    }

    playlist.songs = playlist.songs.filter(
      (songId) =>
        !songs.includes(songId.toString())
    );

    await playlist.save();

    const updatedPlaylist = await Playlist.findById(
      playlistId
    ).populate({
      path: "songs",
      select: "title artist audioUrl"
    });

    res.status(200).json(updatedPlaylist);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};