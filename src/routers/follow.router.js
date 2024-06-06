import express from "express";
import { prisma } from "../utils/prisma.util.js";
import { HTTP_STATUS } from "../constants/http-stsatus-constant.js";
import { MESSAGES } from "../constants/message.constant.js";

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
        message: MESSAGES.FOLLOW.FOLLOWING.NO_USER,
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
      message: MESSAGES.FOLLOW.FOLLOWING.SUCCEED,
      data,
    });
  } catch (error) {
    next(error);
  }
});
// 언팔
followRouter.delete("/:id/unfollow", async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const followingId = parseInt(req.params.id, 10);

    // 팔로잉 관계가 존재하는지 확인
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: followingId,
        },
      },
    });

    if (!follow) {
      return res.status(HTTP_STATUS.NOTFOUND).json({
        status: HTTP_STATUS.NOTFOUND,
        message: MESSAGES.FOLLOW.UNFOLLOWING.NO_USER,
      });
    }

    // 팔로잉 관계 삭제
    const data = await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: followingId,
        },
      },
    });

    res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.FOLLOW.UNFOLLOWING.SUCCEED,
      data,
    });
  } catch (error) {
    next(error);
  }
});

export { followRouter };
