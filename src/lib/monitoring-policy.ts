import type { ErrorEvent, ReactNativeOptions } from "@sentry/react-native";

type EventHint = Parameters<NonNullable<ReactNativeOptions["beforeSend"]>>[1];
const ERROR_TYPES = new Set([
  "Error",
  "TypeError",
  "ReferenceError",
  "SyntaxError",
  "RangeError",
  "URIError",
  "EvalError",
  "AggregateError",
]);
const API_CODES = new Set([
  "ERR_NETWORK",
  "ECONNABORTED",
  "ETIMEDOUT",
  "ERR_BAD_RESPONSE",
]);

interface ApiFailure {
  isAxiosError?: boolean;
  code?: string;
  response?: { status?: number };
  config?: { method?: string };
}

function isApiFailure(error: unknown): error is ApiFailure {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    error.isAxiosError === true
  );
}

/** 요청 본문·URL·헤더 대신 상태 코드와 HTTP 메서드만 수집합니다. */
export function apiFailureMetadata(error: unknown) {
  if (!isApiFailure(error) || error.code === "ERR_CANCELED") return null;
  const status = error.response?.status;
  if (status !== undefined && (status < 500 || status > 599)) return null;
  const method = error.config?.method?.toUpperCase();
  return {
    status: status === undefined ? "network" : String(status),
    code: error.code && API_CODES.has(error.code) ? error.code : "API_ERROR",
    method:
      method && /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)$/.test(method)
        ? method
        : "UNKNOWN",
  };
}

