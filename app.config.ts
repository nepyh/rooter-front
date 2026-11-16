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

/**
 * 원스토어(안드로이드) 빌드에 쓰는 EAS 프로젝트
 * iOS 는 app.json 의 프로젝트를 그대로 쓰고, 안드로이드만 이 프로젝트에서 빌드·서명합니다.
 * eas.json 의 onestore 프로필이 EAS_TARGET=onestore 를 넘깁니다.
 */
const ONESTORE_EAS_PROJECT = {
  owner: "hyphen-team",
  projectId: "e090e687-ac64-4f70-9436-1c9fa65bae92",
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

  const isOnestore = process.env.EAS_TARGET === "onestore";

  return {
    ...(config as ExpoConfig),
    ...(isOnestore && {
      owner: ONESTORE_EAS_PROJECT.owner,
      extra: {
        ...config.extra,
        eas: {
          ...config.extra?.eas,
          projectId: ONESTORE_EAS_PROJECT.projectId,
        },
      },
    }),
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
