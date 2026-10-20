import { Image, Pressable, View } from "react-native";
import { Text } from "../../ui/Text";
import { Icon } from "@/assets";

// ================================
// Components
// ================================

interface Props {
  imageUri?: string;
  fallbackText: string;
  onPressCamera: () => void;
}

/**
 * 동그란 프로필 사진과 오른쪽 아래 카메라 버튼. 사진이 없으면 글자를 보여줌
 * @param imageUri 프로필 사진 주소
 * @param fallbackText 사진이 없을 때 가운데 보여줄 글자 (이름 첫 글자)
 * @param onPressCamera 카메라 버튼을 눌렀을 때 호출
 */
export function ProfileAvatar({ imageUri, fallbackText, onPressCamera }: Props) {
  return (
    <View className="w-[100px] h-[100px]">
      <View className="w-[100px] h-[100px] rounded-radius-full overflow-hidden bg-neutral-700 items-center justify-center">
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={{ width: 100, height: 100 }} />
        ) : (
          <Text variant="title-small">{fallbackText}</Text>
        )}
      </View>
      <Pressable
        onPress={onPressCamera}
        className="absolute bottom-spacing-0 right-spacing-0 w-[28px] h-[28px] rounded-radius-full bg-background-primary items-center justify-center"
      >
        <Icon name="camera" size={16} />
      </Pressable>
    </View>
  );
}
