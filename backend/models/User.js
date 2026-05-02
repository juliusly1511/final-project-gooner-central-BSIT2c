const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const experienceSchema = new mongoose.Schema(
  {
    title: String,
    company: String,
    from: String,
    to: String,
    description: String,
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    school: String,
    degree: String,
    field: String,
    year: String,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // password is optional for accounts created via Google OAuth
    password: { type: String },
    role: { type: String, enum: ['seeker', 'employer'], default: 'seeker' },
    emailVerified: { type: Boolean, default: false },

    // Google OAuth
    googleId: { type: String, index: true },
    avatarUrl: { type: String }, // /uploads/xyz.jpg or remote URL from Google

    // ---- Shared profile ----
    headline: { type: String, maxlength: 160 },   // e.g. "Senior React Developer"
    bio: { type: String, maxlength: 2000 },
    location: { type: String, maxlength: 120 },
    phone: { type: String, maxlength: 40 },
    website: { type: String, maxlength: 200 },

    // ---- Seeker-specific ----
    skills: [{ type: String }],                    // ["React","Node"]
    experience: [experienceSchema],
    education: [educationSchema],
    resumeUrl: { type: String },

    // ---- Employer-specific ----
    company: { type: String, trim: true, maxlength: 150 },
    companySize: { type: String, maxlength: 40 }, // e.g. "11-50"
    industry: { type: String, maxlength: 80 },
    companyAbout: { type: String, maxlength: 2000 },

    // ---- Verification / login codes (6-digit) ----
    verifyCodeHash: String,
    verifyCodeExpires: Date,
    verifyCodePurpose: { type: String, enum: ['signup', 'login', 'reset', null], default: null },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  // Avoid double-hashing if it already looks like a bcrypt hash
  if (/^\$2[aby]\$/.test(this.password)) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.setCode = async function (purpose) {
  const code = '' + Math.floor(100000 + Math.random() * 900000);
  this.verifyCodeHash = await bcrypt.hash(code, 8);
  this.verifyCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
  this.verifyCodePurpose = purpose;
  return code;
};

userSchema.methods.checkCode = async function (code, purpose) {
  if (!this.verifyCodeHash || !this.verifyCodeExpires) return false;
  if (this.verifyCodePurpose !== purpose) return false;
  if (this.verifyCodeExpires.getTime() < Date.now()) return false;
  return bcrypt.compare(String(code || ''), this.verifyCodeHash);
};

userSchema.methods.clearCode = function () {
  this.verifyCodeHash = undefined;
  this.verifyCodeExpires = undefined;
  this.verifyCodePurpose = null;
};

module.exports = mongoose.model('User', userSchema);
