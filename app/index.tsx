import { StatusBar } from 'expo-status-bar';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack, Button, Text } from '@/components';

export default function App() {
  const router = useRouter();

  return (
    <View className="flex-1 pb-10 justify-end">
      <StatusBar style="auto" />
      <Stack gap="xxl" className="items-center">
        <Button variant="disabled" icon="mail" onPress={() => router.push('/Login')}> 이메일로 로그인하기 </Button>
        <Pressable onPress={() => router.push("/Signup")}><Text weight="medium" color="disabled"> 회원가입 </Text></Pressable>
      </Stack>
    </View>
  );
}