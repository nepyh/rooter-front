import { useEffect, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Stack } from "../../layout";
import { AddMenuButton } from "./AddMenuButton";
import { getSpacing } from "@/utils/token";

// ================================
// Constants
// ================================

const ADD_MENU_OFFSCREEN_Y = 400;
const SLIDE_TIMING = { duration: 400, easing: Easing.out(Easing.cubic) };

// ================================
// Components
// ================================

interface Props {
  visible: boolean;
  onClose: () => void;
  onFullyClosed: () => void;
  onCreateSchedule: () => void;
  onCreatePlan: () => void;
}

/**
 * [+] 를 누르면 아래에서 올라오는 메뉴 (일정 생성 / 과목 생성 / 새 플랜 생성)
 * @param visible 메뉴를 띄울지
 * @param onClose 바깥을 누르거나 뒤로가기로 닫을 때 호출
 * @param onFullyClosed 닫힘 애니메이션이 완전히 끝난 뒤 호출. 닫히는 도중 다른 Modal 을 띄우면 터치가 씹혀서, 후속 동작은 여기서 실행
 * @param onCreateSchedule "일정 생성하기" 를 눌렀을 때 호출
 * @param onCreatePlan "새 플랜 생성하기" 를 눌렀을 때 호출
 */
export function AddMenu({ visible, onClose, onFullyClosed, onCreateSchedule, onCreatePlan }: Props) {
  const translateY = useSharedValue(ADD_MENU_OFFSCREEN_Y);
  const [isRendered, setIsRendered] = useState(visible);

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      translateY.value = withTiming(0, SLIDE_TIMING);
    } else {
      translateY.value = withTiming(ADD_MENU_OFFSCREEN_Y, SLIDE_TIMING, (finished) => {
        if (finished) {
          runOnJS(setIsRendered)(false);
          runOnJS(onFullyClosed)();
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, translateY]);

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  return (
    <Modal transparent animationType="none" visible={isRendered} onRequestClose={onClose}>
      <Pressable className="flex-1 bg-neutral-1000/40 justify-end" onPress={onClose}>
        <Pressable>
          <Animated.View style={sheetStyle}>
            <View className="bg-background-primary rounded-t-radius-6 items-center pt-spacing-3 px-spacing-7 pb-spacing-9" style={{ gap: getSpacing("spacing-7") }}>
              <View className="w-[104px] h-[4px] rounded-radius-full bg-neutral-600" />
              <Stack gap="s" width="full">
                <AddMenuButton label="일정 생성하기" onPress={onCreateSchedule} />
                <AddMenuButton label="과목 생성하기" />
                <AddMenuButton label="새 플랜 생성하기" onPress={onCreatePlan} />
              </Stack>
            </View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
