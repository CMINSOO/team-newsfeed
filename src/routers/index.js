import express from "express";
import { authRouter } from "./auth.router.js";
import { postRouter } from "./post.router.js";
import { commentRouter } from "./comments.router.js";

const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/post", postRouter);
apiRouter.use("/post", commentRouter);

export { apiRouter };
