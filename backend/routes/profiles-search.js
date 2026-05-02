const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Escape user input for safe regex
function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /people  — search profiles (seekers + employers)
router.get('/', async (req, res) => {
  const q = (req.query.q || '').trim();
  const role = req.query.role || ''; // '', 'seeker', 'employer'
  const location = (req.query.location || '').trim();
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const perPage = 12;

  const filter = {};
  if (role === 'seeker' || role === 'employer') filter.role = role;

  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [
      { name: rx },
      { headline: rx },
      { bio: rx },
      { skills: rx },
      { company: rx },
      { industry: rx },
    ];
  }
  if (location) {
    filter.location = new RegExp(escapeRegex(location), 'i');
  }

  const [results, total] = await Promise.all([
    User.find(filter)
      .select('name role headline avatarUrl location skills company industry')
      .sort({ updatedAt: -1, _id: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage),
    User.countDocuments(filter),
  ]);

  res.render('profiles-search', {
    title: 'Find People',
    q, role, location, page, perPage, total, results,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  });
});

module.exports = router;
