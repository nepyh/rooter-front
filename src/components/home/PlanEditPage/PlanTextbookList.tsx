import { ActivityIndicator, View } from "react-native";
import { Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { TextbookCardGrid } from "../common/TextbookCardGrid";
import type { TextbookWithSubject } from "@/api/home/common/catalog";
import { color } from "@/constants/token/color";

// ================================
// Components
// ================================

interface Props {
  textbooks: TextbookWithSubject[];
  loading: boolean;
}

/**
 * 플랜에 쓰인 교과서 목록. 눌리지 않는 보기 전용 카드를 여러 줄로 깔아 둠
 * @param textbooks 보여줄 교과서
 * @param loading 교과서를 불러오는 중인지
 */
export function PlanTextbookList({ textbooks, loading }: Props) {
  return (
    <Stack gap="s" width="full">
      <Text variant="base-medium">교과서</Text>
      {loading && (
        <View className="items-start py-spacing-5">
          <ActivityIndicator color={color.primary["500"]} />
        </View>
      )}
      {!loading && textbooks.length === 0 && <Text variant="base-medium" color="secondary">등록된 교과서가 없어요.</Text>}
      {!loading && textbooks.length > 0 && <TextbookCardGrid textbooks={textbooks} />}
    </Stack>
  );
}
