import express from "express";
import { prisma } from "../utils/prisma.util.js";
import bcrypt from "bcrypt";
import { signUpValidator } from "../middlewares/validators/sign-up-validator.middleware.js";
import { HTTP_STATUS } from "../constants/http-stsatus-constant.js";
import { MESSAGES } from "../constants/message.constant.js";
import { updateValidator } from "../middlewares/validators/update-validator.middleware.js";
// 외부로

const authRouter = express.Router();

// 회원가입 api
authRouter.post("/sign-up", signUpValidator, async (req, res, next) => {
  try {
    const { name, email, password, nickname } = req.body;

    // 이미 존재하는 이메일인지 확인
    const existEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existEmail) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: HTTP_STATUS.BAD_REQUEST,
        message: MESSAGES.AUTH.COMMON.EMAIL.DUPLICATE_EMAIL,
      });
    }

    const existnickname = await prisma.user.findUnique({
      where: { nickname },
    });

    if (existnickname) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: HTTP_STATUS.BAD_REQUEST,
        message: MESSAGES.AUTH.COMMON.NICKNAME.DUPLICATE_NICKNAME,
      });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 및 사용자 정보 생성
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        nickname,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    newUser.password = undefined;

    return res.status(HTTP_STATUS.CREATED).json({
      status: HTTP_STATUS.CREATED,
      message: MESSAGES.AUTH.SIGN_UP,
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/user/:id", async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findFirst({
    where: { id: +id },
    //특정 컬럼만 조회하는 파라미터
    select: {
      id: true,
      email: true,
      password: true,
      name: true,
      nickname: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  //3.조회한 사용자의 상세한 정보를 클라이언트에게 반환합니다.
  return res.status(200).json({ data: user });
});

// 수정 api
authRouter.put("/user/:id", updateValidator, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, name, newpassword, nickname, role } = req.body;

    const existuserid = await prisma.user.findFirst({
      where: { id: +id },
    });

    if (!existuserid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: HTTP_STATUS.BAD_REQUEST,
        Message: MESSAGES.AUTH.COMMON.EMAIL.NOT_EXIST_EMAIL,
      });
    }
    const hashedPassword = await bcrypt.hash(newpassword, 10);
    const userInfo = await prisma.user.update({
      data: {
        name: name,
        password: hashedPassword,
        email: email,
        nickname: nickname,
        role: role,
      },
      where: {
        id: parseInt(id),
      },
    });
    userInfo.password = undefined;
    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.AUTH.UPDATE.SUCCEED,
      data: userInfo,
    });
  } catch (error) {
    next(error);
  }
});

export { authRouter };
