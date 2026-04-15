const multer = require("multer");
const { snippetStorage, imageStorage } = require("../config/cloudinary");

// Video upload (snippets)
const uploadVideo = multer({
  storage: snippetStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max
  fileFilter: (req, file, cb) => {
    const allowed = ["video/mp4", "video/quicktime", "video/webm"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only MP4, MOV, and WebM video files are allowed"), false);
    }
  },
});

// Image upload (avatars, thumbnails)
const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, and WebP images are allowed"), false);
    }
  },
});

module.exports = { uploadVideo, uploadImage };
