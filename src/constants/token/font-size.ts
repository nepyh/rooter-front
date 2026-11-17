type FontSize = [string, { lineHeight: string; letterSpacing: string }];

// satisfies 로 키 이름("lg" 등)을 타입에 남겨, getFontStyleWithoutLineHeight 같은 곳에 오타를 넣으면 타입 오류가 나게 함
export const fontSize = {
  "xs": ["12px", { lineHeight: "14px", letterSpacing: "-0.12px" }],
  "sm": ["15px", { lineHeight: "18px", letterSpacing: "-0.15px" }],
  "base": ["17px", { lineHeight: "20px", letterSpacing: "-0.17px" }],
  "m": ["18px", { lineHeight: "22px", letterSpacing: "-0.18px" }],
  "lg": ["19px", { lineHeight: "22px", letterSpacing: "-0.19px" }],
  "xl": ["20px", { lineHeight: "24px", letterSpacing: "-0.20px" }],
  "2xl": ["22px", { lineHeight: "28px", letterSpacing: "-0.22px" }],
  "3xl": ["24px", { lineHeight: "30px", letterSpacing: "-0.24px" }],
  "4xl": ["28px", { lineHeight: "34px", letterSpacing: "-0.28px" }],
  "5xl": ["34px", { lineHeight: "42px", letterSpacing: "-0.34px" }],
} satisfies Record<string, FontSize>;
