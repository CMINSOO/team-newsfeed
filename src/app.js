import express from "express";
import cookieParser from "cookie-parser";
import UsersRouter from "./routers/users.routers.js";
import errorHandler from "./middlewares/error-handling.middleware.js";
import ResumeRouter from "./routers/resumes.router.js";
import { SERVER_PORT } from "./constants/env.constants.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api", [UsersRouter]);
app.use("/resume", [ResumeRouter]);
app.use(errorHandler);

app.listen(SERVER_PORT, () => {
  console.log(`서버가 ${SERVER_PORT}번 포트에서 실행중입니다`);
});
