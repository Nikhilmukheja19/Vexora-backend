import env from '../config/env.js';

// Email service - mock in dev, ready for Nodemailer/SendGrid in production
export const sendEmail = async ({ to, subject, html, text }) => {
  if (!env.SMTP_HOST || !env.SMTP_USER) {
    console.log(`📧 [MOCK EMAIL] To: ${to}, Subject: ${subject}`);
    console.log(`   Body: ${text || html?.substring(0, 100)}`);
    return { success: true, mock: true };
  }

  try {
    // Dynamic import to avoid errors if nodemailer isn't configured
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: false,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"LocalBoost AI" <${env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });

    return { success: true, mock: false };
  } catch (error) {
    console.error('Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

export const sendOrderConfirmation = async (order, customerEmail) => {
  return sendEmail({
    to: customerEmail,
    subject: `Order Confirmed - #${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Order Confirmed! 🎉</h2>
        <p>Your order <strong>#${order.orderNumber}</strong> has been confirmed.</p>
        <p>Total: <strong>₹${order.total.toFixed(2)}</strong></p>
        <p>We'll notify you when your order ships.</p>
        <p style="color: #888;">Thank you for shopping with us!</p>
      </div>
    `,
    text: `Order #${order.orderNumber} confirmed. Total: ₹${order.total.toFixed(2)}`,
  });
};

export const sendTicketNotification = async (ticket, email) => {
  return sendEmail({
    to: email,
    subject: `Support Ticket #${ticket.ticketNumber} - ${ticket.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Support Ticket Update</h2>
        <p>Ticket <strong>#${ticket.ticketNumber}</strong>: ${ticket.subject}</p>
        <p>Status: <strong>${ticket.status}</strong></p>
        <p>Our team will respond shortly.</p>
      </div>
    `,
    text: `Ticket #${ticket.ticketNumber}: ${ticket.subject}. Status: ${ticket.status}`,
  });
};
