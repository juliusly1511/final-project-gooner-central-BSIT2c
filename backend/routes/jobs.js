const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Application = require('../models/Application');
const { requireLogin, requireRole } = require('../middleware/auth');

const CATEGORIES = ['Engineering', 'Design', 'Marketing', 'Sales', 'Finance', 'Operations', 'Other'];
const TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];

// Home / job list with search
router.get('/', async (req, res) => {
  const { q, location, category } = req.query;
  const filter = {};
  if (q) filter.$or = [
    { title: { $regex: q, $options: 'i' } },
    { company: { $regex: q, $options: 'i' } },
    { description: { $regex: q, $options: 'i' } },
  ];
  if (location) filter.location = { $regex: location, $options: 'i' };
  if (category) filter.category = category;

  const jobs = await Job.find(filter).sort({ createdAt: -1 }).limit(100);
  res.render('index', { jobs, query: { q: q || '', location: location || '', category: category || '' }, categories: CATEGORIES });
});

// New job form
router.get('/jobs/new', requireRole('employer'), (req, res) => {
  res.render('job-new', { error: null, form: {}, categories: CATEGORIES, types: TYPES });
});

// Create job
router.post('/jobs', requireRole('employer'), async (req, res) => {
  try {
    const { title, company, location, category, type, salary, description } = req.body;
    if (!title || !company || !location || !description) throw new Error('Please fill in all required fields.');
    await Job.create({
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      category: CATEGORIES.includes(category) ? category : 'Other',
      type: TYPES.includes(type) ? type : 'Full-time',
      salary: (salary || '').trim(),
      description: description.trim(),
      postedBy: req.session.user.id,
    });
    res.redirect('/');
  } catch (err) {
    res.status(400).render('job-new', { error: err.message, form: req.body, categories: CATEGORIES, types: TYPES });
  }
});

// Employer dashboard — my jobs + applicants
router.get('/dashboard', requireRole('employer'), async (req, res) => {
  const jobs = await Job.find({ postedBy: req.session.user.id }).sort({ createdAt: -1 });
  const jobIds = jobs.map(j => j._id);
  const apps = await Application.find({ job: { $in: jobIds } })
    .populate('applicant', 'name email')
    .populate('job', 'title')
    .sort({ createdAt: -1 });
  res.render('dashboard', { jobs, apps });
});

// Job detail
router.get('/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).render('404');
    let alreadyApplied = false;
    if (req.session.user && req.session.user.role === 'seeker') {
      alreadyApplied = !!(await Application.findOne({ job: job._id, applicant: req.session.user.id }));
    }
    res.render('job-detail', { job, alreadyApplied });
  } catch {
    res.status(404).render('404');
  }
});

// Delete job (owner only)
router.post('/jobs/:id/delete', requireRole('employer'), async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (job && String(job.postedBy) === String(req.session.user.id)) {
    await Application.deleteMany({ job: job._id });
    await job.deleteOne();
  }
  res.redirect('/dashboard');
});

module.exports = router;
