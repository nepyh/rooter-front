import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export type DevicePlatform = "IOS" | "ANDROID";

export interface PushTokenInfo {
  token: string;
  platform: DevicePlatform;
}

const PLATFORM_MAP: Partial<Record<typeof Platform.OS, DevicePlatform>> = {
  ios: "IOS",
  android: "ANDROID",
};

/**
 * 알림 권한을 확인·요청한 뒤 Expo 푸시 토큰을 발급받습니다.
 * @returns 서버 등록(POST /notifications/device-tokens)에 쓸 토큰과 플랫폼
 * @throws EAS projectId 가 없거나 토큰 발급에 실패한 경우
 */
export const getPushToken = async (): Promise<PushTokenInfo | null> => {
  const platform = PLATFORM_MAP[Platform.OS];
  if (!platform) return null;

  if (platform === "ANDROID") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  const status =
    existingStatus === "granted"
      ? existingStatus
      : (await Notifications.requestPermissionsAsync()).status;
  if (status !== "granted") return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;
  if (!projectId) {
    throw new Error("EAS projectId 를 찾을 수 없습니다.");
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync({
    projectId,
  });
  return { token, platform };
};
