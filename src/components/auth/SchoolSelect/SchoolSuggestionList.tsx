import {
  Pressable,
  ScrollView,
  View,
  ViewProps,
  useWindowDimensions,
} from "react-native";
import { Text } from "../../ui/Text";
import type { School } from "@/api/auth/SchoolSelect";

// ================================
// Constants
// ================================

/** 목록 최대 높이, 화면 높이 대비 비율. 넘치면 목록 안에서 스크롤 */
const MAX_HEIGHT_RATIO = 0.4;

// ================================
// Components
// ================================

interface Props extends ViewProps {
  schools: School[];
  onSelect: (school: School) => void;
  className?: string;
}

/**
 * 학교명 입력칸 아래 검색 결과 목록. 결과가 많으면 목록 안에서 스크롤
 * 위쪽 여백(pt)까지 높이에 넣어, 감싼 쪽이 onLayout 높이만큼 아래 여백을 당겨 겹쳐 보이게 할 수 있음
 * @param schools 보여줄 학교 목록
 * @param onSelect 학교를 눌렀을 때 호출
 */
export function SchoolSuggestionList({
  schools,
  onSelect,
  className = "",
  ...props
}: Props) {
  const { height } = useWindowDimensions();

  return (
    <View
      className={`w-full pt-spacing-3 ${className}`}
      {...props}
    >
      <ScrollView
        className="w-full overflow-hidden rounded-radius-4 bg-neutral-700 shadow-lg"
        style={{ maxHeight: height * MAX_HEIGHT_RATIO, elevation: 8 }}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        {schools.map((school) => (
          <Pressable
            key={school.schoolId}
            className="w-full p-spacing-6"
            onPress={() => onSelect(school)}
          >
            <Text variant="base-large" weight="medium">
              {school.name} ({school.region})
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
