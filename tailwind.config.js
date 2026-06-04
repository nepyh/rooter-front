/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#FEEDEA",
          100: "#FCC6BE",
          200: "#FBAB9E",
          300: "#F98472",
          400: "#F86D57",
          500: "#F6482D",
          600: "#E04229",
          700: "#AF3320",
          800: "#872819",
          900: "#671E13",
        },
        secondary: {
          50: "#EAF0FE",
          100: "#BED1FC",
          200: "#9EBAFB",
          300: "#729BF9",
          400: "#5788F8",
          500: "#2D6AF6",
          600: "#2960E0",
          700: "#204BAF",
          800: "#193A87",
          900: "#132D67",
        },
        neutral: {
          0: "#FFFFFF",
          50: "#F5F6F8",
          100: "#E8EAEE",
          200: "#D1D5DB",
          300: "#B0B6C0",
          400: "#8A919E",
          500: "#6B7280",
          600: "#525866",
          700: "#3F4552",
          800: "#33363F",
          900: "#1F2228",
          1000: "#000000",
        },
        utility: {
          error: {
            primary: "#FF4D4F",
            secondary: "#FF7875",
            disabled: "#FFD6D6",
          },
          warning: {
            primary: "#FACC15",
            secondary: "#FDE047",
            disabled: "#FEF3C7",
          },
          success: {
            primary: "#22C55E",
            secondary: "#4ADE80",
            disabled: "#CFFFE1",
          },
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#C9CDD6",
          disabled: "#8B919E",
        },
        background: {
          primary: "#33363F",
        },
      },
      spacing: {
        xxs: "2px",
        xs: "4px",
        s: "8px",
        m: "12px",
        l: "16px",
        xl: "20px",
        xxl: "32px",
      },
      fontFamily: {
        regular: ["Pretendard-Regular"],
        medium: ["Pretendard-Medium"],
        semibold: ["Pretendard-SemiBold"],
      },
      fontSize: {
        "xs": ["12px", { lineHeight: "14px" }],
        "sm": ["15px", { lineHeight: "18px" }],
        "base": ["17px", { lineHeight: "20px" }],
        "m": ["18px", { lineHeight: "22px" }],
        "lg": ["19px", { lineHeight: "22px" }],
        "xl": ["20px", { lineHeight: "24px" }],
        "2xl": ["22px", { lineHeight: "28px" }],
        "3xl": ["24px", { lineHeight: "30px" }],
        "4xl": ["28px", { lineHeight: "34px" }],
        "5xl": ["34px", { lineHeight: "42px" }],
      },
    },
  },
  plugins: [],
}
