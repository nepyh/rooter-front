import axios from 'axios';

/**
 * 비밀번호 변경 실패 원인이 "현재 비밀번호 불일치" 인지 (백엔드 code 기준)
 * @param error changePassword() 가 던진 에러
 */
export const isWrongCurrentPassword = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.data?.code === "WRONG_CURRENT_PASSWORD";
