import jwt from "jsonwebtoken";

export default async function (req, res, next) {
  // 클라 로 부터 쿠키 전달받기
  try {
    const { authorization } = req.cookies;
    // 쿠카가 Bearer 토큰 형식인지 확인하기
    const [tokenType, token] = authorization.split(" ");
    if (tokenType !== "Bearer")
      throw new Error("토큰타입이 일치하지 않습니다.");

    //  서버에서 발급한 jwt 가 맞는 지 검증하기
    const decodedToken = jwt.verify(token, "customized_secret_key");
    const userId = decodedToken.userId;

    // jwt 의 userId 를 이용해 사용자 조회
    const user = await prisma.users.findFirst({
      where: { userId: +userId },
    });
    if (!user) {
      res.clearCookie("authorization"); //유저가 없으면 쿠키삭제
      throw new Error("토큰사용자가 존재하지 않습니다");
    }

    //   req.user 에 조회된 사용자 정보 할당하기
    req.user = user;
    //  다음 미들웨어 실행하기
    next();
  } catch (error) {
    res.clearCookie("authorization"); //특정 쿠키 삭제하기

    switch (error.name) {
      case "TokenExpiredError": //토큰이 만료되었을때
        return res.status(401).json({ message: "토큰이 만료되었습니다" });
      case "JsonWebTokenError": //토큰 검증에 실패했을때
        return res.status(401).json({ message: "검증에 실패하였습니다" });
      default:
        return res
          .status(401)
          .json({ message: error.message ?? "비정상적인 요청입니다" });
    }
  }
}
