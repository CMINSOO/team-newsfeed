import express from "express";
import { prisma } from "../utils/prisma.util.js";
import bcrypt from "bcrypt";

const router = express.Router();

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

export default router;
