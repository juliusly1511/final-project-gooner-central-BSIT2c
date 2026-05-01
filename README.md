# Job Connect

A simple, easily-modifiable job board built with **Node.js, Express, MongoDB, EJS, vanilla HTML/CSS/JS**.

## Features
- Browse & search jobs 
- Job detail pages
- User auth (job seekers + employers) with sessions
- Employers can post jobs
- Job seekers can apply with a resume upload (PDF/DOC)
- Employers see applications for their jobs

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   Copy `.env.example` to `.env` and fill in your MongoDB connection string:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/jobboard
   SESSION_SECRET=some-long-random-string
   PORT=3000
   ```
   You can use a local MongoDB or a free MongoDB Atlas cluster.

3. **Run**
   ```bash
   npm start
   ```
   Open http://localhost:3000

## Project Structure
```
server.js           # Express app entry
.env                # Your secrets (create from .env.example)

backend/
models/             # Mongoose models (User, Job, Application)
routes/             # Route handlers (auth, jobs, applications)
middleware/         # Auth middleware

frontend/
views/              # EJS templates (HTML)
public/css/         # Stylesheets
public/js/          # Client-side JS
public/uploads/     # Uploaded resumes

```

## How to modify
- **Look & feel** → edit `public/css/style.css`
- **Pages/HTML** → edit files in `views/`
- **Business logic** → edit files in `routes/`
- **Database fields** → edit files in `models/`
