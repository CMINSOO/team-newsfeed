import express from "express";
import { upload, s3Client } from "../middlewares/image-upload-middleware.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";

const imageRouter = express.Router();

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
