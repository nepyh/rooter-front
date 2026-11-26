import { useState } from "react";
import { View } from "react-native";
import { TextbookCard } from "./TextbookCard";
import type { TextbookWithSubject } from "@/api/home/common/catalog";
import { getSpacing } from "@/utils/common/token";
import { getTextbookGridLayout } from "@/utils/home/textbook";

// ================================
// Constants
// ================================

const TEXTBOOK_GRID_GAP = getSpacing("spacing-6");

// ================================
// Components
// ================================

interface Props {
  textbooks: TextbookWithSubject[];
  selectedIds?: Set<number>;
  onSelect?: (id: number) => void;
}

/**
 * 교과서 카드를 여러 줄로 깔아 놓은 격자. 영역 너비를 재서 한 줄의 카드 수와 카드 너비를 정하므로, 기기 너비와 상관없이 줄을 꽉 채움
 * @param textbooks 보여줄 교과서 목록
 * @param selectedIds 선택 표시를 띄울 교과서 id
 * @param onSelect 교과서를 눌렀을 때 호출, 없으면 눌리지 않는 카드
 */
export function TextbookCardGrid({ textbooks, selectedIds, onSelect }: Props) {
  const [areaWidth, setAreaWidth] = useState(0);
  const { cardWidth } = getTextbookGridLayout(areaWidth, TEXTBOOK_GRID_GAP);

  return (
    <View
      className="flex-row flex-wrap"
      style={{ gap: TEXTBOOK_GRID_GAP }}
      onLayout={(e) => setAreaWidth(e.nativeEvent.layout.width)}
    >
      {areaWidth > 0 && textbooks.map((textbook) => (
        <TextbookCard
          key={textbook.id}
          textbook={textbook}
          width={cardWidth}
          selected={selectedIds?.has(textbook.id)}
          onPress={onSelect && (() => onSelect(textbook.id))}
        />
      ))}
    </View>
  );
}
