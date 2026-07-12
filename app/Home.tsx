import { useEffect, useRef, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Row, Input, Button, Text, Toast, NavBar } from "@/components";
import { Icon } from "@/assets";
import type { IconName } from "@/assets";
import { CATEGORY_COLORS } from "@/constants/category";
import type { Category } from "@/constants/category";
import { WEEKDAYS } from "@/constants/date";
import { useNow } from "@/hooks/useNow";

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
  start: number; // 06:00을 기준으로 한 시작 오프셋(분)
  duration: number; // 분
  status: PlanStatus;
}

// ================================
// Constants
// ================================

const WINDOW_START_MIN = 6 * 60;
const DAY_MIN = 24 * 60;
const TIMELINE_HEIGHT = DAY_MIN;
const TIMELINE_LEFT = 52;
const POPOVER_HEIGHT = 92;

const INITIAL_PLANS: Plan[] = [
  { id: "sleep-1", title: "수면", category: "neutral", start: 0, duration: 100, status: "pending", lines: [{ icon: "history", text: "01:00 - 07:40 | 6시간 40분" }] },
  { id: "school", title: "학교", category: "neutral", start: 150, duration: 480, status: "pending", lines: [{ icon: "history", text: "08:30 - 16:30 | 8시간" }] },
  { id: "math", title: "수학", category: "math", start: 690, duration: 120, status: "pending", lines: [{ icon: "book", text: "교과서 | p.30 ~ p.48" }, { icon: "history", text: "17:30 - 19:30 | 2시간" }] },
  { id: "meal", title: "식사", category: "neutral", start: 810, duration: 60, status: "pending", lines: [{ icon: "history", text: "19:30 - 20:30 | 1시간" }] },
  { id: "english", title: "영어", category: "english", start: 870, duration: 60, status: "pending", lines: [{ icon: "book", text: "교과서 | p.111 ~ p.122" }, { icon: "history", text: "20:30 - 21:30 | 1시간" }] },
  { id: "science", title: "과학", category: "science", start: 960, duration: 120, status: "pending", lines: [{ icon: "book", text: "교과서 | p.22 ~ p.37" }, { icon: "history", text: "22:00 - 24:00 | 2시간" }] },
  { id: "social", title: "사회", category: "social", start: 1080, duration: 90, status: "pending", lines: [{ icon: "book", text: "교과서 | p.8 ~ p.10" }, { icon: "history", text: "24:00 - 00:30 | 1시간 30분" }] },
  { id: "sleep-2", title: "수면", category: "neutral", start: 1140, duration: 300, status: "pending", lines: [{ icon: "history", text: "01:00 - 07:40 | 6시간 40분" }] },
];

const HOURS = Array.from({ length: 24 }, (_, i) => (6 + i) % 24);

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

// ================================
// Components
// ================================

function PlanBlock({ plan, onPress }: { plan: Plan; onPress: () => void }) {
  const colors = CATEGORY_COLORS[plan.category];
  const dimmed = plan.status !== "pending";

  return (
    <Pressable
      onPress={onPress}
      style={{ position: "absolute", top: plan.start, left: TIMELINE_LEFT, right: 0, height: plan.duration, backgroundColor: colors.bg, opacity: dimmed ? 0.6 : 1 }}
      className="flex-row gap-s p-xs rounded-xxs overflow-hidden"
    >
      <View className="w-1 h-full rounded-full" style={{ backgroundColor: colors.bar }} />
      <Stack gap="xs" className="flex-1 py-xxs">
        <Row gap="xs" className="items-center">
          {plan.status === "done" && <Icon name="check" size={12} color="#FFFFFF" />}
          {plan.status === "failed" && <Icon name="close" size={12} color="#FFFFFF" />}
          <Text variant="base-small" weight="medium" className="text-white" style={plan.status === "failed" ? { textDecorationLine: "line-through" } : undefined}>
            {plan.title}
          </Text>
        </Row>
        {plan.lines.map((line, i) => (
          <Row key={i} gap="xs" className="items-center">
            <Icon name={line.icon} size={12} color="rgba(255,255,255,0.6)" />
            <Text variant="base-caption" className="text-white/60">{line.text}</Text>
          </Row>
        ))}
      </Stack>
    </Pressable>
  );
}

