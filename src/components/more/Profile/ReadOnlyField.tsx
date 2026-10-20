import { View } from "react-native";
import { Stack } from "../../layout";
import { Text } from "../../ui/Text";

// ================================
// Components
// ================================

interface Props {
  label: string;
  value: string;
}

/**
 * 고칠 수 없는 정보 칸 (라벨 + 회색 상자 안의 값)
 * @param label 항목 이름
 * @param value 보여줄 값
 */
export function ReadOnlyField({ label, value }: Props) {
  return (
    <Stack gap="s" width="full">
      <Text variant="base-medium">{label}</Text>
      <View className="bg-neutral-700 rounded-radius-4 p-spacing-6 w-full">
        <Text variant="base-large" weight="medium">{value}</Text>
      </View>
    </Stack>
  );
}
