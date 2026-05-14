const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { sendVerificationCode } = require('../utils/mailer');
const { configurePassport, isGoogleEnabled, passport } = require('../utils/passport');
const { passwordScore } = require('../utils/passwordUtils');

configurePassport();

// ========================= REGISTER =========================
router.get('/register', (req, res) => {
  res.render('register', { error: null, form: {}, googleEnabled: isGoogleEnabled() });
});

router.post('/register', async (req, res) => {
  const {
    name, email, password, confirmPassword, role,
    // employer fields
    company, industry, companySize,
    // seeker fields
    headline, skills, location,
  } = req.body;
  try {
    if (!name || !email || !password) throw new Error('All fields are required.');
    if (password.length < 8) throw new Error('Password must be at least 8 characters.');
    if (password !== confirmPassword) throw new Error('Passwords do not match.');
    if (passwordScore(password) < 2)
      throw new Error('Password is too weak. Add uppercase, numbers, or symbols.');

    const isEmployer = role === 'employer';
    if (isEmployer && !company) throw new Error('Employers must enter a company name.');
    if (!isEmployer && !headline) throw new Error('Please enter your professional headline.');

    const emailLower = email.trim().toLowerCase();
    const existing = await User.findOne({ email: emailLower });
    if (existing && existing.emailVerified) {
      throw new Error('That email is already registered.');
    }

    let user = existing;
    if (!user) user = new User({ email: emailLower });
    user.name = name.trim();
    user.password = password;
    user.role = isEmployer ? 'employer' : 'seeker';
    user.location = (location || '').trim() || undefined;
    if (isEmployer) {
      user.company = (company || '').trim();
      user.industry = (industry || '').trim() || undefined;
      user.companySize = (companySize || '').trim() || undefined;
    } else {
      user.headline = (headline || '').trim();
      user.skills = (skills || '')
        .split(',').map(s => s.trim()).filter(Boolean).slice(0, 30);
    }

    const code = await user.setCode('signup');
    await user.save();

    try {
      await sendVerificationCode(user.email, code, 'signup');
    } catch (mailErr) {
      throw new Error('Could not send verification email: ' + mailErr.message);
    }

    req.session.pendingEmail = user.email;
    req.session.pendingPurpose = 'signup';
    res.redirect('/auth/verify');
  } catch (err) {
    console.error(`[AUTH] Registration error:`, err.message);
    res.status(400).render('register', {
      error: err.message, form: req.body, googleEnabled: isGoogleEnabled(),
    });
  }
});

// ========================= VERIFY (signup OR login code) =========================
router.get('/verify', (req, res) => {
  if (!req.session.pendingEmail) return res.redirect('/auth/login');
  res.render('verify', {
    error: null,
    email: req.session.pendingEmail,
    purpose: req.session.pendingPurpose || 'signup',
  });
});

router.post('/verify', async (req, res) => {
  const email = req.session.pendingEmail;
  const purpose = req.session.pendingPurpose || 'signup';
  const { code } = req.body;
  try {
    if (!email) throw new Error('Session expired. Please start again.');
    const user = await User.findOne({ email });
    if (!user) throw new Error('Account not found.');
    const ok = await user.checkCode(code, purpose);
    if (!ok) throw new Error('Invalid or expired code.');

    user.clearCode();
    if (purpose === 'signup') user.emailVerified = true;
    await user.save();

    req.session.pendingEmail = null;
    req.session.pendingPurpose = null;
    req.session.user = { id: user._id, name: user.name, email: user.email, role: user.role };
    res.redirect('/profile');
  } catch (err) {
    res.status(400).render('verify', { error: err.message, email, purpose });
  }
});

router.post('/verify/resend', async (req, res) => {
  const email = req.session.pendingEmail;
  const purpose = req.session.pendingPurpose || 'signup';
  try {
    if (!email) throw new Error('Session expired.');
    const user = await User.findOne({ email });
    if (!user) throw new Error('Account not found.');
    const code = await user.setCode(purpose);
    await user.save();
    await sendVerificationCode(user.email, code, purpose);
    res.render('verify', { error: null, email, purpose, info: 'A new code has been sent.' });
  } catch (err) {
    res.status(400).render('verify', { error: err.message, email, purpose });
  }
});

