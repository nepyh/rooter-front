import * as Sentry from "@sentry/react-native";
import type { Span } from "@sentry/react-native";
import {
  apiFailureMetadata,
  apiSpanName,
  parseTracesSampleRate,
  sanitizeErrorEvent,
  sanitizeTransactionEvent,
  screenSpanName,
} from "@/lib/monitoring-policy";

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
// 0 이면 성능 추적을 끕니다 (기본). 부하·성능 측정할 때만 올립니다.
const tracesSampleRate = parseTracesSampleRate(
  process.env.EXPO_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
);
const tracingEnabled = !!dsn && tracesSampleRate > 0;
// 화면에 들어온 뒤 이 시간 동안 새 API 요청이 없으면 화면 트랜잭션을 끝냅니다.
const SCREEN_IDLE_TIMEOUT_MS = 1_000;
const SCREEN_FINAL_TIMEOUT_MS = 30_000;

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
    // 자동 계측은 끈 채로, 아래 화면·API span 만 직접 남깁니다 (요청 주소·본문·기기 정보 제외)
    tracesSampleRate,
    beforeSendTransaction: sanitizeTransactionEvent,
  });
}

/**
 * 화면 트랜잭션 시작. 화면에 들어온 뒤 부르는 API 요청이 이 아래 span 으로 붙고,
 * 1초 동안 새 요청이 없으면 끝납니다. 성능 추적이 꺼져 있으면 아무것도 안 합니다.
 * @param pathname expo-router 경로 (예: /Home/Home)
 */
export function startScreenSpan(pathname: string) {
  const name = screenSpanName(pathname);
  if (!tracingEnabled || !name) return;
  Sentry.startIdleSpan(
    { name, op: "navigation", forceTransaction: true },
    {
      idleTimeout: SCREEN_IDLE_TIMEOUT_MS,
      finalTimeout: SCREEN_FINAL_TIMEOUT_MS,
    },
  );
}

/**
 * API 요청 span 시작. 이름은 경로 모양만 (id·날짜·쿼리 제외)
 * @param method HTTP 메서드
 * @param url 요청 주소
 * @returns 응답을 받으면 endApiSpan 에 넘길 span, 성능 추적이 꺼져 있으면 undefined
 */
export function startApiSpan(method?: string, url?: string): Span | undefined {
  const name = apiSpanName(method, url);
  if (!tracingEnabled || !name) return undefined;
  return Sentry.startInactiveSpan({ name, op: "http.client" });
}

/**
 * API 요청 span 종료
 * @param span startApiSpan 이 돌려준 span
 * @param status HTTP 상태 코드, 응답이 없으면(네트워크 오류) undefined
 */
export function endApiSpan(span: Span | undefined, status?: number) {
  if (!span) return;
  span.setStatus(
    status !== undefined && status < 400
      ? { code: 1 }
      : {
          code: 2,
          message: status === undefined ? "network_error" : "http_error",
        },
  );
  span.end();
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
