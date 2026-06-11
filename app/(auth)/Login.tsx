import { useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack, Input, Button, Text } from '@/components';

export default function Login() {
  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userErrorMessage, setUserErrorMessage] = useState("");
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  const handleEmailChange = (text: string) => {
    setEmailErrorMessage("");
    setEmail(text);
  };

  const handlePasswordChange = (text: string) => {
    setPasswordErrorMessage("");
    setPassword(text);
  };

  const handleSubmit = () => {
    let isError = false;
    if (!user) setUserErrorMessage("이름을 입력해주세요."); isError = true;
    if (!email) setEmailErrorMessage("아이디를 입력해주세요."); isError = true;
    if (!password) setPasswordErrorMessage("비밀번호를 입력해주세요."); isError = true;
    
    if (isError) return;
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
              onChangeText={handleEmailChange}
              label="이메일"
              placeholder="이메일을 입력해주세요"
              errorMessage={emailErrorMessage}
            />
            <Input
              value={password}
              onChangeText={handlePasswordChange}
              label="이메일"
              placeholder="이메일을 입력해주세요"
              errorMessage={passwordErrorMessage}
            />
          </Stack>
        </Stack>
        <Button onPress={handleSubmit}> 로그인 </Button>
      </Stack>
    </View>
  );
}