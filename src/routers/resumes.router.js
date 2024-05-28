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

// 이력서 목록 조회 api
router.get("/listing", authMiddleware, async (req, res) => {
  // 사용자 가져오기
  const user = req.user;
  //req.query  정렬 조건 들기
  const resumes = await prisma.resume.findMany({
    select: {
      resumeId: true,
      title: true,
      content: true,
      state: true,
      User: {
        select: {
          UserInfos: {
            select: {
              name: true,
            },
          },
        },
      },
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return res
    .status(200)
    .json({ message: "이력서 목록 조회에 성공하였습니다", data: resumes });
});

// 이력서 상세 조회 APi
router.get("/reading/:resumeId", authMiddleware, async (req, res) => {
  // 사용자가져오기
  const user = req.user;
  //   이력서 id 가져오기
  const { resumeId } = req.params;

  const crosscheck = await prisma.resume.findFirst({
    where:
      user.role === "APPLICANT"
        ? { resumeId: resumeId }
        : { resumeId: +resumeId, UserId: +user.userId },
    select: {
      resumeId: true,
      User: {
        select: {
          UserInfos: {
            select: { name: true },
          },
        },
      },
      title: true,
      content: true,
      state: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!crosscheck) {
    return res.status(401).json({ message: "이력서가 존재하지 않습니다" });
  }
  return res
    .status(200)
    .json({ message: "이력서 상세조회에 성공했습니다", data: { crosscheck } });
});

export default router;
