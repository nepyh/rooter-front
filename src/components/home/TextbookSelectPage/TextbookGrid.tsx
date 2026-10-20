import { ScrollView, View } from "react-native";
import { TextbookCard } from "./TextbookCard";
import type { TextbookWithSubject } from "@/api/home/TextbookSelectPage";
import { getSpacing } from "@/utils/common/token";

// ================================
// Components
// ================================

interface Props {
  textbooks: TextbookWithSubject[];
  onSelect: (id: number) => void;
}

/**
 * 교과서 카드를 여러 줄로 깔아 놓은 스크롤 목록
 * @param textbooks 보여줄 교과서 목록
 * @param onSelect 교과서를 눌렀을 때 호출
 */
export function TextbookGrid({ textbooks, onSelect }: Props) {
  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 96 }}>
      <View className="flex-row flex-wrap" style={{ gap: getSpacing("spacing-6") }}>
        {textbooks.map((textbook) => (
          <TextbookCard key={textbook.id} textbook={textbook} onPress={() => onSelect(textbook.id)} />
        ))}
      </View>
    </ScrollView>
  );
}
