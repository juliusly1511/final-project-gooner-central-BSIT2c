// Google OAuth setup (optional — only initialises when env vars are set).
const passport = require('passport');
const User = require('../models/User');

let configured = false;

function configurePassport() {
  if (configured) return passport;

  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL =
    process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback';

  if (!clientID || !clientSecret) {
    // Not configured — leave passport unusable. Routes will check this.
    configured = true;
    return passport;
  }

  const GoogleStrategy = require('passport-google-oauth20').Strategy;

  passport.use(
    new GoogleStrategy(
      { clientID, clientSecret, callbackURL },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0] && profile.emails[0].value;
          if (!email) return done(new Error('Google account has no email.'));
          let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });
          if (!user) {
            user = await User.create({
              name: profile.displayName || email.split('@')[0],
              email: email.toLowerCase(),
              googleId: profile.id,
              avatarUrl: profile.photos && profile.photos[0] && profile.photos[0].value,
              emailVerified: true,
              role: 'seeker', // default; user can switch in profile
            });
          } else if (!user.googleId) {
            user.googleId = profile.id;
            if (!user.avatarUrl && profile.photos && profile.photos[0]) {
              user.avatarUrl = profile.photos[0].value;
            }
            user.emailVerified = true;
            await user.save();
          }
          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const u = await User.findById(id);
      done(null, u);
    } catch (e) {
      done(e);
    }
  });

  configured = true;
  return passport;
}

function isGoogleEnabled() {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

module.exports = { configurePassport, isGoogleEnabled, passport };
