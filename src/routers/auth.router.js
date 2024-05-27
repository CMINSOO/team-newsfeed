import express from "express";
import jwt from "jsonwebtoken";

// access, refresh 토큰 발급 api

const Router = express.Router();

const ACCESS_TOKEN_SECRET_KEY = "dbswp12";
const REFRESH_TOKEN_SECRET_KEY = "skfls12";

const tokenStorages = {}; //리프레시 토큰을 관리할 객체

Router.post("/tokens", async (req, res) => {
  // 아이디 전달
  const { id } = req.body;

  // 엑세스 토큰과 리프레쉬 토큰을 발급하기
  const accessToken = createAccessToken(id);
  const refreshToken = createRefreshToken(id);

  tokenStorages[refreshToken] = {
    id: id,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  };

  //   클라이언트에게 쿠키(토큰 )할당하기
  res.cookie("accessToken", accessToken);
  res.cookie("refreshToken", refreshToken);

  return res
    .status(200)
    .json({ message: "Token 이 정상적으로 발급되었습니다" });
});

function createAccessToken(id) {
  const accessToken = jwt.sign({ id: id }, ACCESS_TOKEN_SECRET_KEY, {
    expiresIn: "5s",
  });
  return accessToken;
}

function createRefreshToken(id) {
  const refreshToken = jwt.sign({ id: id }, REFRESH_TOKEN_SECRET_KEY, {
    expiresIn: "7d",
  });
  return refreshToken;
}

export default Router;
