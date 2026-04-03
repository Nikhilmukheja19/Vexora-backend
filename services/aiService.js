import env from '../config/env.js';

const predefinedResponses = {
  greeting: [
    "Hello! 👋 Welcome! How can I help you today?",
    "Hi there! I'm your AI assistant. What can I do for you?",
    "Welcome! Feel free to ask me anything about our products or services.",
  ],
  shipping: [
    "We typically ship orders within 2-3 business days. Standard delivery takes 5-7 business days.",
    "Shipping is available across India. You'll receive a tracking number once your order ships.",
  ],
  returns: [
    "We offer a 7-day return policy for most products. Items must be in original condition.",
    "To initiate a return, please go to your order history and select the order you'd like to return.",
  ],
  payment: [
    "We accept Cash on Delivery (COD), UPI, and card payments.",
    "All payments are processed securely. We support multiple payment methods for your convenience.",
  ],
  default: [
    "I'd love to help you with that! Could you provide a bit more detail?",
    "That's a great question. Let me find the best answer for you.",
    "Thanks for reaching out! I'm here to help with any questions about our products or services.",
  ],
};

const getKeywordResponse = (message) => {
  const lower = message.toLowerCase();
  if (lower.match(/\b(hi|hello|hey|greetings)\b/)) {
    return randomChoice(predefinedResponses.greeting);
  }
  if (lower.match(/\b(ship|delivery|deliver|track)\b/)) {
    return randomChoice(predefinedResponses.shipping);
  }
  if (lower.match(/\b(return|refund|exchange)\b/)) {
    return randomChoice(predefinedResponses.returns);
  }
  if (lower.match(/\b(pay|payment|cod|upi|card)\b/)) {
    return randomChoice(predefinedResponses.payment);
  }
  return null;
};

const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const getAIResponse = async (message, chatHistory, business) => {
  // Try OpenAI first if API key available
  if (env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a helpful customer support AI for "${business.name}". 
                        Be friendly, professional, and concise. 
                        Business category: ${business.category}.
                        Help customers with product inquiries, orders, and general questions.
                        If you can't help, suggest they contact support directly.`,
            },
            ...chatHistory.slice(-10).map(m => ({ role: m.role, content: m.content })),
          ],
          max_tokens: 200,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      if (data.choices && data.choices[0]) {
        return data.choices[0].message.content;
      }
    } catch (error) {
      console.log('OpenAI API error, falling back to predefined responses');
    }
  }

  // Fallback to keyword-based responses
  const keywordResponse = getKeywordResponse(message);
  if (keywordResponse) return keywordResponse;

  // Smart fallback with business context
  const fallbacks = [
    `Thanks for your message! I'm the AI assistant for ${business.name}. I can help you with product info, orders, shipping, and returns. What would you like to know?`,
    `Great question! While I work on finding the best answer, feel free to browse our products or contact our support team for immediate help.`,
    `I appreciate you reaching out to ${business.name}! I can assist with product details, order status, and general inquiries. How can I help?`,
  ];
  return randomChoice(fallbacks);
};
