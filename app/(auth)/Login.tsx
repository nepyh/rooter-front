import { useState, useEffect, useRef } from 'react';
import { View, TextInput } from 'react-native';
import { router } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { Stack, Input, Button, Text, Toast } from '@/components';
import type { Variant } from "@/components/ui/Button";
import { login } from '@/api/auth';
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const [btnVariant, setBtnVariant] = useState<Variant>("disabled");
  const [showToast, setShowToast] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  const handleSubmit = async () => {
    setBtnVariant("disabled");

    try {
      await login(email, password);

      router.replace("/Home");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("==============================")
        console.log("status:", error.response?.status);
        console.log("data:", error.response?.data);
        console.log("message:", error.response?.data?.message);

        const status = error.response?.status;

        if (status === 401) {
          setPasswordErrorMessage("비밀번호가 옳지 않습니다.");
          passwordRef.current?.focus();
          passwordRef.current?.setNativeProps({ selection: { start: password.length, end: password.length } });
          return;
        } if (status === 404) {
          setResponseMessage("이메일을 찾을 수 없습니다.");
          setShowToast(true);
          setBtnVariant("primary");;
          return;
        } if (status === 500) {
          setResponseMessage("서버 에러가 발생하였습니다.");
          setShowToast(true);
          setBtnVariant("primary");;
          return;
        }
      }
    }

    setBtnVariant("primary");
  };

  useEffect(() => {
    const isError = !email || !password;
    setBtnVariant(isError ? "disabled" : "primary");
  }, [email, password]);

  return (
    <View className="flex-1">
      <StatusBar style="auto" />
      <Stack align="between" className="flex-1">
        <Stack gap="xxl">
          <Stack gap="s">
            <Text variant="title-medium"> 로그인 </Text>
            <Text color="secondary"> 로그인을 진행합니다. </Text>
          </Stack>
          <Stack width="full" gap="m">
            <Input
              ref={emailRef}
              value={email}
              onChangeText={(text: string) => {
                setEmail(text);
                setEmailErrorMessage("");
              }}
              label="이메일"
              placeholder="이메일을 입력해주세요"
              errorMessage={emailErrorMessage}
              autoCapitalize="none"
            />
            <Input
              ref={passwordRef}
              value={password}
              onChangeText={(text: string) => {
                setPassword(text);
                setPasswordErrorMessage("");
              }}
              label="비밀번호"
              placeholder="비밀번호를 입력해주세요"
              errorMessage={passwordErrorMessage}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={() => {
                if (btnVariant !== "disabled") handleSubmit();
              }}
            />
          </Stack>
        </Stack>
        <Button variant={btnVariant} onPress={handleSubmit}> 로그인 </Button>
        {showToast && <Toast text={responseMessage} onClose={() => setShowToast(false)} />}
      </Stack>
    </View>
  );
}