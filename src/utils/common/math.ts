import katex from "katex";

// ================================
// Types
// ================================

/**
 * 수식이 섞인 글을 나눈 한 조각
 * - text: 일반 글
 * - math: `$...$` 안의 LaTeX (달러 기호는 뺀 것)
 */
export interface MathSegment {
  kind: "text" | "math";
  value: string;
}

/**
 * 수식 글을 그릴 때 쓰는 글자 모양 (디자인 토큰 값)
 * @param fontSize 글자 크기(px)
 * @param lineHeight 줄 높이(px)
 * @param letterSpacing 자간(px)
 * @param fontWeight 굵기 (400·500·600)
 * @param color 글자 색
 * @param align 글 정렬
 */
export interface MathTextStyle {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  fontWeight: number;
  color: string;
  align: "left" | "center";
}

// ================================
// Constants
// ================================

// 앱에 설치한 katex 와 같은 버전의 CSS·글꼴 (수식 HTML 은 앱에서 만들고, 모양만 CDN 에서 받음)
const KATEX_CSS_URL = `https://cdn.jsdelivr.net/npm/katex@${katex.version}/dist/katex.min.css`;
// 앱 글꼴(Pretendard)과 같은 글꼴로 일반 글을 그림
const PRETENDARD_CSS_URL = "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css";

// 두 번째 `$` 까지를 수식으로 봄. `$` 는 서버 규칙상 수식에만 쓰임
const MATH_PATTERN = /\$([^$]+)\$/g;

// ================================
// Functions
// ================================

/**
 * 글에 `$...$` 수식이 있는지
 * @param text 확인할 글
 */
export const hasMath = (text: string) => /\$[^$]+\$/.test(text);

/**
 * 글을 일반 글과 수식 조각으로 나눔. 짝이 없는 `$` 는 일반 글로 둠
 * @param text 나눌 글 (예: "일차방정식 $3x - 5 = 10$을 풀었을 때")
 */
export const splitMath = (text: string): MathSegment[] => {
  const segments: MathSegment[] = [];
  let last = 0;
  for (const match of text.matchAll(MATH_PATTERN)) {
    const start = match.index ?? 0;
    if (start > last) segments.push({ kind: "text", value: text.slice(last, start) });
    segments.push({ kind: "math", value: match[1] });
    last = start + match[0].length;
  }
  if (last < text.length) segments.push({ kind: "text", value: text.slice(last) });
  return segments;
};

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/\n/g, "<br>");

/**
 * 수식이 섞인 글을 WebView 에 그릴 HTML 문서로 만듦
 * 수식은 KaTeX 로 그리고(잘못된 LaTeX 는 빨간 원문으로 보여주고 멈추지 않음), 그려진 높이를 앱으로 보내 WebView 높이를 맞춤
 * @param text 수식이 섞인 글
 * @param style 글자 모양
 */
export const buildMathHtml = (text: string, style: MathTextStyle) => {
  const body = splitMath(text)
    .map((segment) => segment.kind === "math"
      // 글 속 수식이라도 분수·지수가 작아지지 않게 \displaystyle 크기로 그림 (작은 분수가 읽기 어렵다는 피드백)
      ? katex.renderToString(`\\displaystyle ${segment.value}`, { throwOnError: false, output: "html" })
      : escapeHtml(segment.value))
    .join("");

  return `<!doctype html>
<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<link rel="stylesheet" href="${KATEX_CSS_URL}">
<link rel="stylesheet" href="${PRETENDARD_CSS_URL}">
<style>
  html, body { margin: 0; padding: 0; background: transparent; -webkit-text-size-adjust: 100%; }
  body {
    font-family: Pretendard, -apple-system, sans-serif;
    font-size: ${style.fontSize}px; line-height: ${style.lineHeight}px; letter-spacing: ${style.letterSpacing}px;
    font-weight: ${style.fontWeight}; color: ${style.color}; text-align: ${style.align};
    word-break: keep-all; overflow-wrap: anywhere;
  }
  .katex { font-size: 1.05em; letter-spacing: 0; }
</style>
</head><body><div id="content">${body}</div>
<script>
  const content = document.getElementById("content");
  const post = () => window.ReactNativeWebView.postMessage(String(Math.ceil(content.getBoundingClientRect().height)));
  new ResizeObserver(post).observe(content);
  document.fonts.ready.then(post);
  post();
</script>
</body></html>`;
};
