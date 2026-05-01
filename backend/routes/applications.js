const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { requireRole } = require('../middleware/auth');

const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF, DOC, DOCX files are allowed.'));
  },
});

// Apply to a job
router.post('/:jobId', requireRole('seeker'), (req, res) => {
  upload.single('resume')(req, res, async (err) => {
    try {
      if (err) throw err;
      const job = await Job.findById(req.params.jobId);
      if (!job) return res.status(404).render('404');

      const existing = await Application.findOne({ job: job._id, applicant: req.session.user.id });
      if (existing) return res.redirect(`/jobs/${job._id}?applied=1`);

      await Application.create({
        job: job._id,
        applicant: req.session.user.id,
        coverLetter: (req.body.coverLetter || '').slice(0, 5000),
        resumePath: req.file ? `/uploads/${req.file.filename}` : undefined,
      });
      res.redirect(`/jobs/${job._id}?applied=1`);
    } catch (e) {
      res.status(400).render('error', { message: e.message });
    }
  });
});

module.exports = router;
