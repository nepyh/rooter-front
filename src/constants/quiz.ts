/** 한 할일에 풀 수 있는 퀴즈 횟수 (최초 1회 + 재도전 2회). 서버 MAX_ATTEMPTS 와 같은 값 */
export const QUIZ_MAX_ATTEMPTS = 3;

/** 떨어진 퀴즈가 만들어진 뒤 다음 퀴즈를 풀 수 있을 때까지 걸리는 시간. 서버 RETRY_DELAY_MINUTES(10분)와 같은 값 */
export const QUIZ_RETRY_DELAY_MS = 10 * 60_000;
