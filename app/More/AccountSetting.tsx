import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { MorePageHeader, MenuGroup, MenuRow, Modal, Toast } from "@/components";
import { useLogout } from "@/hooks/more/useLogout";
import { useWithdraw } from "@/hooks/more/useWithdraw";

export default function AccountSettingPage() {
  const handleLogout = useLogout();
  const withdraw = useWithdraw();

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <MorePageHeader title="계정 설정" />
      <MenuGroup>
        <MenuRow icon="logout" label="로그아웃" onPress={handleLogout} />
        <MenuRow icon="withdraw" label="탈퇴하기" onPress={withdraw.open} />
      </MenuGroup>
      <Modal {...withdraw.modalProps} />
      {!!withdraw.errorMessage && <Toast text={withdraw.errorMessage} onClose={withdraw.clearError} />}
    </View>
  );
}
