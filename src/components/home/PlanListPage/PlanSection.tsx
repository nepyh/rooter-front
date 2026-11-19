import { router } from "expo-router";
import { Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { PlanCard } from "./PlanCard";
import type { PlanBoard } from "@/api/common/planBoard";
import { formatPlanDate, getPlanExamDate } from "@/utils/home/planBoard";

// ================================
// Components
// ================================

interface Props {
  title: string;
  boards: PlanBoard[];
  representativeId?: number | null;
}

/**
 * 플랜 목록의 한 묶음 (진행 중인 플랜, 완료된 플랜). 플랜을 누르면 플랜 수정 화면으로 이동
 * @param title 묶음 제목
 * @param boards 묶음에 넣을 플랜
 * @param representativeId 대표 플랜 id, 이 묶음에 대표 표시가 필요 없으면 생략
 */
export function PlanSection({ title, boards, representativeId = null }: Props) {
  return (
    <Stack gap="l" width="full">
      <Text variant="header-small">{title}</Text>
      <Stack gap="m" width="full">
        {boards.map((board) => (
          <PlanCard
            key={board.id}
            title={board.title}
            date={formatPlanDate(getPlanExamDate(board))}
            isRepresentative={board.id === representativeId}
            onPress={() => router.push({ pathname: "/Home/PlanEditPage", params: { boardId: String(board.id) } })}
          />
        ))}
      </Stack>
    </Stack>
  );
}
