import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack } from "../../layout";
import { Button } from "../../ui/Button";
import { Text } from "../../ui/Text";
import { MascotBubble } from "./MascotBubble";
import { ScoreCircle } from "./ScoreCircle";
import type { TaskQuizResult } from "@/api/quiz/QuizPage";
import { color } from "@/constants/token/color";
import { getResultNotice } from "@/utils/quiz/quiz";

// ================================
// Components
// ================================

interface Props {
  result: TaskQuizResult;
  username?: string;
  subjectLabel?: string;
  onNext: () => void;
}

/**
 * 퀴즈 점수 화면. 바탕 그라데이션이 화면 끝까지 닿도록 레이아웃 좌우 여백·하단 안전영역만큼 넓혀 깔고, 안쪽은 같은 여백을 둠
 * @param result 채점 결과
 * @param username 사용자 이름, 있으면 "OO님," 인사를 보여줌
 * @param subjectLabel 과목 이름
 * @param onNext 다음을 눌렀을 때 호출
 */
export function QuizScore({ result, username, subjectLabel, onNext }: Props) {
  const insets = useSafeAreaInsets();
  const notice = getResultNotice(result);

  return (
    <View
      className="flex-1 -mx-spacing-7 px-spacing-7"
      style={{
        marginBottom: -insets.bottom,
        paddingBottom: insets.bottom,
        experimental_backgroundImage: `linear-gradient(180deg, ${color.background.primary} 0%, ${color.quiz["result-bottom"]} 100%)`,
      }}
    >
      <StatusBar style="light" />
      <Stack align="between" width="full" className="flex-1">
        <Stack gap="m" width="full" className="pt-[60px]">
          {!!username && <Text variant="header-large">{`${username}님,`}</Text>}
          <Text variant="title-large">{`${subjectLabel ? `${subjectLabel} ` : ""}학습 테스트를\n완료했어요!`}</Text>
        </Stack>
        <ScoreCircle correct={result.correctCount} total={result.totalCount} />
        <Stack gap="xl" width="full">
          {notice && <MascotBubble text={notice} />}
          <Button variant="primary" onPress={onNext}>다음</Button>
        </Stack>
      </Stack>
    </View>
  );
}
