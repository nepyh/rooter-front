import { TextbookCardGrid } from "../common/TextbookCardGrid";
import { FadeScrollView } from "../common/FadeScrollView";
import type { TextbookWithSubject } from "@/api/home/common/catalog";

// ================================
// Constants
// ================================

const TEXTBOOK_FADE_HEIGHT = 60;

// ================================
// Components
// ================================

interface Props {
  textbooks: TextbookWithSubject[];
  selectedIds: Set<number>;
  onSelect: (id: number) => void;
}

/**
 * 교과서 카드를 여러 줄로 깔아 놓은 스크롤 목록. 아래로 더 스크롤할 수 있으면 하단을 흐리게 덮음
 * @param textbooks 보여줄 교과서 목록
 * @param selectedIds 목차를 고른 교과서 id
 * @param onSelect 교과서를 눌렀을 때 호출
 */
export function TextbookGrid({ textbooks, selectedIds, onSelect }: Props) {
  return (
    <FadeScrollView fadeHeight={TEXTBOOK_FADE_HEIGHT} contentContainerStyle={{ paddingBottom: 96 }}>
      <TextbookCardGrid textbooks={textbooks} selectedIds={selectedIds} onSelect={onSelect} />
    </FadeScrollView>
  );
}
