import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { Icon } from "@/assets";

// ================================
// Components
// ================================

interface Props {
  description: string;
  children: ReactNode;
  footer: ReactNode;
}

/**
 * 비밀번호 변경 화면 틀. 뒤로가기, "비밀번호 변경" 제목·설명, 입력칸, 맨 아래 버튼 영역
 * @param description 제목 아래 설명 문구 (단계마다 다름)
 * @param children 입력칸들
 * @param footer 화면 맨 아래에 붙일 버튼·토스트
 */
export function ChangePasswordScreen({ description, children, footer }: Props) {
  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <Stack gap="xl" className="flex-1 pb-spacing-11">
        <View className="py-spacing-5">
          <Pressable onPress={() => router.back()}>
            <Icon name="chevronLeft" size={32} />
          </Pressable>
        </View>

        <Stack align="between" className="flex-1">
          <Stack gap="xxl">
            <Stack gap="s">
              <Text variant="title-medium"> 비밀번호 변경 </Text>
              <Text color="secondary"> {description} </Text>
            </Stack>
            <Stack width="full" gap="m">
              {children}
            </Stack>
          </Stack>
          {footer}
        </Stack>
      </Stack>
    </View>
  );
}
