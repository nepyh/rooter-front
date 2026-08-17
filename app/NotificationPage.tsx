import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Stack, Row, Text } from "@/components";
import { Icon } from "@/assets";

// TODO: 실제 알림 종류/설정 저장 API 연동 전까지는 로컬 상태로만 토글합니다.
const NOTIFICATION_ROWS = [
  { id: "type-1", label: "알림 종류", defaultEnabled: true },
  { id: "type-2", label: "알림 종류", defaultEnabled: false },
  { id: "type-3", label: "알림 종류", defaultEnabled: false },
];

// ================================
// Constants
// ================================

const SWITCH_WIDTH = 48;
const SWITCH_HEIGHT = 28;
const SWITCH_PADDING = 2;
const THUMB_SIZE = 24;
const THUMB_TRAVEL = SWITCH_WIDTH - THUMB_SIZE - SWITCH_PADDING * 2;

// ================================
// Components
// ================================

function NotificationSwitch({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 200 });
  }, [value, progress]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], ["#6B7280", "#F6482D"]),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * THUMB_TRAVEL }],
  }));

  return (
    <Pressable onPress={onToggle}>
      <Animated.View
        style={[
          { width: SWITCH_WIDTH, height: SWITCH_HEIGHT, borderRadius: SWITCH_HEIGHT / 2, padding: SWITCH_PADDING },
          trackStyle,
        ]}
      >
        <Animated.View
          style={[{ width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: THUMB_SIZE / 2, backgroundColor: "#FFFFFF" }, thumbStyle]}
        />
      </Animated.View>
    </Pressable>
  );
}

function NotificationRow({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) {
  return (
    <Row width="full" align="between" className="items-center">
      <Text variant="base-large" className="text-white">{label}</Text>
      <NotificationSwitch value={value} onToggle={onToggle} />
    </Row>
  );
}

/**
 * 알림 화면
 * @description 알림 종류별 on/off 토글을 보여줍니다. 실제 알림 발송 기능은 아직 없습니다.
 */
export default function NotificationPage() {
  const [enabled, setEnabled] = useState(NOTIFICATION_ROWS.map((row) => row.defaultEnabled));

  const toggle = (index: number) => {
    setEnabled((prev) => prev.map((value, i) => (i === index ? !value : value)));
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />

      <Row gap="s" className="items-center pb-l">
        <Pressable onPress={() => router.back()}>
          <Icon name="chevronLeft" size={28} />
        </Pressable>
        <Text variant="header-large">알림</Text>
      </Row>

      <Stack gap="xl" width="full" className="pt-l">
        {NOTIFICATION_ROWS.map((row, i) => (
          <NotificationRow key={row.id} label={row.label} value={enabled[i]} onToggle={() => toggle(i)} />
        ))}
      </Stack>
    </View>
  );
}
