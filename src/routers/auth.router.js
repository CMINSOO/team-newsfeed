import express from "express";
import { prisma } from "../utils/prisma.util.js";
import { signUpValidator } from "../middlewares/validators/sign-up-validator.middleware.js";
import bcrypt from "bcrypt";

const authRouter = express.Router();

// 회원가입 api
authRouter.post("/sign-up", async (req, res, next) => {
  try {
    const { name, email, password, nickname, role } = req.body;

    const existEmail = await prisma.users.findFirst({
      where: { email },
    });

    if (existEmail) {
      return res
        .status(400)
        .json({ errorMessage: "이미 존재하는 이메일입니다." });
    }

    const user = await prisma.users.create({
      data: {
        email,
        password,
      },
    });

    const userinfo = await prisma.userInfos.create({
      data: {
        UserId: user.userId,
        email,
        name,
        nickname,
        role,
        createdAt,
        updatedAt,
      },
    });
    return res
      .status(200)
      .json({ message: "회원가입이 완료가 되었습니다.", data: userinfo });
  } catch (error) {
    next();
  }
});

export { authRouter };
