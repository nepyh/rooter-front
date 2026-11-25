// 백엔드 PlanDateRules.kt (nepyh/rooter-back#401) 와 같은 규칙. 바꿀 때는 양쪽을 함께 바꿔야 함

/** 계획 기간(시작~종료, 양 끝 포함) 최대 일수. AI 계획은 시험 첫날 전날까지가 기간이라 시험 첫날은 오늘 + 이 일수까지 */
export const PLAN_MAX_DAYS = 80;

/** 종료일·시험일은 오늘부터 이 해 수 안 */
export const PLAN_MAX_AHEAD_YEARS = 1;
