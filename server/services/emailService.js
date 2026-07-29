const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  const transport = getTransporter();
  if (!transport) {
    console.log('[EmailService] SMTP not configured. Skipping email to:', to);
    return { success: false, message: 'SMTP not configured' };
  }

  try {
    const info = await transport.sendMail({
      from: `"FARS" <${process.env.EMAIL_FROM || 'noreply@fars.com'}>`,
      to,
      subject,
      html,
    });
    console.log(`[EmailService] Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EmailService] Failed to send email to ${to}:`, err.message);
    return { success: false, message: err.message };
  }
};

const sendConfirmationEmail = async (student) => {
  const html = `
    <h2>Registration Submitted Successfully</h2>
    <p>Dear ${student.student_name},</p>
    <p>Your registration has been received. Our team will review your application and payment.</p>
    <p>You can track your application status using your mobile number: ${student.mobile}</p>
    <br/>
    <p>Best regards,<br/>FARS Team</p>
  `;
  return sendEmail({ to: student.email, subject: 'Registration Confirmed - FARS', html });
};

const sendStatusChangeEmail = async (student, newStatus) => {
  const html = `
    <h2>Application Status Updated</h2>
    <p>Dear ${student.student_name},</p>
    <p>Your application status has been updated to: <strong>${newStatus}</strong></p>
    <br/>
    <p>Best regards,<br/>FARS Team</p>
  `;
  return sendEmail({ to: student.email, subject: `Status Update: ${newStatus} - FARS`, html });
};

module.exports = { sendEmail, sendConfirmationEmail, sendStatusChangeEmail };
