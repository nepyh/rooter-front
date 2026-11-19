import { useEffect, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Toast,
  AddPlanBoardModal,
  AiChatModal,
  HomeHeader,
  PlanTimeline,
  NeighborPage,
  EmptyPlanNotice,
  FloatingActions,
  EditModal,
  AddMenu,
  ConfirmDeleteModal,
} from "@/components";
import { useNow } from "@/hooks/common/useNow";
import { useDayPager } from "@/hooks/home/useDayPager";
import { usePlans } from "@/hooks/home/usePlans";
import { useDaySchedule } from "@/hooks/home/useDaySchedule";
import { usePlanBoards } from "@/hooks/home/usePlanBoards";
import { useTimelineScroll } from "@/hooks/home/useTimelineScroll";
import { usePlanDraftStore, useUIStore } from "@/store";
import { TASK_NOT_STARTED_MESSAGE } from "@/constants/task";
import { toLocalDateString } from "@/utils/common/date";
import { getPlanExamDate } from "@/utils/home/planBoard";
import { getDDay, getPlanStartTime, isPlanStarted, type DragPreview, type Plan } from "@/utils/home/timeline";

// ================================
// Constants
// ================================

const TOAST_MESSAGES: Record<string, string> = {
  "success": "회원가입이 완료되었습니다.",
  "study-survey-completed": "공부 스타일 설문이 완료되었습니다.",
};

// ================================
// Components
// ================================

/**
 * 홈 화면
 */
