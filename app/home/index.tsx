import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Modal, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, View } from "react-native";
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import axios from "axios";
import { Stack, Row, Input, Button, Text, Toast, AddPlanBoardModal, AiChatModal } from "@/components";
import { Icon } from "@/assets";
import type { IconName } from "@/assets";
import { CATEGORY_COLORS, SUBJECT_CATEGORIES } from "@/constants/category";
import type { Category } from "@/constants/category";
import { WEEKDAYS } from "@/constants/date";
import { useNow } from "@/hooks/useNow";
import { completeTask, deletePlanTask, getBoardDaily, getDailyTasks, getPlanBoards, getPlanBoardSubjects, updatePlanTask } from "@/api/planBoard";
import type { PlanTask } from "@/api/planBoard";
import { useUIStore, useUserStore } from "@/store";
import { DAY_OF_WEEK_NAMES, getUnavailableTimes } from "@/api/user";
import type { UnavailableTime } from "@/api/user";
import { toLocalDateString } from "@/utils/date";
import palette from "@/constants/palette";

// ================================
// Types
// ================================

type PlanStatus = "pending" | "done" | "failed";

interface PlanLine {
  icon: "book" | "history";
  text: string;
}

interface Plan {
  id: string;
  title: string;
  category: Category;
  lines: PlanLine[];
  start: number; // 타임라인 시작(00:00) 기준 오프셋(분)
  duration: number; // 분
  status: PlanStatus;
  dailyPlanId?: number;
}

// ================================
// Constants
// ================================

const WINDOW_START_MIN = 0;
const DAY_MIN = 24 * 60;
const TIMELINE_HEIGHT = DAY_MIN;
const TIMELINE_LEFT = 52;
const POPOVER_HEIGHT = 92;

const HOURS = Array.from({ length: 24 }, (_, i) => (WINDOW_START_MIN / 60 + i) % 24);

// 태스크 수정 실패 시 백엔드 code별 안내 문구
const EDIT_ERROR_MESSAGES: Record<string, string> = {
  "INVALID_TASK_NAME": "일정 이름을 다시 확인해주세요.",
  "INVALID_TIME_RANGE": "종료 시간은 시작 시간보다 늦어야 해요. 자정을 넘기는 일정은 저장할 수 없어요.",
  "INVALID_TIME_FORMAT": "시간 형식이 올바르지 않아요.",
  "INVALID_ESTIMATED_MINUTES": "소요 시간을 다시 확인해주세요.",
};

// ================================
// Helpers
// ================================

const pad = (n: number) => String(n).padStart(2, "0");

const minutesSinceWindowStart = (date: Date) =>
  (date.getHours() * 60 + date.getMinutes() - WINDOW_START_MIN + DAY_MIN) % DAY_MIN;

const formatClock = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

const formatDateHeader = (date: Date) =>
  `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]})`;

const formatDuration = (mins: number) => {
  if (mins % 60 === 0) return `${mins / 60}시간`;
  if (mins < 60) return `${mins}분`;
  return `${Math.floor(mins / 60)}시간 ${mins % 60}분`;
};

const parseClock = (value: string) => {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 24 || m > 59) return null;
  return h * 60 + m;
};

const parseHHmm = (value: string) => {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
};

// 과목 연결 API 미구현으로 전부 neutral 처리
// 오늘부터 시험일까지 남은 일수, 시험 당일은 0
const getDDay = (examDate: string, now: Date) => {
  const [y, m, d] = examDate.split("-").map(Number);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((new Date(y, m - 1, d).getTime() - today.getTime()) / 86_400_000);
};

// 백엔드 PlanTaskScheduler 기본 수면 시간(00:00~06:30, 23:00~24:00)과 같은 값
const SLEEP_RANGES: [string, string][] = [["00:00", "06:30"], ["23:00", "24:00"]];

interface BusyBlock {
  key: string;
  title: string;
  start: number; // 타임라인 시작 기준 오프셋(분)
  duration: number;
  label: string;
}

