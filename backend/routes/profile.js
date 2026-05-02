const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { requireLogin } = require('../middleware/auth');
const { uploadAvatar } = require('../utils/upload');

// View own profile (edit mode)
router.get('/', requireLogin, async (req, res) => {
  const user = await User.findById(req.session.user.id);
  if (!user) return res.redirect('/auth/login');
  res.render('profile-edit', { user, error: null, info: null });
});

// Public profile by id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -verifyCodeHash -verifyCodeExpires -verifyCodePurpose');
    if (!user) return res.status(404).render('404');
    res.render('profile-view', { user });
  } catch {
    res.status(404).render('404');
  }
});

// Update profile (with optional avatar upload)
router.post(
  '/',
  requireLogin,
  (req, res, next) => {
    uploadAvatar.single('avatar')(req, res, (err) => {
      if (err) return res.status(400).render('error', { message: err.message });
      next();
    });
  },
  async (req, res) => {
    try {
      const user = await User.findById(req.session.user.id);
      if (!user) return res.redirect('/auth/login');

      // Common
      user.name = (req.body.name || user.name).trim();
      user.headline = (req.body.headline || '').trim();
      user.bio = (req.body.bio || '').trim();
      user.location = (req.body.location || '').trim();
      user.phone = (req.body.phone || '').trim();
      user.website = (req.body.website || '').trim();

      if (req.file) {
        user.avatarUrl = '/uploads/' + req.file.filename;
      }

      if (user.role === 'employer') {
        user.company = (req.body.company || '').trim();
        user.industry = (req.body.industry || '').trim();
        user.companySize = (req.body.companySize || '').trim();
        user.companyAbout = (req.body.companyAbout || '').trim();
      } else {
        user.skills = (req.body.skills || '')
          .split(',').map(s => s.trim()).filter(Boolean).slice(0, 30);
        // Experience (parallel arrays)
        const eTitles = [].concat(req.body.exp_title || []);
        const eCompanies = [].concat(req.body.exp_company || []);
        const eFroms = [].concat(req.body.exp_from || []);
        const eTos = [].concat(req.body.exp_to || []);
        const eDescs = [].concat(req.body.exp_desc || []);
        user.experience = eTitles
          .map((t, i) => ({
            title: (t || '').trim(),
            company: (eCompanies[i] || '').trim(),
            from: (eFroms[i] || '').trim(),
            to: (eTos[i] || '').trim(),
            description: (eDescs[i] || '').trim(),
          }))
          .filter(e => e.title || e.company);

        const sNames = [].concat(req.body.edu_school || []);
        const sDegs = [].concat(req.body.edu_degree || []);
        const sFields = [].concat(req.body.edu_field || []);
        const sYears = [].concat(req.body.edu_year || []);
        user.education = sNames
          .map((s, i) => ({
            school: (s || '').trim(),
            degree: (sDegs[i] || '').trim(),
            field: (sFields[i] || '').trim(),
            year: (sYears[i] || '').trim(),
          }))
          .filter(e => e.school || e.degree);
      }

      await user.save();
      // Refresh session name in case it changed
      req.session.user.name = user.name;
      res.render('profile-edit', { user, error: null, info: 'Profile saved.' });
    } catch (err) {
      const user = await User.findById(req.session.user.id);
      res.status(400).render('profile-edit', { user, error: err.message, info: null });
    }
  }
);

module.exports = router;