function safeCodeUrl(value?: string) {
  if (!value) return value;
  return value.split(/[?#]/, 1)[0].replace(/(https?:\/\/)[^/]*@/, "$1");
}

/** 자유 입력·계정 정보는 버리고 소스맵에 필요한 스택 위치만 보존합니다. */
export function sanitizeErrorEvent(
  event: ErrorEvent,
  hint: EventHint,
): ErrorEvent | null {
  // Axios 원본은 인터셉터에서 정제한 오류로 따로 수집합니다.
  if (isApiFailure(hint.originalException)) return null;
  hint.attachments = [];
  return {
    type: undefined,
    event_id: event.event_id,
    timestamp: event.timestamp,
    platform: event.platform,
    level: event.level,
    release: event.release,
    environment: event.environment,
    sdk: event.sdk,
    exception: {
      values: event.exception?.values?.map((exception) => ({
        type:
          exception.type && ERROR_TYPES.has(exception.type)
            ? exception.type
            : "Error",
        value:
          event.tags?.error_source === "api"
            ? "API request failed"
            : "Application error",
        mechanism: exception.mechanism && {
          type: exception.mechanism.type,
          handled: exception.mechanism.handled,
        },
        stacktrace: exception.stacktrace && {
          frames: exception.stacktrace.frames?.map((frame) => ({
            filename: safeCodeUrl(frame.filename),
            abs_path: safeCodeUrl(frame.abs_path),
            function: frame.function,
            lineno: frame.lineno,
            colno: frame.colno,
            in_app: frame.in_app,
          })),
        },
      })),
    },
    debug_meta: event.debug_meta && {
      images: event.debug_meta.images
        ?.filter((image) => image.type === "sourcemap")
        .map((image) => ({
          type: "sourcemap",
          debug_id: image.debug_id,
          code_file: safeCodeUrl(image.code_file) || image.code_file,
        })),
    },
    tags:
      event.tags?.error_source === "api"
        ? {
            error_source: "api",
            error_code: API_CODES.has(String(event.tags.error_code))
              ? event.tags.error_code
              : "API_ERROR",
            http_status: /^(5\d\d|network)$/.test(
              String(event.tags.http_status),
            )
              ? event.tags.http_status
              : "unknown",
            http_method:
              /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|UNKNOWN)$/.test(
                String(event.tags.http_method),
              )
                ? event.tags.http_method
                : "UNKNOWN",
          }
        : undefined,
  };
}

// ================================
// Performance tracing
// ================================

const HTTP_METHODS = /^(GET|POST|PUT|PATCH|DELETE|HEAD)$/;
const SCREEN_NAME = /^\/[A-Za-z0-9/]{0,100}$/;
const API_SPAN_NAME =
  /^(GET|POST|PUT|PATCH|DELETE|HEAD) \/[A-Za-z0-9_./{}-]{0,200}$/;
const SPAN_OPS = new Set(["http.client"]);
const MAX_SPANS = 200;

/**
 * 샘플링 비율 환경변수를 0~1 사이 숫자로. 비었거나 숫자가 아니면 0 (= 성능 추적 끔)
 * @param value EXPO_PUBLIC_SENTRY_TRACES_SAMPLE_RATE
 */
export function parseTracesSampleRate(value?: string) {
  const rate = Number(value);
  if (!value || !Number.isFinite(rate)) return 0;
  return Math.min(1, Math.max(0, rate));
}

/**
 * API 요청 span 이름. 주소의 id·날짜·쿼리는 빼고 경로 모양만 남깁니다.
 * 예: get, "/users/12/streak?x=1" → "GET /users/{id}/streak"
 * @param method HTTP 메서드
 * @param url axios 요청 주소 (baseURL 을 뺀 경로든 전체 주소든)
 * @returns span 이름, 모양이 이상하면 null
 */
export function apiSpanName(method?: string, url?: string) {
  const upper = method?.toUpperCase();
  if (!upper || !HTTP_METHODS.test(upper) || !url) return null;
  const path = url
    .replace(/^[a-z]+:\/\/[^/]*/i, "")
    .split(/[?#]/, 1)[0]
    .split("/")
    .map((segment) =>
      /^\d+$/.test(segment)
        ? "{id}"
        : /^\d{4}-\d{2}-\d{2}$/.test(segment)
          ? "{date}"
          : segment,
    )
    .join("/");
  const name = `${upper} ${path.startsWith("/") ? path : `/${path}`}`;
  return API_SPAN_NAME.test(name) ? name : null;
}

/**
 * 화면 트랜잭션 이름. expo-router 경로(예: /Home/Home)만 허용합니다.
 * @param pathname usePathname() 값
 */
export function screenSpanName(pathname?: string) {
  return pathname && SCREEN_NAME.test(pathname) ? pathname : null;
}

type TransactionEvent = Parameters<
  NonNullable<ReactNativeOptions["beforeSendTransaction"]>
>[0];

/**
 * 성능 트랜잭션에서 화면 이름·API 경로 모양·시간만 남기고 나머지(요청·사용자·태그·기기 정보)는 버립니다.
 * 이름이 허용 모양이 아니면 통째로 버립니다.
 */
export function sanitizeTransactionEvent(
  event: TransactionEvent,
): TransactionEvent | null {
  const name = screenSpanName(event.transaction);
  if (!name) return null;
  const trace = event.contexts?.trace;
  if (!trace) return null;
  return {
    type: "transaction",
    event_id: event.event_id,
    transaction: name,
    transaction_info: { source: "route" },
    start_timestamp: event.start_timestamp,
    timestamp: event.timestamp,
    platform: event.platform,
    release: event.release,
    environment: event.environment,
    sdk: event.sdk,
    contexts: {
      trace: {
        trace_id: trace.trace_id,
        span_id: trace.span_id,
        op: "navigation",
        status: trace.status,
      },
    },
    spans: (event.spans ?? [])
      .filter(
        (span) =>
          span.op !== undefined &&
          SPAN_OPS.has(span.op) &&
          API_SPAN_NAME.test(span.description ?? ""),
      )
      .slice(0, MAX_SPANS)
      .map((span) => ({
        span_id: span.span_id,
        trace_id: span.trace_id,
        parent_span_id: span.parent_span_id,
        op: span.op,
        description: span.description,
        start_timestamp: span.start_timestamp,
        timestamp: span.timestamp,
        status: span.status,
        origin: "manual",
        data: {},
      })),
  };
}
