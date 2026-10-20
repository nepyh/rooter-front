import { useState } from "react";
import { router } from "expo-router";
import { Button, Toast, PasswordInput, ChangePasswordScreen } from "@/components";
import { changePassword } from "@/api/user";
import { isWrongCurrentPassword } from "@/api/more/ChangePassword";
import { useFormField } from "@/hooks/useFormField";
import { useUserStore } from "@/store";
import { isValidPassword, PASSWORD_ERROR_MESSAGE } from "@/utils/password";

// ================================
// Types
// ================================

type Step = "verify" | "reset";

// ================================
// Components
// ================================

/**
 * 비밀번호 변경 화면
 * 현재 비밀번호는 따로 확인하지 않고, 새 비밀번호와 함께 변경 API 를 부를 때 서버가 검증함
 */
export default function ChangePasswordPage() {
  const userId = useUserStore((state) => state.userId);
  const logout = useUserStore((state) => state.logout);
  const [step, setStep] = useState<Step>("verify");
  const [toastMessage, setToastMessage] = useState("");

  const currentPassword = useFormField();
  const newPassword = useFormField();
  const confirmPassword = useFormField();

  const isFilled = step === "verify" ? !!currentPassword.value : !!newPassword.value && !!confirmPassword.value;
  const btnVariant = isFilled ? "primary" : "disabled";

  const handleVerify = () => setStep("reset");

  const handleReset = async () => {
    if (!isValidPassword(newPassword.value)) {
      newPassword.setError(PASSWORD_ERROR_MESSAGE);
      newPassword.focus(true);
      return;
    }
    if (newPassword.value !== confirmPassword.value) {
      confirmPassword.setError("새 비밀번호가 일치하지 않습니다.");
      confirmPassword.focus(true);
      return;
    }
    if (userId === null) return;

    try {
      await changePassword(userId, { currentPassword: currentPassword.value, newPassword: newPassword.value });
      logout();
      router.replace({ pathname: "/Auth/Onboarding", params: { toast: "password-changed" } });
    } catch (error) {
      if (isWrongCurrentPassword(error)) {
        setStep("verify");
        currentPassword.setError("현재 비밀번호가 일치하지 않습니다.");
        return;
      }
      setToastMessage("비밀번호 변경에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleSubmit = step === "verify" ? handleVerify : handleReset;

  return (
    <ChangePasswordScreen
      description={step === "verify" ? "현재 비밀번호를 확인합니다." : "새 비밀번호를 설정합니다."}
      footer={
        <>
          <Button variant={btnVariant} onPress={handleSubmit}>{step === "verify" ? "다음" : "변경하기"}</Button>
          {!!toastMessage && <Toast text={toastMessage} onClose={() => setToastMessage("")} />}
        </>
      }
    >
      {step === "verify" ? (
        <PasswordInput
          {...currentPassword.inputProps}
          label="현재 비밀번호"
          placeholder="현재 비밀번호를 입력해주세요"
          returnKeyType="done"
          onSubmitEditing={() => { if (isFilled) handleVerify(); }}
        />
      ) : (
        <>
          <PasswordInput {...newPassword.inputProps} label="새 비밀번호" placeholder="새 비밀번호를 입력해주세요" />
          <PasswordInput
            {...confirmPassword.inputProps}
            label="새 비밀번호 확인"
            placeholder="새 비밀번호를 다시 입력해주세요"
            returnKeyType="done"
            onSubmitEditing={() => { if (isFilled) handleReset(); }}
          />
        </>
      )}
    </ChangePasswordScreen>
  );
}
