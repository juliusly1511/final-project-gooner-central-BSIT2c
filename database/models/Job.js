const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    company: { type: String, required: true, trim: true, maxlength: 150 },
    location: { type: String, required: true, trim: true, maxlength: 150 },
    category: {
      type: String,
      enum: ['Engineering', 'Design', 'Marketing', 'Sales', 'Finance', 'Operations', 'Other'],
      default: 'Other',
    },
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
      default: 'Full-time',
    },
    salary: { type: String, trim: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 10000 },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text', company: 'text' });

module.exports = mongoose.model('Job', jobSchema);
