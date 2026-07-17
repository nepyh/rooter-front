
import { Pressable, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Stack, Row, Text } from "@/components";
import { Icon } from "@/assets";
import type { IconName } from "@/assets";
import { useUserStore } from "@/store";

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

      <Row width="full" className="items-center pb-l">
        <Text variant="header-large">마이페이지</Text>
      </Row>

      <Pressable className="bg-neutral-700 flex-row items-center justify-between p-l rounded-md w-full">
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
          <SettingRow icon="bell" label="알림" />
          <SettingRow icon="lock" label="계정" />
        </Stack>
      </Stack>

      <Stack gap="l" width="full" className="pt-xxl">
        <Text variant="base-medium" weight="medium" color="secondary">계정 관리</Text>
        <Stack gap="xs" width="full" className="bg-neutral-700 p-xs rounded-md">
          <SettingRow icon="logout" label="로그아웃" onPress={handleLogout} />
        </Stack>
      </Stack>
    </View>
  );
}
