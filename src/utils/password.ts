export const PASSWORD_ERROR_MESSAGE = "비밀번호는 대소문자, 숫자를 포함하여야 합니다.";

export const isValidPassword = (password: string) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(password);
