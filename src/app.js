import express from "express";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/error-handling.middleware.js";
import { SERVER_PORT } from "./constants/env.constants.js";
import { apiRouter } from "./routers/index.js";
import path from 'path';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api", [apiRouter]);

/* 24.06.03 김영규 이메일인증 테스트 추가 - start */
app.use(express.static(path.resolve('src/asset')));
app.get('/api/auth/mail', (req, res) => {
  res.sendFile(path.resolve('src/asset', 'mailAuth.html'));
});
/* 24.06.03 김영규 이메일인증 테스트 추가 - end */


app.use(errorHandler);

app.listen(SERVER_PORT, () => {
  console.log(`서버가 ${SERVER_PORT}번 포트에서 실행중입니다`);
});
