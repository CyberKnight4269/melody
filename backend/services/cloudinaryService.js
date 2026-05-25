import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const uploadToCloudinary = (
  fileBuffer,
  options
) => {

  return new Promise((resolve, reject) => {

    const stream =
      cloudinary.uploader.upload_stream(

        options,

        (error, result) => {

          if (error) {
            reject(error);
          } else {
            resolve(result);
          }

        }
      );

    streamifier
      .createReadStream(fileBuffer)
      .pipe(stream);

  });
};

export const uploadSongToCloudinary = async (
  audioBuffer
) => {

  return await uploadToCloudinary(
    audioBuffer,
    {
      resource_type: "video",
      folder: "songs"
    }
  );
};

export const uploadImageToCloudinary = async (
  imageBuffer
) => {

  return await uploadToCloudinary(
    imageBuffer,
    {
      resource_type: "image",
      folder: "song-covers"
    }
  );
};