import { useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Row, Text, Switch } from "@/components";
import { Icon } from "@/assets";

// TODO: 실제 알림 종류/설정 저장 API 연동 전까지는 로컬 상태로만 토글합니다.
const NOTIFICATION_ROWS = [
  { id: "type-1", label: "알림 종류", defaultEnabled: true },
  { id: "type-2", label: "알림 종류", defaultEnabled: false },
  { id: "type-3", label: "알림 종류", defaultEnabled: false },
];

// ================================
// Components
// ================================

function NotificationRow({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) {
  return (
    <Row width="full" align="between" className="items-center">
      <Text variant="base-large" className="text-white">{label}</Text>
      <Switch value={value} onToggle={onToggle} />
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
