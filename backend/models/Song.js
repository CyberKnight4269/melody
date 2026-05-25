import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    artist: {
      type: String,
      required: true
    },

    audioUrl: {
      type: String,
      required: true
    },

    coverUrl: {
      type: String,
      required: true
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

const Song = mongoose.model("Song", songSchema);

export default Song;