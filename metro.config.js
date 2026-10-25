const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const { withNativeWind } = require("nativewind/metro");

const config = getSentryExpoConfig(__dirname, {
  includeWebReplay: false,
  includeWebFeedback: false,
  injectReleaseForWeb: false,
});

module.exports = withNativeWind(config, { input: "./global.css" });
