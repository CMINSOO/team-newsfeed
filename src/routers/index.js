import express from "express";
import { authRouter } from "./auth.router.js";
import { postRouter } from "./post.router.js";
import { commentRouter } from "./comments.router.js";
import { userRouter } from "./users.router.js";
import authMiddleware from "./../middlewares/auth.middleware.js";
import { followRouter } from "./follow.router.js";

const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/post", authMiddleware, postRouter);
apiRouter.use("/post", authMiddleware, commentRouter);
apiRouter.use("/user", authMiddleware, userRouter);
apiRouter.use("/user", authMiddleware, followRouter);

export { apiRouter };
