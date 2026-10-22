import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { validateExport } from "../scripts/upload-sourcemaps.mjs";

test("소스맵 누락·Debug ID 불일치를 업로드 전에 거부한다", () => {
  const directory = mkdtempSync(join(tmpdir(), "rooter-sourcemaps-"));
  try {
    assert.throws(() => validateExport(directory), /웹 번들/);
    writeFileSync(join(directory, "app.js"), "const x=1");
    assert.throws(() => validateExport(directory), /소스맵이 없는/);
    writeFileSync(join(directory, "app.js.map"), "{}");
    assert.throws(() => validateExport(directory), /유효한 Debug ID/);
    const debugId = "12345678-1234-1234-1234-123456789abc";
    writeFileSync(
      join(directory, "app.js.map"),
      JSON.stringify({ debug_id: debugId }),
    );
    assert.throws(() => validateExport(directory), /Debug ID가 다릅니다/);
    writeFileSync(join(directory, "app.js"), `const debugId='${debugId}'`);
    assert.equal(validateExport(directory), 1);
  } finally {
    rmSync(directory, { recursive: true });
  }
});

test("명시적 업로드에서 설정이 누락되면 성공으로 처리하지 않는다", () => {
  const result = spawnSync(
    process.execPath,
    ["scripts/upload-sourcemaps.mjs"],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        SENTRY_AUTH_TOKEN: "",
        SENTRY_ORG: "",
        SENTRY_PROJECT: "",
      },
    },
  );
  assert.equal(result.status, 1);
  assert.match(result.stderr, /SENTRY_AUTH_TOKEN/);
});

test("업로더의 인증·네트워크 실패를 배포 성공으로 처리하지 않는다", () => {
  const directory = mkdtempSync(join(tmpdir(), "rooter-upload-failure-"));
  try {
    mkdirSync(join(directory, "dist"));
    const debugId = "12345678-1234-1234-1234-123456789abc";
    writeFileSync(join(directory, "dist/app.js"), `const debugId='${debugId}'`);
    writeFileSync(
      join(directory, "dist/app.js.map"),
      JSON.stringify({ debug_id: debugId }),
    );
    const cli = join(directory, "failing-cli");
    writeFileSync(cli, "#!/bin/sh\nexit 42\n", { mode: 0o700 });
    const result = spawnSync(
      process.execPath,
      [resolve("scripts/upload-sourcemaps.mjs")],
      {
        cwd: directory,
        encoding: "utf8",
        env: {
          ...process.env,
          SENTRY_AUTH_TOKEN: "test-only",
          SENTRY_ORG: "test",
          SENTRY_PROJECT: "test",
          SENTRY_URL: "https://example.invalid/",
          SENTRY_CLI_EXECUTABLE: cli,
          EXPO_PUBLIC_SENTRY_DSN: "https://public@example.invalid/1",
          EXPO_PUBLIC_SENTRY_ENVIRONMENT: "test",
          EXPO_PUBLIC_SENTRY_RELEASE: "test@sha",
        },
      },
    );
    assert.equal(result.status, 1);
    assert.match(result.stderr, /업로드에 실패/);
  } finally {
    rmSync(directory, { recursive: true });
  }
});