export default function Home() {
  const { toast } = useLocalSearchParams<{ toast?: string }>();
  const toastMessage = toast ? TOAST_MESSAGES[toast] : undefined;
  const now = useNow(30_000);
  const [dayOffset, setDayOffset] = useState(0);
  const selectedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset);
  const selectedKey = toLocalDateString(selectedDate);
  const isToday = dayOffset === 0;

  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);
  const [failTarget, setFailTarget] = useState<Plan | null>(null);
  const [deleteToast, setDeleteToast] = useState<string | null>(null);
  const [showNotStartedNotice, setShowNotStartedNotice] = useState(false);
  const [emptyNoticeClosed, setEmptyNoticeClosed] = useState(false);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [showPlansNotLoadedNotice, setShowPlansNotLoadedNotice] = useState(false);
  const afterAddMenuClosedRef = useRef<(() => void) | null>(null);
  const setFullScreenModalOpen = useUIStore((state) => state.setFullScreenModalOpen);
  const resetPlanDraft = usePlanDraftStore((state) => state.reset);

  const { plans, coloredPlans, plansLoaded, chatDailyPlanId, reload, savePlanEdit, deletePlan, failPlan } = usePlans(selectedDate, selectedKey, now);
  const { busyBlocks } = useDaySchedule(selectedKey);
  const { representative, isPending: boardsPending } = usePlanBoards();
  const examDDay = representative ? getDDay(getPlanExamDate(representative), now) : null;
  const timeline = useTimelineScroll(now);

  const moveDay = (delta: number) => {
    setActiveId(null);
    setDayOffset((prev) => prev + delta);
  };
  const pager = useDayPager(dayOffset, moveDay, timeline.scrollYRef);
  const neighborDate = (delta: number) => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + delta);

  const activePlan = coloredPlans.find((plan) => plan.id === activeId) ?? null;
  const activePlanStarted = activePlan ? isPlanStarted(activePlan, selectedKey, now) : false;
  const editingPlan = plans.find((plan) => plan.id === editingId) ?? null;

  useEffect(() => {
    setFullScreenModalOpen(showAddPlan || showAiChat);
    return () => setFullScreenModalOpen(false);
  }, [showAddPlan, showAiChat, setFullScreenModalOpen]);

  const handleLongPressPlan = (plan: Plan) => {
    if (plan.status !== "pending") return;
    setActiveId(plan.id);
    timeline.revealMenu(plan);
  };

  const handleDropPlan = (plan: Plan, start: number, duration: number) => {
    setDragPreview(null);
    if (start !== plan.start || duration !== plan.duration) savePlanEdit(plan.id, plan.title, start, duration);
    timeline.revealMenu({ ...plan, start, duration });
  };

  /**
   * 완료·실패를 시작해 보고 할 수 있는지 돌려줌. 액션 메뉴를 닫고, 시작 시각 전이면 안내를 띄우고 false
   * 30초마다 바뀌는 now 대신 누른 순간의 시각으로 판단해, 막 시작한 계획을 잘못 막지 않음
   */
  const tryResolve = (plan: Plan) => {
    if (plan.status !== "pending") return false;
    setActiveId(null);
    if (isPlanStarted(plan, selectedKey, new Date())) return true;
    setShowNotStartedNotice(true);
    return false;
  };

  const handleComplete = (plan: Plan) => {
    if (!tryResolve(plan)) return;
    router.push({
      pathname: "/Quiz/QuizPage",
      params: {
        taskId: plan.id,
        dailyPlanId: plan.dailyPlanId !== undefined ? String(plan.dailyPlanId) : "",
        category: plan.category,
        date: selectedKey,
        startTime: getPlanStartTime(plan),
      },
    });
  };

  const handleFail = (plan: Plan) => {
    if (!tryResolve(plan)) return;
    setFailTarget(plan);
  };

  const confirmFail = () => {
    if (!failTarget) return;
    failPlan(failTarget);
    setFailTarget(null);
  };

  const handleEdit = (plan: Plan) => {
    setEditingId(plan.id);
    setActiveId(null);
  };

  const handleEditSave = (title: string, start: number, duration: number) => {
    if (editingId) savePlanEdit(editingId, title, start, duration);
    setEditingId(null);
  };

  const handleDelete = (plan: Plan) => {
    setActiveId(null);
    setDeleteTarget(plan);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    if (await deletePlan(target)) setDeleteToast(`'${target.title}' 일정이 삭제되었습니다.`);
  };

  /**
   * AI 채팅을 엶. 계획이 없어도 열지만, 그날 할 일을 아직 못 불러왔으면 계획이 있는지 몰라 안내만 띄움
   * (못 불러온 채로 열면 계획이 있는 날도 계획 없는 채팅으로 보내져 일정을 못 바꿈)
   */
  const handleOpenAiChat = () => {
    if (!plansLoaded) {
      setShowPlansNotLoadedNotice(true);
      return;
    }
    setShowAiChat(true);
  };

  const startPlanCreation = () => {
    resetPlanDraft();
    router.push("/Home/PlanInfoPage");
  };

  const handlePlanCreated = () => {
    setShowAddPlan(false);
    reload();
  };

  const closeAddMenuThen = (action: () => void) => {
    afterAddMenuClosedRef.current = action;
    setShowAddMenu(false);
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      {toastMessage && <Toast text={toastMessage} onClose={() => router.setParams({ toast: undefined })} />}

      <HomeHeader
        date={selectedDate}
        isToday={isToday}
        planLoaded={!boardsPending}
        examTitle={representative?.title ?? null}
        examDDay={examDDay}
        onPressToday={pager.goToday}
        onPressDDay={() => router.push("/Home/PlanListPage")}
      />

      <View className="flex-1">
        {plans.length === 0 && !emptyNoticeClosed && (
          <EmptyPlanNotice onCreate={startPlanCreation} onClose={() => setEmptyNoticeClosed(true)} />
        )}
        <View className="flex-1 -mx-spacing-7" onLayout={(e) => pager.setPageWidth(e.nativeEvent.layout.width)}>
          {pager.pageWidth > 0 && (
            <GestureDetector gesture={pager.pagerGesture}>
              <ScrollView
                ref={pager.pagerRef}
                horizontal
                pagingEnabled
                scrollEnabled={pager.pagerScrollEnabled}
                showsHorizontalScrollIndicator={false}
                contentOffset={{ x: pager.pageWidth, y: 0 }}
                scrollEventThrottle={16}
                onScrollBeginDrag={pager.handlePagerBeginDrag}
                onScroll={pager.handlePagerScroll}
                onMomentumScrollEnd={pager.handlePagerEnd}
              >
                <NeighborPage width={pager.pageWidth} offset={pager.neighborOffset} date={neighborDate(pager.neighborDeltas.prev)} now={now} />
                <View className="px-spacing-7" style={{ width: pager.pageWidth }}>
                  <PlanTimeline
                    scrollRef={timeline.scrollRef}
                    pagerGesture={pager.pagerGesture}
                    dateKey={selectedKey}
                    busyBlocks={busyBlocks}
                    plans={coloredPlans}
                    currentTime={isToday ? now : null}
                    activePlan={activePlan}
                    activePlanStarted={activePlanStarted}
                    dragPreview={dragPreview}
                    onLongPressPlan={handleLongPressPlan}
                    onDragStart={(plan, mode) => setDragPreview({ id: plan.id, mode, start: plan.start, duration: plan.duration })}
                    onDragMove={(plan, start, duration) => setDragPreview((prev) => prev && { ...prev, start, duration })}
                    onDropPlan={handleDropPlan}
                    onDismissMenu={() => setActiveId(null)}
                    onComplete={handleComplete}
                    onFail={handleFail}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onScrollY={timeline.handleScrollY}
                    onViewportHeight={timeline.handleViewportHeight}
                  />
                </View>
                <NeighborPage width={pager.pageWidth} offset={pager.neighborOffset} date={neighborDate(pager.neighborDeltas.next)} now={now} />
              </ScrollView>
            </GestureDetector>
          )}
        </View>
      </View>

      <FloatingActions onPressAdd={() => setShowAddMenu(true)} onPressAiChat={handleOpenAiChat} />

      {editingPlan && <EditModal plan={editingPlan} onClose={() => setEditingId(null)} onSave={handleEditSave} />}

      {deleteTarget && (
        <ConfirmDeleteModal
          title={`'${deleteTarget.title}' 일정을 삭제할까요?`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}

      {failTarget && (
        <ConfirmDeleteModal
          title={`'${failTarget.title}' 일정을 실패로 처리할까요?`}
          description="실패로 처리하면 되돌릴 수 없어요."
          confirmText="실패"
          onCancel={() => setFailTarget(null)}
          onConfirm={confirmFail}
        />
      )}

      {deleteToast && <Toast text={deleteToast} onClose={() => setDeleteToast(null)} />}
      {showNotStartedNotice && <Toast text={TASK_NOT_STARTED_MESSAGE} onClose={() => setShowNotStartedNotice(false)} />}
      {showPlansNotLoadedNotice && <Toast text="계획을 아직 불러오지 못했어요. 잠시 후 다시 시도해주세요." onClose={() => setShowPlansNotLoadedNotice(false)} />}

      <AddMenu
        visible={showAddMenu}
        onClose={() => setShowAddMenu(false)}
        onFullyClosed={() => {
          afterAddMenuClosedRef.current?.();
          afterAddMenuClosedRef.current = null;
        }}
        onCreateSchedule={() => closeAddMenuThen(() => setShowAddPlan(true))}
        onCreatePlan={() => closeAddMenuThen(startPlanCreation)}
      />

      <AddPlanBoardModal
        visible={showAddPlan}
        baseDate={isToday ? now : selectedDate}
        onClose={() => setShowAddPlan(false)}
        onCreated={handlePlanCreated}
      />

      <AiChatModal
        visible={showAiChat}
        dailyPlanId={chatDailyPlanId}
        onClose={() => setShowAiChat(false)}
        onPlanChanged={reload}
      />
    </View>
  );
}
