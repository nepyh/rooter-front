import type { ReactNode } from "react";
import { View, ViewProps } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack } from "../../layout";
import { Text } from "../../ui/Text";

// ================================
// Components
// ================================

interface Props extends ViewProps {
  title: string;
  description: string;
  footer?: ReactNode;
  className?: string;
}

/**
 * 인증 화면 공통 틀. 위에 제목·설명과 입력칸, 아래에 버튼 영역을 배치
 * @param title 화면 제목
 * @param description 제목 아래 설명 문구
 * @param children 제목 아래에 세로로 쌓을 입력칸들
 * @param footer 화면 맨 아래에 붙일 버튼 영역
 */
export function AuthScreen({ title, description, footer, children, className = "", ...props }: Props) {
  return (
    <View className={`flex-1 ${className}`} {...props}>
      <StatusBar style="auto" />
      <Stack align="between" className="flex-1">
        <Stack gap="xxl">
          <Stack gap="s">
            <Text variant="title-medium"> {title} </Text>
            <Text color="secondary"> {description} </Text>
          </Stack>
          <Stack width="full" gap="m">
            {children}
          </Stack>
        </Stack>
        {footer}
      </Stack>
    </View>
  );
}
