import type { ConfigContext, ExpoConfig } from "expo/config";

// ================================
// Functions
// ================================

/**
 * 백엔드 주소가 http 일 때만 그 호스트로의 HTTP 요청을 허용하는 iOS 설정
 * @param apiBaseUrl .env 의 EXPO_PUBLIC_API_BASE_URL
 * @returns NSAppTransportSecurity 값, https 거나 주소가 없으면 undefined
 */
const getAppTransportSecurity = (apiBaseUrl?: string) => {
  if (!apiBaseUrl?.startsWith("http://")) return undefined;

  const { hostname } = new URL(apiBaseUrl);
  return {
    NSExceptionDomains: {
      [hostname]: {
        NSExceptionAllowsInsecureHTTPLoads: true,
        NSIncludesSubdomains: false,
      },
    },
  };
};

// ================================
// Config
// ================================

/**
 * app.json 에 .env 값으로 정하는 설정을 덧붙임
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const appTransportSecurity = getAppTransportSecurity(
    process.env.EXPO_PUBLIC_API_BASE_URL,
  );

  return {
    ...(config as ExpoConfig),
    ios: {
      ...config.ios,
      infoPlist: {
        ...config.ios?.infoPlist,
        ...(appTransportSecurity && {
          NSAppTransportSecurity: appTransportSecurity,
        }),
      },
    },
  };
};
