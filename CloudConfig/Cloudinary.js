// import dotenv from "dotenv";
// dotenv.config();
// import { v2 as cloudinary } from 'cloudinary';
// import multer from 'multer';
// import { CloudinaryStorage } from 'multer-storage-cloudinary';
// cloudinary.config({
//   cloud_name: process.env.cloud_name,
//   api_key: process.env.cloud_api_key,
//   api_secret: process.env.cloud_api_secret_key,
// });
// const storage=new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: async (req, file) => {
//     // for reducing the quality of photo
//     const quality = file.mimetype === "image/jpeg" || file.mimetype === "image/png" ? "auto:80" : null;
//     return {
//       folder: "QuickChat",
//       allowed_formats: ["jpg", "png", "jpeg", "pdf", "mp4", "mp3"],
//       public_id: `${file.originalname.split('.')[0]}-${Date.now()}`, // Custom filename without extension duplication
//       // transformation: [
//       //   { width: 800, height: 800, crop: 'limit' }, 
//       //   { quality: quality }, // Reduces quality for image formats
//       //   { fetch_format: 'auto' }, // Automatically convert to optimal format (e.g., WebP, JPEG)
//       // ],
//     };
//   },
// });
// export const upload = multer({ storage: storage }); //export upload to router file

import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.cloud_api_key,
  api_secret: process.env.cloud_api_secret_key,
});

// Define the storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const fileExtension = file.mimetype.split('/')[1];

    // Set resource type to "raw" for non-image/video/audio files
    const resourceType = ["jpeg", "png", "jpg", "gif", "mp4", "mp3", "wav", "avi", "mov", "mkv", "flv"]
      .includes(fileExtension)
      ? "auto"
      : "raw"; 

    return {
      folder: "QuickChat",
      allowed_formats: ["jpg", "png", "jpeg", "gif", "avif", "mp4", "mp3", "pdf", "docx", "ppt", "pptx", "xls", "xlsx", "zip", "rar", "txt"],
      public_id: `${file.originalname.split('.')[0]}-${Date.now()}`,
      resource_type: resourceType, // Enables support for all file types
    };
  },
});

// Multer middleware for handling file uploads
export const upload = multer({ storage: storage });
