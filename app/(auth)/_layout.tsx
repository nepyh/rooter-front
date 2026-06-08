import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { Icon } from "@/assets";

export default function AuthLayout() {
  return (
    <View className="py-16">
      <Pressable onPress={() => router.back()}>
        <Icon name="ChevronLeft" size={32} />
      </Pressable>
    </View>
  );
}