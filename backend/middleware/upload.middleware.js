const multer = require('multer');
const path = require('path');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});

const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error('Only JPEG, PNG, and WebP images are allowed.'));
};

const videoFilter = (req, file, cb) => {
  const allowed = ['video/mp4', 'video/quicktime'];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error('Only MP4 and MOV videos are allowed.'));
};

const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('image');

const uploadVideo = multer({
  storage,
  fileFilter: videoFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
}).single('video');

module.exports = { uploadImage, uploadVideo, BACKEND_URL };
