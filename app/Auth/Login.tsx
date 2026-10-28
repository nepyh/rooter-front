import { useState, useEffect } from 'react';
import { router } from "expo-router";
import { AuthScreen, EmailInput, PasswordInput, Button, Toast } from '@/components';
import type { Variant } from "@/components/ui/Button";
import { login } from '@/api/auth/common';
import { getLoginError } from '@/api/auth/Login';
import { useFormField } from '@/hooks/common/useFormField';

export default function Login() {
  const email = useFormField();
  const password = useFormField();

  const [btnVariant, setBtnVariant] = useState<Variant>("disabled");
  const [toastMessage, setToastMessage] = useState("");

  const handleSubmit = async () => {
    setBtnVariant("disabled");

    try {
      await login(email.value, password.value);
      router.replace("/Home/Home");
    } catch (error) {
      const authError = getLoginError(error);

      if (authError?.target === "password") {
        password.setError(authError.message);
        password.focus(true);
        return;
      }
      if (authError?.target === "toast") setToastMessage(authError.message);
    }

    setBtnVariant("primary");
  };

  useEffect(() => {
    const isError = !email.value || !password.value;
    setBtnVariant(isError ? "disabled" : "primary");
  }, [email.value, password.value]);

  return (
    <AuthScreen
      title="로그인"
      description="로그인을 진행합니다."
      keyboardAware
      footer={
        <>
          <Button variant={btnVariant} onPress={handleSubmit}> 로그인 </Button>
          {!!toastMessage && <Toast text={toastMessage} onClose={() => setToastMessage("")} />}
        </>
      }
    >
      <EmailInput {...email.inputProps} />
      <PasswordInput
        {...password.inputProps}
        textContentType="oneTimeCode"
        autoComplete="off"
        returnKeyType="done"
        onSubmitEditing={() => {
          if (btnVariant !== "disabled") handleSubmit();
        }}
      />
    </AuthScreen>
  );
}
