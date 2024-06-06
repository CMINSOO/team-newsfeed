import express from "express";
import { upload, s3Client } from "../middlewares/image-upload-middleware.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";

const imageRouter = express.Router();

// 싱글 이미지 파일 업로드 -> S3에 이미지를 올린다.
imageRouter.post("/img", upload.single("img"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  res.json({ message: "File uploaded successfully", file: req.file });
});

//다운로드
imageRouter.get("/download/:key", async (req, res) => {
  const command = new GetObjectCommand({
    Bucket: "node-newsfeed-project",
    Key: req.params.key,
  });
  const response = await s3Client.send(command);
  const fileStream = response.Body;
  const filename = encodeURIComponent(req.params.key);
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  fileStream.pipe(res);
});

export { imageRouter };
