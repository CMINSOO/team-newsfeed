import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
} from "../constants/env.constants.js";

const s3Client = new S3Client({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

const allowedExtensions = [".png", ".jpg", ".jpeg", ".bmp"];

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: "node-newsfeed-project",
    key: (req, file, callback) => {
      const uploadDirectory = req.query.directory ?? "";
      const extension = path.extname(file.originalname);
      if (!allowedExtensions.includes(extension)) {
        return callback(new Error("wrong extension"));
      }
      callback(null, `${uploadDirectory}/${Date.now()}_${file.originalname}`);
    },
    acl: "public-read",
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
});

export { upload };