// 타임라인 끝(다음 날 시작 시각)을 넘는 구간은 두 조각으로 나눔
const toBusyBlocks = (key: string, title: string, startTime: string, endTime: string): BusyBlock[] => {
  const label = `${startTime} - ${endTime}`;
  const from = (parseHHmm(startTime) - WINDOW_START_MIN + DAY_MIN) % DAY_MIN;
  const rawEnd = endTime === "24:00" ? DAY_MIN : parseHHmm(endTime);
  let to = (rawEnd - WINDOW_START_MIN + DAY_MIN) % DAY_MIN;
  if (to <= from) to += DAY_MIN;
  const pieces: [number, number][] = to > DAY_MIN ? [[from, DAY_MIN], [0, to - DAY_MIN]] : [[from, to]];
  return pieces.map(([start, end], i) => ({ key: `${key}-${i}`, title, start, duration: end - start, label }));
};

const buildBusyBlocks = (unavailable: UnavailableTime[], today: Date): BusyBlock[] => {
  const todayName = DAY_OF_WEEK_NAMES[(today.getDay() + 6) % 7];
  return [
    ...SLEEP_RANGES.flatMap(([start, end], i) => toBusyBlocks(`sleep-${i}`, "수면", start, end)),
    ...unavailable
      .filter((time) => time.dayOfWeek === todayName)
      .flatMap((time) => toBusyBlocks(`busy-${time.id}`, "불가능 시간", time.startTime, time.endTime)),
  ];
};

const mapPlanTaskToPlan = (task: PlanTask): Plan => {
  const startMin = parseHHmm(task.startTime);
  const start = (startMin - WINDOW_START_MIN + DAY_MIN) % DAY_MIN;

  return {
    id: String(task.id),
    title: task.taskName,
    category: "neutral",
    start,
    duration: task.estimatedMinutes,
    status: task.isCompleted ? "done" : "pending",
    dailyPlanId: task.dailyPlanId,
    lines: [
      { icon: "history", text: `${task.startTime} - ${task.endTime} | ${formatDuration(task.estimatedMinutes)}` },
    ],
  };
};

// ================================
// Components
// ================================

// 완료(성공)는 색을 죽여 "클리어됨"을, 실패는 붉은 톤으로 "실패했음"을 구분해서 보여줍니다.
const STATUS_OVERRIDE: Partial<Record<PlanStatus, { bar: string; bg: string; opacity: number }>> = {
  done: { bar: "#6B7280", bg: "rgba(107,114,128,0.12)", opacity: 0.55 },
  failed: { bar: "#FF4D4F", bg: "rgba(255,77,79,0.16)", opacity: 0.85 },
};

// 일정을 넣지 않는 시간 표시용, 누를 수 없음
function BusyBlockView({ block }: { block: BusyBlock }) {
  const colors = CATEGORY_COLORS.neutral;
  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", top: block.start, left: TIMELINE_LEFT, right: 0, height: block.duration, backgroundColor: colors.bg }}
      className="flex-row gap-s p-xs rounded-xxs overflow-hidden"
    >
      <View className="w-1 h-full rounded-full" style={{ backgroundColor: colors.bar }} />
      <Stack gap="xs" className="flex-1 py-xxs">
        <Text variant="base-small" weight="medium">{block.title}</Text>
        {block.duration >= 40 && (
          <Row gap="xs" className="items-center">
            <Icon name="history" size={12} color="rgba(255,255,255,0.6)" />
            <Text variant="base-caption" style={{ color: "rgba(255,255,255,0.6)" }}>{block.label}</Text>
          </Row>
        )}
      </Stack>
    </View>
  );
}

function PlanBlock({ plan, onPress }: { plan: Plan; onPress: () => void }) {
  const colors = CATEGORY_COLORS[plan.category];
  const override = STATUS_OVERRIDE[plan.status];
  const bar = override?.bar ?? colors.bar;
  const bg = override?.bg ?? colors.bg;
  const opacity = override?.opacity ?? 1;

  return (
    <Pressable
      onPress={onPress}
      style={{ position: "absolute", top: plan.start, left: TIMELINE_LEFT, right: 0, height: plan.duration, backgroundColor: bg, opacity }}
      className="flex-row gap-s p-xs rounded-xxs overflow-hidden"
    >
      <View className="w-1 h-full rounded-full" style={{ backgroundColor: bar }} />
      <Stack gap="xs" className="flex-1 py-xxs">
        <Row gap="xs" className="items-center">
          {plan.status === "done" && <Icon name="check" size={12} color="#FFFFFF" />}
          {plan.status === "failed" && <Icon name="close" size={12} color="#FF4D4F" />}
          <Text
            variant="base-small"
            weight="medium"
            style={plan.status === "failed" ? { textDecorationLine: "line-through", color: "#FF4D4F" } : undefined}
          >
            {plan.title}
          </Text>
        </Row>
        {plan.lines.map((line, i) => (
          <Row key={i} gap="xs" className="items-center">
            <Icon name={line.icon} size={12} color="rgba(255,255,255,0.6)" />
            <Text variant="base-caption" style={{ color: "rgba(255,255,255,0.6)" }}>{line.text}</Text>
          </Row>
        ))}
      </Stack>
    </Pressable>
  );
}

