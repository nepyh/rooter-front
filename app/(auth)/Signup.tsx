import { useState, useEffect, useRef } from 'react';
import { router } from "expo-router";
import { View, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack, Input, Button, Text, Toast } from '@/components';
import type { Variant } from "@/components/ui/Button";
import { signup } from '@/api/auth';
import axios from "axios";

export default function Signup() {
  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checkPassword, setCheckPassword] = useState("");

  const [userErrorMessage, setUserErrorMessage] = useState("");
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [checkPasswordErrorMessage, setCheckPasswordErrorMessage] = useState("");

  const userRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const checkPasswordRef = useRef<TextInput>(null);

  const [btnVariant, setBtnVariant] = useState<Variant>("primary");
  const [showToast, setShowToast] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  const handleSubmit = async () => {
    setBtnVariant("disabled");

    if (password != checkPassword) {
      setCheckPasswordErrorMessage("비밀번호가 일치하지 않습니다.");
      passwordRef.current?.focus();
      setBtnVariant("primary");
      return;
    }

    try {
      await signup(user, email, password);

      router.replace({
        pathname: "/",
        params: {
          toast: "success",
        },
      });

      setBtnVariant("primary");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("==============================")
        console.log("status:", error.response?.status);
        console.log("data:", error.response?.data);
        console.log("message:", error.response?.data?.message);

        const status = error.response?.status;

        if (status === 400) { 
          setUserErrorMessage("이름은 12자 이하여야 합니다.");
          userRef.current?.focus();
          return; 
        } if (status === 406) {
          setPasswordErrorMessage("비밀번호는 대소문자, 숫자를 포함하여야 합니다.")
          passwordRef.current?.focus();
          return;
        } if (status === 409) {
          setEmailErrorMessage("이미 사용 중인 이메일입니다.");
          emailRef.current?.focus();
          return;
        } if (status === 500) {
          setResponseMessage("서버 에러가 발생하였습니다.");
          setShowToast(true);
          setBtnVariant("primary");;
          return;
        }
      }
    }
  }

  useEffect(() => {
    const isError = !user || !email || !password || !checkPassword;
    setBtnVariant(isError ? "disabled" : "primary");
  }, [user, email, password, checkPassword]);

  return (
    <View className="flex-1">
      <StatusBar style="auto" />
      <Stack align="between" className="flex-1">
        <Stack gap="xxl">
          <Stack gap="s">
            <Text variant="title-medium"> 회원가입 </Text>
            <Text color="secondary"> 회원가입을 진행합니다. </Text>
          </Stack>
          <Stack width="full" gap="m">
            <Input
              ref={userRef}
              value={user}
              onChangeText={(text: string) => {
                setUser(text);
                setUserErrorMessage("");
              }}
              label="이름"
              placeholder="이름을 입력해주세요"
              errorMessage={userErrorMessage}
            />
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
            />
            <Input
              ref={checkPasswordRef}
              value={checkPassword}
              onChangeText={(text: string) => {
                setCheckPassword(text);
                setCheckPasswordErrorMessage("");
              }}
              label="비밀번호 확인"
              placeholder="비밀번호를 다시 입력해주세요"
              errorMessage={checkPasswordErrorMessage}
              secureTextEntry
            />
          </Stack>
        </Stack>
        <Button variant={btnVariant} onPress={handleSubmit}> 회원가입 </Button>
        {showToast && <Toast text={responseMessage} onClose={() => setShowToast(false)} />}
      </Stack>
    </View>
  );
}