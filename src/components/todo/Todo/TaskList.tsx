import { View } from "react-native";
import { Row, Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { TaskRow, type TaskRowStatus } from "./TaskRow";
import type { PlanTask } from "@/api/common/planBoard";
import { CATEGORY_COLORS, type Category } from "@/constants/category";

// ================================
// Components
// ================================

interface Props {
  subjectName: string;
  category: Category;
  tasks: PlanTask[];
  getStatus: (task: PlanTask) => TaskRowStatus;
  onToggleTask: (task: PlanTask) => void;
}

/**
 * 왼쪽에 과목 색 막대가 붙은 회색 상자 안의 과목 이름 + 할 일 목록
 * @param subjectName 상자 맨 위에 보여줄 과목 이름
 * @param category 막대와 완료 체크박스에 쓸 과목 색
 * @param tasks 보여줄 할 일
 * @param getStatus 할 일마다 보여줄 상태
 * @param onToggleTask 할 일을 눌렀을 때 호출
 */
export function TaskList({ subjectName, category, tasks, getStatus, onToggleTask }: Props) {
  const accentColor = CATEGORY_COLORS[category].bar;

  return (
    <Row gap="s" className="bg-neutral-700 p-spacing-2 rounded-radius-2 w-full">
      <View className="w-spacing-2 rounded-radius-full" style={{ backgroundColor: accentColor }} />
      <Stack gap="s" className="flex-1 p-spacing-3">
        <Text variant="base-medium" weight="medium">{subjectName}</Text>
        <Stack gap="m">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} status={getStatus(task)} accentColor={accentColor} onToggle={() => onToggleTask(task)} />
          ))}
        </Stack>
      </Stack>
    </Row>
  );
}
