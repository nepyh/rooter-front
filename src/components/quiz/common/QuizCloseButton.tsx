import { Pressable } from "react-native";
import { router } from "expo-router";
import { Icon } from "@/assets";

// ================================
// Components
// ================================

/**
 * 퀴즈 화면을 닫는 X 버튼
 */
export function QuizCloseButton() {
  return (
    <Pressable onPress={() => router.back()} className="w-[28px] h-[28px] items-center justify-center">
      <Icon name="close" size={24} />
    </Pressable>
  );
}
