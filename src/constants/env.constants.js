import "dotenv/config";

export const DATABASE_URL = process.env.DATABASE_URL;
export const SERVER_PORT = process.env.SERVER_PORT;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const TOKEN_EXPIREDIN = "12h";
export const REFRESH_TOKEN_EXPIREDIN = "7d";
export const EMAIL_SERVICE = process.env.EMAIL_SERVICE;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;