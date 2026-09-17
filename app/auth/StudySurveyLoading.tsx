import { useEffect } from "react";
import { View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components";
import { Icon } from "@/assets";
import { createStudentProfile } from "@/api/user";
import { submitStudyStyle } from "@/api/studyStyle";
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
  const { schoolId, grade, classNum, answers } = useLocalSearchParams<{
    schoolId: string;
    grade: string;
    classNum: string;
    answers?: string;
  }>();
  const userId = useUserStore((state) => state.userId);

  const rotation = useSharedValue(0);
  const spinnerStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 900, easing: Easing.linear }), -1);
  }, [rotation]);

  useEffect(() => {
    if (userId !== null) {
      createStudentProfile(userId, { schoolId, grade: Number(grade), classNumber: Number(classNum) }).catch(() => {});
    }
    if (answers) {
      const studyStyleAnswers = answers.split(",").map((selectedIndex, i) => ({
        questionNumber: i + 1,
        answerOption: Number(selectedIndex) + 1,
      }));
      submitStudyStyle(studyStyleAnswers).catch(() => {});
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
