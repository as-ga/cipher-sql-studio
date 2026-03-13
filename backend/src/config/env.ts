import dotenv from "dotenv";
dotenv.config();

const _env = {
  cors_origin: process.env.CORS_ORIGIN?.split(","),
  port: Number(process.env.PORT),

  //   Database URI
  db_uri: process.env.DB_URI,

  jwtSecret: process.env.JWT_SECRET || "change-me-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  geminiApiKey: process.env.GEMINI_API_KEY!,
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.0-flash",
};

const env = Object.freeze(_env);
export default env;
