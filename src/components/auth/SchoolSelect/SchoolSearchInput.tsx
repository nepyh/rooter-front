import { useEffect, useState, type Ref } from "react";
import { Pressable, TextInput, View } from "react-native";
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
 * @param selected 학교를 고른 상태인지 (고른 뒤에는 입력칸을 누르면 다시 수정하고, 목록이 닫힘)
 * @param onChangeQuery 학교명이 바뀔 때 호출
 * @param onSelect 목록에서 학교를 골랐을 때 호출
 * @param onEdit 학교를 고른 뒤 입력칸을 다시 눌렀을 때 호출
 */
export function SchoolSearchInput({ ref, query, selected, onChangeQuery, onSelect, onEdit }: Props) {
  const [schools, setSchools] = useState<School[]>([]);
  const [listHeight, setListHeight] = useState(0);
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
    // 목록을 칸 안에 두고 그 높이만큼 아래 여백을 당겨, 아래 입력칸 위치는 그대로 두고 목록만 겹쳐 보이게 함
    // 목록이 칸 밖으로 튀어나오면 안드로이드에서 목록 스크롤이 먹지 않음
    <View
      className="z-10"
      style={{ pointerEvents: "box-none", marginBottom: showSuggestions ? -listHeight : 0 }}
    >
      <Input
        ref={ref}
        value={query}
        onChangeText={onChangeQuery}
        label="학교명"
        placeholder="학교 이름을 입력해주세요."
      />
      {/* 고른 뒤에는 칸 전체를 덮는 누름 영역으로 입력을 막음. editable 로 잠그면 안드로이드에서 누름 이벤트가 오지 않고, 풀자마자 부르는 focus 도 무시됨 */}
      {selected && <Pressable className="absolute inset-0" onPress={onEdit} />}
      {showSuggestions && (
        <SchoolSuggestionList
          schools={schools}
          onSelect={onSelect}
          onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}
        />
      )}
    </View>
  );
}
