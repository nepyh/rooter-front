import type { PlanBoard, UpdatePlanBoardInput } from "@/api/common/planBoard";
import type { PlanBoardEditInput } from "@/api/home/PlanEditPage";

// ================================
// Types
// ================================

interface PlanBoardEditForm {
  title: string;
  description: string;
  examDate: string;
  isRepresentative: boolean;
}

// ================================
// Constants
// ================================

const PLAN_NAME_MIN_BOARDS = 2;

// ================================
// Functions
// ================================

/**
 * 일정 블록에 보여줄 플랜 이름 목록. 플랜이 PLAN_NAME_MIN_BOARDS 개 이상일 때만 만들고, 그보다 적으면 빈 목록
 * @param boards 플랜보드 목록
 * @returns 플랜보드 ID → 플랜 이름
 */
export const getPlanNames = (boards: PlanBoard[]): Record<number, string> =>
  boards.length < PLAN_NAME_MIN_BOARDS
    ? {}
    : Object.fromEntries(boards.map((board) => [board.id, board.title]));

/**
 * 플랜의 시험일. 시험일이 없는 보드는 종료일을 씀
 * @param board 플랜보드
 * @returns 시험일 (YYYY-MM-DD)
 */
export const getPlanExamDate = (board: PlanBoard) => board.examDate ?? board.endDate;

/**
 * 플랜을 진행 중과 완료(시험일이 오늘보다 이전)로 나눔. 서버 정렬(최근 생성 순)은 그대로 유지
 * @param boards 플랜보드 목록
 * @param today 오늘 (YYYY-MM-DD)
 */
export const splitPlanBoards = (boards: PlanBoard[], today: string) => ({
  inProgress: boards.filter((board) => getPlanExamDate(board) >= today),
  completed: boards.filter((board) => getPlanExamDate(board) < today),
});

/**
 * 플랜 수정 화면 입력값에서 원래 플랜과 달라진 것만 골라 저장 요청으로 만듦. 이름·설명은 앞뒤 공백을 빼고 비교
 * @param board 원래 플랜
 * @param form 수정 화면 입력값 (examDate 는 YYYY-MM-DD)
 * @returns fields(바뀐 필드), isRepresentative(대표 여부가 바뀌었을 때만)
 */
export const buildPlanBoardEditInput = (board: PlanBoard, form: PlanBoardEditForm): PlanBoardEditInput => {
  const fields: UpdatePlanBoardInput = {};
  const title = form.title.trim();
  const description = form.description.trim();
  if (title !== board.title) fields.title = title;
  if (description !== (board.description ?? "")) fields.description = description;
  if (form.examDate !== getPlanExamDate(board)) fields.examDate = form.examDate;
  return {
    fields,
    isRepresentative: form.isRepresentative !== board.isRepresentative ? form.isRepresentative : undefined,
  };
};

/**
 * 저장할 변경이 있는지
 * @param input buildPlanBoardEditInput() 의 결과
 */
export const hasPlanBoardEdit = (input: PlanBoardEditInput) =>
  Object.keys(input.fields).length > 0 || input.isRepresentative !== undefined;

/**
 * YYYY-MM-DD 를 기기 시간 기준 Date 로 변환
 * @param value 날짜 문자열 (YYYY-MM-DD)
 */
export const parseLocalDate = (value: string) => {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/**
 * 플랜 목록 카드에 보여줄 날짜 (예: 2026년 8월 10일)
 * @param value 날짜 문자열 (YYYY-MM-DD)
 */
export const formatPlanDate = (value: string) => {
  const date = parseLocalDate(value);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};

/**
 * 날짜 선택 버튼에 보여줄 날짜 (예: 6월 30일)
 * @param date 날짜
 */
export const formatMonthDay = (date: Date) => `${date.getMonth() + 1}월 ${date.getDate()}일`;
