const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Application = require('../models/Application');
const { requireLogin, requireRole } = require('../middleware/auth');

const CATEGORIES = ['Engineering', 'Design', 'Marketing', 'Sales', 'Finance', 'Operations', 'Other'];
const TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
const SALARY_RANGES = [
  { label: '20k - 30k', min: 20, max: 30 },
  { label: '30k - 50k', min: 30, max: 50 },
  { label: '50k - 75k', min: 50, max: 75 },
  { label: '75k - 100k', min: 75, max: 100 },
  { label: '100k+', min: 100, max: 999999 },
];

// Home / job list with search
router.get('/', async (req, res) => {
  const { q, location, category, salaryRange } = req.query;
  const filter = {};
  if (q) filter.$or = [
    { title: { $regex: q, $options: 'i' } },
    { company: { $regex: q, $options: 'i' } },
    { description: { $regex: q, $options: 'i' } },
  ];
  if (location) filter.location = { $regex: location, $options: 'i' };
  if (category) filter.category = category;
  
  // Add salary range filter
  if (salaryRange) {
    const range = SALARY_RANGES.find(r => r.label === salaryRange);
    if (range) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        $and: [
          { salaryMin: { $lte: range.max } },
          { salaryMax: { $gte: range.min } }
        ]
      });
    }
  }

  const jobs = await Job.find(filter).sort({ createdAt: -1 }).limit(100);
  res.render('index', { 
    jobs, 
    query: { q: q || '', location: location || '', category: category || '', salaryRange: salaryRange || '' }, 
    categories: CATEGORIES,
    salaryRanges: SALARY_RANGES 
  });
});

// New job form
router.get('/jobs/new', requireRole('employer'), (req, res) => {
  res.render('job-new', { error: null, form: {}, categories: CATEGORIES, types: TYPES, salaryRanges: SALARY_RANGES });
});

// Create job
router.post('/jobs', requireRole('employer'), async (req, res) => {
  try {
    const { title, company, location, category, type, salaryRange, description } = req.body;
    if (!title || !company || !location || !description) throw new Error('Please fill in all required fields.');
    
    let salaryMin, salaryMax;
    if (salaryRange) {
      const range = SALARY_RANGES.find(r => r.label === salaryRange);
      if (range) {
        salaryMin = range.min;
        salaryMax = range.max === 999999 ? 999999 : range.max;
      }
    }
    
    await Job.create({
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      category: CATEGORIES.includes(category) ? category : 'Other',
      type: TYPES.includes(type) ? type : 'Full-time',
      salaryMin,
      salaryMax,
      description: description.trim(),
      postedBy: req.session.user.id,
    });
    res.redirect('/');
  } catch (err) {
    res.status(400).render('job-new', { error: err.message, form: req.body, categories: CATEGORIES, types: TYPES, salaryRanges: SALARY_RANGES });
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
