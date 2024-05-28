import express from "express";
import { prisma } from "../utils/prisma.util.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// 이력서 생성 api

router.post("/posting", authMiddleware, async (req, res, next) => {
  try {
    // 유저 아이디 가져와 인증받은 유저인지 확인
    const { userId } = req.user;
    console.log(userId);
    console.log(req.user);
    // 이력서 생성을 위한 스케마에 있는 타이틀 과 컨텐츠 가져오기
    const { title, content } = req.body;
    // Resume 테이블에 이력서 생성하기
    const resume = await prisma.resume.create({
      data: {
        UserId: userId,
        title,
        content,
      },
    });

    return res
      .status(201)
      .json({ message: "이력서 생성에 성공하였습니다", data: resume });
  } catch (error) {
    next(error);
  }
});

export default router;
