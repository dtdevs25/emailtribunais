const nodemailer = require('nodemailer');
const { query } = require('../db/pool');

const getTransporter = async () => {
  const configs = await query('SELECT chave, valor FROM configuracoes WHERE chave LIKE \'SMTP_%\'');
  const configMap = configs.rows.reduce((acc, row) => {
    acc[row.chave] = row.valor;
    return acc;
  }, {});

  return nodemailer.createTransport({
    host: configMap.SMTP_HOST,
    port: parseInt(configMap.SMTP_PORT) || 587,
    secure: parseInt(configMap.SMTP_PORT) === 465,
    auth: {
      user: configMap.SMTP_USER,
      pass: configMap.SMTP_PASS,
    },
  });
};

const sendEmail = async (to, subject, html, attachments = []) => {
  const transporter = await getTransporter();
  const configs = await query('SELECT valor FROM configuracoes WHERE chave = \'SMTP_FROM_NAME\' OR chave = \'SMTP_FROM_EMAIL\'');
  const fromName = configs.rows.find(c => c.chave === 'SMTP_FROM_NAME')?.valor || 'Perito Judicial';
  const fromEmail = configs.rows.find(c => c.chave === 'SMTP_FROM_EMAIL')?.valor;

  if (!fromEmail) throw new Error('SMTP_FROM_EMAIL not configured');

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    html,
    attachments
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendEmail
};
