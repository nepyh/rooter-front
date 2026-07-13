import { SafeAreaView } from "react-native-safe-area-context";
import { Slot, usePathname } from "expo-router";
import { View } from "react-native";
import { NavBar } from "@/components";
import "../global.css";

// ================================
// Constants
// ================================

const TAB_PATHS = ["/Home", "/TodoPage", "/CalendarPage", "/SettingPage"];

export default function RootLayout() {
  const pathname = usePathname();
  const showNavBar = TAB_PATHS.includes(pathname);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#33363F' }}>
      <View className="px-6 flex-1 bg-background-primary">
        <Slot />
      </View>
      {showNavBar && <NavBar />}
    </SafeAreaView>
  );
}
