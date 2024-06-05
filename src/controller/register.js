exports.register = async (req, res, next) => {
  const Img = req.file;
  console.log("s3 이미지 경로 :", Img.location);
};
