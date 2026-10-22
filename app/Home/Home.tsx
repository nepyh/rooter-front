import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
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
import { usePrefetchNeighborDays } from "@/hooks/home/usePrefetchNeighborDays";
import { useTimelineScroll } from "@/hooks/home/useTimelineScroll";
import { usePlanDraftStore, useUIStore } from "@/store";
import { toLocalDateString } from "@/utils/common/date";
import type { DragPreview, Plan } from "@/utils/home/timeline";

/**
 * 홈 화면
 */
export default function Home() {
  const { toast } = useLocalSearchParams<{ toast?: string }>();
  const now = useNow(30_000);
  const [dayOffset, setDayOffset] = useState(0);
  const selectedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset);
  const selectedKey = toLocalDateString(selectedDate);
  const isToday = dayOffset === 0;

  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [deleteToast, setDeleteToast] = useState<string | null>(null);
  const [showNoPlanChatNotice, setShowNoPlanChatNotice] = useState(false);
  const [emptyNoticeClosed, setEmptyNoticeClosed] = useState(false);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const afterAddMenuClosedRef = useRef<(() => void) | null>(null);
  const setFullScreenModalOpen = useUIStore((state) => state.setFullScreenModalOpen);
  const resetPlanDraft = usePlanDraftStore((state) => state.reset);

  const { plans, coloredPlans, chatDailyPlanId, reload, isManualPlan, setPlanStatus, savePlanEdit, deletePlan } = usePlans(selectedDate, selectedKey, now);
  const { busyBlocks, examDDay } = useDaySchedule(selectedKey, now);
  usePrefetchNeighborDays(selectedDate);
  const timeline = useTimelineScroll(now);

  const moveDay = (delta: number) => {
    setActiveId(null);
    setDayOffset((prev) => prev + delta);
  };
  const pager = useDayPager(dayOffset, moveDay, timeline.scrollYRef);
  const pagerGesture = useMemo(() => Gesture.Native(), []);

  const activePlan = coloredPlans.find((plan) => plan.id === activeId) ?? null;
  const editingPlan = plans.find((plan) => plan.id === editingId) ?? null;

  useEffect(() => {
    if (toast === "success") setShowToast(true);
  }, [toast]);

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

  const handleComplete = (plan: Plan) => {
    if (plan.status !== "pending") return;
    setActiveId(null);
    router.push({
      pathname: "/Quiz/QuizPage",
      params: { taskId: plan.id, dailyPlanId: plan.dailyPlanId !== undefined ? String(plan.dailyPlanId) : "", category: plan.category },
    });
  };

  const handleFail = (plan: Plan) => {
    if (plan.status !== "pending") return;
    setPlanStatus(plan.id, "failed");
    setActiveId(null);
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

  const handleOpenAiChat = () => {
    if (plans.length === 0) {
      setShowNoPlanChatNotice(true);
      return;
    }
    setShowAiChat(true);
  };

  const startPlanCreation = () => {
    resetPlanDraft();
    router.push("/Home/ExamDatePage");
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
      {showToast && <Toast text="회원가입이 완료되었습니다." onClose={() => setShowToast(false)} />}

      <HomeHeader date={selectedDate} isToday={isToday} examDDay={examDDay} onPressToday={pager.goToday} />

      <View className="flex-1" onLayout={(e) => pager.setPageWidth(e.nativeEvent.layout.width)}>
        {plans.length === 0 && !emptyNoticeClosed && (
          <EmptyPlanNotice onCreate={startPlanCreation} onClose={() => setEmptyNoticeClosed(true)} />
        )}
        {pager.pageWidth > 0 && (
          <GestureDetector gesture={pagerGesture}>
            <ScrollView
              ref={pager.pagerRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentOffset={{ x: pager.pageWidth, y: 0 }}
              onScrollBeginDrag={pager.syncNeighborOffset}
              onMomentumScrollEnd={pager.handlePagerEnd}
            >
              <NeighborPage width={pager.pageWidth} offset={pager.neighborOffset} />
              <View style={{ width: pager.pageWidth }}>
                <PlanTimeline
                  scrollRef={timeline.scrollRef}
                  pagerGesture={pagerGesture}
                  dateKey={selectedKey}
                  busyBlocks={busyBlocks}
                  plans={coloredPlans}
                  currentTime={isToday ? now : null}
                  activePlan={activePlan}
                  dragPreview={dragPreview}
                  canDeleteActive={isManualPlan(activePlan)}
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
              <NeighborPage width={pager.pageWidth} offset={pager.neighborOffset} />
            </ScrollView>
          </GestureDetector>
        )}
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

      {deleteToast && <Toast text={deleteToast} onClose={() => setDeleteToast(null)} />}
      {showNoPlanChatNotice && <Toast text="계획이 있어야 AI와 대화할 수 있어요" onClose={() => setShowNoPlanChatNotice(false)} />}

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
