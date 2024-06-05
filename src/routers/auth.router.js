import express from "express";
import { prisma } from "../utils/prisma.util.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { signUpValidator } from "../middlewares/validators/sign-up-validator.middleware.js";
import { HTTP_STATUS } from "../constants/http-stsatus-constant.js";
import { MESSAGES } from "../constants/message.constant.js";
import { HASH_SALT_ROUNDS } from "../constants/auth.constant.js";
import { signInValidator } from "../middlewares/validators/sign-in-validator.middleware.js";
/* 24.06.03 김영규 추가 - start */
import {
  ACCESS_TOKEN_SECRET,
  TOKEN_EXPIREDIN,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIREDIN,
  EMAIL_SERVICE,
  EMAIL_USER,
  EMAIL_PASSWORD,
} from "../constants/env.constants.js";
/* 24.06.03 김영규 추가 - end */
import { updateValidator } from "../middlewares/validators/update-validator.middleware.js";
import nodemailer from "nodemailer";

// 24.06.04 전수원 추가
import authMiddleware from "../middlewares/auth.middleware.js";
// 외부로
const authRouter = express.Router();
/* 24.06.03 김영규 추가 */
const tokenStorage = {};

// 회원가입 api
authRouter.post("/sign-up", signUpValidator, async (req, res, next) => {
  try {
    const { email, password, name, nickname } = req.body;

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
    const hashedPassword = await bcrypt.hash(password, HASH_SALT_ROUNDS);

    // 사용자 및 사용자 정보 생성
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        nickname,
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

// 로그인
authRouter.post("/sign-in", signInValidator, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findFirst({
      where: { email: email },

      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        nickname: true,
        role: true,
      },
    });

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: MESSAGES.AUTH.COMMON.UNAUTHENTICATED,
      });
    }
    /** Access Token, Refresh Token 발급 API **/
    const { id } = user;
    const accessToken = createAccessToken(id);
    const refreshToken = createRefreshToken(id);

    // Refresh Token을 가지고 해당 유저의 정보를 서버에 저장합니다.
    tokenStorage[refreshToken] = {
      id: id, // 사용자에게 전달받은 ID를 저장합니다.
      ip: req.ip, // 사용자의 IP 정보를 저장합니다.
      userAgent: req.headers["user-agent"], // 사용자의 User Agent 정보를 저장합니다.
    };

    res.cookie("accessToken", `Bearer ` + accessToken); // Access Token을 Cookie에 전달한다.
    res.cookie("refreshToken", `Bearer ` + refreshToken); // Refresh Token을 Cookie에 전달한다.

    user.password = undefined;
    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.AUTH.SIGN_IN.SUCCEED,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// 수정 api
authRouter.put(
  "/user",
  authMiddleware,
  updateValidator,
  async (req, res, next) => {
    try {
      const { id } = req.user;
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
  },
);

/* 24.06.03 김영규 추가 - start */

// Access Token을 생성하는 함수
function createAccessToken(id) {
  const accessToken = jwt.sign(
    { id: id }, // JWT 데이터
    ACCESS_TOKEN_SECRET, // Access Token의 비밀 키
    { expiresIn: TOKEN_EXPIREDIN }, // Access Token이 10초 뒤에 만료되도록 설정합니다.
  );

  return accessToken;
}

// Refresh Token을 생성하는 함수
function createRefreshToken(id) {
  const refreshToken = jwt.sign(
    { id: id }, // JWT 데이터
    REFRESH_TOKEN_SECRET, // Refresh Token의 비밀 키
    { expiresIn: REFRESH_TOKEN_EXPIREDIN }, // Refresh Token이 7일 뒤에 만료되도록 설정합니다.
  );

  return refreshToken;
}

// 로그아웃
authRouter.post("/sign-out", async (req, res, next) => {
  try {
    res.clearCookie("accessToken", "refreshToken");

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.AUTH.SIGN_OUT,
    });
  } catch (error) {
    next(error);
  }
});

// 메일인증
authRouter.post("/mailAuth", async (req, res, next) => {
  try {
    const { email, constant } = req.body;
    const transporter = nodemailer.createTransport({
      service: EMAIL_SERVICE,
      port: 587,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: "보안코드 확인용 이메일입니다.",
      text: constant,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log("Email Sent : ", info);
      }
    });
    
    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: "메일이 정상적으로 발송완료되었습니다.",
    });
  } catch (error) {
    next(error);
  }
});
/* 24.06.03 김영규 추가 - end */

export { authRouter };
