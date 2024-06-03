import express from "express";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/error-handling.middleware.js";
import { SERVER_PORT } from "./constants/env.constants.js";
import { apiRouter } from "./routers/index.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api", [apiRouter]);
app.use(errorHandler);

app.listen(SERVER_PORT, () => {
  console.log(`서버가 ${SERVER_PORT}번 포트에서 실행중입니다`);
});
