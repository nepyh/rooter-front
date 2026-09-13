import { useEffect } from "react";
import { View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components";
import { Icon } from "@/assets";
import { createStudentProfile } from "@/api/user";
import { useUserStore } from "@/store";

// ================================
// Constants
// ================================

const ANALYZE_MS = 1600;

// ================================
// Components
// ================================

/**
 * 공부 스타일 분석 중 화면
 */
export default function StudySurveyLoading() {
  const { schoolId, grade, classNum } = useLocalSearchParams<{
    schoolId: string;
    grade: string;
    classNum: string;
  }>();
  const userId = useUserStore((state) => state.userId);

  const rotation = useSharedValue(0);
  const spinnerStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 900, easing: Easing.linear }), -1);
  }, [rotation]);

  useEffect(() => {
    // 설문 문항(answers) 저장 API는 아직 없어서 학교/학년/반만 저장
    if (userId !== null) {
      createStudentProfile(userId, { schoolId, grade: Number(grade), classNumber: Number(classNum) }).catch(() => {});
    }
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
