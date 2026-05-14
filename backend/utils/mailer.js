const { Resend } = require('resend');

let resend = null;

function getResendClient() {
  if (resend) return resend;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Resend API key is not configured. Set RESEND_API_KEY in your .env file.'
    );
  }
  resend = new Resend(apiKey);
  return resend;
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
  const client = getResendClient();
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
  
  const fromAddress = process.env.MAIL_FROM_ADDRESS || 'noreply@jobconnect.com';

  await client.emails.send({
    from: `${fromName} <${fromAddress}>`,
    to: toEmail,
    subject,
    html,
  });
}

async function sendApplicationNotification(employerEmail, employerName, applicantData, jobData) {
  const client = getResendClient();
  const fromName = process.env.MAIL_FROM_NAME || 'JobConnect';
  
  const coverLetterPreview = applicantData.coverLetter 
    ? applicantData.coverLetter.substring(0, 200) + (applicantData.coverLetter.length > 200 ? '...' : '')
    : 'No cover letter provided';
  
  const resumeLink = applicantData.resumePath 
    ? `<p><a href="${process.env.APP_URL || 'http://localhost:3000'}${applicantData.resumePath}" style="color:#2557a7;text-decoration:none;font-weight:bold;">📄 Download Resume</a></p>`
    : '<p><em>No resume attached</em></p>';
  
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e4e2e0;border-radius:10px;">
      <h2 style="color:#2557a7;margin:0 0 16px;">JobConnect — New Application</h2>
      
      <div style="background:#f5f5f5;padding:16px;border-radius:8px;margin:16px 0;">
        <p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;">Job Position</p>
        <h3 style="margin:8px 0 0;color:#333;">${jobData.title}</h3>
        <p style="margin:4px 0 0;color:#666;font-size:14px;">${jobData.company}</p>
      </div>

      <div style="margin:20px 0;">
        <p style="color:#666;font-size:12px;text-transform:uppercase;margin:0 0 8px;">Applicant Information</p>
        <p style="margin:4px 0;"><strong>${applicantData.name}</strong></p>
        <p style="margin:4px 0;color:#666;"><a href="mailto:${applicantData.email}" style="color:#2557a7;text-decoration:none;">${applicantData.email}</a></p>
        ${applicantData.phone ? `<p style="margin:4px 0;color:#666;font-size:14px;">${applicantData.phone}</p>` : ''}
      </div>

      <div style="margin:20px 0;">
        <p style="color:#666;font-size:12px;text-transform:uppercase;margin:0 0 8px;">Cover Letter</p>
        <div style="background:#f9f9f9;padding:12px;border-left:3px solid #2557a7;margin:8px 0;">
          <p style="margin:0;color:#333;font-size:14px;line-height:1.5;">${coverLetterPreview}</p>
        </div>
      </div>

      <div style="margin:20px 0;">
        <p style="color:#666;font-size:12px;text-transform:uppercase;margin:0 0 8px;">Resume</p>
        ${resumeLink}
      </div>

      <div style="background:#eef3fb;padding:16px;border-radius:8px;margin:20px 0;text-align:center;">
        <a href="${process.env.APP_URL || 'http://localhost:3000'}/jobs/${jobData._id}" style="display:inline-block;background:#2557a7;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">View Full Application</a>
      </div>

      <p style="color:#767676;font-size:12px;margin:16px 0 0;border-top:1px solid #e4e2e0;padding-top:16px;">
        You're receiving this email because ${applicantData.name} applied for <strong>${jobData.title}</strong> at your company. 
        <br>This is an automated notification from JobConnect.
      </p>
    </div>
  `;

  const fromAddress = process.env.MAIL_FROM_ADDRESS || 'noreply@jobconnect.com';

  await client.emails.send({
    from: `${fromName} <${fromAddress}>`,
    to: employerEmail,
    subject: `New Application: ${applicantData.name} applied for ${jobData.title}`,
    html,
  });
}

module.exports = { sendVerificationCode, sendApplicationNotification };