function ActionMenu({ plan, onComplete, onFail, onEdit, onDelete }: { plan: Plan; onComplete: () => void; onFail: () => void; onEdit: () => void; onDelete: () => void }) {
  const showBelow = plan.start < POPOVER_HEIGHT + 8;
  const top = showBelow ? plan.start + plan.duration + 8 : plan.start - POPOVER_HEIGHT - 8;

  return (
    <View style={{ position: "absolute", top, left: TIMELINE_LEFT }} className="items-center">
      {showBelow && <View className="w-3 h-3 -mb-1.5 bg-neutral-700 border-l border-t border-neutral-600 rotate-45" />}
      <Row gap="none" className="bg-neutral-700 border border-neutral-600 rounded-md p-xs items-center">
        <ActionButton icon="check" label="완료" onPress={onComplete} />
        <ActionButton icon="close" label="실패" onPress={onFail} />
        <ActionButton icon="pencil" label="수정" onPress={onEdit} />
        <ActionButton icon="trash" label="삭제" onPress={onDelete} />
      </Row>
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
          {!!error && <Text className="text-utility-error-primary">{error}</Text>}
          <Row gap="m" width="full">
            <View className="flex-1">
              <Button variant="disabled" onPress={onClose}> 취소 </Button>
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

/**
 * 홈 화면
 * @description 오늘의 일정을 시간순으로 보여주고, 현재 시각/날짜를 실시간으로 반영합니다.
 */
export default function Home() {
  const { toast } = useLocalSearchParams<{ toast?: string }>();
  const [showToast, setShowToast] = useState(false);
  const now = useNow(30_000);
  const [plans, setPlans] = useState(INITIAL_PLANS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (toast === "success") setShowToast(true);
  }, [toast]);

  useEffect(() => {
    const offset = Math.max(0, minutesSinceWindowStart(now) - 260);
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: offset, animated: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activePlan = plans.find((plan) => plan.id === activeId) ?? null;
  const editingPlan = plans.find((plan) => plan.id === editingId) ?? null;

  const updateStatus = (id: string, status: PlanStatus) => {
    setPlans((prev) => prev.map((plan) => (plan.id === id ? { ...plan, status: plan.status === status ? "pending" : status } : plan)));
    setActiveId(null);
  };

  const handleDelete = (id: string) => {
    setActiveId(null);
    Alert.alert("일정 삭제", "이 일정을 삭제할까요?", [
      { text: "취소", style: "cancel" },
      { text: "삭제", style: "destructive", onPress: () => setPlans((prev) => prev.filter((plan) => plan.id !== id)) },
    ]);
  };

  const handleEditSave = (title: string, start: number, duration: number) => {
    setPlans((prev) => prev.map((plan) => {
      if (plan.id !== editingId) return plan;
      const startMin = (start + WINDOW_START_MIN) % DAY_MIN;
      const endMin = (startMin + duration) % DAY_MIN;
      const lines = plan.lines.map((line) => line.icon === "history"
        ? { ...line, text: `${pad(Math.floor(startMin / 60))}:${pad(startMin % 60)} - ${pad(Math.floor(endMin / 60))}:${pad(endMin % 60)} | ${formatDuration(duration)}` }
        : line);
      return { ...plan, title, start, duration, lines };
    }));
    setEditingId(null);
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      {showToast && <Toast text="회원가입이 완료되었습니다." onClose={() => setShowToast(false)} />}

      <Row width="full" align="between" className="items-center pb-l">
        <Text variant="header-medium">{formatDateHeader(now)}</Text>
        <Row gap="s" className="items-center">
          <Text variant="base-small" color="secondary">기말고사</Text>
          <Text variant="header-medium">D-20</Text>
        </Row>
      </Row>

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        <View style={{ height: TIMELINE_HEIGHT, position: "relative" }}>
          {HOURS.map((hour, i) => (
            <Row key={i} width="full" align="between" className="absolute items-center" style={{ top: i * 60 }}>
              <Text variant="base-caption" color="disabled">{pad(hour)}:00</Text>
              <View className="flex-1 h-px bg-neutral-600 ml-s" />
            </Row>
          ))}

          {plans.map((plan) => (
            <PlanBlock key={plan.id} plan={plan} onPress={() => setActiveId(plan.id === activeId ? null : plan.id)} />
          ))}

          <CurrentTimeLine top={minutesSinceWindowStart(now)} label={formatClock(now)} />

          {activePlan && (
            <ActionMenu
              plan={activePlan}
              onComplete={() => updateStatus(activePlan.id, "done")}
              onFail={() => updateStatus(activePlan.id, "failed")}
              onEdit={() => { setEditingId(activePlan.id); setActiveId(null); }}
              onDelete={() => handleDelete(activePlan.id)}
            />
          )}
        </View>
      </ScrollView>

      <View className="absolute self-center items-center" style={{ bottom: 96 }}>
        <Row gap="none" className="bg-neutral-700 border border-neutral-600 rounded-full p-xs items-center">
          <Pressable className="p-m rounded-full items-center justify-center">
            <Icon name="plus" size={20} />
          </Pressable>
          <Pressable className="p-m rounded-full items-center justify-center">
            <Icon name="sparkle" size={20} />
          </Pressable>
        </Row>
      </View>

      <NavBar />

      {editingPlan && (
        <EditModal plan={editingPlan} onClose={() => setEditingId(null)} onSave={handleEditSave} />
      )}
    </View>
  );
}
