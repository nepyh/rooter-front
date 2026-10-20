import { Redirect } from "expo-router";

/**
 * 앱 진입점. 접속하면 바로 온보딩 화면으로 보냄
 */
export default function Index() {
  return <Redirect href="/Auth/Onboarding" />;
}
