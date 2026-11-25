import React from "react";
import { loadFont } from "@remotion/fonts";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { MascotLogoFace } from "./scenes/StoryScenes";
import { C, FONT, LIGHT } from "./theme";

// ================================
// 노션 커버 배너 후보 (1500 x 600). 원본 NotionBanner.tsx 는 그대로 두고 여기서 비교용 후보를 만듦
// 1) 단색 바탕(검정·오렌지·베이지) × 각진 글자체 3종, 그라데이션·캐릭터 없음
// 2) 노션 콜라보 느낌: 노션 페이지 화면 안에 루터 공부 계획이 들어간 배너 (라이트·다크)
// ================================

loadFont({ family: "Russo One", url: staticFile("fonts/RussoOne-Regular.ttf") });
loadFont({ family: "Black Han Sans", url: staticFile("fonts/BlackHanSans-Regular.ttf") });
loadFont({ family: "Chakra Petch", url: staticFile("fonts/ChakraPetch-Bold.ttf"), weight: "700" });

type Bg = "dark" | "orange" | "beige";
type Face = "russo" | "blackhan" | "chakra";

const BG: Record<Bg, { bg: string; word: string; sub: string; strong: string }> = {
  dark: { bg: C.bg, word: C.primary, sub: C.textSub, strong: C.white },
  orange: { bg: C.primary, word: C.white, sub: "rgba(255,255,255,0.8)", strong: C.white },
  beige: { bg: LIGHT.bg, word: C.primary, sub: LIGHT.sub, strong: LIGHT.ink },
};

/** 글자체마다 크기·자간을 맞춰 Rooter 글자 폭이 비슷하게 보이도록 함 */
const FACE: Record<Face, { family: string; size: number; spacing: number; weight?: number }> = {
  russo: { family: "Russo One", size: 150, spacing: -2 },
  blackhan: { family: "Black Han Sans", size: 168, spacing: -3 },
  chakra: { family: "Chakra Petch", size: 168, spacing: -4, weight: 700 },
};

export type SolidProps = { bg: Bg; face: Face };

export const SolidBanner: React.FC<SolidProps> = ({ bg, face }) => {
  const t = BG[bg];
  const f = FACE[face];
  return (
    <AbsoluteFill style={{ background: t.bg, fontFamily: FONT.body, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: f.family, fontWeight: f.weight, fontSize: f.size, lineHeight: 1, letterSpacing: f.spacing, color: t.word }}>Rooter</div>
      <div style={{ marginTop: 26, fontSize: 34, fontWeight: 500, color: t.sub, letterSpacing: -1 }}>
        중학생을 위한 <span style={{ color: t.strong, fontWeight: 600 }}>AI 시험공부 플래너</span>
      </div>
    </AbsoluteFill>
  );
};

// ================================
// 노션 콜라보: 왼쪽 'Rooter × Notion', 오른쪽 노션 페이지처럼 생긴 카드에 루터 공부 계획
// 노션 기본 색(본문 #37352F, 회색 선)과 루터 오렌지를 섞음
// ================================

export type NotionProps = { mode: "light" | "dark" };

const N = {
  light: { bg: "#FFFFFF", page: "#FFFFFF", ink: "#37352F", sub: "#787774", line: "#E9E9E7", hover: "#F7F7F5", shadow: "0 18px 50px rgba(15,15,15,0.10), 0 0 0 1px rgba(15,15,15,0.06)" },
  dark: { bg: "#191919", page: "#202020", ink: "#E8E7E4", sub: "#9B9A97", line: "#2F2F2F", hover: "#2A2A2A", shadow: "0 18px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)" },
};

const Check: React.FC<{ done?: boolean; c: (typeof N)["light"] }> = ({ done, c }) => (
  <div style={{ width: 22, height: 22, borderRadius: 3, flexShrink: 0, border: done ? "none" : `2px solid ${c.sub}`, background: done ? C.primary : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
    {done && (
      <svg width={14} height={14} viewBox="0 0 14 14">
        <path d="M2.5 7.5l3 3 6-7" stroke="#fff" strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )}
  </div>
);

const Todo: React.FC<{ text: string; done?: boolean; c: (typeof N)["light"] }> = ({ text, done, c }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22 }}>
    <Check done={done} c={c} />
    <span style={{ color: done ? c.sub : c.ink, textDecoration: done ? "line-through" : undefined }}>{text}</span>
  </div>
);

