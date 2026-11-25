import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  PressableProps,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Text } from "./Text";
import { Row, Stack } from "../layout";
import { Icon } from "@/assets";
import { color } from "@/constants/token/color";
import { getSpacing } from "@/utils/common/token";

// ================================
// Constants
// ================================

const SHEET_SLIDE_MS = 250;

// ================================
// Types
// ================================

export interface SelectOption {
  label: string;
  value: string;
}

// ================================
// Components
// ================================

interface Props extends Omit<PressableProps, "onPress"> {
  label?: string;
  value: string;
  options: SelectOption[];
  placeholder?: string;
  sheetTitle?: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * 정해진 보기 중 하나를 고르는 선택칸. 누르면 아래에서 보기 목록 시트가 올라옴
 * 올라오는 애니메이션은 entering 대신 translateY 값으로 움직임. entering 을 쓰면 안드로이드에서 보기를 눌러도 탭이 취소됨
 * @param label 칸 위쪽에 작게 보여줄 이름
 * @param value 지금 고른 보기의 값, 안 골랐으면 빈 문자열
 * @param options 고를 수 있는 보기 목록
 * @param placeholder 안 골랐을 때 칸에 보여줄 문구
 * @param sheetTitle 보기 목록 시트의 제목, 없으면 label
 * @param onChange 보기를 골랐을 때 그 값과 함께 호출
 */
export function Select({
  label,
  value,
  options,
  placeholder = "선택",
  sheetTitle,
  onChange,
  className = "",
  ...props
}: Props) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const translateY = useSharedValue(screenHeight);

  // 열릴 때마다 아래에서 올라옴
  useEffect(() => {
    if (!open) return;
    translateY.value = screenHeight;
    translateY.value = withTiming(0, {
      duration: SHEET_SLIDE_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [open, screenHeight, translateY]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const selected = options.find((option) => option.value === value);

  const handleSelect = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className={`w-full gap-spacing-1 rounded-radius-4 border-2 bg-neutral-700 p-spacing-6 ${open ? "border-primary-500" : "border-transparent"} ${className}`}
        {...props}
      >
        {label && (
          <Text variant="base-caption" weight="medium" color="secondary">
            {label}
          </Text>
        )}
        <Row gap="s" className="items-center">
          <Text
            variant="base-large"
            color={selected ? "primary" : "disabled"}
            className="flex-1"
          >
            {selected?.label ?? placeholder}
          </Text>
          <View style={{ transform: [{ rotate: "90deg" }] }}>
            <Icon name="chevronRight" size={20} color={color.neutral["400"]} />
          </View>
        </Row>
      </Pressable>

      <Modal
        transparent
        visible={open}
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-neutral-1000/40"
          onPress={() => setOpen(false)}
        >
          <Animated.View style={sheetStyle}>
            <Pressable
              className="items-center rounded-t-radius-6 bg-background-primary px-spacing-7 pt-spacing-3"
              style={{
                paddingBottom: getSpacing("spacing-11") + insets.bottom,
              }}
            >
              <Stack gap="xl" width="full" className="items-center">
                <View className="h-1 w-[104px] rounded-radius-full bg-neutral-600" />
                {!!(sheetTitle ?? label) && (
                  <Text variant="title-medium" className="w-full">
                    {sheetTitle ?? label}
                  </Text>
                )}
                <Stack width="full">
                  {options.map((option) => {
                    const isSelected = option.value === value;
                    return (
                      <Pressable
                        key={option.value}
                        onPress={() => handleSelect(option.value)}
                        className="flex-row items-center justify-between py-spacing-5"
                      >
                        <Text
                          variant="base-large"
                          weight={isSelected ? "semibold" : "medium"}
                          color={isSelected ? "primary" : "secondary"}
                        >
                          {option.label}
                        </Text>
                        {isSelected && (
                          <Icon
                            name="check"
                            size={22}
                            color={color.primary["500"]}
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </Stack>
              </Stack>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}
