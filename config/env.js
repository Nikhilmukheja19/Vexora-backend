import dotenv from "dotenv";
dotenv.config();

const env = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI:
    process.env.MONGODB_URI || "mongodb://localhost:27017/localboost-ai",
  JWT_SECRET: process.env.JWT_SECRET || "default-dev-secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: process.env.SMTP_PORT || 587,
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  CLIENT_URL: process.env.CLIENT_URL || "https://vexoraaa.netlify.app/",
  NODE_ENV: process.env.NODE_ENV || "development",
};

export default env;
