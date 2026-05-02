const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const user = process.env.GMAIL_USER;
  const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
  if (!user || !pass) {
    throw new Error(
      'Gmail SMTP is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in your .env file.'
    );
  }
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
  return transporter;
}

const SUBJECTS = {
  signup: (code) => `Verify your JobConnect email — code ${code}`,
  login: (code) => `Your JobConnect sign-in code: ${code}`,
  reset: (code) => `Reset your JobConnect password — code ${code}`,
};

const ACTIONS = {
  signup: 'verify your email',
  login: 'sign in',
  reset: 'reset your password',
};

async function sendVerificationCode(toEmail, code, purpose) {
  const t = getTransporter();
  const fromName = process.env.MAIL_FROM_NAME || 'JobConnect';
  const subject = (SUBJECTS[purpose] || SUBJECTS.signup)(code);
  const action = ACTIONS[purpose] || ACTIONS.signup;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e4e2e0;border-radius:10px;">
      <h2 style="color:#2557a7;margin:0 0 8px;">JobConnect</h2>
      <p>Use the code below to ${action}. It expires in <b>15 minutes</b>.</p>
      <div style="font-size:32px;font-weight:800;letter-spacing:6px;background:#eef3fb;color:#164081;padding:16px;border-radius:8px;text-align:center;margin:16px 0;">
        ${code}
      </div>
      <p style="color:#767676;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;
  await t.sendMail({
    from: `"${fromName}" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject,
    text: `Your JobConnect code is ${code} (expires in 15 minutes).`,
    html,
  });
}

module.exports = { sendVerificationCode };
