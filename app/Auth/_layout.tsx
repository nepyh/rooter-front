import { View, Pressable } from "react-native";
import { Slot, router, usePathname } from "expo-router";
import { Stack } from "@/components";
import { Icon } from "@/assets";
import { useLogout } from "@/hooks/more/useLogout";

// ================================
// Constants
// ================================

// 뒤로 갈 화면이 없는 첫 화면이라 뒤로가기 헤더 없이 그대로 보여줌
const NO_HEADER_PATHS = ["/Auth/Onboarding"];

// 가입 직후 이미 로그인된 채로 오는 화면이라, 뒤로 가면 회원가입 화면이 아니라 로그아웃 후 첫 화면으로 보냄
const LOGOUT_ON_BACK_PATHS = ["/Auth/SchoolSelect"];

export default function AuthLayout() {
  const pathname = usePathname();
  const logout = useLogout();

  if (NO_HEADER_PATHS.includes(pathname)) return <Slot />;

  return (
    <Stack gap="xl" className="flex-1 pb-spacing-11">
      <View className="py-spacing-5">
        <Pressable onPress={() => (LOGOUT_ON_BACK_PATHS.includes(pathname) ? logout() : router.back())}>
          <Icon name="chevronLeft" size={32} />
        </Pressable>
      </View>
      <Slot />
    </Stack>
  );
}