// ========================= LOGIN (password) =========================
router.get('/login', (req, res) => {
  res.render('login', { error: null, form: {}, googleEnabled: isGoogleEnabled() });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !(await user.comparePassword(password || ''))) {
      throw new Error('Invalid email or password.');
    }
    if (!user.emailVerified) {
      const code = await user.setCode('signup');
      await user.save();
      await sendVerificationCode(user.email, code, 'signup');
      req.session.pendingEmail = user.email;
      req.session.pendingPurpose = 'signup';
      return res.redirect('/auth/verify');
    }
    req.session.user = { id: user._id, name: user.name, email: user.email, role: user.role };
    res.redirect('/');
  } catch (err) {
    res.status(400).render('login', {
      error: err.message, form: req.body, googleEnabled: isGoogleEnabled(),
    });
  }
});

// ========================= LOGIN WITH EMAIL CODE =========================
router.get('/login-code', (req, res) => {
  res.render('login-code', { error: null, form: {} });
});

router.post('/login-code', async (req, res) => {
  const { email } = req.body;
  try {
    const emailLower = (email || '').trim().toLowerCase();
    const user = await User.findOne({ email: emailLower });
    if (!user) throw new Error('No account found with that email.');
    const code = await user.setCode('login');
    await user.save();
    await sendVerificationCode(user.email, code, 'login');
    req.session.pendingEmail = user.email;
    req.session.pendingPurpose = 'login';
    res.redirect('/auth/verify');
  } catch (err) {
    res.status(400).render('login-code', { error: err.message, form: req.body });
  }
});

// ========================= FORGOT / RESET PASSWORD =========================
router.get('/forgot', (req, res) => {
  res.render('forgot', { error: null, info: null, form: {} });
});

router.post('/forgot', async (req, res) => {
  const { email } = req.body;
  try {
    const emailLower = (email || '').trim().toLowerCase();
    const user = await User.findOne({ email: emailLower });
    // Always behave as if it worked (avoid email enumeration), but only really send if exists
    if (user) {
      const code = await user.setCode('reset');
      await user.save();
      await sendVerificationCode(user.email, code, 'reset');
    }
    req.session.resetEmail = emailLower;
    res.redirect('/auth/reset');
  } catch (err) {
    res.status(400).render('forgot', { error: err.message, info: null, form: req.body });
  }
});

router.get('/reset', (req, res) => {
  if (!req.session.resetEmail) return res.redirect('/auth/forgot');
  res.render('reset', { error: null, email: req.session.resetEmail });
});

router.post('/reset', async (req, res) => {
  const email = req.session.resetEmail;
  const { code, password, confirmPassword } = req.body;
  try {
    if (!email) throw new Error('Session expired. Please request a new code.');
    if (!password || password.length < 8) throw new Error('Password must be at least 8 characters.');
    if (password !== confirmPassword) throw new Error('Passwords do not match.');
    if (passwordScore(password) < 2) throw new Error('Password is too weak.');

    const user = await User.findOne({ email });
    if (!user) throw new Error('Account not found.');
    const ok = await user.checkCode(code, 'reset');
    if (!ok) throw new Error('Invalid or expired code.');

    user.password = password; // re-hashed by pre-save hook
    user.clearCode();
    user.emailVerified = true;
    await user.save();
    req.session.resetEmail = null;
    res.redirect('/auth/login');
  } catch (err) {
    res.status(400).render('reset', { error: err.message, email });
  }
});

// ========================= GOOGLE OAUTH =========================
router.get('/google', (req, res, next) => {
  if (!isGoogleEnabled()) {
    return res.status(503).render('error', {
      message: 'Google sign-in is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env',
    });
  }
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  if (!isGoogleEnabled()) return res.redirect('/auth/login');
  passport.authenticate('google', { session: false, failureRedirect: '/auth/login' }, (err, user) => {
    if (err || !user) return res.redirect('/auth/login');
    req.session.user = { id: user._id, name: user.name, email: user.email, role: user.role };
    res.redirect('/profile');
  })(req, res, next);
});

// ========================= LOGOUT =========================
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
