import { useEffect, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Row, Stack } from "../../layout";
import { Button } from "../../ui/Button";
import { Text } from "../../ui/Text";
import type { CalendarItem } from "@/api/calendar/Calendar";
import { getSpacing } from "@/utils/common/token";

// ================================
// Constants
// ================================

const DETAIL_SHEET_OFFSCREEN_Y = 700;
const SLIDE_TIMING = { duration: 400, easing: Easing.out(Easing.cubic) };

// ================================
// Components
// ================================

interface Props {
  visible: boolean;
  date: Date;
  item: CalendarItem;
  onClose: () => void;
  onHidden: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * 일정을 누르면 아래에서 올라오는 상세 시트. 배경은 바로 덮고 시트만 아래에서 밀어 올림
 * 개인 일정만 수정·삭제 버튼을 보여줌
 * @param visible 시트를 띄울지
 * @param date 일정 날짜
 * @param item 보여줄 일정
 * @param onClose 바깥을 누르거나 뒤로가기로 닫을 때 호출
 * @param onHidden 닫힘 애니메이션이 완전히 끝난 뒤 호출. 닫히는 도중 다른 Modal 을 띄우면 iOS 에서 안 떠서, 후속 동작은 여기서 실행
 * @param onEdit 수정을 눌렀을 때 호출
 * @param onDelete 삭제를 눌렀을 때 호출
 */
export function PlanDetailModal({ visible, date, item, onClose, onHidden, onEdit, onDelete }: Props) {
  const translateY = useSharedValue(DETAIL_SHEET_OFFSCREEN_Y);
  const [isRendered, setIsRendered] = useState(visible);

  const handleHidden = () => {
    setIsRendered(false);
    onHidden();
  };

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      translateY.value = withTiming(0, SLIDE_TIMING);
    } else {
      translateY.value = withTiming(DETAIL_SHEET_OFFSCREEN_Y, SLIDE_TIMING, (finished) => {
        if (finished) runOnJS(handleHidden)();
      });
    }
  }, [visible, translateY]);

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  return (
    <Modal transparent animationType="none" visible={isRendered} onRequestClose={onClose}>
      <Pressable className="flex-1 bg-neutral-1000/40 justify-end" onPress={onClose}>
        <Pressable>
          <Animated.View style={sheetStyle}>
            <Stack width="full" align="center" className="items-center bg-background-primary pt-spacing-3 px-spacing-8 pb-spacing-8 rounded-t-radius-6" style={{ gap: getSpacing("spacing-7") }}>
              <View className="w-[104px] h-[4px] rounded-radius-full bg-neutral-600" style={{ alignSelf: "center" }} />
              <Stack gap="xxl" width="full" className="pb-spacing-9">
                <Stack gap="xs" width="full">
                  <Row gap="s">
                    <Text variant="base-medium" color="secondary">{`${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`}</Text>
                    <Text variant="base-medium" color="secondary">|</Text>
                    <Text variant="base-medium" color="secondary">하루종일</Text>
                  </Row>
                  <Text variant="title-small">{item.label}</Text>
                </Stack>
                <Stack gap="s" width="full">
                  <Text variant="base-medium" weight="medium">메모</Text>
                  <View className="bg-neutral-700 p-spacing-4 rounded-radius-2 w-full" style={{ minHeight: 119 }}>
                    <Text variant="base-medium">{item.memo}</Text>
                  </View>
                </Stack>
                {item.kind === "event" && (
                  <Row gap="m" width="full">
                    <View className="flex-1">
                      <Button variant="disabled" disabled={false} onPress={onDelete}>삭제</Button>
                    </View>
                    <View className="flex-1">
                      <Button variant="primary" onPress={onEdit}>수정</Button>
                    </View>
                  </Row>
                )}
              </Stack>
            </Stack>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
