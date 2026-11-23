import { useState } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import { Text } from "../ui/Text";
import { fontSize } from "@/constants/token/font-size";
import { color } from "@/constants/token/color";
import { buildMathHtml, hasMath } from "@/utils/common/math";

// ================================
// Types
// ================================

type Variant = "title-medium" | "base-large";
type Align = "left" | "center";

// ================================
// Styles
// ================================

// Text 의 같은 variant 와 같은 크기·굵기 (Text.tsx variantStyles)
const variantFonts: Record<Variant, { size: keyof typeof fontSize; weight: number }> = {
  "title-medium": { size: "4xl", weight: 600 },
  "base-large": { size: "lg", weight: 400 },
};

const alignClassNames: Record<Align, string> = {
  "left": "text-left",
  "center": "text-center",
};

// ================================
// Components
// ================================

interface Props {
  text: string;
  variant?: Variant;
  align?: Align;
  className?: string;
}

/**
 * 글 안의 `$...$` 부분만 KaTeX 수식으로 그리고 나머지는 일반 글로 보여주는 글
 * 수식이 없으면 지금까지처럼 Text 로 그리고, 있으면 글 전체를 WebView 에 그려 그려진 높이에 맞춰 늘어남
 * WebView 는 터치를 받지 않아서, 보기처럼 눌러야 하는 곳 안에 넣어도 누름이 바깥으로 전달됨
 * @param text 보여줄 글 (예: "일차방정식 $3x - 5 = 10$을 풀었을 때 $x$의 값은?")
 * @param variant 글자 모양, Text 의 같은 이름과 같은 크기·굵기
 * @param align 글 정렬
 */
export function MathText({ text, variant = "base-large", align = "left", className = "" }: Props) {
  const [height, setHeight] = useState(0);

  if (!hasMath(text)) {
    return <Text variant={variant} className={`${alignClassNames[align]} ${className}`}>{text}</Text>;
  }

  const { size, weight } = variantFonts[variant];
  const [px, { lineHeight, letterSpacing }] = fontSize[size];
  const html = buildMathHtml(text, {
    fontSize: parseFloat(px),
    lineHeight: parseFloat(lineHeight),
    letterSpacing: parseFloat(letterSpacing),
    fontWeight: weight,
    color: color.text.primary,
    align,
  });

  return (
    // 높이를 받기 전에는 한 줄 높이로 자리만 잡고 숨겨서, 그려지는 중간 모습이 보이지 않게 함
    <View pointerEvents="none" className={`w-full ${className}`} style={{ height: height || parseFloat(lineHeight), opacity: height ? 1 : 0 }}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        onMessage={(e) => setHeight(Number(e.nativeEvent.data) || 0)}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={{ backgroundColor: "transparent" }}
      />
    </View>
  );
}
