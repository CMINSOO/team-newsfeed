import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { HTTP_STATUS } from "../constants/http-stsatus-constant.js";
import { prisma } from "../utils/prisma.util.js";
import { MESSAGES } from "../constants/message.constant.js";

const commentRouter = express.Router();

//----------------------댓글 생성 API---------------------//
commentRouter.post(
  "/:postId/comments",
  authMiddleware,
  async (req, res, next) => {
    //댓글 작성자가 로그인된 사용자인지 검정
    try {
      //authMiddleware 에서 userId를 전달 받음
      const { id, nickname } = req.user;
      //댓글 작성 게시물의 'postId'를 path parameters로 전달 받음
      const { postId } = req.params;
      //댓글 생성을 위한 'content'를 body로 전달 받음
      const { content } = req.body;

      //댓글 내용이 비어있는지 확인
      if (!content) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: MESSAGES.POST.COMMENT.CONTENT.REQUIRED });
      }

      //게시글이 존재하는지 확인
      const post = await prisma.postModal.findFirst({ where: { id: +postId } });
      if (!post) {
        return res
          .status(HTTP_STATUS.NOTFOUND)
          .json({ message: MESSAGES.POST.COMMON.NOT_FOUND });
      }

      //comments 테이블에 댓글 생성
      const comment = await prisma.comment.create({
        data: {
          content,
          userId: +id,
          PostId: +postId,
          nickname,
        },
      });

      return res.status(HTTP_STATUS.CREATED).json({ data: comment });
    } catch (error) {
      next(error);
    }
  },
);

//----------------------댓글 조회 API------------------------//

commentRouter.get("/:postId/comments", async (req, res, next) => {
  try {
    //댓글 작성 게시물의 'postId'를 path parameters로 전달 받음
    const { postId } = req.params;

    //게시글이 존재하는지 확인
    const post = await prisma.postModal.findFirst({
      where: { id: +postId },
    });
    if (!post) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.POST.COMMON.NOT_FOUND });
    }

    //댓글 조회
    const comments = await prisma.comment.findMany({
      where: { PostId: +postId },
      select: {
        id: true,
        content: true,
        Users: {
          select: { nickname: true },
        },
      },

      orderBy: { createdAt: "desc" },
    });

    return res.status(HTTP_STATUS.OK).json({ data: comments });
  } catch (error) {
    next(error);
  }
});
//----------------------댓글 수정 API-------------------------//
commentRouter.put(
  "/:postId/comments/:commentId",
  authMiddleware,
  async (req, res, next) => {
    //댓글 작성자가 로그인된 사용자인지 검증
    try {
      //댓글 작성 게시물의 'postId'를 path parameters로 전달 받음
      const { postId } = req.params;
      //댓글의 'commentId'를 path parameters로 전달 받음
      const { commentId } = req.params;
      //댓글 수정을 위한 'content'를 body로 전달 받음
      const { content } = req.body;

      //댓글 내용이 비어있는지 확인
      if (!content) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: MESSAGES.POST.COMMENT.CONTENT.REQUIRED });
      }

      //댓글이 존재하는지 확인
      const comment = await prisma.comment.findFirst({
        where: { id: +commentId },
      });
      if (!comment) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: MESSAGES.POST.COMMENT.NOT_FOUND });
      }

      //댓글 수정
      const updatedComment = await prisma.comment.update({
        where: { PostId: +postId, id: +commentId },
        data: { content: content },
      });

      return res.status(HTTP_STATUS.OK).json({
        message: MESSAGES.POST.COMMENT.UPDATE.SUCCEED,
        data: updatedComment,
      });
    } catch (error) {
      next(error);
    }
  },
);
//-----------------------댓글 삭제 API--------------------------//
commentRouter.delete(
  "/:postId/comments/:commentId",
  authMiddleware,
  async (req, res, next) => {
    //댓글 작성자가 로그인된 사용자인지 검증
    try {
      //댓글 작성 게시물의 'postId'와 'commentId'를 path parameters로 전달 받음
      const { postId, commentId } = req.params;

      //댓글이 존재하는지 확인
      const comment = await prisma.comment.findFirst({
        where: { id: +commentId },
      });
      if (!comment) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: MESSAGES.POST.COMMENT.NOT_FOUND });
      }

      //댓글 삭제
      await prisma.comment.delete({
        where: { PostId: +postId, id: +commentId },
      });

      return res
        .status(HTTP_STATUS.OK)
        .json({ message: MESSAGES.POST.COMMENT.DELETE.SUCCEED });
    } catch (error) {
      next(error);
    }
  },
);

export { commentRouter };