export const NotionCollabBanner: React.FC<NotionProps> = ({ mode }) => {
  const c = N[mode];
  return (
    <AbsoluteFill style={{ background: c.bg, fontFamily: FONT.body, color: c.ink }}>
      {/* 왼쪽: Rooter × Notion */}
      <div style={{ position: "absolute", left: 170, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 22 }}>
          <div style={{ fontFamily: "Russo One", fontSize: 92, lineHeight: 1, letterSpacing: -2, color: C.primary }}>Rooter</div>
          <div style={{ fontSize: 48, fontWeight: 400, color: c.sub }}>×</div>
          <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 72, fontWeight: 700, lineHeight: 1, letterSpacing: -2, color: c.ink }}>Notion</div>
        </div>
        <div style={{ marginTop: 26, fontSize: 30, fontWeight: 500, color: c.sub, letterSpacing: -1 }}>
          시험공부 계획은 루터가, <span style={{ color: c.ink, fontWeight: 600 }}>기록은 노션에</span>
        </div>
      </div>

      {/* 오른쪽: 노션 페이지 카드 */}
      <div style={{ position: "absolute", left: 950, top: 115, width: 420, height: 370, borderRadius: 10, background: c.page, boxShadow: c.shadow, padding: "34px 34px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ width: 70, height: 70, borderRadius: 12, background: mode === "dark" ? "#F1F1EF" : "transparent", display: "flex", alignItems: "center", justifyContent: mode === "dark" ? "center" : "flex-start" }}>
          <MascotLogoFace size={58} eyes={1} mouth={1} />
        </div>
        <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: -1, marginTop: 2 }}>기말고사 플래너</div>
        <div style={{ display: "flex", gap: 10, fontSize: 19, color: c.sub }}>
          <span style={{ padding: "3px 10px", borderRadius: 4, background: `${C.primary}22`, color: C.primary, fontWeight: 600 }}>D-13</span>
          <span style={{ padding: "3px 10px", borderRadius: 4, background: c.hover }}>AI 추천 계획</span>
        </div>
        <div style={{ height: 1, background: c.line, margin: "4px 0" }} />
        <Todo text="수학 · 일차함수 개념 정리" done c={c} />
        <Todo text="영어 · Lesson 3 단어" done c={c} />
        <Todo text="과학 · 물질의 구성 요약" c={c} />
      </div>

      {/* 카드 모서리에 앉은 루티 */}
      <Img src={staticFile("ruti2/cheer-pose.png")} style={{ position: "absolute", left: 1290, top: 52, width: 150, rotate: "10deg", filter: mode === "dark" ? "drop-shadow(0 0 2px rgba(255,255,255,0.9)) drop-shadow(0 0 18px rgba(255,255,255,0.25))" : undefined }} />
    </AbsoluteFill>
  );
};

/** 후보 목록: id 는 Studio 컴포지션 이름이자 out/노션배너-후보/ 파일 이름 */
export const SOLID_CANDIDATES: { id: string; props: SolidProps }[] = [
  { id: "Banner01-Dark-Russo", props: { bg: "dark", face: "russo" } },
  { id: "Banner02-Dark-BlackHan", props: { bg: "dark", face: "blackhan" } },
  { id: "Banner03-Dark-Chakra", props: { bg: "dark", face: "chakra" } },
  { id: "Banner04-Orange-Russo", props: { bg: "orange", face: "russo" } },
  { id: "Banner05-Orange-BlackHan", props: { bg: "orange", face: "blackhan" } },
  { id: "Banner06-Orange-Chakra", props: { bg: "orange", face: "chakra" } },
  { id: "Banner07-Beige-Russo", props: { bg: "beige", face: "russo" } },
  { id: "Banner08-Beige-BlackHan", props: { bg: "beige", face: "blackhan" } },
  { id: "Banner09-Beige-Chakra", props: { bg: "beige", face: "chakra" } },
];

export const NOTION_CANDIDATES: { id: string; props: NotionProps }[] = [
  { id: "Banner10-Notion-Light", props: { mode: "light" } },
  { id: "Banner11-Notion-Dark", props: { mode: "dark" } },
];
