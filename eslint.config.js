// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const eslintConfigPrettier = require("eslint-config-prettier/flat");

module.exports = defineConfig([
  expoConfig,
  // Prettier 와 겹치는 포맷팅 규칙을 끕니다. 포맷팅은 Prettier(npm run format)가 담당합니다.
  eslintConfigPrettier,
  {
    ignores: ["dist/*", ".expo/*", "ios/*", "android/*"],
  },
]);
