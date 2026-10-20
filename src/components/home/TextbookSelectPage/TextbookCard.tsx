import { Image, Pressable, View } from "react-native";
import { Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { Icon } from "@/assets";
import type { TextbookWithSubject } from "@/api/home/TextbookSelectPage";
import { getTextbookLabels } from "@/utils/home/textbook";
import { color } from "@/constants/token/color";

// ================================
// Components
// ================================

interface Props {
  textbook: TextbookWithSubject;
  onPress: () => void;
}

/**
 * 표지·제목·출판사로 된 교과서 카드
 * @param textbook 보여줄 교과서
 * @param onPress 카드를 눌렀을 때 호출
 */
export function TextbookCard({ textbook, onPress }: Props) {
  const { title, publisher } = getTextbookLabels(textbook, textbook.subjectName);

  return (
    <Pressable onPress={onPress} className="gap-spacing-3" style={{ width: 104 }}>
      <View className="rounded-radius-1 bg-neutral-700 items-center justify-center overflow-hidden" style={{ aspectRatio: 210 / 270 }}>
        {textbook.coverImageUrl ? (
          <Image source={{ uri: textbook.coverImageUrl }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
        ) : (
          <Icon name="book" size={32} color={color.neutral["400"]} />
        )}
      </View>
      <Stack gap="xxs" width="full">
        <Text variant="base-small" weight="medium" className="text-text-primary" numberOfLines={1}>{title}</Text>
        <Text variant="base-small" color="secondary" numberOfLines={1}>{publisher}</Text>
      </Stack>
    </Pressable>
  );
}
