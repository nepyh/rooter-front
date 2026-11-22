// ================================
// Types
// ================================

type PasswordProblem = "whitespace" | "hidden" | "emoji" | "tooShort" | "tooLong" | "noLetter" | "noDigit";

// ================================
// Constants
// ================================

// 백엔드 PasswordPolicy.kt (nepyh/rooter-back#385) 와 같은 규칙. 바꿀 때는 양쪽을 함께 바꿔야 함
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 20;

/** 서버는 거절했는데 화면 검사로는 어긴 규칙을 못 찾았을 때 보여주는 기본 규칙 */
export const PASSWORD_ERROR_MESSAGE = `비밀번호는 영문과 숫자를 포함한 ${PASSWORD_MIN_LENGTH}~${PASSWORD_MAX_LENGTH}자여야 합니다.`;

const PROBLEM_MESSAGES: Record<PasswordProblem, string> = {
  "whitespace": "비밀번호에 띄어쓰기를 넣을 수 없습니다.",
  "hidden": "비밀번호에 눈에 보이지 않는 문자가 섞여 있습니다. 붙여넣지 말고 직접 입력해주세요.",
  "emoji": "비밀번호에 이모지나 기호(©, ° 등)를 넣을 수 없습니다.",
  "tooShort": `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`,
  "tooLong": `비밀번호는 ${PASSWORD_MAX_LENGTH}자 이하여야 합니다.`,
  "noLetter": "비밀번호에 영문을 하나 이상 넣어주세요.",
  "noDigit": "비밀번호에 숫자를 하나 이상 넣어주세요.",
};

/** 공백 (전각 공백·NBSP 포함) */
const WHITESPACE = /\p{White_Space}/u;

/** 제어 문자 Cc, 눈에 안 보이는 서식 문자 Cf (U+200B~200D, U+2060, U+FEFF 등, 붙여넣기로 섞여 들어옴), 사용자 정의 영역 Co, 정해지지 않은 문자 Cn */
const HIDDEN_CHAR = /[\p{Cc}\p{Cf}\p{Co}\p{Cn}]/u;

/** BMP 이모지·그림 기호 So (☺ ❤ ✅ © ° 등), 키캡 Me (U+20E3), 이모지 변형 선택자 U+FE00~FE0F */
const EMOJI_CHAR = /[\p{So}\p{Me}︀-️]/u;

/** 보조 평면 문자 (이모지 대부분). u 플래그 없이 서로게이트 단위로 찾아, 백엔드처럼 글자 수(length)가 보이는 글자 수와 같아지게 함 */
const SURROGATE = /[\uD800-\uDFFF]/;

const HAS_LETTER = /[A-Za-z]/;
const HAS_DIGIT = /\d/;

// ================================
// Functions
// ================================

/**
 * 비밀번호가 어긴 규칙 하나를 찾음. 넣으면 안 되는 문자를 먼저 보고, 그다음 길이, 마지막으로 영문·숫자 포함 여부를 봄
 * (이모지는 두 글자로 세어져 길이 문제로 잘못 안내되지 않도록 길이보다 먼저 확인)
 * @param password 검사할 비밀번호
 */
const findPasswordProblem = (password: string): PasswordProblem | null => {
  if (WHITESPACE.test(password)) return "whitespace";
  if (HIDDEN_CHAR.test(password)) return "hidden";
  if (EMOJI_CHAR.test(password) || SURROGATE.test(password)) return "emoji";
  if (password.length < PASSWORD_MIN_LENGTH) return "tooShort";
  if (password.length > PASSWORD_MAX_LENGTH) return "tooLong";
  if (!HAS_LETTER.test(password)) return "noLetter";
  if (!HAS_DIGIT.test(password)) return "noDigit";
  return null;
};

/**
 * 새로 설정하는 비밀번호(가입·변경)에서 어긴 규칙의 안내 문구. 로그인에는 쓰지 않음 (예전 규칙으로 만든 비밀번호도 로그인돼야 함)
 * @param password 검사할 비밀번호
 * @returns 어긴 규칙의 안내 문구, 규칙에 맞으면 null
 */
export const getPasswordError = (password: string): string | null => {
  const problem = findPasswordProblem(password);
  return problem ? PROBLEM_MESSAGES[problem] : null;
};
