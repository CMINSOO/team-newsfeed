import express from "express";
import { authRouter } from "./auth.router.js";

const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);

export { apiRouter };
