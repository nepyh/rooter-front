import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { MascotLogoFace } from "./scenes/StoryScenes";
import { C, FONT, LIGHT } from "./theme";

// ================================
// 노션 커버 배너 (1500 x 600)
// 피그마 '배너' 파일의 스티커 시안처럼 밝은 크림 바탕 + 검은 루티 한 명만 크게.
// 노션은 화면 폭에 따라 위아래(넓은 창)·양옆(좁은 창)을 잘라 보여 주므로
// 로고와 루티는 가운데(x 250 ~ 1250, y 150 ~ 450) 안에 모아 둠
// ================================

export const NotionBanner: React.FC = () => (
  <AbsoluteFill style={{ background: `linear-gradient(100deg, ${LIGHT.bg} 0%, ${LIGHT.bg} 45%, ${LIGHT.bg2} 100%)`, fontFamily: FONT.body, color: LIGHT.ink, overflow: "hidden" }}>
    {/* 루티 뒤 은은한 빛 */}
    <div style={{ position: "absolute", left: 1010 - 420, top: 300 - 420, width: 840, height: 840, borderRadius: "50%", background: `radial-gradient(circle, ${C.primary}2e 0%, transparent 62%)` }} />

    {/* 왼쪽: 로고 + 소개 */}
    <div style={{ position: "absolute", left: 300, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <MascotLogoFace size={104} eyes={1} mouth={1} />
        <div style={{ fontFamily: FONT.logo, fontSize: 118, lineHeight: 1, letterSpacing: -3.5, color: C.primary }}>Rooter</div>
      </div>
      <div style={{ marginTop: 26, fontSize: 34, fontWeight: 500, color: LIGHT.sub, letterSpacing: -1 }}>
        중학생을 위한 <span style={{ color: LIGHT.ink, fontWeight: 600 }}>AI 시험공부 플래너</span>
      </div>
    </div>

    {/* 오른쪽: 펜 타고 나는 루티 */}
    <Img src={staticFile("ruti2/fly-pen.png")} style={{ position: "absolute", left: 1010 - 190, top: 300 - 170, width: 380, rotate: "-6deg" }} />
  </AbsoluteFill>
);
