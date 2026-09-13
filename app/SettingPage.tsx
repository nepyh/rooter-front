
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Stack, Row, Text, Toast } from "@/components";
import { Icon } from "@/assets";
import type { IconName } from "@/assets";
import { useUserStore } from "@/store";
import { WEEKDAYS } from "@/constants/date";
import { getStreak } from "@/api/user";

const TOAST_MESSAGES: Record<string, string> = {
  "password-changed": "비밀번호가 변경되었습니다.",
};

// ================================
// Constants
// ================================

const CONTRIBUTION_WEEK_COUNT = 53;

// 잔디 색상 단계: 0(활동 없음)은 neutral-600, 1~5는 primary-500을 기준으로 투명도를 올려 표현합니다.
const CONTRIBUTION_LEVEL_COLORS = ["#525866", "rgba(246,72,45,0.2)", "rgba(246,72,45,0.4)", "rgba(246,72,45,0.6)", "rgba(246,72,45,0.8)", "#F6482D"];

// ================================
// Helpers
// ================================

const pad = (n: number) => String(n).padStart(2, "0");
const toDateString = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const startOfWeek = (date: Date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - d.getDay());
  return d;
};

// completionRate(0~100)를 잔디 색상 단계(0~5)로 변환
const completionRateToLevel = (rate: number) => (rate <= 0 ? 0 : Math.min(5, Math.ceil(rate / 20)));

interface ContributionMonthGroup {
  label: string;
  weeks: Date[][];
}

const buildContributionMonths = (today: Date, weekCount: number): ContributionMonthGroup[] => {
  const lastWeekStart = startOfWeek(today);
  const weeks: Date[][] = [];
  for (let w = weekCount - 1; w >= 0; w--) {
    const weekStart = new Date(lastWeekStart);
    weekStart.setDate(weekStart.getDate() - w * 7);
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
    weeks.push(days);
  }

  const months: ContributionMonthGroup[] = [];
  weeks.forEach((week) => {
    const label = `${week[0].getMonth() + 1}월`;
    const lastGroup = months[months.length - 1];
    if (lastGroup && lastGroup.label === label) {
      lastGroup.weeks.push(week);
    } else {
      months.push({ label, weeks: [week] });
    }
  });
  return months;
};

// ================================
// Components
// ================================

function SettingRow({ icon, label, onPress }: { icon: IconName; label: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center justify-between p-m rounded-sm w-full">
      <Row gap="s" className="flex-1 items-center">
        <Icon name={icon} size={20} />
        <Text variant="base-medium" weight="medium" className="text-white">{label}</Text>
      </Row>
      <Icon name="chevronRight" size={24} color="#8A919E" />
    </Pressable>
  );
}

function ContributionGraph() {
  const userId = useUserStore((state) => state.userId);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const months = buildContributionMonths(today, CONTRIBUTION_WEEK_COUNT);
  const scrollRef = useRef<ScrollView>(null);
  const [levels, setLevels] = useState<Record<string, number>>({});

  useEffect(() => {
    if (userId === null) return;
    const start = startOfWeek(today);
    start.setDate(start.getDate() - (CONTRIBUTION_WEEK_COUNT - 1) * 7);

    getStreak(userId, toDateString(start), toDateString(startOfToday))
      .then((streak) => {
        const next: Record<string, number> = {};
        streak.days.forEach((day) => { next[day.date] = completionRateToLevel(day.completionRate); });
        setLevels(next);
      })
      .catch(() => setLevels({}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <Row gap="s" width="full" className="items-end bg-neutral-700 p-l rounded-md">
      <Stack gap="xs">
        {WEEKDAYS.map((weekday) => (
          <View key={weekday} className="w-[20px] h-[20px] items-center justify-center">
            <Text variant="base-small" color="primary">{weekday}</Text>
          </View>
        ))}
      </Stack>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        <Row gap="xs">
          {months.map((month, i) => (
            <Stack key={i} gap="s">
              <Text variant="base-small" color="primary">{month.label}</Text>
              <Row gap="xs">
                {month.weeks.map((week, j) => (
                  <Stack key={j} gap="xs">
                    {week.map((day, k) => (
                      day > startOfToday ? (
                        <View key={k} className="w-[20px] h-[20px]" />
                      ) : (
                        <View
                          key={k}
                          className="w-[20px] h-[20px] rounded-xxs"
                          style={{ backgroundColor: CONTRIBUTION_LEVEL_COLORS[levels[toDateString(day)] ?? 0] }}
                        />
                      )
                    ))}
                  </Stack>
                ))}
              </Row>
            </Stack>
          ))}
        </Row>
      </ScrollView>
    </Row>
  );
}

/**
 * 마이페이지(설정) 화면
 */
export default function SettingPage() {
  const router = useRouter();
  const { toast } = useLocalSearchParams<{ toast?: string }>();
  const user = useUserStore((state) => state.user);
  const username = user?.username ?? "게스트";
  const email = user?.email ?? "로그인이 필요합니다";

  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (toast && TOAST_MESSAGES[toast]) setShowToast(true);
  }, [toast]);

  return (
    <View className="flex-1">
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
      <Row width="full" className="items-center pb-l">
        <Text variant="header-large">마이페이지</Text>
      </Row>

      <Pressable onPress={() => router.push("/ProfilePage")} className="bg-neutral-700 flex-row items-center justify-between p-l rounded-md w-full">
        <Row gap="m" className="items-center">
          <View className="w-[48px] h-[48px] rounded-full bg-primary-500 items-center justify-center">
            <Text variant="base-large" weight="medium" className="text-white">{username.slice(0, 1)}</Text>
          </View>
          <Stack gap="xs">
            <Text variant="base-medium" weight="medium" className="text-white">{username}</Text>
            <Text variant="base-medium" color="secondary">{email}</Text>
          </Stack>
        </Row>
        <Icon name="chevronRight" size={24} />
      </Pressable>

      <Stack gap="l" width="full" className="pt-xxl">
        <Text variant="base-medium" weight="medium" color="secondary">일반</Text>
        <Stack gap="xs" width="full" className="bg-neutral-700 p-xs rounded-md">
          <SettingRow icon="bell" label="알림" onPress={() => router.push("/NotificationPage")} />
          <SettingRow icon="lock" label="계정" onPress={() => router.push("/AccountSettingPage")} />
        </Stack>
      </Stack>

      <Stack gap="l" width="full" className="pt-xxl">
        <Text variant="base-medium" weight="medium" color="secondary">데일리</Text>
        <ContributionGraph />
      </Stack>

      <Row width="full" className="justify-end pt-xxl" pointerEvents="none">
        <Icon name="mascotCharacter" size={120} />
      </Row>
      </ScrollView>

      {showToast && toast && (
        <Toast text={TOAST_MESSAGES[toast]} onClose={() => setShowToast(false)} />
      )}
    </View>
  );
}
