# Resend Email Configuration

Your application has been switched from SendGrid/Gmail to **Resend** for email delivery.

## What Was Changed

1. ✅ Replaced `nodemailer` with `resend` package
2. ✅ Updated `backend/utils/mailer.js` to use Resend API
3. ✅ Removed logging from `backend/routes/auth.js`
4. ✅ Updated `.env` configuration
5. ✅ Removed `nodemailer` from dependencies

## Setup Instructions

### 1. Get Your Resend API Key

1. Go to https://resend.com
2. Sign up or log in
3. Go to Settings → API Keys
4. Copy your API key

### 2. Update Your .env File

Replace the placeholder with your actual Resend API key:

```env
# === Email service configuration (Resend) ===
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
MAIL_FROM_ADDRESS=noreply@jobconnect.com
MAIL_FROM_NAME=JobConnect
```

### 3. Start the Server

```bash
npm start
```

The server will now use Resend for all email notifications (signup verification, login verification, application notifications).

## Verify Sender Email in Resend

Before you can send emails, you need to verify your sender email in Resend:

1. Log in to Resend dashboard
2. Go to Senders
3. Add or verify `noreply@jobconnect.com` (or another email)
4. Check your email and verify the domain

**Note:** During testing, you can use your personal email. For production, use a domain email like `noreply@yourdomain.com`.

## Testing

1. Start the server with `npm start`
2. Register a new account at http://localhost:3000/auth/register
3. Check your email for the verification code
4. Complete the verification process

## No More SendGrid Configuration Needed

Your old SendGrid SMTP settings have been removed. Resend is now the only email service configured.
