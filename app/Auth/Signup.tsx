import { useState, useEffect } from 'react';
import { router } from "expo-router";
import { AuthScreen, EmailInput, PasswordInput, Input, Button, Toast, TermsAgreementSheet } from '@/components';
import type { Variant } from "@/components/ui/Button";
import { login } from '@/api/auth/common';
import { signup, getSignupError } from '@/api/auth/Signup';
import type { AgreementDecision } from '@/api/common/agreement';
import { useFormField } from '@/hooks/common/useFormField';
import { useAgreementCatalog } from '@/hooks/common/useAgreements';
import { isValidPassword, PASSWORD_ERROR_MESSAGE } from '@/utils/common/password';

export default function Signup() {
  const username = useFormField();
  const email = useFormField();
  const password = useFormField();
  const checkPassword = useFormField();

  const [btnVariant, setBtnVariant] = useState<Variant>("primary");
  const [toastMessage, setToastMessage] = useState("");
  const [termsVisible, setTermsVisible] = useState(false);
  const agreementCatalog = useAgreementCatalog();

  const handleSubmit = async () => {
    setBtnVariant("disabled");

    if (!isValidPassword(password.value)) {
      password.setError(PASSWORD_ERROR_MESSAGE);
      password.focus(true);
      setBtnVariant("primary");
      return;
    }

    if (password.value !== checkPassword.value) {
      checkPassword.setError("비밀번호가 일치하지 않습니다.");
      password.focus();
      setBtnVariant("primary");
      return;
    }

    setBtnVariant("primary");

    if (!agreementCatalog) {
      setToastMessage("약관을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setTermsVisible(true);
  };

  const handleAgree = async (decisions: AgreementDecision[]) => {
    setTermsVisible(false);
    setBtnVariant("disabled");

    try {
      await signup(username.value, email.value, password.value, decisions);
      // 이후 학교/학년/반 저장 API가 로그인 토큰을 요구해서, 가입 직후 바로 로그인해둡니다.
      await login(email.value, password.value);

      router.push("/Auth/SchoolSelect");
    } catch (error) {
      const authError = getSignupError(error);
      if (!authError) return;

      if (authError.target === "toast") {
        setToastMessage(authError.message);
        setBtnVariant("primary");
        return;
      }

      const field = { username, email, password }[authError.target];
      field.setError(authError.message);
      field.focus();
    }
  };

  useEffect(() => {
    const isError = !username.value || !email.value || !password.value || !checkPassword.value;
    setBtnVariant(isError ? "disabled" : "primary");
  }, [username.value, email.value, password.value, checkPassword.value]);

  return (
    <AuthScreen
      title="회원가입"
      description="회원가입을 진행합니다."
      footer={
        <>
          <Button variant={btnVariant} onPress={handleSubmit}> 회원가입 </Button>
          {!!toastMessage && <Toast text={toastMessage} onClose={() => setToastMessage("")} />}
          <TermsAgreementSheet visible={termsVisible} agreements={agreementCatalog ?? []}onClose={() => setTermsVisible(false)} onNext={handleAgree} />
        </>
      }
    >
      <Input {...username.inputProps} label="이름" placeholder="이름을 입력해주세요" />
      <EmailInput {...email.inputProps} />
      <PasswordInput {...password.inputProps} />
      <PasswordInput {...checkPassword.inputProps} label="비밀번호 확인" placeholder="비밀번호를 다시 입력해주세요" />
    </AuthScreen>
  );
}
