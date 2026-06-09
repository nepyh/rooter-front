import { useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack, Input, Button, Text } from '@/components';

export default function Signup() {
  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checkPassword, setCheckPassword] = useState("");

  const [userErrorMessage, setUserErrorMessage] = useState("");
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [checkPasswordErrorMessage, setCheckPasswordErrorMessage] = useState("");

  const handleSubmit = () => {
    let isError = false;

    if (!user) setUserErrorMessage("이름이 입력되지 않았습니다"); isError = true;
    if (!email) setEmailErrorMessage("이메일이 입력되지 않았습니다"); isError = true;
    if (!password) setPasswordErrorMessage("비밀번호가 입력되지 않았습니다"); isError = true;
    if (!checkPassword) setCheckPasswordErrorMessage("비밀번호가 입력되지 않았습니다"); isError = true;

    if (isError) return;
  }

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
        <Button onPress={handleSubmit}> 회원가입 </Button>
      </Stack>
    </View>
  );
}