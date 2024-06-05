import express from "express";
import { prisma } from "../utils/prisma.util.js";
import { HTTP_STATUS } from "../constants/http-stsatus-constant.js";

const followRouter = express.Router();

// 팔로우하기

followRouter.post("/:id/follow", async (req, res, next) => {
  const userId = parseInt(req.user.id, 10);
  const followingId = parseInt(req.params.id, 10);
  try {
    // 유저가 존재하는지 확인
    const userToFollow = await prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!userToFollow) {
      return res.status(HTTP_STATUS.NOTFOUND).json({
        status: HTTP_STATUS.NOTFOUND,
        message: "사용자가 존재하지 않습니다.",
      });
    }

    // 팔로잉 관계 맺어주기
    const data = await prisma.follow.create({
      data: {
        followerId: userId,
        followingId: followingId,
      },
    });

    return res.status(HTTP_STATUS.CREATED).json({
      status: HTTP_STATUS.CREATED,
      message: "팔로잉 에 성공하였습니다",
      data,
    });
  } catch (error) {
    next(error);
  }
});

export { followRouter };
