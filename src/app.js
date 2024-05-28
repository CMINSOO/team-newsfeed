import express from "express";
import cookieParser from "cookie-parser";
import UsersRouter from "./routers/users.routers.js";
import errorHandler from "./middlewares/error-handling.middleware.js";
import ResumeRouter from "./routers/resumes.router.js";

const app = express();
const PORT = 3306;

app.use(express.json());
app.use(cookieParser());
app.use("/api", [UsersRouter]);
app.use("/resume", [ResumeRouter]);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
