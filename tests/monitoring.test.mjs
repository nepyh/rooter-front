import assert from "node:assert/strict";
import test from "node:test";
import {
  apiFailureMetadata,
  apiSpanName,
  parseTracesSampleRate,
  sanitizeErrorEvent,
  sanitizeTransactionEvent,
  screenSpanName,
} from "../src/lib/monitoring-policy.ts";

const failure = (status, extra = {}) => ({
  isAxiosError: true,
  response: status ? { status } : undefined,
  config: {
    method: "post",
    headers: { Authorization: "secret" },
    data: "private body",
  },
  ...extra,
});

test("5xx와 네트워크 장애만 본문 없이 분류한다", () => {
  assert.deepEqual(apiFailureMetadata(failure(503)), {
    status: "503",
    method: "POST",
    code: "API_ERROR",
  });
  assert.deepEqual(apiFailureMetadata(failure(undefined)), {
    status: "network",
    method: "POST",
    code: "API_ERROR",
  });
  for (const status of [200, 400, 401, 403, 404, 409, 422, 429])
    assert.equal(apiFailureMetadata(failure(status)), null);
  assert.equal(
    apiFailureMetadata(failure(undefined, { code: "ERR_CANCELED" })),
    null,
  );
  assert.equal(apiFailureMetadata(new Error("secret")), null);
});

test("요청, 사용자, 자유 입력, 첨부파일과 스택 변수는 전송하지 않는다", () => {
  const hint = { attachments: [{ filename: "private.txt", data: "secret" }] };
  const event = sanitizeErrorEvent(
    {
      event_id: "event",
      release: "rooter@sha",
      environment: "staging",
      message: "secret",
      request: { headers: { Authorization: "secret" }, data: "secret" },
      user: { email: "secret@example.com" },
      extra: { password: "secret" },
      breadcrumbs: [{ message: "secret" }],
      contexts: { custom: { content: "secret" } },
      transaction: "/users/secret",
      tags: { private: "secret" },
      exception: {
        values: [
          {
            type: "secret",
            value: "secret",
            mechanism: {
              type: "generic",
              handled: false,
              data: { secret: "secret" },
            },
            stacktrace: {
              frames: [
                {
                  filename:
                    "https://secret@site.test/app.js?token=secret#secret",
                  function: "render",
                  lineno: 10,
                  colno: 20,
                  vars: { secret: "secret" },
                  pre_context: ["secret"],
                  context_line: "secret",
                },
              ],
            },
          },
        ],
      },
      debug_meta: {
        images: [
          {
            type: "sourcemap",
            debug_id: "debug-id",
            code_file: "https://site.test/app.js?secret",
          },
        ],
      },
    },
    hint,
  );
  assert.equal(JSON.stringify(event).includes("secret"), false);
  assert.equal(
    event.exception.values[0].stacktrace.frames[0].filename,
    "https://site.test/app.js",
  );
  assert.equal(event.exception.values[0].stacktrace.frames[0].lineno, 10);
  assert.equal(event.debug_meta.images[0].debug_id, "debug-id");
  assert.deepEqual(hint.attachments, []);
});

test("Axios 원본이 다시 unhandled 오류로 올라와도 중복 전송하지 않는다", () => {
  assert.equal(
    sanitizeErrorEvent({}, { originalException: failure(500) }),
    null,
  );
  assert.equal(
    sanitizeErrorEvent({}, { originalException: failure(401) }),
    null,
  );
});

test("API 태그도 허용된 값만 보존한다", () => {
  const event = sanitizeErrorEvent(
    {
      tags: {
        error_source: "api",
        http_status: "503",
        http_method: "POST",
        secret: "secret",
      },
    },
    {},
  );
  assert.deepEqual(event.tags, {
    error_source: "api",
    http_status: "503",
    http_method: "POST",
    error_code: "API_ERROR",
  });
});

