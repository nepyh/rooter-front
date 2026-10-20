import { View, Pressable } from "react-native";
import { Slot, router } from "expo-router";
import { Stack } from "@/components";
import { Icon } from "@/assets";

export default function AuthLayout() {
  return (
    <Stack gap="xl" className="flex-1 pb-spacing-11">
      <View className="py-spacing-5">
        <Pressable onPress={() => router.back()}>
          <Icon name="chevronLeft" size={32} />
        </Pressable>
      </View>
      <Slot />
    </Stack>
  );
}