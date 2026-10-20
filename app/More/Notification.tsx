import { useState } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack, MorePageHeader, NotificationRow } from "@/components";

// ================================
// Constants
// ================================

/**
 * 알림 설정 목록. 알림 종류·설정 저장 API 연동 전이라 화면 안에서만 켜고 끔
 */
const NOTIFICATION_ROWS = [
  { id: "type-1", label: "알림 종류", defaultEnabled: true },
  { id: "type-2", label: "알림 종류", defaultEnabled: false },
  { id: "type-3", label: "알림 종류", defaultEnabled: false },
];

// ================================
// Components
// ================================

/**
 * 알림 화면
 */
export default function NotificationPage() {
  const [enabled, setEnabled] = useState(NOTIFICATION_ROWS.map((row) => row.defaultEnabled));

  const toggle = (index: number) => {
    setEnabled((prev) => prev.map((value, i) => (i === index ? !value : value)));
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <MorePageHeader title="알림" />
      <Stack gap="xl" width="full" className="pt-spacing-5">
        {NOTIFICATION_ROWS.map((row, i) => (
          <NotificationRow key={row.id} label={row.label} value={enabled[i]} onToggle={() => toggle(i)} />
        ))}
      </Stack>
    </View>
  );
}
