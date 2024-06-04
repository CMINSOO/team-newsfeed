import aws from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";

import {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
} from "../constants/env.constants.js";

aws.config.update({
  region: "arn:aws:iam::767398021007:user/node-newsfeed-project",
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccesskey: AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

const allowedExtensions = [".png", ".jpg", ".jpeg", ".bmp"];

const imageUploader = multer({
  storage: multerS3({
    s3: s3,
    bucket: "node-newsfeed-project",
    key: (req, file, callback) => {
      const uploadDirectory = req.query.directory ?? "";
      const extension = path.extname(file.originalname);
      if (!allowedExtensions.includes(extension)) {
        return callback(new Error("wrong extension"));
      }
      callback(null, `${uploadDirectory}/${Date.now()}_${file.originalname}`);
    },
    acl: "public-read-write",
  }),
});

export { imageUploader };
