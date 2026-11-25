import { useState } from "react";
import { Alert, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Button,
  FadeScrollView,
  LoadingView,
  Modal,
  PageHeader,
  PlanDeleteButton,
  PlanInfoFields,
  PlanPeriodField,
  PlanTextbookList,
  RepresentativePlanToggle,
  Stack,
  Text,
} from "@/components";
import { deletePlanBoard } from "@/api/common/planBoard";
import type { PlanBoard } from "@/api/common/planBoard";
import { getDeleteErrorMessage, getSaveErrorMessage, savePlanBoardEdit } from "@/api/home/PlanEditPage";
import { invalidatePlanQueries, queryClient, queryKeys } from "@/api/queryClient";
import { usePlanBoards } from "@/hooks/home/usePlanBoards";
import { usePlanBoardTextbooks } from "@/hooks/home/usePlanBoardTextbooks";
import { PLAN_MAX_AHEAD_YEARS } from "@/constants/plan";
import { addYears, toLocalDateString } from "@/utils/common/date";
import { getSpacing } from "@/utils/common/token";
import { buildPlanBoardEditInput, getPlanExamDate, hasPlanBoardEdit, parseLocalDate } from "@/utils/home/planBoard";
import { getGenerationStatus } from "@/utils/home/planGeneration";

// ================================
// Constants
// ================================

const BOTTOM_FADE_HEIGHT = getSpacing("spacing-12");

/** AI 계획의 남은 기간을 만드는 중이면 서버가 기간 수정을 막음 (409 PLAN_GENERATION_IN_PROGRESS, rooter-back#405) */
const PERIOD_LOCKED_MESSAGE = "남은 계획을 만드는 중이라 다 만들어진 뒤에 바꿀 수 있어요.";

// ================================
// Components
// ================================

interface FormProps {
  board: PlanBoard;
  canBeRepresentative: boolean;
  onDeleted: () => void;
}

/**
 * 플랜 수정 입력 칸들. 지금은 시험일 하루만 저장할 수 있어 시작·종료일을 늘 같은 날짜(시험일)로 맞추고, 오늘 이전·1년 넘는 날짜는 고를 수 없음
 * AI 계획의 남은 기간을 만드는 중이면 날짜는 막아 두고 이름·설명·대표 여부만 바꿀 수 있음
 * 아래로 더 스크롤할 수 있으면 [수정하기] 버튼 바로 위를 그라데이션으로 흐리게 덮음
 * [수정하기] 를 누르면 확인창을 띄운 뒤 바뀐 이름·설명·시험일·대표 여부만 저장하고, 홈으로 돌아가 완료 토스트를 띄움
 * [삭제하기] 를 누르면 확인창을 띄운 뒤 플랜을 삭제하고, 목록 캐시에서 바로 빼서 홈으로 돌아가 완료 토스트를 띄움
 * @param board 수정할 플랜
 * @param canBeRepresentative 대표 플랜 스위치를 보여줄지 (진행 중이거나 이미 대표인 플랜)
 * @param onDeleted 삭제에 성공해 목록 캐시에서 빼기 직전에 호출
 */
