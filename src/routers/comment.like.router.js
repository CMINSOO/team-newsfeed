// import express from "express";
// import { HTTP_STATUS } from "../constants/http-stsatus-constant.js";
// import { MESSAGES } from "../constants/message.constant.js";
// import authMiddleware from "../middlewares/auth.middleware.js";
// import { prisma } from "../utils/prisma.util.js";

// const likeRouter = express.Router();

// //-----------------------------댓글 좋아요 등록 API-----------------------------------//
// likeRouter.post(
//   "/:postId/comments/commentId/likes",
//   authMiddleware,
//   async (req, res, next) => {
//     try {
//       // user.req에서 id 값을 받는다.
//       const { id } = req.user;

//       //파라미터에서 postId 값을 받는다.
//       const { postId, commentId } = req.params;

//       //본인 댓글에 좋아요 남길 수 없음
//       const comment = await prisma.comment.findUnique({
//         where: { Postid: +postId, id: +commentId },
//         select: { userid: true },
//       });

//       if (comment.userId === id) {
//         return res
//           .status(HTTP_STATUS.BAD_REQUEST)
//           .json({ message: MESSAGES.POST.LIKE.NOT_ALLOW });
//       }

//       //이미 좋아요를 누름
//       const existedLike = await prisma.commentlike.findFirst({
//         where: {
//           PostId: +postId,
//           userId: +id,
//         },
//       });
//       if (existedLike) {
//         return res
//           .status(HTTP_STATUS.BAD_REQUEST)
//           .json({ message: MESSAGES.POST.LIKE.DUPLICATE_LIKE });
//       }

//       //좋아요 추가
//       const like = await prisma.like.create({
//         data: {
//           userId: +id,
//           PostId: +postId,
//         },
//       });

//       return res
//         .status(HTTP_STATUS.OK)
//         .json({ message: MESSAGES.POST.LIKE.SUCCEED, data: like });
//     } catch (error) {
//       next(error);
//     }
//   },
// );

// //-----------------------------좋아요 조회 API---------------------------//

// likeRouter.get("/:postId/likes", async (req, res, next) => {
//   try {
//     //좋아요 게시물의 'postId'를 path parameters로 전달 받음
//     const { postId } = req.params;

//     //게시글이 존재하는지 확인
//     const post = await prisma.postModal.findFirst({
//       where: { id: +postId },
//     });
//     if (!post) {
//       return res
//         .status(HTTP_STATUS.BAD_REQUEST)
//         .json({ message: MESSAGES.POST.COMMON.NOT_FOUND });
//     }

//     //좋아요 목록 조회
//     const likes = await prisma.Like.findMany({
//       where: { PostId: +postId },
//       select: {
//         id: true,
//         Users: {
//           select: { nickname: true },
//         },
//       },

//       orderBy: { createdAt: "desc" },
//     });

//     return res.status(HTTP_STATUS.OK).json({ data: likes });
//   } catch (error) {
//     next(error);
//   }
// });

// //-----------------------------좋아요 취소 API---------------------------//
// likeRouter.delete(
//   "/:postId/likes/:likeId",
//   authMiddleware,
//   async (req, res, next) => {
//     //사용자가 로그인된 사용자인지 검증
//     try {
//       //좋아요 게시물의 'postId'와 'likeId'를 path parameters로 전달 받음
//       const { postId, likeId } = req.params;

//       //좋아요가 존재하는지 확인
//       const like = await prisma.Like.findFirst({
//         where: { id: +likeId },
//       });
//       if (!like) {
//         return res
//           .status(HTTP_STATUS.BAD_REQUEST)
//           .json({ message: MESSAGES.POST.LIKE.DELETE.NOT_FOUND });
//       }

//       //좋아요 취소
//       await prisma.Like.delete({
//         where: { PostId: +postId, id: +likeId },
//       });

//       return res
//         .status(HTTP_STATUS.OK)
//         .json({ message: MESSAGES.POST.LIKE.DELETE.SUCCEED });
//     } catch (error) {
//       next(error);
//     }
//   },
// );

// export { likeRouter };
