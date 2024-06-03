import express from "express";
import { authRouter } from "./auth.router.js";
import { postRouter } from "./post.router.js";

const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/post", postRouter);

export { apiRouter };
