// JWT는 base64url이라 표준 base64로 치환 후 디코딩
export const decodeJwtPayload = (token: string): Record<string, unknown> => {
  const payload = token.split('.')[1] ?? '';
  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(normalized));
};