// 계획이 없을 때 타임라인 위에 뜨는 안내 말풍선, 마스코트 쪽 위 모서리만 각지게
function EmptyPlanNotice({ onCreate, onClose }: { onCreate: () => void; onClose: () => void }) {
  return (
    <View className="absolute z-10" style={{ top: 16, left: -12, right: -12 }}>
      <Row gap="m" width="full" className="items-start">
        <Icon name="mascotFace" size={52} />
        <Stack gap="xs" className="flex-1 bg-neutral-700 px-[18px] py-[14px] rounded-tr-[24px] rounded-br-[24px] rounded-bl-[24px]">
          <Text variant="base-medium">생성된 플랜이 없어요. 플랜을 만들어 하루 계획을 생성해보세요!</Text>
          <Pressable onPress={onCreate}>
            <Text variant="base-medium" className="text-primary-500" style={{ textDecorationLine: "underline" }}>새 플랜 생성하기</Text>
          </Pressable>
        </Stack>
      </Row>
      <Pressable
        onPress={onClose}
        hitSlop={10}
        className="absolute w-[20px] h-[20px] rounded-full bg-neutral-600 items-center justify-center"
        style={{ top: -4, right: -4 }}
      >
        <Icon name="close" size={12} />
      </Pressable>
    </View>
  );
}

function ActionMenu({ plan, canDelete, onComplete, onFail, onEdit, onDelete }: { plan: Plan; canDelete: boolean; onComplete: () => void; onFail: () => void; onEdit: () => void; onDelete: () => void }) {
  const [menuHeight, setMenuHeight] = useState(POPOVER_HEIGHT);
  const showBelow = plan.start < menuHeight + 8;
  const top = showBelow ? plan.start + plan.duration + 8 : plan.start - menuHeight - 8;

  return (
    <View style={{ position: "absolute", top, left: TIMELINE_LEFT }} className="items-center">
      {showBelow && <View className="w-3 h-3 -mb-1.5 bg-neutral-700 border-l border-t border-neutral-600 rotate-45" />}
      <Stack gap="s" className="bg-neutral-700 border border-neutral-600 rounded-md p-xs" onLayout={(e) => setMenuHeight(e.nativeEvent.layout.height)}>
        <Row gap="none" className="items-center">
          <ActionButton icon="check" label="완료" onPress={onComplete} />
          <ActionButton icon="close" label="실패" onPress={onFail} />
          <ActionButton icon="pencil" label="수정" onPress={onEdit} />
          {/* AI가 만든 계획은 삭제 불가, 직접 추가한 계획만 */}
          {canDelete && <ActionButton icon="trash" label="삭제" onPress={onDelete} />}
        </Row>
      </Stack>
      {!showBelow && <View className="w-3 h-3 -mt-1.5 bg-neutral-700 border-r border-b border-neutral-600 rotate-45" />}
    </View>
  );
}

function ActionButton({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="w-[54px] items-center justify-center gap-xs p-s rounded-sm">
      <Icon name={icon} size={20} color="#FFFFFF" />
      <Text variant="base-caption" className="text-white">{label}</Text>
    </Pressable>
  );
}

function CurrentTimeLine({ top, label }: { top: number; label: string }) {
  return (
    <Row style={{ position: "absolute", top: top - 9, left: 0, right: 0 }} className="items-center">
      <View className="bg-primary-500 rounded-xs px-xs py-xxs">
        <Text variant="base-caption" weight="medium" className="text-white">{label}</Text>
      </View>
      <View className="flex-1 h-[2px] bg-primary-500 rounded-r-full" />
    </Row>
  );
}

