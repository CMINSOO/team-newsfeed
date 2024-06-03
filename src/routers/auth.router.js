import express from "express";
import { prisma } from "../utils/prisma.util.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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
  REFRESH_TOKEN_EXPIREDIN
} from "../constants/env.constants.js";
/* 24.06.03 김영규 추가 - end */

const authRouter = express.Router();
/* 24.06.03 김영규 추가 */
const tokenStorage = {};

// 회원가입 api
authRouter.post("/sign-up", signUpValidator, async (req, res, next) => {
  try {
    const { email, password, name, nickname } = req.body;

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
        nickname,
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


// 로그인
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
    /** Access Token, Refresh Token 발급 API **/
    const { id } = req.body;
    const accessToken = createAccessToken(id);
    const refreshToken = createRefreshToken(id);
    
    // Refresh Token을 가지고 해당 유저의 정보를 서버에 저장합니다.
    tokenStorage[(refreshToken)] = {
      id: id, // 사용자에게 전달받은 ID를 저장합니다.
      ip: req.ip, // 사용자의 IP 정보를 저장합니다.
      userAgent: req.headers['user-agent'], // 사용자의 User Agent 정보를 저장합니다.
    };
  
    res.cookie('accessToken', accessToken); // Access Token을 Cookie에 전달한다.
    res.cookie('refreshToken', refreshToken); // Refresh Token을 Cookie에 전달한다.
    

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.CREATED,
      message: MESSAGES.AUTH.SIGN_IN,
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
});

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

    res.clearCookie('accessToken','refreshToken');

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.AUTH.SIGN_OUT,
    });
  } catch (error) {
    next(error);
  }
});
/* 24.06.03 김영규 추가 - end */

export { authRouter };
