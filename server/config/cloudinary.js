const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for video snippets
const snippetStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "snapbeats/snippets",
    resource_type: "video",
    allowed_formats: ["mp4", "mov", "webm"],
  },
});

// Storage for thumbnails / avatars (images)
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "snapbeats/images",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

module.exports = { cloudinary, snippetStorage, imageStorage };
