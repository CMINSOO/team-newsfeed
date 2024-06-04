import express from "express";
import imageUploader from "../middlewares/image-upload-middleware";

const imageRouter = express.Router();

imageRouter.post("/test", imageUploader.single("image"), (req, res) => {
  res.send("good!");
});

export { imageRouter };
