import { SafeAreaView } from "react-native-safe-area-context";
import { Slot, usePathname } from "expo-router";
import { View } from "react-native";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { NavBar } from "@/components";
import { useUIStore, useUserStore } from "@/store";
import "../global.css";

// ================================
// Constants
// ================================

const TAB_PATHS = ["/home", "/todo", "/calendar", "/more"];

export default function RootLayout() {
  const pathname = usePathname();
  const isFullScreenModalOpen = useUIStore((state) => state.isFullScreenModalOpen);
  const showNavBar = TAB_PATHS.includes(pathname) && !isFullScreenModalOpen;

  const [fontsLoaded] = useFonts({
    Jalnan2: require("@/assets/fonts/Jalnan2.otf"),
  });

  const restoreSession = useUserStore((state) => state.restoreSession);
  const [sessionRestored, setSessionRestored] = useState(false);

  useEffect(() => {
    restoreSession().finally(() => setSessionRestored(true));
  }, [restoreSession]);

  if (!fontsLoaded || !sessionRestored) return null;

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <View className="px-6 flex-1 bg-background-primary">
        <Slot />
      </View>
      {showNavBar && <NavBar />}
    </SafeAreaView>
  );
}
