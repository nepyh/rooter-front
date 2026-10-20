import { View } from "react-native";
import { Row, Stack } from "../../layout";
import { TaskRow } from "./TaskRow";
import { AddTaskRow } from "./AddTaskRow";
import type { PlanTask } from "@/api/common/planBoard";

// ================================
// Components
// ================================

interface Props {
  tasks: PlanTask[];
  onToggleTask: (task: PlanTask) => void;
  onAdd: () => void;
}

/**
 * 왼쪽 주황 막대가 붙은 회색 상자 안의 할 일 목록 + "눌러서 추가하기" 줄
 * @param tasks 보여줄 할 일
 * @param onToggleTask 할 일을 눌렀을 때 호출
 * @param onAdd "눌러서 추가하기" 를 눌렀을 때 호출
 */
export function TaskList({ tasks, onToggleTask, onAdd }: Props) {
  return (
    <Row gap="s" className="bg-neutral-700 p-spacing-2 rounded-radius-2 w-full">
      <View className="w-spacing-2 rounded-radius-full bg-primary-500" />
      <Stack gap="m" className="flex-1 p-spacing-3">
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} onToggle={() => onToggleTask(task)} />
        ))}
        <AddTaskRow onPress={onAdd} />
      </Stack>
    </Row>
  );
}