function EditModal({ plan, onSave, onClose }: { plan: Plan; onSave: (title: string, start: number, duration: number) => void; onClose: () => void }) {
  const historyIndex = plan.lines.findIndex((line) => line.icon === "history");
  const initial = plan.lines[historyIndex]?.text.match(/^(\d{1,2}:\d{2}) - (\d{1,2}:\d{2})/);

  const [title, setTitle] = useState(plan.title);
  const [startText, setStartText] = useState(initial?.[1] ?? "");
  const [endText, setEndText] = useState(initial?.[2] ?? "");
  const [error, setError] = useState("");

  const handleSave = () => {
    const startMin = parseClock(startText);
    const endMin = parseClock(endText);
    if (!title.trim() || startMin === null || endMin === null) {
      setError("시간을 HH:MM 형식으로 입력해주세요.");
      return;
    }
    const duration = ((endMin - startMin + DAY_MIN) % DAY_MIN) || DAY_MIN;
    const start = (startMin - WINDOW_START_MIN + DAY_MIN) % DAY_MIN;
    onSave(title.trim(), start, duration);
  };

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <Stack gap="l" className="bg-background-primary p-xl rounded-t-md">
          <Text variant="header-medium">일정 수정</Text>
          <Input label="제목" value={title} onChangeText={setTitle} />
          <Row gap="m" width="full">
            <View className="flex-1">
              <Input label="시작 시간" placeholder="HH:MM" value={startText} onChangeText={setStartText} />
            </View>
            <View className="flex-1">
              <Input label="종료 시간" placeholder="HH:MM" value={endText} onChangeText={setEndText} />
            </View>
          </Row>
          {!!error && <Text style={{ color: "#FF4D4F" }}>{error}</Text>}
          <Row gap="m" width="full">
            <View className="flex-1">
              <Button variant="disabled" disabled={false} onPress={onClose}> 취소 </Button>
            </View>
            <View className="flex-1">
              <Button variant="primary" onPress={handleSave}> 저장 </Button>
            </View>
          </Row>
        </Stack>
      </View>
    </Modal>
  );
}

const ADD_MENU_OFFSCREEN_Y = 400;

function AddMenuButton({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} className="bg-neutral-700 h-16 rounded-md items-center justify-center w-full">
      <Text variant="base-medium" weight="medium">{label}</Text>
    </Pressable>
  );
}

