const nodemailer = require('nodemailer');

const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: parseInt(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false }
  });
};

const sendEmail = async (to, subject, html, attachments = []) => {
  const transporter = getTransporter();
  const fromEmail = process.env.SMTP_USER;
  const fromName = process.env.SMTP_FROM_NAME || 'Daniel Pereira dos Santos - Perito Judicial';

  if (!fromEmail) throw new Error('SMTP_USER not configured in environment');

  // Remove HTML tags for plain text fallback to improve SPAM score
  const fallbackText = html.replace(/<[^>]*>?/gm, '');

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    replyTo: fromEmail,
    subject,
    text: fallbackText,
    html,
    attachments,
    headers: {
      'Precedence': 'bulk',
      'X-Auto-Response-Suppress': 'OOF',
      'List-Unsubscribe': `<mailto:${fromEmail}?subject=unsubscribe>`
    },
    messageId: `<${Date.now()}-${Math.random().toString(36).substring(2)}@ehspro.com.br>`
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };
