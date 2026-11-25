import React from "react";
import { AppIcon, type AppIconName } from "./appIcons";

// ================================
// 루터 앱(rooter-front) 디자인을 그대로 옮긴 화면 조각
// 색·글자 크기·간격·모서리는 rooter-front/src/constants/token/* 값 그대로
// 좌표는 폰 화면(402 x 874) 기준. 위쪽 안전 영역 62, 아래쪽 34, 좌우 여백 24
// ================================

export const A = {
  primary: "#F6482D",
  primary30: "#F6482D4D",
  secondary: "#2D6AF6",
  bg: "#33363F", // neutral-800, background-primary
  n900: "#1F2228",
  n700: "#3F4552",
  n600: "#525866",
  n500: "#6B7280",
  n400: "#8A919E",
  text: "#FFFFFF",
  textSub: "#C9CDD6",
  textDim: "#8B919E",
  success: "#22C55E",
  success30: "#22C55E4D",
  error: "#FF4D4F",
  muted: "#FFFFFF99", // 일정 블록 안 보조 글자
  chatBottom: "#3F3333",
};

export const SAFE_TOP = 62;
export const SAFE_BOTTOM = 874 - 34;
export const PAD = 24;
export const CONTENT_W = 402 - PAD * 2;

/** 앱 글자 크기 (font-size.ts): [크기, 줄높이] */
const SIZES = {
  "title-medium": [28, 34, 600],
  "title-small": [24, 30, 600],
  "header-large": [22, 28, 600],
  "header-medium": [20, 24, 600],
  "header-small": [18, 22, 600],
  "base-large": [19, 22, 400],
  "base-medium": [17, 20, 400],
  "base-small": [15, 18, 400],
  "base-caption": [12, 14, 400],
} as const;

export type Variant = keyof typeof SIZES;
const WEIGHTS = { regular: 400, medium: 500, semibold: 600 } as const;

/** 앱의 Text 컴포넌트와 같은 사용법 */
export const T: React.FC<{
  v?: Variant;
  w?: keyof typeof WEIGHTS;
  color?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ v = "base-medium", w, color = A.text, style, children }) => {
  const [size, line, weight] = SIZES[v];
  return (
    <div style={{ fontSize: size, lineHeight: `${line}px`, letterSpacing: -size * 0.01, fontWeight: w ? WEIGHTS[w] : weight, color, whiteSpace: "pre-line", ...style }}>
      {children}
    </div>
  );
};

export const Icon: React.FC<{ name: AppIconName; size?: number; color?: string; style?: React.CSSProperties }> = (p) => <AppIcon {...p} />;

/** 앱 화면 본문 (안전 영역 + 좌우 24 여백) */
export const Page: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: "absolute", top: SAFE_TOP, left: PAD, width: CONTENT_W, bottom: 874 - SAFE_BOTTOM, display: "flex", flexDirection: "column", ...style }}>{children}</div>
);

/** home/common/BackHeader */
export const BackHeader: React.FC<{ title?: string; right?: React.ReactNode }> = ({ title, right }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 16, flexShrink: 0 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Icon name="chevronLeft" size={28} />
      {title ? <T v="header-medium" color={A.textSub}>{title}</T> : null}
    </div>
    {right}
  </div>
);

/** home/common/PageTitle */
export const PageTitle: React.FC<{ title: string; description: string; style?: React.CSSProperties }> = ({ title, description, style }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, ...style }}>
    <T v="title-medium">{title}</T>
    <T color={A.textSub}>{description}</T>
  </div>
);

/** home/common/NextButton: 높이 64, 모서리 16 */
export const NextButton: React.FC<{ label?: string; disabled?: boolean }> = ({ label = "다음", disabled }) => (
  <div style={{ height: 64, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", background: disabled ? A.n700 : A.primary, flexShrink: 0, marginBottom: 20 }}>
    <T w="medium">{label}</T>
  </div>
);

/** ui/Button: 위아래 20, 모서리 12 (비활성일 때도 글자는 흰색) */
export const Button: React.FC<{ children: React.ReactNode; disabled?: boolean }> = ({ children, disabled }) => (
  <div style={{ padding: "20px 0", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: disabled ? A.n700 : A.primary, flexShrink: 0 }}>
    <T w="medium">{children}</T>
  </div>
);

/** 마스코트 얼굴 (앱 아이콘 mascotFace) */
export const MascotFace: React.FC<{ size: number }> = ({ size }) => <Icon name="mascotFace" size={size} />;

/** layout/NavBar */
const TABS: { label: string; icon: AppIconName }[] = [
  { label: "홈", icon: "home" },
  { label: "할일", icon: "checklist" },
  { label: "퀴즈", icon: "quiz" },
  { label: "캘린더", icon: "calendar" },
  { label: "더보기", icon: "menu" },
];

export const NavBar: React.FC<{ active: string }> = ({ active }) => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, display: "flex", gap: 4, padding: "8px 20px 32px", borderTop: `1px solid ${A.n600}`, background: A.bg }}>
    {TABS.map((t) => (
      <div key={t.label} style={{ flex: 1, height: 62, padding: "8px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <Icon name={t.icon} size={24} color={t.label === active ? "#FFFFFF" : "#8A919E"} />
        <T v="base-small" color={t.label === active ? A.text : A.textDim}>{t.label}</T>
      </div>
    ))}
  </div>
);

/** ui/LoadingScreen 의 회전 아이콘 (0.9초에 한 바퀴) */
export const LoadingSpinner: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{ rotate: `${(frame / 27) * 360}deg` }}>
    <Icon name="loading" size={60} color={A.primary} />
  </div>
);
