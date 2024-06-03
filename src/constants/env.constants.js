import "dotenv/config";

export const DATABASE_URL = process.env.DATABASE_URL;
export const SERVER_PORT = process.env.SERVER_PORT;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

/* 24.06.03 김영규 추가 - start */
export const REFRESH_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_EXPIREDIN = "7d";
/* 24.06.03 김영규 추가 - end */
export const TOKEN_EXPIREDIN = "12h";
