import { useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Row, Input, Button, Text } from "@/components";
import { Icon } from "@/assets";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/constants/category";
import type { Category } from "@/constants/category";
import { useTodoStore } from "@/store";

// ================================
// Constants
// ================================

const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];

// ================================
// Components
// ================================

/**
 * 할 일 추가 화면
 * @description 과목을 선택하고 내용을 입력해 새로운 할 일을 추가합니다. (디자인 미정으로 임의 구성)
 */
export default function AddTodo() {
  const addItem = useTodoStore((state) => state.addItem);
  const [category, setCategory] = useState<Category>("math");
  const [text, setText] = useState("");

  const canSubmit = text.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    addItem(category, text.trim());
    router.back();
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <Stack align="between" className="flex-1">
        <Stack gap="xxl">
          <Stack gap="s">
            <Text variant="title-medium">할 일 추가</Text>
            <Text color="secondary">과목을 선택하고 할 일을 입력해주세요</Text>
          </Stack>

          <Stack gap="m">
            <Text variant="base-medium" weight="medium">과목</Text>
            <Row gap="s" className="flex-wrap">
              {CATEGORIES.map((key) => {
                const colors = CATEGORY_COLORS[key];
                const isSelected = category === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setCategory(key)}
                    className="px-l py-s rounded-full border-2"
                    style={{
                      borderColor: isSelected ? colors.bar : "#525866",
                      backgroundColor: isSelected ? colors.bg : "transparent",
                    }}
                  >
                    <Text weight="medium" style={{ color: isSelected ? colors.bar : "#8A919E" }}>
                      {CATEGORY_LABELS[key]}
                    </Text>
                  </Pressable>
                );
              })}
            </Row>
          </Stack>

          <Input
            label="할 일 내용"
            value={text}
            onChangeText={setText}
            placeholder="할 일을 입력해주세요."
          />
        </Stack>

        <Row gap="m" width="full">
          <View className="flex-1">
            <Button variant="disabled" onPress={() => router.back()}> 취소 </Button>
          </View>
          <View className="flex-1">
            <Button variant={canSubmit ? "primary" : "disabled"} onPress={handleSubmit}> 추가 </Button>
          </View>
        </Row>
      </Stack>
    </View>
  );
}
