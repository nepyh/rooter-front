import { useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Button,
  PageIndicator,
  Text,
  TutorialSlide,
  VerticalGradient,
} from "@/components";
import { color } from "@/constants/token/color";

// ================================
// Constants
// ================================

const SLIDES = [
  {
    image: require("@/assets/images/tutorial/tutorial_1.png"),
    title: "먼저 플랜을 만들어요",
    description:
      "홈 화면의 '새 플랜 생성하기'를 누르면\nAI가 공부 계획을 만들어줘요",
  },
  {
    image: require("@/assets/images/tutorial/tutorial_2.png"),
    title: "AI가 짜주는 공부 계획",
    description: "날짜별 공부 분량과 시간을\n타임라인으로 한눈에 확인해요",
  },
  {
    image: require("@/assets/images/tutorial/tutorial_3.png"),
    title: "꾹 눌러 간편하게 관리",
    description:
      "계획을 길게 누르면\n완료 / 실패 / 수정 /삭제를 바로 할 수 있어요",
  },
  {
    image: require("@/assets/images/tutorial/tutorial_4.png"),
    title: "퀴즈로 실력 점검",
    description:
      "오늘 공부한 내용을 퀴즈로 확인하면\nAI가 결과에 맞게 계획을 고쳐줘요",
  },
  {
    image: require("@/assets/images/tutorial/tutorial_5.png"),
    title: "캘린더로 한눈에",
    description: "일별 공부 기록과 시험 일정을\n캘린더에서 바로 확인해요",
  },
  {
    image: require("@/assets/images/tutorial/tutorial_6.png"),
    title: "공부 잔디 심기",
    description:
      "계획을 지킨 만큼 잔디가 채워져요\n더보기에서 내 기록을 확인해요",
  },
];

const BACKGROUND_STOPS = [
  { offset: 0, color: color.onboarding["gradient-top"] },
  { offset: 1, color: color.background.primary },
];

// ================================
// Components
// ================================

/**
 * 회원가입 직후 홈에 들어가기 전 보여주는 사용법 안내 화면
 */
export default function Tutorial() {
  const insets = useSafeAreaInsets();
  const pagerRef = useRef<ScrollView>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isLast = currentIndex === SLIDES.length - 1;

  const finish = () => {
    router.replace({ pathname: "/Home/Home", params: { toast: "success" } });
  };

  const handleNext = () => {
    if (isLast) {
      finish();
      return;
    }
    pagerRef.current?.scrollTo({
      x: pageWidth * (currentIndex + 1),
      animated: true,
    });
  };

  // 넘기는 도중에도 점이 따라오도록 절반을 넘으면 다음 장으로 표시
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (pageWidth === 0) return;
    const index = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
    setCurrentIndex(Math.min(Math.max(index, 0), SLIDES.length - 1));
  };

  return (
    <View className="flex-1 pb-spacing-9">
      <StatusBar style="light" />
      {/* 루트 레이아웃 여백과 상태바 영역까지 화면 전체를 덮는 배경 */}
      <VerticalGradient
        className="absolute -left-spacing-7 -right-spacing-7 bottom-spacing-0"
        style={{ top: -insets.top }}
        stops={BACKGROUND_STOPS}
      />

      <View className="items-end">
        <Pressable onPress={finish} hitSlop={12}>
          <Text weight="medium" color="disabled">
            건너뛰기
          </Text>
        </Pressable>
      </View>

      <View
        className="-mx-spacing-7 flex-1"
        onLayout={(e) => setPageWidth(e.nativeEvent.layout.width)}
      >
        {pageWidth > 0 && (
          <ScrollView
            ref={pagerRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={handleScroll}
          >
            {SLIDES.map((slide) => (
              <TutorialSlide key={slide.title} width={pageWidth} {...slide} />
            ))}
          </ScrollView>
        )}
      </View>

      <PageIndicator
        total={SLIDES.length}
        currentIndex={currentIndex}
        className="mt-spacing-6"
      />
      <Button variant="primary" className="mt-spacing-10" onPress={handleNext}>
        {isLast ? "시작하기" : "다음"}
      </Button>
    </View>
  );
}
