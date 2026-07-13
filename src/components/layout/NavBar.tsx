import { useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { usePathname, router } from "expo-router";
import { Row } from "./Row";
import { Stack } from "./Stack";
import { Text } from "../ui/Text";
import { Icon } from "@/assets";
import type { IconName } from "@/assets";

// ================================
// Types
// ================================

type TabPath = "/Home" | "/TodoPage" | "/CalendarPage" | "/SettingPage";

interface Tab {
  key: string;
  label: string;
  icon: IconName;
  path: TabPath;
}

// ================================
// Constants
// ================================

const TABS: Tab[] = [
  { key: "home", label: "홈", icon: "home", path: "/Home" },
  { key: "todo", label: "할 일", icon: "checklist", path: "/TodoPage" },
  { key: "calendar", label: "캘린더", icon: "calendar", path: "/CalendarPage" },
  { key: "more", label: "더보기", icon: "menu", path: "/SettingPage" },
];

// ================================
// Components
// ================================

function NavItem({ tab, active, onPress }: { tab: Tab; active: boolean; onPress: () => void }) {
  const glow = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    glow.value = withTiming(active ? 1 : 0, { duration: 800, easing: Easing.out(Easing.cubic) });
  }, [active, glow]);

  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  return (
    <Pressable className="flex-1" onPress={onPress}>
      <Stack gap="xs" align="center" className="items-center py-s rounded-sm" style={{ height: 62 }}>
        <View>
          <Icon name={tab.icon} size={24} color="#8A919E" />
          <Animated.View style={[{ position: "absolute", top: 0, left: 0 }, glowStyle]}>
            <Icon name={tab.icon} size={24} color="#FFFFFF" />
          </Animated.View>
        </View>
        <View>
          <Text variant="base-small" color="disabled">{tab.label}</Text>
          <Animated.View style={[{ position: "absolute", top: 0, left: 0 }, glowStyle]}>
            <Text variant="base-small" color="primary">{tab.label}</Text>
          </Animated.View>
        </View>
      </Stack>
    </Pressable>
  );
}

/**
 * 하단 탭 내비게이션
 * @description 현재 경로에 따라 활성 탭을 표시하고, 탭을 누르면 해당 화면으로 이동합니다.
 */
export function NavBar() {
  const pathname = usePathname();

  return (
    <Row width="full" gap="xs" className="border-t border-neutral-600 items-center justify-center absolute bottom-0 left-0 pt-s pb-s px-xl bg-background-primary">
      {TABS.map((tab) => {
        const active = pathname === tab.path;
        return (
          <NavItem key={tab.key} tab={tab} active={active} onPress={() => !active && router.replace(tab.path)} />
        );
      })}
    </Row>
  );
}
