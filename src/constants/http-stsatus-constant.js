export const HTTP_STATUS = {
  OK: 200, // 호출에 성공했을떄
  CREATED: 201, // 생성에 성공했을떄
  BAD_REQUEST: 400, // 사용자가 잘못했을때 (예{ 입력 값을 빠드렸을떄})
  UNAUTHORIZED: 401, // 인증실패 .UNAUTHENCIATED(예: 비밀번호가 틀렸을떄)
  FORBIDDEN: 403, //인가 실패 UNAUTHORIZED ( 예: 접근권한이 없을떄)
  NOT_FOUND: 404, // 요청한 데이터를 찾을 수 없을때
  CONFLICT: 409, // 충돌이 발생했을때 {예: 이메일 중복}
  INTERNER_SERVER_ERROR: 500, // 예상치 못한 오류가 발생했을때
};
