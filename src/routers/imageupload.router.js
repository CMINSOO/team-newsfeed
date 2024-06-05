import express from "express";
import { upload } from "../middlewares/image-upload-middleware.js";

const imageRouter = express.Router();

// 싱글 이미지 파일 업로드 -> S3에 이미지를 올린다.
imageRouter.post("/img", upload.single("img"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  console.log(req.file);
  res.json({ url: req.file.location });
});

export { imageRouter };
