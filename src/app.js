import express from "express";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/error-handling.middleware.js";
import { SERVER_PORT } from "./constants/env.constants.js";
import { apiRouter } from "./routers/index.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api", [apiRouter]);
app.use(errorHandler);


// 정적 파일 서빙 설정
app.use(express.static(path.join(__dirname, 'asset')));

// 라우팅
app.get('/api/mail', (req, res) => {
  res.sendFile(path.join(__dirname, 'asset', 'mailAuth.html'));
});

app.listen(SERVER_PORT, () => {
  console.log(`서버가 ${SERVER_PORT}번 포트에서 실행중입니다`);
});
