import { SafeAreaView } from "react-native-safe-area-context";
import { Slot, usePathname } from "expo-router";
import { View } from "react-native";
import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { NavBar } from "@/components";
import { CACHE_MAX_AGE_MS, clearQueryCache, queryClient, queryPersister } from "@/api/queryClient";
import { useUIStore, useUserStore } from "@/store";
import "../global.css";

// ================================
// Constants
// ================================

const TAB_PATHS = ["/Home/Home", "/Todo/Todo", "/Quiz/Quiz", "/Calendar/Calendar", "/More/More"];

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
    restoreSession()
      .then(() => (useUserStore.getState().isLogin ? undefined : clearQueryCache()))
      .finally(() => setSessionRestored(true));
  }, [restoreSession]);

  if (!fontsLoaded || !sessionRestored) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: queryPersister, maxAge: CACHE_MAX_AGE_MS }}>
        <SafeAreaView className="flex-1 bg-background-primary">
          <View className="px-spacing-7 flex-1 bg-background-primary">
            <Slot />
          </View>
          {showNavBar && <NavBar />}
        </SafeAreaView>
      </PersistQueryClientProvider>
    </GestureHandlerRootView>
  );
}
