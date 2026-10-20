import type { ReactNode } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { Icon } from "@/assets";

// ================================
// Components
// ================================

interface Props {
  title: string;
  description: string;
  footer: ReactNode;
}

/**
 * 마스코트 + 제목 + 설명, 맨 아래 버튼으로 된 설문 안내·완료 화면 틀
 * @param title 제목
 * @param description 제목 아래 설명 문구 (줄바꿈은 \n)
 * @param footer 화면 맨 아래에 붙일 버튼 영역
 */
export function SurveyMessageScreen({ title, description, footer }: Props) {
  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <Stack align="between" className="flex-1" width="full">
        <Stack gap="xl" width="full">
          <Icon name="mascotFace" size={100} />
          <Stack gap="m" width="full">
            <Text variant="title-medium" className="w-full">{title}</Text>
            <Text variant="base-large" className="w-full">{description}</Text>
          </Stack>
        </Stack>
        {footer}
      </Stack>
    </View>
  );
}