test("표준 에러 종류와 네트워크 오류 코드를 보존한다", () => {
  assert.equal(
    sanitizeErrorEvent(
      { exception: { values: [{ type: "TypeError", value: "secret" }] } },
      {},
    ).exception.values[0].type,
    "TypeError",
  );
  assert.equal(
    apiFailureMetadata(failure(undefined, { code: "ECONNABORTED" })).code,
    "ECONNABORTED",
  );
});

test("성능 추적 샘플링 비율은 0~1, 비었거나 이상하면 0", () => {
  assert.equal(parseTracesSampleRate(undefined), 0);
  assert.equal(parseTracesSampleRate(""), 0);
  assert.equal(parseTracesSampleRate("abc"), 0);
  assert.equal(parseTracesSampleRate("0.5"), 0.5);
  assert.equal(parseTracesSampleRate("3"), 1);
  assert.equal(parseTracesSampleRate("-1"), 0);
});

test("API span 이름은 id·날짜·쿼리·호스트를 뺀 경로 모양만", () => {
  assert.equal(
    apiSpanName("get", "/users/12/streak"),
    "GET /users/{id}/streak",
  );
  assert.equal(
    apiSpanName("get", "/calendar/2026-11-18?token=secret"),
    "GET /calendar/{date}",
  );
  assert.equal(
    apiSpanName(
      "post",
      "https://user:pw@api.test/api/plan-tasks/7/quiz/submit#x",
    ),
    "POST /api/plan-tasks/{id}/quiz/submit",
  );
  assert.equal(
    apiSpanName("get", "/school/search?name=비밀중학교"),
    "GET /school/search",
  );
  assert.equal(apiSpanName("get", "/users/secret@example.com"), null);
  assert.equal(apiSpanName("trace", "/users"), null);
  assert.equal(apiSpanName(undefined, "/users"), null);
});

test("화면 이름은 expo-router 경로 모양만", () => {
  assert.equal(screenSpanName("/Home/Home"), "/Home/Home");
  assert.equal(screenSpanName("/users/secret@example.com"), null);
  assert.equal(screenSpanName(undefined), null);
});

test("성능 트랜잭션은 화면 이름·API 경로 모양·시간만 남긴다", () => {
  const event = sanitizeTransactionEvent({
    type: "transaction",
    event_id: "event",
    transaction: "/Home/Home",
    start_timestamp: 1,
    timestamp: 2,
    release: "rooter@sha",
    environment: "loadtest",
    request: { url: "https://secret", headers: { Authorization: "secret" } },
    user: { email: "secret@example.com" },
    tags: { private: "secret" },
    extra: { secret: "secret" },
    breadcrumbs: [{ message: "secret" }],
    contexts: {
      trace: {
        trace_id: "t",
        span_id: "s",
        op: "navigation",
        status: "ok",
        data: { secret: "secret" },
      },
      device: { name: "secret phone" },
    },
    spans: [
      {
        span_id: "a",
        trace_id: "t",
        parent_span_id: "s",
        op: "http.client",
        description: "GET /plan-tasks",
        start_timestamp: 1,
        timestamp: 1.5,
        status: "ok",
        data: { url: "https://secret?token=secret" },
      },
      {
        span_id: "b",
        trace_id: "t",
        parent_span_id: "s",
        op: "http.client",
        description: "GET /users/secret@example.com",
        start_timestamp: 1,
        timestamp: 1.5,
      },
      {
        span_id: "c",
        trace_id: "t",
        parent_span_id: "s",
        op: "ui.render",
        description: "secret",
        start_timestamp: 1,
        timestamp: 1.5,
      },
    ],
  });
  assert.equal(event.transaction, "/Home/Home");
  assert.deepEqual(
    event.spans.map((span) => span.description),
    ["GET /plan-tasks"],
  );
  assert.deepEqual(event.spans[0].data, {});
  assert.deepEqual(Object.keys(event.contexts), ["trace"]);
  assert.equal(event.contexts.trace.data, undefined);
  const json = JSON.stringify(event);
  assert.ok(!json.includes("secret"), json);
  assert.equal(
    sanitizeTransactionEvent({
      transaction: "/users/secret@example.com",
      contexts: { trace: {} },
    }),
    null,
  );
});
