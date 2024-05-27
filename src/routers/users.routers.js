import express from "express";
import { prisma } from "../utils/prisma.util.js";
import bcrypt from "bcrypt";

const router = express.Router();

// 사용자 회원가입 API
router.post("/sign-up", async (req, res, next) => {
  // 1. email, password, checkPassword, name 을 req.body 에 전달 받기
  const { email, password, rePassword, name, gender, role, profileImage, age } =
    req.body;
  // 2.  유효성 검증 및 에러 처리
  //   2-1. 회원정보 하나라도 빠진 경우 000을 입력해주세요
  if (
    !email ||
    !password ||
    !rePassword ||
    !name ||
    !gender ||
    !role ||
    !profileImage ||
    !age
  ) {
    return res.status(400).json({ message: "정보를 모두 입력해주세요." });
  }
  //   2-2. 이메일 형식에 맞지 않는 경우

  //   2-3. 이메일이 중복되는 경우 "이미가입된 사용자입니다"
  const isExistEmail = await prisma.users.findFirst({
    where: { email },
  });
  if (isExistEmail) {
    return res.status(409).json({ message: "이미 존재하는 이메일입니다" });
  }
  // 2-4 비밀번호가 6자리 미만인 경우
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "비밀번호 는 6자리 이상이여야 합니다" });
  }
  // 2-5 비밀번호와 비밀번호 확인 일치하지 않을경우
  if (password !== rePassword) {
    return res
      .status(400)
      .json({ message: "비밀번호와 확인비밀번호가 다릅니다 " });
  }

  // 암호화된 패스워드 만들기
  const hashedPassword = await bcrypt.hash(password, 10);

  //  prisma user 테이블에 사용자 추가하기
  const user = await prisma.users.create({
    data: {
      email,
      password: hashedPassword,
    },
  });
  // userinfo 테이블에 사용자  정보 추가하기
  const userinfo = await prisma.userInfos.create({
    data: {
      UserId: user.userId,
      name,
      age,
      gender: gender.toUpperCase(),
      role: role.toUpperCase(),
      profileImage,
    },
  });
  return res.status(201).json({ message: "회원가입이 완료되었습니다." });
});

// 로그인 API

export default router;
