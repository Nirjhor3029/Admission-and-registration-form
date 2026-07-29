const sendSMS = async ({ to, message }) => {
  if (!process.env.SMS_API_KEY || process.env.SMS_PROVIDER === 'placeholder') {
    console.log(`[SMSService] SMS not configured. Would send to ${to}: ${message}`);
    return { success: false, message: 'SMS provider not configured' };
  }

  try {
    const response = await fetch('https://api.example-sms-provider.com/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SMS_API_KEY}`,
      },
      body: JSON.stringify({
        to,
        message,
        sender: process.env.SMS_SENDER_ID || 'FARS',
      }),
    });
    const data = await response.json();
    console.log(`[SMSService] SMS sent to ${to}:`, data);
    return { success: true, data };
  } catch (err) {
    console.error(`[SMSService] Failed to send SMS to ${to}:`, err.message);
    return { success: false, message: err.message };
  }
};

const sendConfirmationSMS = async (student) => {
  const message = `Dear ${student.student_name}, your registration at FARS has been submitted successfully. We will contact you soon.`;
  return sendSMS({ to: student.mobile, message });
};

const sendStatusChangeSMS = async (student, newStatus) => {
  const message = `Dear ${student.student_name}, your FARS application status has been updated to: ${newStatus}.`;
  return sendSMS({ to: student.mobile, message });
};

module.exports = { sendSMS, sendConfirmationSMS, sendStatusChangeSMS };
