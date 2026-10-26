import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { MorePageHeader, MenuGroup, MenuRow } from "@/components";
import { useLogout } from "@/hooks/more/useLogout";

/**
 * 계정 설정 화면
 */
export default function AccountSettingPage() {
  const handleLogout = useLogout();

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <MorePageHeader title="계정 설정" />
      <MenuGroup>
        <MenuRow icon="logout" label="로그아웃" onPress={handleLogout} />
        <MenuRow icon="withdraw" label="탈퇴하기" />
      </MenuGroup>
    </View>
  );
}
