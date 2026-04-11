import dotenv from "dotenv";

dotenv.config();

// ------- SERVER ---------
export const HOST = process.env.HOST || "0.0.0.0";
export const PORT = process.env.PORT || 4747;

// ------- DATABASE ---------
export const DATABASE_URL = process.env.DATABASE_URL;

// ------- JWT ---------
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_ALGORITHM = process.env.JWT_ALGORITHM || "HS512";
export const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || "15m";
export const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || "7d";
export const JWT_ACCESS_EXPIRY_SECONDS = parseInt(process.env.JWT_ACCESS_EXPIRY_SECONDS) || 900;
export const JWT_REFRESH_EXPIRY_SECONDS = parseInt(process.env.JWT_REFRESH_EXPIRY_SECONDS) || 604800;

// ------- COOKIE ---------
export const COOKIE_HTTP_ONLY = process.env.COOKIE_HTTP_ONLY === "true";
export const COOKIE_SECURE = process.env.COOKIE_SECURE === "true";
export const COOKIE_SAME_SITE = process.env.COOKIE_SAME_SITE || "Strict";