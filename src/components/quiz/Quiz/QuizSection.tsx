import { Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { QuizCard } from "./QuizCard";
import type { QuizItem } from "@/api/quiz/Quiz";

// ================================
// Components
// ================================

interface Props {
  title: string;
  items: QuizItem[];
  onPressItem: (item: QuizItem) => void;
}

/**
 * 제목 + 퀴즈 카드 목록. 퀴즈가 없으면 아무것도 그리지 않음
 * @param title 구역 제목
 * @param items 보여줄 퀴즈
 * @param onPressItem 카드를 눌렀을 때 호출
 */
export function QuizSection({ title, items, onPressItem }: Props) {
  if (items.length === 0) return null;

  return (
    <Stack gap="l" width="full">
      <Text variant="base-large" weight="medium">{title}</Text>
      <Stack gap="m" width="full">
        {items.map((item) => (
          <QuizCard key={item.task.id} item={item} onPress={() => onPressItem(item)} />
        ))}
      </Stack>
    </Stack>
  );
}
