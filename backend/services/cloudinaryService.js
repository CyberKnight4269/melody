import cloudinary from "../config/cloudinary.js";

const uploadSongToCloudinary = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: "video",
    folder: "songs"
  });

  return result;
};

export default uploadSongToCloudinary;