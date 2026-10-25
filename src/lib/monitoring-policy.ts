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
