import assert from "node:assert/strict";
import test from "node:test";
import {
  apiFailureMetadata,
  sanitizeErrorEvent,
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
