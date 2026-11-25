import React from "react";
import { loadFont } from "@remotion/fonts";
import { AbsoluteFill, staticFile } from "remotion";
import { MascotLogoFace } from "./scenes/StoryScenes";
import { C, FONT } from "./theme";

// ================================
// 노션 커버 배너 (2400 x 440, 노션 커버가 실제로 보이는 5~6:1 띠 비율)
// 흰 바탕 + 옅은 격자, 왼쪽 굵은 헤드라인(형광펜 블록) + 아래 로고·소개 줄, 오른쪽 컬러 타일 글자판
// 타일 색은 앱 과목 색(src/constants/category.ts)을 옅게 씀
// ================================

loadFont({ family: "Black Han Sans", url: staticFile("fonts/BlackHanSans-Regular.ttf") });
loadFont({ family: "Pretendard", url: staticFile("fonts/Pretendard-ExtraBold.otf"), weight: "800" });

export const GRID_W = 2400;
export const GRID_H = 440;
const ROW = GRID_H / 3;
const COLS = 6;
const TILE_LEFT = GRID_W - COLS * ROW;

export type GridBannerProps = { mode: "light" | "dark" };

const PAL = {
  sky: "#ADD3FF",
  yellow: "#FFE252",
  peach: "#FFB4A3",
  pink: "#FFA8D6",
  green: "#B6EFA6",
  orange: C.primary,
};

const THEME = {
  light: { bg: "#FFFFFF", ink: "#1E2028", sub: "#8B919E", line: "#EDEEF1", blank: "#FFFFFF" },
  dark: { bg: "#191919", ink: "#F3F3F1", sub: "#8B8B88", line: "#262626", blank: "#191919" },
};

/** 오른쪽 글자판: 3줄 x 6칸. 글자 없는 칸은 색만, face 는 루터 얼굴 */
type Tile = { ch?: string; bg?: keyof typeof PAL; face?: boolean };
const TILES: Tile[][] = [
  [{ ch: "R", bg: "sky" }, { ch: "O" }, { ch: "O", bg: "yellow" }, { ch: "T" }, { ch: "E", bg: "pink" }, { ch: "R", bg: "peach" }],
  [{ bg: "peach" }, { ch: "S" }, { ch: "T", bg: "green" }, { ch: "U" }, { ch: "D", bg: "sky" }, { ch: "Y" }],
  [{ bg: "yellow" }, { face: true }, { bg: "pink" }, { bg: "sky" }, {}, { bg: "orange" }],
];

const Mark: React.FC<{ children: React.ReactNode; bg: string }> = ({ children, bg }) => (
  <span style={{ background: bg, padding: "4px 16px 0", margin: "0 6px 0 0", letterSpacing: 0 }}>{children}</span>
);

export const NotionBannerGrid: React.FC<GridBannerProps> = ({ mode }) => {
  const t = THEME[mode];
  return (
    <AbsoluteFill style={{ background: t.bg, color: t.ink, fontFamily: FONT.body, overflow: "hidden" }}>
      {/* 옅은 격자 */}
      {Array.from({ length: Math.ceil(TILE_LEFT / ROW) }).map((_, i) => (
        <div key={`v${i}`} style={{ position: "absolute", left: i * ROW, top: 0, bottom: 0, width: 2, background: t.line }} />
      ))}
      {[1, 2].map((i) => (
        <div key={`h${i}`} style={{ position: "absolute", top: i * ROW, left: 0, right: 0, height: 2, background: t.line }} />
      ))}

      {/* 헤드라인 (위 두 줄 칸) */}
      <div style={{ position: "absolute", left: 120, top: 0, height: ROW * 2, display: "flex", alignItems: "center" }}>
        <div style={{ fontFamily: "Black Han Sans", fontSize: 150, lineHeight: 1, letterSpacing: -2, whiteSpace: "nowrap", color: mode === "dark" ? t.ink : t.ink }}>
          <Mark bg={PAL.yellow}>
            <span style={{ color: "#1E2028" }}>시험공부</span>
          </Mark>
          , <Mark bg={PAL.peach}>
            <span style={{ color: "#1E2028" }}>루터</span>
          </Mark>
          로 끝<span style={{ color: PAL.orange }}>.</span>
                  </div>
      </div>

      {/* 아래 줄: 로고 · 소개 · 기능 */}
      <div style={{ position: "absolute", left: 120, top: ROW * 2, height: ROW, right: GRID_W - TILE_LEFT + 60, display: "flex", alignItems: "center", gap: 44, whiteSpace: "nowrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <MascotLogoFace size={66} eyes={1} mouth={1} />
          <div style={{ fontFamily: "Black Han Sans", fontSize: 62, lineHeight: 1, letterSpacing: -1 }}>Rooter</div>
        </div>
        <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1.2 }}>중학생을 위한 AI 시험공부 플래너.</div>
        <div style={{ fontSize: 22, fontWeight: 500, color: t.sub, letterSpacing: 2 }}>PLAN · QUIZ · FEEDBACK · STREAK</div>
      </div>

      {/* 오른쪽 글자판 */}
      {TILES.map((row, r) =>
        row.map((tile, c) => (
          <div
            key={`${r}-${c}`}
            style={{
              position: "absolute",
              left: TILE_LEFT + c * ROW,
              top: r * ROW,
              width: ROW,
              height: ROW,
              background: tile.bg ? PAL[tile.bg] : t.blank,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Black Han Sans",
              fontSize: 118,
              lineHeight: 1,
              color: tile.bg ? "#1E2028" : t.ink,
            }}
          >
            {tile.face ? <MascotLogoFace size={ROW * 0.62} eyes={1} mouth={1} /> : tile.ch}
          </div>
        )),
      )}
    </AbsoluteFill>
  );
};
