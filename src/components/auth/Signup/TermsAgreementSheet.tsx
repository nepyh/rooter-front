import { useState } from "react";
import { Linking, Modal, ModalProps, Pressable, View } from "react-native";
import Animated, { SlideInDown } from "react-native-reanimated";
import { Row, Stack } from "../../layout";
import { Button } from "../../ui/Button";
import { Text } from "../../ui/Text";
import { Icon } from "@/assets";
import { color } from "@/constants/token/color";

type TermKey = "service" | "age";

interface Term {
  key: TermKey;
  label: string;
  url?: string;
}

const TERMS: Term[] = [
  { key: "service", label: "(필수) 루터 서비스 이용약관 동의", url: "https://nepyh.github.io/rooter-legal/terms/2026-11-01/" },
  { key: "age", label: "(필수) 만 14세 이상입니다." },
];

const INITIAL_AGREED: Record<TermKey, boolean> = { service: false, age: false };

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
  onClose: () => void;
  onNext: () => void;
}

export function TermsAgreementSheet({ onClose, onNext, ...props }: Props) {
  const [agreed, setAgreed] = useState(INITIAL_AGREED);

  const isAllAgreed = TERMS.every((term) => agreed[term.key]);

  const toggleTerm = (key: TermKey) => setAgreed((prev) => ({ ...prev, [key]: !prev[key] }));
  const toggleAll = () => setAgreed({ service: !isAllAgreed, age: !isAllAgreed });

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
                    {TERMS.map((term) => (
                      <CheckRow
                        key={term.key}
                        checked={agreed[term.key]}
                        label={term.label}
                        onPress={() => toggleTerm(term.key)}
                        onPressView={term.url ? () => Linking.openURL(term.url!) : undefined}
                      />
                    ))}
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
            <Button variant={isAllAgreed ? "primary" : "disabled"} onPress={onNext}>
              다음
            </Button>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
