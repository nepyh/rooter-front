import { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack, Button, Text, Toast } from '@/components';

export default function App() {
  const router = useRouter();
  const { toast } = useLocalSearchParams();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (toast === "success") {
      setShowToast(true);
    }
  }, [toast]);

  return (
    <View className="flex-1 pb-10 justify-end">
      <StatusBar style="auto" />
      <Stack gap="xxl" className="items-center">
        {showToast && <Toast text="회원가입이 완료되었습니다." onClose={() => setShowToast(false)} />}
        <Button variant="disabled" icon="mail" onPress={() => router.push('/Login')}> 이메일로 로그인하기 </Button>
        <Pressable onPress={() => router.push("/Signup")}><Text weight="medium" color="disabled"> 회원가입 </Text></Pressable>
      </Stack>
    </View>
  );
}