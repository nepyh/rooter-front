import { Pressable } from "react-native";
import { usePathname, router } from "expo-router";
import { Row } from "./Row";
import { Stack } from "./Stack";
import { Text } from "../ui/Text";
import { Icon } from "@/assets";
import type { IconName } from "@/assets";

// ================================
// Types
// ================================

type TabPath = "/Home/Home" | "/Todo/Todo" | "/Quiz/Quiz" | "/Calendar/Calendar" | "/More/More";

interface Tab {
  key: string;
  label: string;
  icon: IconName;
  path: TabPath;
}

// ================================
// Constants
// ================================

// 탭바 전체 높이, 위 테두리 1 + 위 여백 8 + 탭 62 + 아래 여백 32
export const NAV_BAR_HEIGHT = 103;

const TABS: Tab[] = [
  { key: "home", label: "홈", icon: "home", path: "/Home/Home" },
  { key: "todo", label: "할일", icon: "checklist", path: "/Todo/Todo" },
  { key: "quiz", label: "퀴즈", icon: "quiz", path: "/Quiz/Quiz" },
  { key: "calendar", label: "캘린더", icon: "calendar", path: "/Calendar/Calendar" },
  { key: "more", label: "더보기", icon: "menu", path: "/More/More" },
];

// ================================
// Components
// ================================

function NavItem({ tab, active, onPress }: { tab: Tab; active: boolean; onPress: () => void }) {
  return (
    <Pressable className="flex-1" onPress={onPress}>
      <Stack gap="xs" align="center" className="items-center py-spacing-3 rounded-radius-3" style={{ height: 62 }}>
        <Icon name={tab.icon} size={24} color={active ? "#FFFFFF" : "#8A919E"} />
        <Text variant="base-small" color={active ? "primary" : "disabled"}>{tab.label}</Text>
      </Stack>
    </Pressable>
  );
}

/**
 * 하단 탭 내비게이션
 */
export function NavBar() {
  const pathname = usePathname();

  return (
    <Row width="full" gap="xs" className="border-t border-neutral-600 items-center justify-center absolute bottom-spacing-0 left-spacing-0 pt-spacing-3 pb-spacing-9 px-spacing-6 bg-background-primary">
      {TABS.map((tab) => {
        const active = pathname === tab.path;
        return (
          <NavItem key={tab.key} tab={tab} active={active} onPress={() => !active && router.replace(tab.path)} />
        );
      })}
    </Row>
  );
}
