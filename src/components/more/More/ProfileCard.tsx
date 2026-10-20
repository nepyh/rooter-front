import { Pressable, View } from "react-native";
import { Row, Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { Icon } from "@/assets";

// ================================
// Components
// ================================

interface Props {
  username: string;
  email: string;
  onPress: () => void;
}

/**
 * 마이페이지 맨 위 내 정보 카드 (이름 첫 글자 동그라미 + 이름 + 이메일)
 * @param username 이름
 * @param email 이메일
 * @param onPress 카드를 눌렀을 때 호출
 */
export function ProfileCard({ username, email, onPress }: Props) {
  return (
    <Pressable onPress={onPress} className="bg-neutral-700 flex-row items-center justify-between p-spacing-5 rounded-radius-4 w-full">
      <Row gap="m" className="items-center">
        <View className="w-[48px] h-[48px] rounded-radius-full bg-primary-500 items-center justify-center">
          <Text variant="base-large" weight="medium" className="text-text-primary">{username.slice(0, 1)}</Text>
        </View>
        <Stack gap="xs">
          <Text variant="base-medium" weight="medium" className="text-text-primary">{username}</Text>
          <Text variant="base-medium" color="secondary">{email}</Text>
        </Stack>
      </Row>
      <Icon name="chevronRight" size={24} />
    </Pressable>
  );
}
