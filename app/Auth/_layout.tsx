import { View, Pressable } from "react-native";
import { Slot, router, usePathname } from "expo-router";
import { Stack } from "@/components";
import { Icon } from "@/assets";

// ================================
// Constants
// ================================

// 뒤로 갈 화면이 없는 첫 화면이라 뒤로가기 헤더 없이 그대로 보여줌
const NO_HEADER_PATHS = ["/Auth/Onboarding"];

export default function AuthLayout() {
  const pathname = usePathname();

  if (NO_HEADER_PATHS.includes(pathname)) return <Slot />;

  return (
    <Stack gap="xl" className="flex-1 pb-spacing-11">
      <View className="py-spacing-5">
        <Pressable onPress={() => router.back()}>
          <Icon name="chevronLeft" size={32} />
        </Pressable>
      </View>
      <Slot />
    </Stack>
  );
}