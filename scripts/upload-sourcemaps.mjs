import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);

function filesIn(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesIn(path) : [path];
  });
}

export function validateExport(directory) {
  const files = filesIn(directory);
  const bundles = files.filter((file) => file.endsWith(".js"));
  if (!bundles.length)
    throw new Error(
      "웹 번들이 없습니다. npm run export:web을 먼저 실행하세요.",
    );
  for (const bundle of bundles) {
    if (!files.includes(`${bundle}.map`))
      throw new Error("소스맵이 없는 번들이 있습니다.");
    const map = JSON.parse(readFileSync(`${bundle}.map`, "utf8"));
    const debugId = map.debug_id || map.debugId;
    if (!debugId || !/^[0-9a-f-]{36}$/i.test(debugId))
      throw new Error("소스맵에 유효한 Debug ID가 없습니다.");
    if (map.debugId && map.debug_id && map.debugId !== map.debug_id)
      throw new Error("소스맵의 Debug ID가 서로 다릅니다.");
    const code = readFileSync(bundle, "utf8");
    if (!code.includes(debugId))
      throw new Error("번들과 소스맵의 Debug ID가 다릅니다.");
  }
  return bundles.length;
}

function main() {
  const validateOnly = process.argv.includes("--validate-only");
  if (!validateOnly) {
    const required = [
      "SENTRY_AUTH_TOKEN",
      "SENTRY_ORG",
      "SENTRY_PROJECT",
      "EXPO_PUBLIC_SENTRY_DSN",
      "EXPO_PUBLIC_SENTRY_ENVIRONMENT",
      "EXPO_PUBLIC_SENTRY_RELEASE",
    ];
    const missing = required.filter((key) => !process.env[key]?.trim());
    if (missing.length)
      throw new Error(`소스맵 업로드 설정이 없습니다: ${missing.join(", ")}`);
  }
  const count = validateExport("dist");
  console.log(`웹 번들 ${count}개의 소스맵과 Debug ID가 일치합니다.`);
  if (validateOnly) return;
  const upload =
    require.resolve("@sentry/react-native/scripts/expo-upload-sourcemaps.js");
  const result = spawnSync(process.execPath, [upload, "dist"], {
    stdio: "inherit",
    env: {
      ...process.env,
      SENTRY_URL: process.env.SENTRY_URL || "https://sentry.io/",
      SENTRY_ALLOW_FAILURE: "false",
    },
  });
  if (result.error || result.status !== 0)
    throw new Error("Sentry 소스맵 업로드에 실패했습니다. 배포를 중단하세요.");
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
