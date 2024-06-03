import express from "express";
import { prisma } from "../utils/prisma.util.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { signUpValidator } from "../middlewares/validators/sign-up-validator.middleware.js";
import { HTTP_STATUS } from "../constants/http-stsatus-constant.js";
import { MESSAGES } from "../constants/message.constant.js";
import { HASH_SALT_ROUNDS } from "../constants/auth.constant.js";
import { signInValidator } from "../middlewares/validators/sign-in-validator.middleware.js";
import {
  ACCESS_TOKEN_SECRET,
  TOKEN_EXPIREDIN,
} from "../constants/env.constants.js";

const authRouter = express.Router();

// 회원가입 api
authRouter.post("/sign-up", signUpValidator, async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const exxistedUser = await prisma.user.findUnique({ where: { email } });
    // 이메일이 중복된 경우
    if (exxistedUser) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        status: HTTP_STATUS.CONFLICT,
        message: MESSAGES.AUTH.COMMON.EMAIL.DUPLICATE_EMAIL,
      });
    }

    const hashedPassword = bcrypt.hashSync(password, HASH_SALT_ROUNDS);

    const data = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    data.password = undefined;

    return res.status(HTTP_STATUS.CREATED).json({
      status: HTTP_STATUS.CREATED,
      message: MESSAGES.AUTH.SIGN_UP.SUCCEED,
      data,
    });
  } catch (error) {
    next(error);
  }
});
// 회원가입
authRouter.post("/sign-in", signInValidator, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    const isPasswordMatched =
      user && bcrypt.compareSync(password, user.password);

    if (!isPasswordMatched) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: MESSAGES.AUTH.COMMON.UNAUTHENTICATED,
      });
    }

    const payload = { id: user.id };
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: TOKEN_EXPIREDIN,
    });

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.CREATED,
      message: MESSAGES.AUTH.SIGN_IN,
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
});

export { authRouter };
