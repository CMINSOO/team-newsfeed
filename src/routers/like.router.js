import express from "express";
import { HTTP_STATUS } from "../constants/http-stsatus-constant.js";
import { MESSAGES } from "../constants/message.constant.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { prisma } from "../utils/prisma.util.js";

const likeRouter = express.Router();

//-----------------------------좋아요 등록 API-----------------------------------//
likeRouter.post("/:postId/likes", authMiddleware, async (req, res, next) => {
  try {
    // user.req에서 id 값을 받는다.
    const { id } = req.user;

    //파라미터에서 postId 값을 받는다.
    const { postId } = req.params;

    //본인 글에 좋아요 남길 수 없음
    const post = await prisma.postModal.findUnique({
      where: { id: +postId },
      select: { authorid: true },
    });

    if (post.authorid === id) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.POST.LIKE.NOT_ALLOW });
    }

    //이미 좋아요를 누름
    const existedLike = await prisma.like.findFirst({
      where: {
        PostId: +postId,
        userId: +id,
      },
    });
    if (existedLike) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.POST.LIKE.DUPLICATE_LIKE });
    }

    //좋아요 추가
    const like = await prisma.like.create({
      data: {
        userId: +id,
        PostId: +postId,
      },
    });

    return res
      .status(HTTP_STATUS.OK)
      .json({ message: MESSAGES.POST.LIKE.SUCCEED, data: like });
  } catch (error) {
    next(error);
  }
});

//-----------------------------좋아요 조회 API---------------------------//

//-----------------------------좋아요 취소 API---------------------------//

export { likeRouter };
