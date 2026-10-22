import { ScrollView } from "react-native";
import { Row } from "../../layout";
import { SubjectPill } from "./SubjectPill";
import type { Subject } from "@/api/home/common/catalog";

// ================================
// Components
// ================================

interface Props {
  subjects: Subject[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

/**
 * "전체" + 과목별 필터 버튼 줄
 * @param subjects 과목 목록
 * @param selectedId 고른 과목 id, null 이면 전체
 * @param onSelect 과목을 눌렀을 때 호출 (전체는 null)
 */
export function SubjectFilter({ subjects, selectedId, onSelect }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="grow-0 mb-spacing-6">
      <Row gap="s">
        <SubjectPill label="전체" active={selectedId === null} onPress={() => onSelect(null)} />
        {subjects.map((subject) => (
          <SubjectPill
            key={subject.id}
            label={subject.name}
            active={selectedId === subject.id}
            onPress={() => onSelect(subject.id)}
          />
        ))}
      </Row>
    </ScrollView>
  );
}