// onFullyClosed: 닫힘 애니메이션 도중 다른 Modal을 띄우면 두 Modal이 동시에 떠서 터치가 씹히는 문제가 있어,
// 완전히 닫힌 뒤에 후속 동작을 실행하도록 호출 시점을 분리했습니다.
function AddMenu({ visible, onClose, onFullyClosed, onCreateSchedule, onCreatePlan }: { visible: boolean; onClose: () => void; onFullyClosed: () => void; onCreateSchedule: () => void; onCreatePlan: () => void }) {
  const translateY = useSharedValue(ADD_MENU_OFFSCREEN_Y);
  const [isRendered, setIsRendered] = useState(visible);

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      translateY.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });
    } else {
      translateY.value = withTiming(ADD_MENU_OFFSCREEN_Y, { duration: 400, easing: Easing.out(Easing.cubic) }, (finished) => {
        if (finished) {
          runOnJS(setIsRendered)(false);
          runOnJS(onFullyClosed)();
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, translateY]);

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  return (
    <Modal transparent animationType="none" visible={isRendered} onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
        <Pressable>
          <Animated.View style={sheetStyle}>
            <View className="bg-background-primary rounded-t-[32px] items-center pt-s px-6 pb-xxl" style={{ gap: 24 }}>
              <View className="w-[104px] h-[4px] rounded-full bg-neutral-600" />
              <Stack gap="s" width="full">
                <AddMenuButton label="일정 생성하기" onPress={onCreateSchedule} />
                <AddMenuButton label="과목 생성하기" />
                <AddMenuButton label="새 플랜 생성하기" onPress={onCreatePlan} />
              </Stack>
            </View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ConfirmDeleteModal({ title, onCancel, onConfirm }: { title: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <Modal transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable className="flex-1 bg-black/40 items-center justify-center px-l" onPress={onCancel}>
        <Pressable style={{ width: "100%", maxWidth: 354 }}>
          <Stack gap="xxl" width="full" className="bg-neutral-800 p-xl rounded-[20px]">
            <Stack gap="s" width="full">
              <Text variant="header-medium">{title}</Text>
              <Text variant="base-medium" color="secondary">삭제하고 되돌릴 수 없습니다.</Text>
            </Stack>
            <Row gap="m" width="full">
              <Button
                variant="disabled"
                disabled={false}
                width="auto"
                style={{ width: 150, height: 52, borderRadius: 16, paddingTop: 0, paddingBottom: 0 }}
                onPress={onCancel}
              >
                취소
              </Button>
              <Button
                variant="primary"
                width="auto"
                style={{ width: 150, height: 52, borderRadius: 16, paddingTop: 0, paddingBottom: 0 }}
                onPress={onConfirm}
              >
                삭제
              </Button>
            </Row>
          </Stack>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/**
 * 홈 화면
 */
export default function Home() {
  const { toast } = useLocalSearchParams<{ toast?: string }>();
  const [showToast, setShowToast] = useState(false);
  const now = useNow(30_000);
  // 좌우로 밀어 날짜 이동, 0이 오늘
  const [dayOffset, setDayOffset] = useState(0);
  // 가로 페이지(어제|오늘|내일) 너비와 옆 페이지 눈금 위치
  const pagerRef = useRef<ScrollView>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [neighborOffset, setNeighborOffset] = useState(0);
  const selectedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset);
  const selectedKey = toLocalDateString(selectedDate);
  const isToday = dayOffset === 0;
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);
  const [deleteToast, setDeleteToast] = useState<string | null>(null);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  // 여러 플랜보드면 dailyPlanId가 여러 개라 첫 태스크 기준 사용
  const [chatDailyPlanId, setChatDailyPlanId] = useState<number | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const [emptyNoticeClosed, setEmptyNoticeClosed] = useState(false);
  const scrollYRef = useRef(0);
  const viewportHeightRef = useRef(0);
  const afterAddMenuClosedRef = useRef<(() => void) | null>(null);
  const setFullScreenModalOpen = useUIStore((state) => state.setFullScreenModalOpen);

  useEffect(() => {
    if (toast === "success") setShowToast(true);
  }, [toast]);

  // 플랜보드 추가 모달이나 AI 채팅 모달이 떠 있는 동안은 하단 NavBar를 숨깁니다.
  useEffect(() => {
    setFullScreenModalOpen(showAddPlan || showAiChat);
    return () => setFullScreenModalOpen(false);
  }, [showAddPlan, showAiChat, setFullScreenModalOpen]);

  // 일정 생성 후 복귀 시 최신 목록 반영 위해 포커스마다 재조회
  const loadDailyTasks = useCallback(() => {
    getDailyTasks(selectedKey)
      .then((daily) => {
        setChatDailyPlanId(daily.tasks[0]?.dailyPlanId ?? null);
        setPlans(daily.tasks.map(mapPlanTaskToPlan));
      })
      .catch(() => {
        setChatDailyPlanId(null);
        setPlans([]);
      });
  }, [selectedKey]);

  useFocusEffect(loadDailyTasks);

  const moveDay = (delta: number) => {
    setActiveId(null);
    setDayOffset((prev) => prev + delta);
  };

  // iOS는 세로 ScrollView가 터치를 먼저 가져가 JS 제스처가 끊겨서, 가로 넘김도 네이티브 페이지 스크롤로 처리
  const handlePagerEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!pageWidth) return;
    const page = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
    if (page !== 1) moveDay(page - 1);
    pagerRef.current?.scrollTo({ x: pageWidth, animated: false });
  };

  const renderNeighborPage = () => (
    <View style={{ width: pageWidth, overflow: "hidden" }}>
      <View style={{ height: TIMELINE_HEIGHT, transform: [{ translateY: -neighborOffset }] }}>
        {HOURS.map((hour, i) => (
          <Row key={i} width="full" align="between" className="absolute items-center" style={{ top: i * 60 }}>
            <Text variant="base-caption" color="disabled">{pad(hour)}:00</Text>
            <View className="flex-1 h-px bg-neutral-600 ml-s" />
          </Row>
        ))}
      </View>
    </View>
  );

  // 플랜보드 중 오늘 이후 가장 가까운 시험일
  const [nextExamDate, setNextExamDate] = useState<string | null>(null);
  const loadNextExam = useCallback(() => {
    const today = toLocalDateString(new Date());
    getPlanBoards()
      .then((boards) => {
        const upcoming = boards
          .map((board) => board.examDate)
          .filter((date): date is string => !!date && date >= today)
          .sort();
        setNextExamDate(upcoming[0] ?? null);
      })
      .catch(() => setNextExamDate(null));
  }, []);

  useFocusEffect(loadNextExam);

  // 할일 응답에 보드·과목이 없어 보드별 그날 dailyPlanId로 연결
  // 직접 추가 = 시험일 없는 기본 보드, 과목 색 = 과목이 하나뿐인 보드의 과목
  const [manualDailyPlanIds, setManualDailyPlanIds] = useState<Set<number>>(new Set());
  const [categoryByDailyPlanId, setCategoryByDailyPlanId] = useState<Map<number, Category>>(new Map());
  const loadBoardInfo = useCallback(() => {
    getPlanBoards()
      .then((boards) => Promise.all(boards.map(async (board) => {
        const [daily, subjects] = await Promise.all([
          getBoardDaily(board.id, selectedKey),
          board.examDate === null ? Promise.resolve([]) : getPlanBoardSubjects(board.id).catch(() => []),
        ]);
        const subjectNames = new Set(subjects.map((subject) => subject.subjectName));
        const category = subjectNames.size === 1 ? SUBJECT_CATEGORIES[[...subjectNames][0]] ?? "neutral" : "neutral";
        return { dailyPlanId: daily.dailyPlanId, manual: board.examDate === null, category };
      })))
      .then((infos) => {
        const linked = infos.filter((info): info is typeof info & { dailyPlanId: number } => typeof info.dailyPlanId === "number");
        setManualDailyPlanIds(new Set(linked.filter((info) => info.manual).map((info) => info.dailyPlanId)));
        setCategoryByDailyPlanId(new Map(linked.map((info) => [info.dailyPlanId, info.category])));
      })
      .catch(() => {
        setManualDailyPlanIds(new Set());
        setCategoryByDailyPlanId(new Map());
      });
  }, [selectedKey]);
  useFocusEffect(loadBoardInfo);

  // 수면·불가능 시간 표시, 학교(하교 시각)는 조회 API가 없어 미표시
  const userId = useUserStore((state) => state.userId);
  const [unavailableTimes, setUnavailableTimes] = useState<UnavailableTime[]>([]);
  const loadUnavailableTimes = useCallback(() => {
    if (userId === null) return;
    getUnavailableTimes(userId).then(setUnavailableTimes).catch(() => setUnavailableTimes([]));
  }, [userId]);
  useFocusEffect(loadUnavailableTimes);
  const busyBlocks = buildBusyBlocks(unavailableTimes, selectedDate);
  const examDDay = nextExamDate ? getDDay(nextExamDate, now) : null;

  useEffect(() => {
    const offset = Math.max(0, minutesSinceWindowStart(now) - 260);
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: offset, animated: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const coloredPlans = plans.map((plan) => ({
    ...plan,
    category: (plan.dailyPlanId !== undefined && categoryByDailyPlanId.get(plan.dailyPlanId)) || plan.category,
  }));
  const activePlan = coloredPlans.find((plan) => plan.id === activeId) ?? null;
  const editingPlan = plans.find((plan) => plan.id === editingId) ?? null;

  const setPlanStatus = (id: string, status: PlanStatus) => {
    setPlans((prev) => prev.map((plan) => (plan.id === id ? { ...plan, status } : plan)));
    setActiveId(null);
  };

  // 액션메뉴 팝업이 현재 화면(스크롤 뷰포트) 밖으로 가려지면, 팝업이 가운데 오도록 자동으로 스크롤합니다.
  const handleSelectPlan = (plan: Plan) => {
    if (plan.status === "done") return; // 완료한 계획은 메뉴 없음
    const nextId = plan.id === activeId ? null : plan.id;
    setActiveId(nextId);
    if (!nextId) return;

    const viewportHeight = viewportHeightRef.current;
    if (!viewportHeight) return;

    const showBelow = plan.start < POPOVER_HEIGHT + 8;
    const menuTop = showBelow ? plan.start + plan.duration + 8 : plan.start - POPOVER_HEIGHT - 8;
    const menuBottom = menuTop + POPOVER_HEIGHT;

    const visibleTop = scrollYRef.current;
    const visibleBottom = visibleTop + viewportHeight;
    if (menuTop >= visibleTop && menuBottom <= visibleBottom) return;

    const centerTarget = menuTop + POPOVER_HEIGHT / 2 - viewportHeight / 2;
    const targetY = Math.max(0, Math.min(TIMELINE_HEIGHT - viewportHeight, centerTarget));
    scrollRef.current?.scrollTo({ y: targetY, animated: true });
  };

  // "완료"를 눌러 실제로 완료 처리될 때만(취소 토글이 아닐 때) 해당 과목 퀴즈로 이동합니다.
  const handleComplete = (plan: Plan) => {
    if (plan.status !== "pending") return;
    setPlanStatus(plan.id, "done");

    completeTask(Number(plan.id), true).catch(() => {
      setPlanStatus(plan.id, "pending"); // 서버 처리 실패 시 대기 상태로 복구
      Alert.alert("처리 실패", "완료 처리에 실패했습니다. 잠시 후 다시 시도해주세요.");
    });

    router.push({
      pathname: "/home/QuizPage",
      params: { taskId: plan.id, dailyPlanId: plan.dailyPlanId !== undefined ? String(plan.dailyPlanId) : "", category: plan.category },
    });
  };

  const handleFail = (plan: Plan) => {
    if (plan.status !== "pending") return;
    setPlanStatus(plan.id, "failed");
  };

  const handleDelete = (plan: Plan) => {
    setActiveId(null);
    setDeleteTarget(plan);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setPlans((prev) => prev.filter((plan) => plan.id !== target.id));
    setDeleteTarget(null);

    deletePlanTask(Number(target.id))
      .then(() => setDeleteToast(`'${target.title}' 일정이 삭제되었습니다.`))
      .catch(() => {
        loadDailyTasks(); // 실패 시 서버 목록으로 복구
        Alert.alert("삭제 실패", "일정 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
      });
  };

  // createPlanTask 응답에 태스크 정보 없음, 생성 후 목록 재조회
  const handlePlanCreated = () => {
    setShowAddPlan(false);
    loadDailyTasks();
    loadBoardInfo(); // 기본 보드가 새로 생겼을 수 있음
  };

  const handleEditSave = (title: string, start: number, duration: number) => {
    const id = editingId;
    const startMin = (start + WINDOW_START_MIN) % DAY_MIN;
    const endMin = (startMin + duration) % DAY_MIN;
    const startTime = `${pad(Math.floor(startMin / 60))}:${pad(startMin % 60)}`;
    const endTime = `${pad(Math.floor(endMin / 60))}:${pad(endMin % 60)}`;

    setPlans((prev) => prev.map((plan) => {
      if (plan.id !== id) return plan;
      const lines = plan.lines.map((line) => line.icon === "history"
        ? { ...line, text: `${startTime} - ${endTime} | ${formatDuration(duration)}` }
        : line);
      return { ...plan, title, start, duration, lines };
    }));
    setEditingId(null);

    if (!id) return;

    updatePlanTask(Number(id), { taskName: title, startTime, endTime, estimatedMinutes: duration })
      .catch((error) => {
        loadDailyTasks(); // 실패 시 서버 목록으로 복구
        const code = axios.isAxiosError(error) ? error.response?.data?.code : undefined;
        Alert.alert("수정 실패", EDIT_ERROR_MESSAGES[code] ?? "일정 수정에 실패했습니다. 잠시 후 다시 시도해주세요.");
      });
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      {showToast && <Toast text="회원가입이 완료되었습니다." onClose={() => setShowToast(false)} />}

      <Row width="full" align="between" className="items-center pt-m pb-l">
        <Row gap="s" className="items-center">
          <Text variant="header-large">{formatDateHeader(selectedDate)}</Text>
          {!isToday && (
            <Pressable onPress={() => moveDay(-dayOffset)} hitSlop={8}>
              <Text variant="base-small" weight="medium" style={{ color: palette.primary["500"] }}>오늘로</Text>
            </Pressable>
          )}
        </Row>
        {examDDay !== null && examDDay >= 0 && (
          <Row gap="s" className="items-center">
            <Text variant="base-small" weight="medium" color="secondary">시험</Text>
            <Text variant="header-medium">{examDDay === 0 ? "D-Day" : `D-${examDDay}`}</Text>
          </Row>
        )}
      </Row>

      <View className="flex-1" onLayout={(e) => setPageWidth(e.nativeEvent.layout.width)}>
      {plans.length === 0 && !emptyNoticeClosed && (
        <EmptyPlanNotice onCreate={() => router.push("/ExamDatePage")} onClose={() => setEmptyNoticeClosed(true)} />
      )}
      {pageWidth > 0 && (
      <ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentOffset={{ x: pageWidth, y: 0 }}
        onScrollBeginDrag={() => setNeighborOffset(scrollYRef.current)}
        onMomentumScrollEnd={handlePagerEnd}
      >
      {renderNeighborPage()}
      <View style={{ width: pageWidth }}>

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => { scrollYRef.current = e.nativeEvent.contentOffset.y; }}
        onLayout={(e) => { viewportHeightRef.current = e.nativeEvent.layout.height; }}
      >
        <View key={selectedKey} style={{ height: TIMELINE_HEIGHT, position: "relative" }}>
          {HOURS.map((hour, i) => (
            <Row key={i} width="full" align="between" className="absolute items-center" style={{ top: i * 60 }}>
              <Text variant="base-caption" color="disabled">{pad(hour)}:00</Text>
              <View className="flex-1 h-px bg-neutral-600 ml-s" />
            </Row>
          ))}

          {busyBlocks.map((block) => (
            <BusyBlockView key={block.key} block={block} />
          ))}

          {coloredPlans.map((plan) => (
            <PlanBlock key={plan.id} plan={plan} onPress={() => handleSelectPlan(plan)} />
          ))}

          {isToday && <CurrentTimeLine top={minutesSinceWindowStart(now)} label={formatClock(now)} />}

          {activePlan && (
            <ActionMenu
              key={activePlan.id}
              plan={activePlan}
              canDelete={activePlan.dailyPlanId !== undefined && manualDailyPlanIds.has(activePlan.dailyPlanId)}
              onComplete={() => handleComplete(activePlan)}
              onFail={() => handleFail(activePlan)}
              onEdit={() => { setEditingId(activePlan.id); setActiveId(null); }}
              onDelete={() => handleDelete(activePlan)}
            />
          )}
        </View>
      </ScrollView>
      </View>
      {renderNeighborPage()}
      </ScrollView>
      )}
      </View>

      <View className="absolute self-center items-center" style={{ bottom: 96 }}>
        <Row gap="none" className="bg-neutral-700 border border-neutral-600 rounded-full p-xs items-center">
          <Pressable onPress={() => setShowAddMenu(true)} className="p-m rounded-full items-center justify-center">
            <Icon name="plus" size={20} />
          </Pressable>
          <Pressable onPress={() => setShowAiChat(true)} className="p-m rounded-full items-center justify-center">
            <Icon name="sparkle" size={20} />
          </Pressable>
        </Row>
      </View>

      {editingPlan && (
        <EditModal plan={editingPlan} onClose={() => setEditingId(null)} onSave={handleEditSave} />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title={`'${deleteTarget.title}' 일정을 삭제할까요?`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}

      {deleteToast && <Toast text={deleteToast} onClose={() => setDeleteToast(null)} />}

      <AddMenu
        visible={showAddMenu}
        onClose={() => setShowAddMenu(false)}
        onFullyClosed={() => {
          afterAddMenuClosedRef.current?.();
          afterAddMenuClosedRef.current = null;
        }}
        onCreateSchedule={() => {
          afterAddMenuClosedRef.current = () => setShowAddPlan(true);
          setShowAddMenu(false);
        }}
        onCreatePlan={() => {
          afterAddMenuClosedRef.current = () => router.push("/ExamDatePage");
          setShowAddMenu(false);
        }}
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
        onPlanChanged={loadDailyTasks}
      />
    </View>
  );
}
