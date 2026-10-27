import { useState } from "react";
import { Linking, Modal, ModalProps, Pressable, View } from "react-native";
import Animated, { SlideInDown } from "react-native-reanimated";
import { Row, Stack } from "../layout";
import { Button } from "../ui/Button";
import { Text } from "../ui/Text";
import { Icon } from "@/assets";
import { color } from "@/constants/token/color";
import type { AgreementDecision, AgreementDocument } from "@/api/common/agreement";

interface CheckRowProps {
  checked: boolean;
  label: string;
  onPress: () => void;
  onPressView?: () => void;
}

function CheckRow({ checked, label, onPress, onPressView }: CheckRowProps) {
  return (
    <Row width="full" className="items-center justify-between py-spacing-5">
      <Pressable className="flex-1 flex-row items-center gap-spacing-4" onPress={onPress}>
        <Icon name="checkCircle" size={28} color={checked ? color.primary["500"] : color.neutral["600"]} />
        <Text weight="medium" className="flex-1">{label}</Text>
      </Pressable>
      {onPressView && (
        <Pressable hitSlop={8} onPress={onPressView}>
          <Text variant="base-small" weight="medium" color="disabled" className="underline">보기</Text>
        </Pressable>
      )}
    </Row>
  );
}

interface Props extends Omit<ModalProps, "children"> {
  agreements: AgreementDocument[];
  onClose: () => void;
  onNext: (decisions: AgreementDecision[]) => void;
}

/**
 * 서버의 약관 목록을 체크 항목으로 그리는 동의 바텀시트
 * @param agreements 체크 항목으로 보여줄 약관 목록 (GET /agreements)
 * @param onClose 바깥을 누르거나 뒤로가기를 했을 때 호출
 * @param onNext 필수 항목을 모두 체크하고 "다음"을 눌렀을 때, 항목별 동의 결정과 함께 호출
 */
export function TermsAgreementSheet({ agreements, onClose, onNext, ...props }: Props) {
  const [agreed, setAgreed] = useState<Record<string, boolean>>({});

  const isChecked = (code: string) => agreed[code] ?? false;
  const isAllAgreed = agreements.length > 0 && agreements.every((doc) => isChecked(doc.code));
  const isRequiredAgreed = agreements.length > 0 && agreements.every((doc) => !doc.required || isChecked(doc.code));

  const toggleTerm = (code: string) => setAgreed((prev) => ({ ...prev, [code]: !prev[code] }));
  const toggleAll = () => setAgreed(Object.fromEntries(agreements.map((doc) => [doc.code, !isAllAgreed])));

  const handleNext = () =>
    onNext(agreements.map(({ code, version }) => ({ code, version, agreed: isChecked(code) })));

  return (
    <Modal transparent animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={onClose} {...props}>
      <Pressable className="flex-1 justify-end bg-neutral-1000/40" onPress={onClose}>
        <Animated.View entering={SlideInDown.duration(250)}>
          <Pressable className="h-[500px] items-center justify-between bg-background-primary px-spacing-7 pt-spacing-3 pb-spacing-9 rounded-t-radius-6">
            <Stack gap="xxl" width="full" className="items-center">
              <View className="w-[104px] h-1 rounded-radius-full bg-neutral-600" />
              <Stack gap="xl" width="full">
                <Stack gap="s" width="full">
                  <Text variant="title-medium">약관에 동의해주세요</Text>
                  <Text color="secondary">약관 미동의시 서비스 이용이 제한됩니다.</Text>
                </Stack>
                <Stack gap="s" width="full">
                  <CheckRow checked={isAllAgreed} label="모두 동의" onPress={toggleAll} />
                  <View className="w-full h-spacing-divider bg-neutral-600" />
                  <Stack width="full">
                    {agreements.map((doc) => (
                      <CheckRow
                        key={doc.code}
                        checked={isChecked(doc.code)}
                        label={`(${doc.required ? "필수" : "선택"}) ${doc.title} 동의`}
                        onPress={() => toggleTerm(doc.code)}
                        onPressView={() => Linking.openURL(doc.url)}
                      />
                    ))}
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
            <Button variant={isRequiredAgreed ? "primary" : "disabled"} onPress={handleNext}>
              다음
            </Button>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
