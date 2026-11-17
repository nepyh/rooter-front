import { useEffect, useState } from 'react';
import { Redirect, useRouter, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { RooterLogo, Stack, Button, Text, Toast } from '@/components';
import { getStartPath } from '@/api/auth/common';
import { useUserStore } from '@/store';

// ================================
// Constants
// ================================

const TOAST_MESSAGES: Record<string, string> = {
  "success": "회원가입이 완료되었습니다.",
  "session-expired": "로그인이 만료되었습니다. 다시 로그인해주세요.",
};

export default function Onboarding() {
  const router = useRouter();
  const { toast } = useLocalSearchParams<{ toast?: string }>();
  const [showToast, setShowToast] = useState(false);
  const isLogin = useUserStore((state) => state.isLogin);
  const userId = useUserStore((state) => state.userId);
  // 로그인 정보가 남아 있을 때 보낼 화면, 학교 정보를 확인하는 동안은 null
  const [startPath, setStartPath] = useState<Awaited<ReturnType<typeof getStartPath>> | null>(null);

  useEffect(() => {
    if (toast && TOAST_MESSAGES[toast]) {
      setShowToast(true);
    }
  }, [toast]);

  useEffect(() => {
    if (!isLogin || userId === null) return;
    let cancelled = false;
    getStartPath(userId).then((path) => { if (!cancelled) setStartPath(path); });
    return () => { cancelled = true; };
  }, [isLogin, userId]);

  // 로그인 정보가 남아 있으면 첫 화면 건너뛰고 Home, 학교를 아직 안 정했으면 학교 선택
  if (isLogin && userId === null) return <Redirect href="/Home/Home" />;
  if (isLogin) return startPath ? <Redirect href={startPath} /> : null;

  return (
    <View className="flex-1 pb-spacing-11 justify-end">
      <StatusBar style="auto" />
      <RooterLogo className="flex-1" />
      <Stack gap="xxl" className="items-center">
        {showToast && toast && <Toast text={TOAST_MESSAGES[toast]} onClose={() => setShowToast(false)} />}
        <Button variant="primary" icon="mail" onPress={() => router.push("/Auth/Login")}> 이메일로 로그인하기 </Button>
        <Pressable onPress={() => router.push("/Auth/Signup")}><Text weight="medium" color="disabled"> 회원가입 </Text></Pressable>
      </Stack>
    </View>
  );
}
