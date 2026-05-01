const express = require('express');
const router = express.Router();
const User = require('../../database/models/User');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');

// Initialize Google OAuth client (only if credentials exist in .env)
let googleClient = null;
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.BASE_URL || 'http://localhost:3000'}/auth/google/callback`
  );
}

// ========== REGISTER ROUTES ==========
router.get('/register', (req, res) => {
  res.render('register', { error: null, form: {} });
});

router.post('/register', async (req, res) => {
  const { name, email, password, role, company } = req.body;
  
  try {
    // Validations
    if (!name || !email || !password) throw new Error('All fields are required.');
    if (password.length < 6) throw new Error('Password must be at least 6 characters.');
    
    // Check if email already exists in YOUR database
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new Error('That email is already registered.');
    
    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: role === 'employer' ? 'employer' : 'seeker',
      company: role === 'employer' ? (company || '').trim() : undefined,
    });

    req.session.user = { 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role 
    };
    
    res.redirect('/');
  } catch (err) {
    res.status(400).render('register', { error: err.message, form: req.body });
  }
});

// ========== GOOGLE OAUTH ROUTES (Only if configured) ==========
if (googleClient) {
  // Redirect to Google's consent screen
  router.get('/google', (req, res) => {
    const url = googleClient.generateAuthUrl({
      access_type: 'online',
      scope: ['email', 'profile'],
      prompt: 'select_account'
    });
    res.redirect(url);
  });

  // Google callback after user authenticates
  router.get('/google/callback', async (req, res) => {
    const { code } = req.query;
    
    if (!code) {
      return res.redirect('/auth/register?error=google_auth_failed');
    }
    
    try {
      // Exchange code for tokens
      const { tokens } = await googleClient.getToken(code);
      
      // Verify the ID token
      const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      
      const payload = ticket.getPayload();
      const email = payload.email;
      const name = payload.name;
      const googleId = payload.sub;
      const emailVerified = payload.email_verified;
      
      if (!emailVerified) {
        return res.redirect('/auth/register?error=email_not_verified');
      }
      
      // Check if user exists
      let user = await User.findOne({ $or: [
        { email: email.toLowerCase() },
        { googleId: googleId }
      ]});
      
      if (!user) {
        // Create new user with Google account
        user = await User.create({
          name: name,
          email: email.toLowerCase(),
          password: crypto.randomBytes(32).toString('hex'),
          role: 'seeker',
          googleId: googleId,
          emailVerified: true,
          authProvider: 'google'
        });
      }
      
      // Log the user in
      req.session.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      };
      
      res.redirect('/');
      
    } catch (error) {
      console.error('Google auth error:', error);
      res.redirect('/auth/register?error=google_auth_failed');
    }
  });
}

// ========== LOGIN ROUTES ==========
router.get('/login', (req, res) => {
  res.render('login', { error: null, form: {} });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !(await user.comparePassword(password || ''))) {
      throw new Error('Invalid email or password.');
    }
    req.session.user = { 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role 
    };
    res.redirect('/');
  } catch (err) {
    res.status(400).render('login', { error: err.message, form: req.body });
  }
});

// ========== LOGOUT ROUTE ==========
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;