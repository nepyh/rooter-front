import { useEffect, useState } from 'react';
import { Redirect, useRouter, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PhoneMockup, Stack, Button, Text, Toast, VerticalGradient } from '@/components';
import { color } from '@/constants/token/color';
import { getStartPath } from '@/api/auth/common';
import { useUserStore } from '@/store';

// ================================
// Constants
// ================================

const TOAST_MESSAGES: Record<string, string> = {
  "success": "회원가입이 완료되었습니다.",
  "session-expired": "로그인이 만료되었습니다. 다시 로그인해주세요.",
};

const BACKGROUND_STOPS = [
  { offset: 0, color: color.onboarding["gradient-top"] },
  { offset: 1, color: color.background.primary },
];

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    <View className="flex-1 pb-spacing-7">
      <StatusBar style="light" />
      {/* 루트 레이아웃 여백과 상태바 영역까지 화면 전체를 덮는 배경 */}
      <VerticalGradient className="absolute bottom-spacing-0 -left-spacing-7 -right-spacing-7" style={{ top: -insets.top }} stops={BACKGROUND_STOPS} />
      <PhoneMockup className="flex-1" />
      <Stack gap="s" className="items-center">
        <Text variant="title-medium">루터와 함께 공부하기</Text>
        <Text variant="base-large" color="secondary" className="text-center">
          {"언제나 힘든 공부 계획 세우기,\n루티와 함께해요!"}
        </Text>
      </Stack>
      {/* 문구와 버튼 사이 72px */}
      <Stack gap="xl" className="items-center mt-spacing-12 pt-spacing-3">
        {showToast && toast && <Toast text={TOAST_MESSAGES[toast]} onClose={() => setShowToast(false)} />}
        <Button variant="primary" onPress={() => router.push("/Auth/Login")}>이메일로 로그인</Button>
        <Pressable onPress={() => router.push("/Auth/Signup")}><Text weight="medium" color="disabled">회원가입</Text></Pressable>
      </Stack>
    </View>
  );
}
