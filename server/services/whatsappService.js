const sendWhatsApp = async ({ to, template, params }) => {
  if (!process.env.WHATSAPP_API_KEY) {
    console.log(`[WhatsAppService] WhatsApp not configured. Would send to ${to}: ${template}`, params);
    return { success: false, message: 'WhatsApp not configured' };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to.replace(/^0/, '88'),
          type: 'template',
          template: { name: template, language: { code: 'en' }, components: [{ type: 'body', parameters: params }] },
        }),
      }
    );
    const data = await response.json();
    console.log(`[WhatsAppService] Message sent to ${to}:`, data);
    return { success: true, data };
  } catch (err) {
    console.error(`[WhatsAppService] Failed to send to ${to}:`, err.message);
    return { success: false, message: err.message };
  }
};

const sendConfirmationWhatsApp = async (student) => {
  return sendWhatsApp({
    to: student.mobile,
    template: 'registration_confirmation',
    params: [{ type: 'text', text: student.student_name }],
  });
};

module.exports = { sendWhatsApp, sendConfirmationWhatsApp };
