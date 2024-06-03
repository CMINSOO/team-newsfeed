import express from "express";
import authMiddleware from "../../../../resume_site/src/middlewares/require-access-token.middleware.js";
import { HTTP_STATUS } from "../constants/http-stsatus-constant.js";
import { prisma } from "../utils/prisma.util.js";

const router = express.Router();

//----------------------댓글 생성 API---------------------//
router.post(
  "/posts/:postId/comments",
  authMiddleware,
  async (req, res, next) => {
    //댓글 작성자가 로그인된 사용자인지 검정
    try {
      //authMiddleware 에서 userId를 전달 받음
      const { userId } = req.user;
      //댓글 작성 게시물의 'postId'를 path parameters로 전달 받음
      const { postId } = req.params;
      //댓글 생성을 위한 'content'를 body로 전달 받음
      const { content } = req.body;

      //댓글 내용이 비어있는지 확인
      if (!content) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: "댓글을 입력해주세요." });
      }

      //게시글이 존재하는지 확인
      const post = await prisma.posts.findFirst({ where: { postId: +postId } });
      if (!post) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "게시글이 존재하지 않습니다." });
      }

      //comments 테이블에 댓글 생성
      const comment = await prisma.comments.create({
        data: {
          content,
          UserId: +userId,
          PostId: +postId,
        },
      });

      return res.status(HTTP_STATUS.CREATED).json({ data: comment });
    } catch (error) {
      next(error);
    }
  },
);

//----------------------댓글 조회 API------------------------//

//----------------------댓글 수정 API-------------------------//

//-----------------------댓글 삭제 API--------------------------//

export default router;