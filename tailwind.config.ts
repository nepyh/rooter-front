import type { Config } from "tailwindcss";

import { color } from "./src/constants/token/color";
import { fontFamily } from "./src/constants/token/font-family";
import { fontSize } from "./src/constants/token/font-size";
import { radius } from "./src/constants/token/radius";
import { spacing } from "./src/constants/token/spacing";

export default {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: color,
      spacing,
      borderRadius: radius,
      fontFamily,
      fontSize,
    },
  },
  plugins: [],
} satisfies Config;
