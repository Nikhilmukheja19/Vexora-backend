// Mock WhatsApp service - ready for WhatsApp Business API integration
import env from '../config/env.js';

export const sendWhatsAppMessage = async (phone, message) => {
  console.log(`📱 [MOCK WHATSAPP] To: ${phone}, Message: ${message.substring(0, 100)}`);
  return { success: true, mock: true, messageId: `wa_${Date.now()}` };
};

export const sendOrderNotificationWA = async (phone, order) => {
  const message = `🛒 Order Update!\nOrder: #${order.orderNumber}\nStatus: ${order.status}\nTotal: ₹${order.total}\n\nThank you for your purchase!`;
  return sendWhatsAppMessage(phone, message);
};
