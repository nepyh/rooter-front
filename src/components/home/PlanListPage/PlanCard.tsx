import { Pressable, PressableProps, View } from "react-native";
import { Row, Stack } from "../../layout";
import { Text } from "../../ui/Text";
import type { PlanGenerationNotice } from "@/utils/home/planGeneration";

// ================================
// Types
// ================================

type GenerationKind = PlanGenerationNotice["kind"];

// ================================
// Styles
// ================================

const generationLabels: Record<GenerationKind, string> = {
  "generating": "남은 계획을 만드는 중이에요",
  "failed": "남은 계획을 만들지 못했어요",
};

const generationStyles: Record<GenerationKind, string> = {
  "generating": "text-text-secondary",
  "failed": "text-utility-error-primary",
};

// ================================
// Components
// ================================

interface Props extends PressableProps {
  title: string;
  date: string;
  isRepresentative?: boolean;
  generation?: GenerationKind | null;
  className?: string;
}

/**
 * 플랜 목록의 플랜 한 줄. 이름과 시험일을 보여주고, 대표 플랜이면 이름 앞에 '대표' 표시. 누르고 있는 동안 배경이 살짝 어두워짐
 * @param title 플랜 이름
 * @param date 보여줄 시험일 (예: 2026년 8월 10일)
 * @param isRepresentative 대표 플랜인지
 * @param generation AI 계획의 남은 기간을 만드는 중(generating)·만들지 못함(failed)이면 이름 아래에 한 줄로 알림 (rooter-back#405)
 */
export function PlanCard({ title, date, isRepresentative = false, generation = null, className = "", ...props }: Props) {
  return (
    <Pressable className={`w-full bg-neutral-700 active:bg-neutral-700/60 p-spacing-6 rounded-radius-4 ${className}`} {...props}>
      <Stack gap="xs" width="full">
        <Row width="full" align="between" gap="m" className="items-center">
          <Row gap="s" className="flex-1 items-center">
            {isRepresentative && (
              <View className="bg-neutral-600 px-spacing-3 py-spacing-2 rounded-radius-1">
                <Text variant="base-caption" weight="medium" color="secondary">대표</Text>
              </View>
            )}
            <Text variant="base-large" weight="medium" numberOfLines={1} className="flex-1">{title}</Text>
          </Row>
          <Text variant="base-large" color="secondary">{date}</Text>
        </Row>
        {generation && (
          <Text variant="base-small" className={generationStyles[generation]}>{generationLabels[generation]}</Text>
        )}
      </Stack>
    </Pressable>
  );
}
