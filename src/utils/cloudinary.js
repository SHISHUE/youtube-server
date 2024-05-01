import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    //upload the file cloudinary
    const res = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    //file has been uploaded successfull
    // console.log(res.url);
    fs.unlinkSync(localFilePath)

    return res;
  } catch (error) {
    console.log(error);
    fs.unlinkSync(localFilePath);
    return error.message;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
      if (!publicId) {
          throw new Error("No public ID provided.");
      }

      // Delete the image from Cloudinary
      await cloudinary.uploader.destroy(publicId);
  } catch (error) {
      console.error("Error deleting image from Cloudinary:", error);
      throw error;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
