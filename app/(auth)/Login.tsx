import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { Stack, Input, Button, Text } from '@/components';

export default function Login() {
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
            <Input label="이름" placeholder="이름을 입력해주세요" />
            <Input label="이메일" placeholder="이메일을 입력해주세요" />
            <Input label="비밀번호" placeholder="비밀번호를 입력해주세요" secureTextEntry />
          </Stack>
        </Stack>
        <Button> 로그인 </Button>
      </Stack>
    </View>
  );
}