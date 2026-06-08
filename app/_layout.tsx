import { SafeAreaView } from "react-native-safe-area-context";
import { Slot } from "expo-router";
import { View } from "react-native";
import "../global.css";

export default function RootLayout() {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#33363F' }}>
      <View className="px-6 flex-1 bg-background-primary">
        <Slot />
      </View>
    </SafeAreaView>
  );
}