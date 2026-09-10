import { useEffect } from "react";
import { View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components";
import { Icon } from "@/assets";

// ================================
// Constants
// ================================

const ANALYZE_MS = 1600;

// ================================
// Components
// ================================

/**
 * 공부 스타일 분석 중 화면
 * @description 설문 결과를 잠시 보여주는 로딩 화면으로, 일정 시간 뒤 가입 완료로 이동합니다.
 */
export default function StudySurveyLoading() {
  const { school, grade, classNum, answers } = useLocalSearchParams<{
    school: string;
    grade: string;
    classNum: string;
    answers?: string;
  }>();

  const rotation = useSharedValue(0);
  const spinnerStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 900, easing: Easing.linear }), -1);
  }, [rotation]);

  useEffect(() => {
    // TODO: 학교/학년/반/설문 응답을 저장하는 API가 정해지면 여기서 전송합니다.
    console.log("survey result:", { school, grade, classNum, answers: answers ? answers.split(",") : [] });
    const timer = setTimeout(() => {
      router.replace({ pathname: "/", params: { toast: "success" } });
    }, ANALYZE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View className="flex-1 items-center justify-center">
      <StatusBar style="light" />
      <View style={{ alignItems: "center", gap: 28 }}>
        <Animated.View style={spinnerStyle}>
          <Icon name="loading" size={60} color="#F6482D" />
        </Animated.View>
        <Text variant="title-small">공부 스타일 분석 중...</Text>
      </View>
    </View>
  );
}
