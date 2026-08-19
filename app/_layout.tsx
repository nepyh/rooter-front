import { SafeAreaView } from "react-native-safe-area-context";
import { Slot, usePathname } from "expo-router";
import { View } from "react-native";
import { useFonts } from "expo-font";
import { NavBar } from "@/components";
import { useUIStore } from "@/store";
import "../global.css";

// ================================
// Constants
// ================================

const TAB_PATHS = ["/Home", "/TodoPage", "/CalendarPage", "/SettingPage"];

export default function RootLayout() {
  const pathname = usePathname();
  const isFullScreenModalOpen = useUIStore((state) => state.isFullScreenModalOpen);
  const showNavBar = TAB_PATHS.includes(pathname) && !isFullScreenModalOpen;

  const [fontsLoaded] = useFonts({
    Jalnan2: require("@/assets/fonts/Jalnan2.otf"),
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#33363F' }}>
      <View className="px-6 flex-1 bg-background-primary">
        <Slot />
      </View>
      {showNavBar && <NavBar />}
    </SafeAreaView>
  );
}
