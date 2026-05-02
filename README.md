# JobConnect
 built with **Node.js**, **Express**, **MongoDB**, and **EJS**.

## 📁 Project structure

```
jobconnect/
├── backend/                ← all server-side code
│   ├── server.js
│   ├── routes/             (auth, jobs, profile, profiles-search, applications)
│   ├── models/             (User, Job, Application)
│   ├── middleware/         (auth)
│   └── utils/              (mailer, passport, upload)
│
├── frontend/               ← all client-facing code
│   ├── views/              (EJS templates + partials)
│   └── public/
│       ├── css/style.css
│       ├── js/             (main.js, password.js)
│       └── uploads/        (user-uploaded avatars / resumes)
│
├── package.json            ← `npm start` runs backend/server.js
├── .env.example
└── README.md
```

The backend resolves the frontend folder relative to its own location
(`path.join(__dirname, '..', 'frontend')`), so you can run the app from
the project root with `npm start`.

## 🚀 Quick start

```bash
npm install
cp .env.example .env        # then fill in MONGODB_URI, GMAIL_USER, etc.
npm start                   # http://localhost:3000
```

## ✨ Features

- Job seekers + employers (different signup fields)
- Profile creation with avatar, headline, skills, experience, education
- Public profile pages and **profile search** at `/people`
- Email verification + sign-in by email code (Gmail SMTP)
- Forgot-password flow with 6-digit reset code
- Optional **Sign in with Google** (set `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`)
- Password strength meter + confirm-password match
- Fully responsive, modern UI with fixed header