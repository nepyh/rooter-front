import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Row, Text } from "@/components";
import { Icon } from "@/assets";

/**
 * 계정 설정 화면
 * @description 현재는 별도 기능 없이 헤더만 퍼블리싱된 화면입니다.
 */
export default function AccountSettingPage() {
  return (
    <View className="flex-1">
      <StatusBar style="light" />

      <Row gap="s" className="items-center pb-l">
        <Pressable onPress={() => router.back()}>
          <Icon name="chevronLeft" size={28} />
        </Pressable>
        <Text variant="header-large">계정 설정</Text>
      </Row>
    </View>
  );
}
