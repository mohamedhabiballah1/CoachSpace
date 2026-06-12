const { uploadImage, uploadVideo, BACKEND_URL } = require('../middleware/upload.middleware');

exports.uploadImageHandler = (req, res) => {
  uploadImage(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
    const url = `${BACKEND_URL}/uploads/${req.file.filename}`;
    res.json({ success: true, url });
  });
};

exports.uploadVideoHandler = (req, res) => {
  uploadVideo(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
    const url = `${BACKEND_URL}/uploads/${req.file.filename}`;
    res.json({ success: true, url });
  });
};