function PlanEditForm({ board, canBeRepresentative, onDeleted }: FormProps) {
  const [title, setTitle] = useState(board.title);
  const [description, setDescription] = useState(board.description ?? "");
  const [examDate, setExamDate] = useState(() => parseLocalDate(getPlanExamDate(board)));
  const [isRepresentative, setIsRepresentative] = useState(board.isRepresentative);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { textbooks, isPending: loadingTextbooks } = usePlanBoardTextbooks(board.id);
  const today = new Date();
  const busy = saving || deleting;

  const editInput = buildPlanBoardEditInput(board, {
    title,
    description,
    examDate: toLocalDateString(examDate),
    isRepresentative,
  });
  const canSave = title.trim().length > 0 && hasPlanBoardEdit(editInput) && !busy;

  const handleSave = async () => {
    setShowSaveConfirm(false);
    setSaving(true);
    try {
      await savePlanBoardEdit(board.id, editInput);
      invalidatePlanQueries();
      router.dismissTo({ pathname: "/Home/Home", params: { toast: "plan-updated" } });
    } catch (error) {
      invalidatePlanQueries();
      Alert.alert("수정 실패", getSaveErrorMessage(error));
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    setDeleting(true);
    try {
      await deletePlanBoard(board.id);
      onDeleted();
      queryClient.setQueryData<PlanBoard[]>(queryKeys.boards.list, (prev) => prev?.filter((item) => item.id !== board.id));
      invalidatePlanQueries();
      router.dismissTo({ pathname: "/Home/Home", params: { toast: "plan-deleted" } });
    } catch (error) {
      invalidatePlanQueries();
      Alert.alert("삭제 실패", getDeleteErrorMessage(error));
      setDeleting(false);
    }
  };

  return (
    <>
      <FadeScrollView
        fadeHeight={BOTTOM_FADE_HEIGHT}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ gap: getSpacing("spacing-11"), paddingBottom: getSpacing("spacing-9") }}
      >
        <PlanInfoFields title={title} description={description} onChangeTitle={setTitle} onChangeDescription={setDescription} />
        <PlanPeriodField
          start={examDate}
          end={examDate}
          minDate={today}
          maxDate={addYears(today, PLAN_MAX_AHEAD_YEARS)}
          onChangeStart={setExamDate}
          onChangeEnd={setExamDate}
          disabledMessage={getGenerationStatus(board) === "GENERATING" ? PERIOD_LOCKED_MESSAGE : null}
        />
        <PlanTextbookList textbooks={textbooks} loading={loadingTextbooks} />
        <Stack gap="m" width="full">
          {canBeRepresentative && (
            <RepresentativePlanToggle value={isRepresentative} onToggle={() => setIsRepresentative((prev) => !prev)} />
          )}
          <PlanDeleteButton disabled={busy} onPress={() => setShowDeleteConfirm(true)} />
        </Stack>
      </FadeScrollView>

      <Button
        variant={canSave ? "primary" : "disabled"}
        onPress={() => setShowSaveConfirm(true)}
        className="mb-spacing-6"
      >
        {saving ? "수정 중..." : "수정하기"}
      </Button>

      {showSaveConfirm && (
        <Modal
          title="플랜을 수정할까요?"
          description="수정한 플랜 정보를 저장합니다."
          confirmText="수정"
          onCancel={() => setShowSaveConfirm(false)}
          onConfirm={handleSave}
        />
      )}

      {showDeleteConfirm && (
        <Modal
          title={`'${board.title}' 플랜을 삭제할까요?`}
          description="이 플랜의 할 일과 퀴즈·피드백 기록도 함께 삭제되고 되돌릴 수 없습니다."
          confirmText="삭제"
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}

/**
 * 플랜 수정 화면. 플랜 목록에서 고른 플랜(boardId)의 이름·설명·시험일·대표 여부를 수정하거나 플랜을 삭제하고, 쓰인 교과서를 보여줌
 * 삭제한 뒤 홈으로 돌아가는 동안에는 '플랜을 찾을 수 없어요' 를 띄우지 않음
 */
export default function PlanEditPage() {
  const { boardId } = useLocalSearchParams<{ boardId: string }>();
  const { boards, inProgress, isPending } = usePlanBoards();
  const [deleted, setDeleted] = useState(false);
  const board = boards.find((item) => item.id === Number(boardId));

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <PageHeader title="플랜 수정하기" />

      {board && (
        <PlanEditForm
          key={board.id}
          board={board}
          canBeRepresentative={board.isRepresentative || inProgress.some((item) => item.id === board.id)}
          onDeleted={() => setDeleted(true)}
        />
      )}
      {!board && isPending && <LoadingView />}
      {!board && !isPending && !deleted && <Text variant="base-medium" color="secondary">플랜을 찾을 수 없어요.</Text>}
    </View>
  );
}
