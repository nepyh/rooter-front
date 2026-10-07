/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: require("./src/constants/palette"),
      spacing: {
        xxs: "2px",
        xs: "4px",
        s: "8px",
        m: "12px",
        l: "16px",
        xl: "20px",
        xxl: "32px",
      },
      borderRadius: {
        xxs: "4px",
        xs: "8px",
        sm: "12px",
        md: "16px",
        full: "9999px",
      },
      fontFamily: {
        regular: ["Pretendard-Regular"],
        medium: ["Pretendard-Medium"],
        semibold: ["Pretendard-SemiBold"],
      },
      fontSize: {
        "xs":   ["12px", { lineHeight: "14px", letterSpacing: "-0.12px" }],
        "sm":   ["15px", { lineHeight: "18px", letterSpacing: "-0.15px" }],
        "base": ["17px", { lineHeight: "20px", letterSpacing: "-0.17px" }],
        "m":    ["18px", { lineHeight: "22px", letterSpacing: "-0.18px" }],
        "lg":   ["19px", { lineHeight: "22px", letterSpacing: "-0.19px" }],
        "xl":   ["20px", { lineHeight: "24px", letterSpacing: "-0.20px" }],
        "2xl":  ["22px", { lineHeight: "28px", letterSpacing: "-0.22px" }],
        "3xl":  ["24px", { lineHeight: "30px", letterSpacing: "-0.24px" }],
        "4xl":  ["28px", { lineHeight: "34px", letterSpacing: "-0.28px" }],
        "5xl":  ["34px", { lineHeight: "42px", letterSpacing: "-0.34px" }],
      },
    },
  },
  plugins: [],
}
