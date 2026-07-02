import { useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack, Input, Button, Text } from '@/components';
import type { Variant } from "@/components/ui/Button";
import { login } from '@/api/auth';
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  const [btnVariant, setBtnVariant] = useState<Variant>("primary");
  const [responseMessage, setResponseMessage] = useState("");

  const handleEmailChange = (text: string) => {
    setEmailErrorMessage("");
    setEmail(text);
  };

  const handlePasswordChange = (text: string) => {
    setPasswordErrorMessage("");
    setPassword(text);
  };

  const handleSubmit = async () => {
    setResponseMessage("");
    let isError = false;

    if (!email) { setEmailErrorMessage("아이디를 입력해주세요."); isError = true; }
    if (!password) { setPasswordErrorMessage("비밀번호를 입력해주세요."); isError = true; }
    
    if (isError) return;

    try {
      setBtnVariant("disabled");
      await login(email, password);
    } catch (error) {
      if (error instanceof Error) {
        if (axios.isAxiosError(error)) {
          console.log("status:", error.response?.status);
          console.log("data:", error.response?.data);
          console.log("message:", error.response?.data?.message);
        }
        setResponseMessage(error.message);
      }
    }

    setBtnVariant("primary");
  };

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
              value={email}
              onChangeText={handleEmailChange}
              label="이메일"
              placeholder="이메일을 입력해주세요"
              errorMessage={emailErrorMessage}
            />
            <Input
              value={password}
              onChangeText={handlePasswordChange}
              label="비밀번호"
              placeholder="비밀번호를 입력해주세요"
              errorMessage={passwordErrorMessage}
              secureTextEntry
            />
          </Stack>
        </Stack>
        <Stack gap="s" className="items-center">
          <Button variant={btnVariant} onPress={handleSubmit}> 로그인 </Button>
          {responseMessage && <Text variant="base-small" className="text-utility-error-primary"> {responseMessage} </Text>}
        </Stack>
      </Stack>
    </View>
  );
}