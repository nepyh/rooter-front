// ================================
// Functions
// ================================

/**
 * 반 입력에서 숫자가 아닌 글자(띄어쓰기 등)를 뺀 문자열
 * 서버는 반을 숫자로 받아서, 숫자 아닌 글자가 섞이면 저장이 거절됨
 * @param text 입력된 반
 */
export const toClassNumberInput = (text: string) => text.replace(/\D/g, "");

/**
 * 반이 1 이상 정수인지
 * @param classNum 입력된 반
 */
export const isValidClassNumber = (classNum: string) => /^\d+$/.test(classNum) && Number(classNum) >= 1;
