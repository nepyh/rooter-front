import React from "react";
import { AbsoluteFill } from "remotion";
import { SubjectCard } from "./NotionBannerA4";
import { HomeScreen } from "./scenes/FeatureScenes";
import { C, FONT } from "./theme";
import { Phone } from "./ui";

// ================================
// 노션 커버 배너 (2400 x 400 = 노션 커버가 실제로 보이는 6:1 띠)
// BannerA4-1-Gradient(A배너 축소판)를 넓게 편 버전. 로고는 한글 '루터'
// 폰은 아래가 잘리고, 과목 카드는 폰 양옆으로 흩어 둠
// 굵은 Pretendard(800·900)는 NotionBannerA4.tsx 에서 불러옴
// ================================

export const WIDE_W = 2400;
export const WIDE_H = 400;

export type WideProps = { word: string };

export const NotionBannerWide: React.FC<WideProps> = ({ word }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.bg} 10%, ${C.warmBottom} 150%)`, fontFamily: FONT.body, color: C.white, overflow: "hidden" }}>
    {/* 왼쪽: 소개 + 루터 */}
    <div style={{ position: "absolute", left: 180, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ fontSize: 32, fontWeight: 500, color: C.textSub, letterSpacing: -0.8 }}>AI를 이용한 시험공부 계획 앱</div>
      <div style={{ marginTop: 4, fontSize: 200, fontWeight: 900, lineHeight: 1.05, letterSpacing: -8 }}>{word}</div>
    </div>

    {/* 과목 카드: 폰 왼쪽 둘, 오른쪽 둘 */}
    <SubjectCard title="사회" bar="#ADD3FF" task="교과서 | p.8 ~ p.10" time="24:00 - 00:30" x={1100} y={36} r={-8} />
    <SubjectCard title="수학" bar="#FF5252" task="교과서 | p.30 ~ p.48" time="17:30 - 19:30" x={1060} y={200} r={-5} />
    <SubjectCard title="과학" bar="#FFE252" task="교과서 | p.22 ~ p.37" time="22:00 - 24:00" x={1700} y={56} r={6} z={2} />
    <SubjectCard title="영어" bar="#5283FF" task="Lesson 3 | 단어 외우기" time="20:30 - 21:30" x={1750} y={228} r={4} z={2} />

    {/* 실제 일정 화면 폰 (아래는 잘림) */}
    <div style={{ position: "absolute", left: 1350, top: 44, zIndex: 1 }}>
      <Phone scale={0.84}>
        <HomeScreen still scroll={-170} />
      </Phone>
    </div>
  </AbsoluteFill>
);

export const WIDE_BANNERS: { id: string; props: WideProps }[] = [
  { id: "BannerWide", props: { word: "루터" } },
];
