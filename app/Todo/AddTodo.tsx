import { useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Row, Input, Button, Text, AddTodoHeader, TimeRangeInputs, TodoTextbookField, TodoTextbookPicker } from "@/components";
import { useAddTodo } from "@/hooks/todo/useAddTodo";
import { color } from "@/constants/token/color";

/**
 * 할 일 추가 화면. 과목(교과서)을 고르면 그 할 일의 퀴즈가 고른 과목으로 나옴
 */
export default function AddTodo() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const todo = useAddTodo(date);
  const [pickingTextbook, setPickingTextbook] = useState(false);

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
          <TodoTextbookField textbook={todo.textbook} onPress={() => setPickingTextbook(true)} onClear={() => todo.setTextbook(null)} />
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

      {pickingTextbook && (
        <TodoTextbookPicker
          selectedId={todo.textbook?.id ?? null}
          onSelect={(textbook) => { todo.setTextbook(textbook); setPickingTextbook(false); }}
          onClose={() => setPickingTextbook(false)}
        />
      )}
    </View>
  );
}
