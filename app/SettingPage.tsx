
import { useRef } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Stack, Row, Text } from "@/components";
import { Icon } from "@/assets";
import type { IconName } from "@/assets";
import { useUserStore } from "@/store";
import { WEEKDAYS } from "@/constants/date";

// ================================
// Constants
// ================================

const CONTRIBUTION_WEEK_COUNT = 53;

// 잔디 색상 단계: 0(활동 없음)은 neutral-600, 1~5는 primary-500을 기준으로 투명도를 올려 표현합니다.
const CONTRIBUTION_LEVEL_COLORS = ["#525866", "rgba(246,72,45,0.2)", "rgba(246,72,45,0.4)", "rgba(246,72,45,0.6)", "rgba(246,72,45,0.8)", "#F6482D"];

// TODO: 실제 작업 수행량 데이터로 교체 예정. 지금은 최근 13일치 목업 값입니다 (index 0 = 오늘).
const CONTRIBUTION_MOCK_LEVELS = [2, 0, 4, 1, 5, 3, 0, 2, 4, 1, 0, 3, 1];

// ================================
// Helpers
// ================================

const startOfWeek = (date: Date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - d.getDay());
  return d;
};

const daysBetween = (a: Date, b: Date) => Math.round((a.getTime() - b.getTime()) / 86_400_000);

const getMockContributionLevel = (date: Date, today: Date) => {
  const diff = daysBetween(new Date(today.getFullYear(), today.getMonth(), today.getDate()), date);
  if (diff < 0 || diff >= CONTRIBUTION_MOCK_LEVELS.length) return 0;
  return CONTRIBUTION_MOCK_LEVELS[diff];
};

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
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const months = buildContributionMonths(today, CONTRIBUTION_WEEK_COUNT);
  const scrollRef = useRef<ScrollView>(null);

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
                          style={{ backgroundColor: CONTRIBUTION_LEVEL_COLORS[getMockContributionLevel(day, today)] }}
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
 * @description 로그인한 사용자 정보를 보여주고, 알림/계정 설정으로 이동할 수 있는 진입점을 제공합니다.
 */
export default function SettingPage() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const username = user?.username ?? "게스트";
  const email = user?.email ?? "로그인이 필요합니다";

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

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
          <SettingRow icon="lock" label="계정" />
        </Stack>
      </Stack>

      <Stack gap="l" width="full" className="pt-xxl">
        <Text variant="base-medium" weight="medium" color="secondary">데일리</Text>
        <ContributionGraph />
      </Stack>

      <Stack gap="l" width="full" className="pt-xxl">
        <Text variant="base-medium" weight="medium" color="secondary">계정 관리</Text>
        <Stack gap="xs" width="full" className="bg-neutral-700 p-xs rounded-md">
          <SettingRow icon="logout" label="로그아웃" onPress={handleLogout} />
        </Stack>
      </Stack>

      <Row width="full" className="justify-end pt-xxl" pointerEvents="none">
        <Icon name="mascotCharacter" size={120} />
      </Row>
      </ScrollView>
    </View>
  );
}
