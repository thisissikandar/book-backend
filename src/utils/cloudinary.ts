import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

import { config } from "../config/config";

cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
});

const uploadOnCloudinary = async (
  localFilePath: string,
  folderName: string
) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: folderName,
    });
    // console.log("response", response);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};
const deleteOnCloudinary = async (filePublicId: string) => {
  try {
    if (!filePublicId) return null;
    //Delete the file on cloudinary
    const response = await cloudinary.uploader.destroy(filePublicId);
    return response;
  } catch (error) {
    return null;
  }
};

export { uploadOnCloudinary, deleteOnCloudinary };
