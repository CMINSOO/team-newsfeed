import express from "express";
import { prisma } from "../utils/prisma.util.js";

const userRouter = express.Router();

// 사용자 조회
userRouter.get("/", async (req, res, next) => {
  const { id } = req.user;

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

export { userRouter };
