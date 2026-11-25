// ================================
// Types
// ================================

type UsernameProblem = "whitespace" | "hidden" | "tooLong";

// ================================
// Constants
// ================================

// 백엔드 이름 규칙 (nepyh/rooter-back#407) 과 같은 규칙. 바꿀 때는 양쪽을 함께 바꿔야 함
export const USERNAME_MAX_LENGTH = 12;

const PROBLEM_MESSAGES: Record<UsernameProblem, string> = {
  "whitespace": "이름에 띄어쓰기를 넣을 수 없어요.",
  "hidden": "이름에 눈에 보이지 않는 문자가 섞여 있어요. 붙여넣지 말고 직접 입력해주세요.",
  "tooLong": `이름은 ${USERNAME_MAX_LENGTH}자 이하로 입력해주세요.`,
};

/** 공백 (전각 공백·NBSP 포함) */
const WHITESPACE = /\p{White_Space}/u;

/** 제어 문자 Cc, 눈에 안 보이는 서식 문자 Cf (U+200B~200D, U+2060, U+FEFF 등), 사용자 정의 영역 Co, 정해지지 않은 문자 Cn */
const HIDDEN_CHAR = /[\p{Cc}\p{Cf}\p{Co}\p{Cn}]/u;

// ================================
// Functions
// ================================

/**
 * 이름이 어긴 규칙 하나를 찾음. 넣으면 안 되는 문자를 먼저 보고, 그다음 길이를 봄
 * @param username 검사할 이름
 */
const findUsernameProblem = (username: string): UsernameProblem | null => {
  if (WHITESPACE.test(username)) return "whitespace";
  if (HIDDEN_CHAR.test(username)) return "hidden";
  if (username.length > USERNAME_MAX_LENGTH) return "tooLong";
  return null;
};

/**
 * 이름에서 어긴 규칙의 안내 문구. 빈 이름은 버튼을 막는 것으로 처리해 안내하지 않음
 * @param username 검사할 이름
 * @returns 어긴 규칙의 안내 문구, 규칙에 맞으면 null
 */
export const getUsernameError = (username: string): string | null => {
  const problem = findUsernameProblem(username);
  return problem ? PROBLEM_MESSAGES[problem] : null;
};
