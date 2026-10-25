import * as Sentry from "@sentry/react-native";
import {
  apiFailureMetadata,
  sanitizeErrorEvent,
} from "@/lib/monitoring-policy";

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT || "development",
    release: process.env.EXPO_PUBLIC_SENTRY_RELEASE || undefined,
    sendDefaultPii: false,
    enableNative: false,
    enableAutoSessionTracking: false,
    enableAutoPerformanceTracing: false,
    enableAppStartTracking: false,
    enableNativeFramesTracking: false,
    enableLogs: false,
    enableStallTracking: false,
    enableUserInteractionTracing: false,
    enableCaptureFailedRequests: false,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    maxBreadcrumbs: 0,
    beforeSend: sanitizeErrorEvent,
  });
}

/** 처리된 5xx·네트워크 오류를 원본 Axios 데이터 없이 수집합니다. */
export function captureApiFailure(error: unknown) {
  if (!dsn) return;
  const metadata = apiFailureMetadata(error);
  if (!metadata) return;
  Sentry.captureException(new Error("API request failed"), {
    tags: {
      error_source: "api",
      error_code: metadata.code,
      http_status: metadata.status,
      http_method: metadata.method,
    },
  });
}

export { Sentry };
