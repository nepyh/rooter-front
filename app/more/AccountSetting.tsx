import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Row, Text } from "@/components";
import { Icon } from "@/assets";
import { logout } from "@/api/auth";

/**
 * 계정 설정 화면
 */
export default function AccountSettingPage() {
  const handleLogout = async () => {
    // logout()은 서버 호출 성공/실패와 무관하게 로컬 로그인 상태를 항상 정리합니다.
    try {
      await logout();
    } catch {
      // 로컬 상태는 이미 정리됐으므로 무시하고 화면만 이동합니다.
    }
    router.replace("/");
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />

      <Row gap="s" className="items-center pb-l">
        <Pressable onPress={() => router.back()}>
          <Icon name="chevronLeft" size={28} />
        </Pressable>
        <Text variant="header-large">계정 설정</Text>
      </Row>

      <Stack gap="xs" width="full" className="bg-neutral-700 p-xs rounded-md">
        <Pressable onPress={handleLogout} className="flex-row items-center justify-between p-m rounded-sm w-full">
          <Row gap="s" className="items-center">
            <Icon name="logout" size={20} />
            <Text variant="base-medium" weight="medium" className="text-white">로그아웃</Text>
          </Row>
        </Pressable>
      </Stack>
    </View>
  );
}
