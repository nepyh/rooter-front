import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Row, Input, Button, Text } from "@/components";
import type { Variant } from "@/components/ui/Button";
import { Icon } from "@/assets";

/**
 * 비밀번호 변경 화면
 * @description 현재 비밀번호와 새 비밀번호를 입력받아 변경합니다.
 */
export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [newPasswordErrorMessage, setNewPasswordErrorMessage] = useState("");
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = useState("");

  const [btnVariant, setBtnVariant] = useState<Variant>("disabled");

  useEffect(() => {
    const isFilled = !!currentPassword && !!newPassword && !!confirmPassword;
    setBtnVariant(isFilled ? "primary" : "disabled");
  }, [currentPassword, newPassword, confirmPassword]);

  const handleSubmit = () => {
    if (newPassword.length < 8) {
      setNewPasswordErrorMessage("비밀번호는 8자 이상 입력해주세요.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmPasswordErrorMessage("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    // TODO: 실제 비밀번호 변경 API 연동 전까지는 성공한 것으로 간주합니다.
    router.replace("/SettingPage");
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />

      <Row gap="s" className="items-center pb-l">
        <Pressable onPress={() => router.back()}>
          <Icon name="chevronLeft" size={28} />
        </Pressable>
        <Text variant="header-large">비밀번호 변경</Text>
      </Row>

      <Stack gap="m" width="full" className="pt-xxl flex-1">
        <Input
          value={currentPassword}
          onChangeText={setCurrentPassword}
          label="현재 비밀번호"
          placeholder="현재 비밀번호를 입력해주세요"
          secureTextEntry
        />
        <Input
          value={newPassword}
          onChangeText={(text: string) => {
            setNewPassword(text);
            setNewPasswordErrorMessage("");
          }}
          label="새 비밀번호"
          placeholder="새 비밀번호를 입력해주세요"
          errorMessage={newPasswordErrorMessage}
          secureTextEntry
        />
        <Input
          value={confirmPassword}
          onChangeText={(text: string) => {
            setConfirmPassword(text);
            setConfirmPasswordErrorMessage("");
          }}
          label="새 비밀번호 확인"
          placeholder="새 비밀번호를 다시 입력해주세요"
          errorMessage={confirmPasswordErrorMessage}
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={() => {
            if (btnVariant !== "disabled") handleSubmit();
          }}
        />
      </Stack>

      <Button variant={btnVariant} onPress={handleSubmit}>변경하기</Button>
    </View>
  );
}
