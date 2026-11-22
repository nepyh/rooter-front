import { setRepresentativePlanBoard, unsetRepresentativePlanBoard, updatePlanBoard } from '../../common/planBoard';
import type { UpdatePlanBoardInput } from '../../common/planBoard';

// ================================
// Types
// ================================

export interface PlanBoardEditInput {
  fields: UpdatePlanBoardInput;
  isRepresentative?: boolean;
}

// ================================
// Functions
// ================================

/**
 * 플랜 수정 화면의 변경 내용을 저장. 이름·설명·시험일을 먼저 수정하고, 대표 여부가 바뀌었으면 대표를 설정하거나 해제함
 * @param boardId 플랜보드 ID
 * @param input fields(바뀐 필드만, 비면 수정 요청을 보내지 않음), isRepresentative(바뀌었을 때만 넣음)
 */
export const savePlanBoardEdit = async (boardId: number, { fields, isRepresentative }: PlanBoardEditInput) => {
  if (Object.keys(fields).length > 0) await updatePlanBoard(boardId, fields);
  if (isRepresentative === true) await setRepresentativePlanBoard(boardId);
  if (isRepresentative === false) await unsetRepresentativePlanBoard(boardId);
};
