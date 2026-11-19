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
import type { PlanBoard } from "@/api/common/planBoard";
import { getSaveErrorMessage, savePlanBoardEdit } from "@/api/home/PlanEditPage";
import { invalidatePlanQueries } from "@/api/queryClient";
import { usePlanBoards } from "@/hooks/home/usePlanBoards";
import { usePlanBoardTextbooks } from "@/hooks/home/usePlanBoardTextbooks";
import { toLocalDateString } from "@/utils/common/date";
import { getSpacing } from "@/utils/common/token";
import { buildPlanBoardEditInput, getPlanExamDate, hasPlanBoardEdit, parseLocalDate } from "@/utils/home/planBoard";

// ================================
// Constants
// ================================

const BOTTOM_FADE_HEIGHT = getSpacing("spacing-12");

// ================================
// Components
// ================================

interface FormProps {
  board: PlanBoard;
  canBeRepresentative: boolean;
}

/**
 * 플랜 수정 입력 칸들. 지금은 시험일 하루만 저장할 수 있어 시작·종료일을 늘 같은 날짜(시험일)로 맞추고, 오늘 이전 날짜는 고를 수 없음
 * 아래로 더 스크롤할 수 있으면 [수정하기] 버튼 바로 위를 그라데이션으로 흐리게 덮음
 * [수정하기] 를 누르면 확인창을 띄운 뒤 바뀐 이름·설명·시험일·대표 여부만 저장하고 플랜 목록으로 돌아감
 * [삭제하기] 는 확인창까지만 띄우고, 삭제 API 는 아직 연결하지 않음
 * @param board 수정할 플랜
 * @param canBeRepresentative 대표 플랜 스위치를 보여줄지 (진행 중이거나 이미 대표인 플랜)
 */
function PlanEditForm({ board, canBeRepresentative }: FormProps) {
  const [title, setTitle] = useState(board.title);
  const [description, setDescription] = useState(board.description ?? "");
  const [examDate, setExamDate] = useState(() => parseLocalDate(getPlanExamDate(board)));
  const [isRepresentative, setIsRepresentative] = useState(board.isRepresentative);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const { textbooks, isPending: loadingTextbooks } = usePlanBoardTextbooks(board.id);
  const today = new Date();

  const editInput = buildPlanBoardEditInput(board, {
    title,
    description,
    examDate: toLocalDateString(examDate),
    isRepresentative,
  });
  const canSave = title.trim().length > 0 && hasPlanBoardEdit(editInput) && !saving;

  const handleSave = async () => {
    setShowSaveConfirm(false);
    setSaving(true);
    try {
      await savePlanBoardEdit(board.id, editInput);
      invalidatePlanQueries();
      if (router.canGoBack()) router.back(); else router.replace("/Home/PlanListPage");
    } catch (error) {
      invalidatePlanQueries();
      Alert.alert("수정 실패", getSaveErrorMessage(error));
      setSaving(false);
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
          onChangeStart={setExamDate}
          onChangeEnd={setExamDate}
        />
        <PlanTextbookList textbooks={textbooks} loading={loadingTextbooks} />
        <Stack gap="m" width="full">
          {canBeRepresentative && (
            <RepresentativePlanToggle value={isRepresentative} onToggle={() => setIsRepresentative((prev) => !prev)} />
          )}
          <PlanDeleteButton onPress={() => setShowDeleteConfirm(true)} />
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
          animationType="fade"
          title="플랜을 수정할까요?"
          description="수정한 플랜 정보를 저장합니다."
          confirmText="수정"
          onCancel={() => setShowSaveConfirm(false)}
          onConfirm={handleSave}
        />
      )}

      {showDeleteConfirm && (
        <Modal
          animationType="fade"
          title={`'${board.title}' 플랜을 삭제할까요?`}
          description="플랜의 공부 계획도 모두 삭제되고 되돌릴 수 없습니다."
          confirmText="삭제"
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
}

/**
 * 플랜 수정 화면. 플랜 목록에서 고른 플랜(boardId)의 이름·설명·시험일·대표 여부를 수정하고, 쓰인 교과서를 보여줌
 */
export default function PlanEditPage() {
  const { boardId } = useLocalSearchParams<{ boardId: string }>();
  const { boards, inProgress, isPending } = usePlanBoards();
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
        />
      )}
      {!board && isPending && <LoadingView />}
      {!board && !isPending && <Text variant="base-medium" color="secondary">플랜을 찾을 수 없어요.</Text>}
    </View>
  );
}
