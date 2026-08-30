const express    = require('express');
const multer     = require('multer');
const cloudinary = require('cloudinary').v2;
const { authUser } = require('../middleware/auth');
const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => file.mimetype.startsWith('image/') ? cb(null,true) : cb(new Error('Images only')),
});

router.post('/image', authUser, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image' });
    const b64    = Buffer.from(req.file.buffer).toString('base64');
    const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${b64}`, {
      folder: 'shoptok',
      transformation: [{ width:800, height:800, crop:'fill', quality:'auto' }],
    });
    res.json({ success: true, url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Upload failed: ' + err.message });
  }
});

module.exports = router;
