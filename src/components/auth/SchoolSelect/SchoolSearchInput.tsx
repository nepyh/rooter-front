import { useEffect, useState, type Ref } from "react";
import { TextInput, View } from "react-native";
import { Input } from "../../ui/Input";
import { SchoolSuggestionList } from "./SchoolSuggestionList";
import { searchMiddleSchools, type School } from "@/api/auth/SchoolSelect";

// ================================
// Constants
// ================================

const SEARCH_DEBOUNCE_MS = 300;

// ================================
// Components
// ================================

interface Props {
  ref?: Ref<TextInput>;
  query: string;
  selected: boolean;
  onChangeQuery: (text: string) => void;
  onSelect: (school: School) => void;
  onEdit: () => void;
}

/**
 * 학교명 입력칸 + 검색 결과 목록. 입력이 바뀌면 중학교를 검색해 아래에 보여줌
 * @param query 입력된 학교명
 * @param selected 학교를 고른 상태인지 (고른 뒤에는 입력이 잠기고 목록이 닫힘)
 * @param onChangeQuery 학교명이 바뀔 때 호출
 * @param onSelect 목록에서 학교를 골랐을 때 호출
 * @param onEdit 학교를 고른 뒤 입력칸을 다시 눌렀을 때 호출
 */
export function SchoolSearchInput({ ref, query, selected, onChangeQuery, onSelect, onEdit }: Props) {
  const [schools, setSchools] = useState<School[]>([]);
  const showSuggestions = query.length > 0 && !selected;

  useEffect(() => {
    if (!showSuggestions) {
      setSchools([]);
      return;
    }

    const timer = setTimeout(() => {
      searchMiddleSchools(query)
        .then(setSchools)
        .catch(() => setSchools([]));
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, showSuggestions]);

  return (
    <View className="relative z-10">
      <Input
        ref={ref}
        value={query}
        onChangeText={onChangeQuery}
        editable={!selected}
        onPressIn={selected ? onEdit : undefined}
        label="학교명"
        placeholder="학교 이름을 입력해주세요."
      />
      {showSuggestions && <SchoolSuggestionList schools={schools} onSelect={onSelect} />}
    </View>
  );
}
