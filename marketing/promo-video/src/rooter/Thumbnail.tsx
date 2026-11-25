import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { GrassScreen, HomeScreen, QuizScreen } from "./scenes/FeatureScenes";
import { MascotLogoFace } from "./scenes/StoryScenes";
import { C, FONT, LIGHT } from "./theme";
import { Phone } from "./ui";

// ================================
// 세로 홍보 영상 표지 (인스타, 1080 x 1920): 로고 + 한 줄 소개 + 실제 앱 화면 세 장
// 인스타 피드 격자에서는 가운데만 보이므로 로고·소개는 y 285 ~ 1635 안에 둠
// ================================

const PHONES = [
  { screen: <QuizScreen selected graded bubble={1} />, x: -250, y: 60, r: -12, z: 0 },
  { screen: <GrassScreen frame={200} />, x: 250, y: 60, r: 12, z: 0 },
  { screen: <HomeScreen still />, x: 0, y: 0, r: 0, z: 1 },
];

export const Thumbnail: React.FC = () => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.bg} 30%, ${C.warmBottom} 100%)`, fontFamily: FONT.body, color: C.white, overflow: "hidden" }}>
    {/* 로고 뒤 은은한 빛 */}
    <div style={{ position: "absolute", left: 540 - 600, top: 120, width: 1200, height: 900, borderRadius: "50%", background: `radial-gradient(ellipse, ${C.primary}40 0%, transparent 65%)` }} />

    {/* 로고 */}
    <div style={{ position: "absolute", top: 330, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <MascotLogoFace size={230} eyes={1} mouth={1} />
      <div style={{ marginTop: 18, fontFamily: FONT.logo, fontSize: 190, lineHeight: 1, letterSpacing: -6, color: C.primary }}>Rooter</div>
      <div style={{ marginTop: 40, fontSize: 56, fontWeight: 500, color: C.textSub, letterSpacing: -1.5 }}>
        중학생을 위한 <span style={{ color: C.white, fontWeight: 600 }}>AI 시험공부 플래너</span>
      </div>
    </div>

    {/* 실제 앱 화면 세 장 */}
    {PHONES.map((p, i) => (
      <div key={i} style={{ position: "absolute", top: 1010 + p.y, left: 540 + p.x, translate: "-50% 0", rotate: `${p.r}deg`, zIndex: p.z, filter: p.z ? undefined : "brightness(0.75)" }}>
        <Phone scale={0.8}>{p.screen}</Phone>
      </div>
    ))}
  </AbsoluteFill>
);

const Logo: React.FC<{ face: number; text: number; color?: string; row?: boolean }> = ({ face, text, color = C.primary, row }) => (
  <div style={{ display: "flex", flexDirection: row ? "row" : "column", alignItems: "center", gap: row ? face * 0.18 : 18 }}>
    <MascotLogoFace size={face} eyes={1} mouth={1} />
    <div style={{ fontFamily: FONT.logo, fontSize: text, lineHeight: 1, letterSpacing: -text * 0.03, color }}>Rooter</div>
  </div>
);

/** 2. 밝은 크림 바탕 + 가로 로고 + 큰 폰 하나 */
export const Thumbnail2: React.FC = () => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${LIGHT.bg} 40%, ${LIGHT.bg2} 100%)`, fontFamily: FONT.body, color: LIGHT.ink, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 540 - 560, top: 820, width: 1120, height: 1120, borderRadius: "50%", background: `radial-gradient(circle, ${C.primary}45 0%, transparent 65%)` }} />
    <div style={{ position: "absolute", top: 330, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Logo face={150} text={150} row />
      <div style={{ marginTop: 40, fontSize: 54, fontWeight: 600, letterSpacing: -1.5, color: LIGHT.sub }}>
        중학생을 위한 <span style={{ color: LIGHT.ink }}>AI 시험공부 플래너</span>
      </div>
    </div>
    <div style={{ position: "absolute", top: 760, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <Phone scale={1.1}>
        <HomeScreen still />
      </Phone>
    </div>
  </AbsoluteFill>
);

/** 3. 주황 바탕 + 흰 로고 + 폰 세 장 */
export const Thumbnail3: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 70% at 50% 35%, #FF6A4D 0%, ${C.primary} 55%, #C93A22 100%)`, fontFamily: FONT.body, color: C.white, overflow: "hidden" }}>
    <div style={{ position: "absolute", top: 330, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Logo face={220} text={190} color={C.white} />
      <div style={{ marginTop: 40, fontSize: 56, fontWeight: 600, letterSpacing: -1.5 }}>중학생을 위한 AI 시험공부 플래너</div>
    </div>
    {PHONES.map((p, i) => (
      <div key={i} style={{ position: "absolute", top: 1010 + p.y, left: 540 + p.x, translate: "-50% 0", rotate: `${p.r}deg`, zIndex: p.z, filter: "drop-shadow(0 30px 40px rgba(90,20,0,0.35))" }}>
        <Phone scale={0.8}>{p.screen}</Phone>
      </div>
    ))}
  </AbsoluteFill>
);

const FEATURES = ["AI 플랜", "시간표", "퀴즈", "AI 채팅", "공부 잔디"];

/** 4. 로고 + 기능 다섯 개 칩 + 폰 */
export const Thumbnail4: React.FC = () => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.bg} 30%, ${C.warmBottom} 100%)`, fontFamily: FONT.body, color: C.white, overflow: "hidden" }}>
    <div style={{ position: "absolute", top: 320, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Logo face={130} text={140} row />
      <div style={{ marginTop: 34, fontSize: 52, fontWeight: 500, color: C.textSub, letterSpacing: -1.5 }}>
        중학생을 위한 <span style={{ color: C.white, fontWeight: 600 }}>AI 시험공부 플래너</span>
      </div>
      <div style={{ marginTop: 46, width: 900, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 18 }}>
        {FEATURES.map((f) => (
          <div key={f} style={{ padding: "16px 34px", borderRadius: 999, background: C.card, border: `2px solid ${C.line}`, fontSize: 44, fontWeight: 600 }}>{f}</div>
        ))}
      </div>
    </div>
    <div style={{ position: "absolute", top: 960, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <Phone scale={1.0}>
        <HomeScreen still />
      </Phone>
    </div>
  </AbsoluteFill>
);

const FRIENDS = [
  { n: "detective", x: 60, y: 1010, w: 330, r: -8 },
  { n: "teacher", x: 690, y: 990, w: 340, r: 8 },
  { n: "ai-robot", x: 40, y: 1290, w: 340, r: -6 },
  { n: "fighting", x: 660, y: 1270, w: 380, r: 6 },
  { n: "model-student", x: 330, y: 1110, w: 440, r: 0 },
];

/** 5. 로고 + 루티 친구들 (캐릭터 중심) */
export const Thumbnail5: React.FC = () => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${LIGHT.bg} 45%, ${LIGHT.bg2} 100%)`, fontFamily: FONT.body, color: LIGHT.ink, overflow: "hidden" }}>
    <div style={{ position: "absolute", top: 330, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Logo face={200} text={180} />
      <div style={{ marginTop: 36, fontSize: 56, fontWeight: 600, letterSpacing: -1.5, color: LIGHT.sub }}>
        나만의 <span style={{ color: C.primary }}>시험공부 루틴</span> 플래너
      </div>
    </div>
    {FRIENDS.map((f) => (
      <Img key={f.n} src={staticFile(`ruti2/${f.n}.png`)} style={{ position: "absolute", left: f.x, top: f.y, width: f.w, rotate: `${f.r}deg`, filter: "drop-shadow(0 18px 24px rgba(120,60,40,0.25))" }} />
    ))}
  </AbsoluteFill>
);
