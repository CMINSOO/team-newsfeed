import express from "express";
import { prisma } from "../utils/prisma.util.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

const ACCESS_TOKEN_SECRET_KEY = "testing123";

// 회원가입API

router.post("/sign-up", async (req, res, next) => {
  const { email, password, repassword, name } = req.body;

  //  회원 정보가 하나라도 빠진경우
  if (!email || !password || !repassword || !name) {
    return res.status(400).json({ message: "모든 정보를 입력해주세요." });
  }
  // 이메일형식에 맞지 않을경우
  // 이메일이 중복되는경우
  const existEmail = await prisma.users.findFirst({
    where: {
      email,
    },
  });
  if (existEmail) {
    return res.status(409).json({ message: "이미 존재하는 이메일입니다" });
  }
  // 비밀번호가 6자리 미만인경우
  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "비밀번호는 6자리 이상이여야합니다." });
  }
  // 비밀번호와 비밀번호 확인이 일치하지 않을경우
  if (password !== repassword) {
    return res.status(409).json({ message: "두 비밀번호가 다릅니다." });
  }
  // 비밀번호 암호화
  const hashedPassword = await bcrypt.hash(password, 10);
  // user 테이블에 사용자 추가
  const user = await prisma.users.create({
    data: {
      email,
      password: hashedPassword,
    },
  });
  // userinfo 테이블에 사용자 정보 추가
  const userinfo = await prisma.userInfos.create({
    data: {
      UserId: user.userId,
      name,
      role: "APPLICANT",
    },
  });
  return res.status(201).json({
    message: "회원가입이 완료되었습니다.",
    data: {
      id: user.userId,
      email: user.email,
      name: userinfo.name,
      role: userinfo.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

// 로그인 api / ACCESSTOKEN 발급
function createAccessToken(id) {
  return jwt.sign({ id: id }, ACCESS_TOKEN_SECRET_KEY, {
    expiresIn: "12h",
  });
}

router.post("/sign-in", async (req, res, next) => {
  const { email, password } = req.body;
  // 이메일을 입력안했을경우
  if (!email) {
    return res.status(400).json({ error: "email 을 입력해주세요" });
  }
  // 패스워드를 입력 안했을경우
  if (!password) {
    return res.status(400).json({ error: "비밀번호를 입력해주세요." });
  }
  // 이메일 형식이 올바르지 않을경우
  // 이메일로 조회되지 않거나 비밀번호가 일치하지 않는 경우
  const crosscheck = await prisma.users.findFirst({
    where: { email },
  });
  if (!crosscheck) {
    return res.status(401).json({ message: "존재하지 않는 이메일입니다" });
  }
  const result = await bcrypt.compare(password, crosscheck.password);
  if (!result) {
    return res.status(401).json({ message: "비밀번호가 일치하지 않습니다" });
  }
  // AccessToken(Payload에 사용자 ID를 포함하고, 유효기한이 12시간)을 생성합니다.
  const token = createAccessToken(crosscheck.userId);
  res.cookie("authorization", `Bearer ${token}`);
  return res.status(200).json({
    message: "로그인에 성공하였습니다.",
  });
});

export default router;
