import { useEffect, useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import axios from "axios";
import { Stack, Input, Button, Text, Toast } from "@/components";
import type { Variant } from "@/components/ui/Button";
import { Icon } from "@/assets";
import { isValidPassword, PASSWORD_ERROR_MESSAGE } from "@/utils/password";
import { changePassword } from "@/api/user";
import { useUserStore } from "@/store";

type Step = "verify" | "reset";

/**
 * 비밀번호 변경 화면
 */
export default function ChangePasswordPage() {
  const userId = useUserStore((state) => state.userId);
  const [step, setStep] = useState<Step>("verify");

  const [currentPassword, setCurrentPassword] = useState("");
  const [currentPasswordErrorMessage, setCurrentPasswordErrorMessage] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordErrorMessage, setNewPasswordErrorMessage] = useState("");
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = useState("");

  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const [btnVariant, setBtnVariant] = useState<Variant>("disabled");
  const [showToast, setShowToast] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  useEffect(() => {
    const isFilled = step === "verify"
      ? !!currentPassword
      : !!newPassword && !!confirmPassword;
    setBtnVariant(isFilled ? "primary" : "disabled");
  }, [step, currentPassword, newPassword, confirmPassword]);

  // 에러 후 재포커스 시 커서가 맨 앞으로 가지 않도록 텍스트 끝으로 이동시킵니다.
  const focusAtEnd = (ref: React.RefObject<TextInput | null>, value: string) => {
    ref.current?.focus();
    ref.current?.setNativeProps({ selection: { start: value.length, end: value.length } });
  };

  const handleVerify = () => {
    // 현재 비밀번호 검증은 새 비밀번호와 함께 한 번에(변경 API 호출 시) 서버가 처리
    setStep("reset");
  };

  const handleReset = async () => {
    if (!isValidPassword(newPassword)) {
      setNewPasswordErrorMessage(PASSWORD_ERROR_MESSAGE);
      focusAtEnd(newPasswordRef, newPassword);
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmPasswordErrorMessage("새 비밀번호가 일치하지 않습니다.");
      focusAtEnd(confirmPasswordRef, confirmPassword);
      return;
    }
    if (userId === null) return;

    try {
      await changePassword(userId, { currentPassword, newPassword });
      router.replace({ pathname: "/SettingPage", params: { toast: "password-changed" } });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setStep("verify");
        setCurrentPasswordErrorMessage("현재 비밀번호가 일치하지 않습니다.");
        return;
      }
      setResponseMessage("비밀번호 변경에 실패했습니다. 잠시 후 다시 시도해주세요.");
      setShowToast(true);
    }
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <Stack gap="xl" className="flex-1 pb-10">
        <View className="py-4">
          <Pressable onPress={() => router.back()}>
            <Icon name="chevronLeft" size={32} />
          </Pressable>
        </View>

        <Stack align="between" className="flex-1">
          {step === "verify" ? (
            <Stack gap="xxl">
              <Stack gap="s">
                <Text variant="title-medium"> 비밀번호 변경 </Text>
                <Text color="secondary"> 현재 비밀번호를 확인합니다. </Text>
              </Stack>
              <Stack width="full" gap="m">
                <Input
                  value={currentPassword}
                  onChangeText={(text: string) => {
                    setCurrentPassword(text);
                    setCurrentPasswordErrorMessage("");
                  }}
                  label="현재 비밀번호"
                  placeholder="현재 비밀번호를 입력해주세요"
                  errorMessage={currentPasswordErrorMessage}
                  secureTextEntry
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    if (btnVariant !== "disabled") handleVerify();
                  }}
                />
              </Stack>
            </Stack>
          ) : (
            <Stack gap="xxl">
              <Stack gap="s">
                <Text variant="title-medium"> 비밀번호 변경 </Text>
                <Text color="secondary"> 새 비밀번호를 설정합니다. </Text>
              </Stack>
              <Stack width="full" gap="m">
                <Input
                  ref={newPasswordRef}
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
                  ref={confirmPasswordRef}
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
                    if (btnVariant !== "disabled") handleReset();
                  }}
                />
              </Stack>
            </Stack>
          )}

          <Button variant={btnVariant} onPress={step === "verify" ? handleVerify : handleReset}>
            {step === "verify" ? "다음" : "변경하기"}
          </Button>
          {showToast && <Toast text={responseMessage} onClose={() => setShowToast(false)} />}
        </Stack>
      </Stack>
    </View>
  );
}
