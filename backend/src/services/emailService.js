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

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    html,
    attachments
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };
