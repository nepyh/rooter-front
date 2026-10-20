import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Row, Input, Button, Text, AddTodoHeader, TimeRangeInputs } from "@/components";
import { useAddTodo } from "@/hooks/todo/useAddTodo";
import { color } from "@/constants/token/color";

/**
 * 할 일 추가 화면
 */
export default function AddTodo() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const todo = useAddTodo(date);

  const handleSubmit = async () => {
    if (await todo.submit()) router.back();
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <Stack align="between" className="flex-1">
        <Stack gap="xxl">
          <AddTodoHeader />
          <Input label="할 일 내용" value={todo.title} onChangeText={todo.setTitle} placeholder="할 일을 입력해주세요." />
          <TimeRangeInputs start={todo.startText} end={todo.endText} onChangeStart={todo.setStartText} onChangeEnd={todo.setEndText} />
          {!!todo.error && <Text style={{ color: color.utility["error-primary"] }}>{todo.error}</Text>}
        </Stack>

        <Row gap="m" width="full">
          <View className="flex-1">
            <Button variant="disabled" disabled={false} onPress={() => router.back()}> 취소 </Button>
          </View>
          <View className="flex-1">
            <Button variant={todo.canSubmit ? "primary" : "disabled"} onPress={handleSubmit}> 추가 </Button>
          </View>
        </Row>
      </Stack>
    </View>
  );
}
