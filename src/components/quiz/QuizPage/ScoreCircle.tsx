import { View } from "react-native";
import { Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { color } from "@/constants/token/color";
import { getSpacing } from "@/utils/common/token";

// ================================
// Styles
// ================================

const SCORE_TEXT_STYLE = { fontSize: 40, lineHeight: 50, letterSpacing: -0.4 };

// ================================
// Components
// ================================

interface Props {
  correct: number;
  total: number;
}

/**
 * 점수(100점 만점)와 맞힌 개수를 보여주는 큰 원
 * @param correct 맞힌 문제 수
 * @param total 전체 문제 수
 */
export function ScoreCircle({ correct, total }: Props) {
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <View
      className="w-[280px] h-[280px] rounded-radius-full border-[10px] border-primary-500 items-center justify-center self-center"
      style={{
        gap: getSpacing("spacing-7"),
        experimental_backgroundImage: `linear-gradient(180deg, ${color.quiz["score-top"]} 0%, ${color.quiz["score-bottom"]} 100%)`,
      }}
    >
      <Text variant="base-large">나의 점수</Text>
      <Stack gap="s" className="items-center">
        <Text weight="semibold" style={SCORE_TEXT_STYLE}>{`${score}점`}</Text>
        <Text variant="base-large" color="secondary">{`${correct}/${total}`}</Text>
      </Stack>
    </View>
  );
}
