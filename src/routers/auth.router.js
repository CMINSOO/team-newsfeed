import express from "express";
import { prisma } from "../utils/prisma.util.js";
import { signUpValidator } from "../middlewares/validators/sign-up-validator.middleware.js";

const authRouter = express.Router();

// 회원가입 api
authRouter.post("/sign-up", signUpValidator, async (req, res, next) => {
  try {
  } catch (error) {
    next();
  }
});

export { authRouter };
