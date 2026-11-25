import React from "react";
import { loadFont } from "@remotion/fonts";
import { AbsoluteFill, staticFile } from "remotion";
import { AppIcon } from "./appIcons";
import { HomeScreen } from "./scenes/FeatureScenes";
import { C, FONT } from "./theme";
import { Phone } from "./ui";

// ================================
// 노션 커버 배너 (1500 x 600): 피그마 '배너' 파일의 'A배너'(A4, 3:6)를 가로로 줄인 버전
// 왼쪽 작은 소개 + 아주 두꺼운 '루터', 오른쪽 실제 일정 화면 폰 + 비스듬히 떠 있는 과목 카드
// ================================

loadFont({ family: "Pretendard", url: staticFile("fonts/Pretendard-ExtraBold.otf"), weight: "800" });
loadFont({ family: "Pretendard", url: staticFile("fonts/Pretendard-Black.otf"), weight: "900" });

export type A4BannerProps = { bg: "gradient" | "dark" | "orange" };

const BGS: Record<A4BannerProps["bg"], { bg: string; sub: string }> = {
  // A배너 그대로: 위 남색 → 아래 따뜻한 갈색
  gradient: { bg: `linear-gradient(180deg, ${C.bg} 20%, ${C.warmBottom} 130%)`, sub: C.textSub },
  dark: { bg: C.bg, sub: C.textSub },
  orange: { bg: C.primary, sub: "rgba(255,255,255,0.85)" },
};

/** A배너 왼쪽에 떠 있는 과목 카드 (홈 타임라인 블록을 크게 뗀 모양) */
export const SubjectCard: React.FC<{ title: string; bar: string; task: string; time: string; x: number; y: number; r: number; z?: number }> = ({ title, bar, task, time, x, y, r, z = 0 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 300,
      rotate: `${r}deg`,
      zIndex: z,
      display: "flex",
      gap: 14,
      padding: "16px 18px",
      borderRadius: 10,
      background: `linear-gradient(${bar}38, ${bar}38), #3A3E48`,
      boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
    }}
  >
    <div style={{ width: 6, borderRadius: 99, background: bar, flexShrink: 0 }} />
    <div style={{ display: "flex", flexDirection: "column", gap: 8, color: C.white }}>
      <div style={{ fontSize: 26, fontWeight: 600 }}>{title}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 19, color: "#D5D8DF", whiteSpace: "nowrap" }}>
        <AppIcon name="book" size={20} color="#D5D8DF" /> {task}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 19, color: "#D5D8DF", whiteSpace: "nowrap" }}>
        <AppIcon name="history" size={20} color="#D5D8DF" /> {time}
      </div>
    </div>
  </div>
);

export const NotionBannerA4: React.FC<A4BannerProps> = ({ bg }) => {
  const t = BGS[bg];
  return (
    <AbsoluteFill style={{ background: t.bg, fontFamily: FONT.body, color: C.white, overflow: "hidden" }}>
      {/* 왼쪽: 소개 + 루터 */}
      <div style={{ position: "absolute", left: 200, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: 36, fontWeight: 500, color: t.sub, letterSpacing: -1 }}>AI를 이용한 시험공부 계획 앱</div>
        <div style={{ marginTop: 6, fontSize: 210, fontWeight: 900, lineHeight: 1.05, letterSpacing: -8 }}>루터</div>
      </div>

      {/* 과목 카드: 폰 뒤로 살짝 숨음 */}
      <SubjectCard title="사회" bar="#ADD3FF" task="교과서 | p.8 ~ p.10" time="24:00 - 00:30" x={770} y={100} r={-8} />
      <SubjectCard title="수학" bar="#FF5252" task="교과서 | p.30 ~ p.48" time="17:30 - 19:30" x={735} y={262} r={-6} />
      <SubjectCard title="과학" bar="#FFE252" task="교과서 | p.22 ~ p.37" time="22:00 - 24:00" x={690} y={430} r={-4} />

      {/* 실제 일정 화면 폰 (아래는 잘림) */}
      <div style={{ position: "absolute", left: 930, top: 70, zIndex: 1 }}>
        <Phone scale={0.84}>
          <HomeScreen still />
        </Phone>
      </div>
    </AbsoluteFill>
  );
};

export const A4_BANNERS: { id: string; props: A4BannerProps }[] = [
  { id: "BannerA4-1-Gradient", props: { bg: "gradient" } },
  { id: "BannerA4-2-Dark", props: { bg: "dark" } },
  { id: "BannerA4-3-Orange", props: { bg: "orange" } },
];
