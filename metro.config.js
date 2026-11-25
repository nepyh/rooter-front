const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const { withNativeWind } = require("nativewind/metro");

const config = getSentryExpoConfig(__dirname, {
  includeWebReplay: false,
  includeWebFeedback: false,
  injectReleaseForWeb: false,
});

// 홍보물(marketing/: 홍보영상·디지털 명함)은 앱 번들에서 제외
const block = config.resolver.blockList;
config.resolver.blockList = [
  ...(Array.isArray(block) ? block : block ? [block] : []),
  /[/\\]marketing[/\\].*/,
];

module.exports = withNativeWind(config, { input: "./global.css" });
