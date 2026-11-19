import { getPlanBoards, setRepresentativePlanBoard } from '../../common/planBoard';

// ================================
// Functions
// ================================

/**
 * 대표 플랜이 하나도 없으면 방금 만든 플랜을 대표로 지정. 계획 생성 API 는 대표를 정하지 않아 생성 뒤에 따로 확인함
 * 캐시가 아닌 서버 목록으로 확인해, 다른 화면에서 막 바꾼 대표를 덮어쓰지 않음
 * @param boardId 방금 만든 플랜보드 ID
 */
export const setRepresentativeIfMissing = async (boardId: number) => {
  const boards = await getPlanBoards();
  if (boards.some((board) => board.isRepresentative)) return;
  await setRepresentativePlanBoard(boardId);
};
