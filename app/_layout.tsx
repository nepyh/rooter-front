import { SafeAreaView } from "react-native-safe-area-context";
import { ErrorBoundary as RouterErrorBoundary, Slot, usePathname } from "expo-router";
import { Sentry } from "@/lib/monitoring";
import { View } from "react-native";
import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { NavBar, TermsAgreementSheet, Toast } from "@/components";
import { CACHE_MAX_AGE_MS, clearQueryCache, queryClient, queryPersister } from "@/api/queryClient";
import { useUIStore, useUserStore } from "@/store";
import { useAgreementGate } from "@/hooks/common/useAgreementGate";
import "../global.css";

// ================================
// Constants
// ================================

const TAB_PATHS = ["/Home/Home", "/Todo/Todo", "/Quiz/Quiz", "/Calendar/Calendar", "/More/More"];

function AgreementGate() {
  const gate = useAgreementGate();

  return (
    <>
      {gate.visible && !gate.errorMessage && <TermsAgreementSheet {...gate.sheetProps} />}
      {!!gate.errorMessage && <Toast text={gate.errorMessage} onClose={gate.clearError} />}
    </>
  );
}

function RootLayout() {
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
        <AgreementGate />
      </PersistQueryClientProvider>
    </GestureHandlerRootView>
  );
}

export const ErrorBoundary = Sentry.wrapExpoRouterErrorBoundary(RouterErrorBoundary);

export default Sentry.wrap(RootLayout);
