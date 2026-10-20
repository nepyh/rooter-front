import { Pressable, View, ViewProps } from "react-native";
import { Stack } from "../../layout";
import { Text } from "../../ui/Text";
import type { School } from "@/api/auth/SchoolSelect";

// ================================
// Components
// ================================

interface Props extends ViewProps {
  schools: School[];
  onSelect: (school: School) => void;
  className?: string;
}

/**
 * 학교명 입력칸 아래에 떠 있는 검색 결과 목록
 * @param schools 보여줄 학교 목록
 * @param onSelect 학교를 눌렀을 때 호출
 */
export function SchoolSuggestionList({ schools, onSelect, className = "", ...props }: Props) {
  return (
    <View className={`absolute top-full mt-spacing-3 w-full z-20 shadow-lg ${className}`} style={{ elevation: 8 }} {...props}>
      <Stack width="full" className="bg-neutral-700 rounded-radius-4 overflow-hidden">
        {schools.map((school) => (
          <Pressable key={school.schoolId} className="p-spacing-6 w-full" onPress={() => onSelect(school)}>
            <Text variant="base-large" weight="medium">
              {school.name} ({school.region})
            </Text>
          </Pressable>
        ))}
      </Stack>
    </View>
  );
}
