import express from "express";
import { prisma } from "../utils/prisma.util.js";
import { HTTP_STATUS } from "../constants/http-stsatus-constant.js";
import { MESSAGES } from "../constants/message.constant.js";
import { createPostValidator } from "../middlewares/validators/create-post-middleware.js";
import { upddatePostValidator } from "../middlewares/validators/update-post-middleware.js";

const postRouter = express.Router();

//  게시글 생성 api
postRouter.post("/", createPostValidator, async (req, res, next) => {
  try {
    const user = req.user;
    const { title, content, scheduledTimeStart, scheduledTimeEnd } = req.body;
    const authorid = user.id;

    const data = await prisma.postModal.create({
      data: {
        authorid,
        title,
        content,
        scheduledTimeStart,
        scheduledTimeEnd,
      },
    });

    return res.status(HTTP_STATUS.CREATED).json({
      status: HTTP_STATUS.CREATED,
      message: MESSAGES.POST.POSTING.SUCCEED,
      data,
    });
  } catch (error) {
    next(error);
  }
});

// 게시글 목록 조회
postRouter.get("/", async (req, res, next) => {
  try {
    const user = req.user;
    const authorid = user.id;

    let { sort } = req.query;
    sort = sort?.toLowerCase();
    if (sort !== "desc" && sort !== "asc") {
      sort = "desc";
    }

    let data = await prisma.postModal.findMany({
      where: { authorid },
      orderBy: {
        createdAt: sort,
      },

      include: {
        Users: true,
      },
    });

    data = data.map((postModal) => {
      return {
        id: postModal.id,
        UsersName: postModal.author.name,
        title: postModal.title,
        content: postModal.content,
        deleteYn: postModal.deleteYn,
        createdAt: postModal.createdAt,
        updatedAt: postModal.updatedAt,
      };
    });

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.POST.READ_POST.SUCCEED,
      data,
    });
  } catch (error) {
    next(error);
  }
});

// 페이지 상세 조회
postRouter.get("/:id", async (req, res, next) => {
  try {
    const user = req.user;
    const authorid = user.id;

    const { id } = req.params;

    let data = await prisma.postModal.findUnique({
      where: { id: +id, authorid },
      include: { author: true },
    });

    if (!data) {
      return res.status(HTTP_STATUS.NOTFOUND).json({
        status: HTTP_STATUS.NOTFOUND,
        message: MESSAGES.POST.COMMON.NOT_FOUND,
      });
    }

    data = {
      id: data.id,
      authorName: data.author.name,
      title: data.title,
      content: data.content,
      deleteYn: data.deleteYn,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.POST.READ_DETAIL,
      data,
    });
  } catch (error) {
    next(error);
  }
});

// 게시글 수정

postRouter.put("/:id", upddatePostValidator, async (req, res, next) => {
  try {
    const user = req.user;
    const authorId = user.id;

    const { id } = req.params;

    const { title, content, scheduledTimeStart, scheduledTimeEnd } = req.body;

    let existPost = await prisma.postModal.findUnique({
      where: { id: +id, authorId },
    });

    if (existPost) {
      return res.status(HTTP_STATUS.NOTFOUND).json({
        status: HTTP_STATUS.NOTFOUND,
        message: MESSAGES.POST.COMMON.NOT_FOUND,
      });
    }

    const data = await prisma.postModal.update({
      where: { id: +id, authorId },
      data: {
        ...(title && { title }),
        ...(content && { content }),
      },
    });

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.POST.UPDATE.SUCCEED,
      data,
    });
  } catch (error) {
    next(error);
  }
});

//  게시글 삭제

postRouter.delete("/:id", async (req, res, next) => {
  try {
    const user = req.user;
    const authorId = user.id;

    const { id } = req.params;

    let existPost = await prisma.postModal.findUnique({
      where: { id: +id, authorId },
    });

    if (existPost) {
      return res.status(HTTP_STATUS.NOTFOUND).json({
        status: HTTP_STATUS.NOTFOUND,
        message: MESSAGES.POST.COMMON.NOT_FOUND,
      });
    }

    const data = await prisma.postModal.delete({
      where: { id: +id, authorId },
    });

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.POST.DELETE,
      data: { id: data.id },
    });
  } catch (error) {
    next(error);
  }
});

export { postRouter };
