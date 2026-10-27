import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { Row, Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { Icon } from "@/assets";
import { toAvatarSource } from "@/utils/more/profile";

// ================================
// Components
// ================================

interface Props {
  username: string;
  email: string;
  imageUri?: string;
  onPress: () => void;
}

/**
 * 마이페이지 맨 위 내 정보 카드 (프로필 사진 동그라미 + 이름 + 이메일). 사진이 없으면 이름 첫 글자를 보여줌
 * @param username 이름
 * @param email 이메일
 * @param imageUri 프로필 사진 주소
 * @param onPress 카드를 눌렀을 때 호출
 */
export function ProfileCard({ username, email, imageUri, onPress }: Props) {
  return (
    <Pressable onPress={onPress} className="bg-neutral-700 flex-row items-center justify-between p-spacing-5 rounded-radius-4 w-full">
      <Row gap="m" className="items-center">
        <View className="w-[48px] h-[48px] rounded-radius-full overflow-hidden bg-primary-500 items-center justify-center">
          {imageUri ? (
            <Image source={toAvatarSource(imageUri)} cachePolicy="memory-disk" style={{ width: 48, height: 48 }} />
          ) : (
            <Text variant="base-large" weight="medium" className="text-text-primary">{username.slice(0, 1)}</Text>
          )}
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
