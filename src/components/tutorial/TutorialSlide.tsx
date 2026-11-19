import { View, ImageSourcePropType } from "react-native";
import { Image } from "expo-image";
import { Stack } from "../layout";
import { Text } from "../ui/Text";

// ================================
// Constants
// ================================

// 피그마 기준 목업 높이, 화면이 작으면 이보다 줄어듦
const MAX_HEIGHT = 459;
// 목업 이미지 비율 222:459
const ASPECT_RATIO = 222 / 459;

// ================================
// Components
// ================================

interface Props {
  image: ImageSourcePropType;
  title: string;
  description: string;
  width: number;
}

/**
 * 튜토리얼 한 장, 휴대폰 목업과 제목·설명
 * @param image 목업 이미지를 입력합니다.
 * @param title 제목을 입력합니다.
 * @param description 설명을 입력합니다. 줄바꿈은 \n
 * @param width 한 장의 너비를 입력합니다.
 */
export function TutorialSlide({ image, title, description, width }: Props) {
  return (
    <View className="px-spacing-7 pt-spacing-4" style={{ width }}>
      <View className="flex-1 items-center">
        <Image
          source={image}
          style={{
            height: "100%",
            maxHeight: MAX_HEIGHT,
            aspectRatio: ASPECT_RATIO,
          }}
          contentFit="contain"
        />
      </View>
      <Stack gap="s" className="mt-spacing-9 items-center">
        <Text variant="title-medium">{title}</Text>
        <Text variant="base-large" color="secondary" className="text-center">
          {description}
        </Text>
      </Stack>
    </View>
  );
}
