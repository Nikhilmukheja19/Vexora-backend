import env from '../config/env.js';

// Mock payment service - ready for Stripe/Razorpay integration
export const createPaymentIntent = async (amount, currency = 'INR', metadata = {}) => {
  // In production, replace with actual Stripe/Razorpay call
  const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    success: true,
    paymentId,
    amount,
    currency,
    status: 'created',
    // Stripe/Razorpay would return a client_secret here
    clientSecret: `mock_secret_${paymentId}`,
  };
};

export const verifyPayment = async (paymentId) => {
  // Mock verification - always succeeds in dev
  return {
    success: true,
    paymentId,
    status: 'paid',
    paidAt: new Date(),
  };
};

export const processRefund = async (paymentId, amount) => {
  return {
    success: true,
    refundId: `ref_${Date.now()}`,
    paymentId,
    amount,
    status: 'refunded',
  };
};
