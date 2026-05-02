const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Uploads live inside the frontend public dir so they're served as static files.
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'frontend', 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 8);
    const safe = (req.session.user ? req.session.user.id : 'anon') + '-' + Date.now() + ext;
    cb(null, safe);
  },
});

const imageOnly = (req, file, cb) => {
  if (/^image\/(png|jpe?g|gif|webp)$/.test(file.mimetype)) cb(null, true);
  else cb(new Error('Only image files are allowed.'));
};

const uploadAvatar = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: imageOnly,
});

module.exports = { uploadAvatar, UPLOAD_DIR };
