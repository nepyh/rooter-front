import React from "react";
import { AbsoluteFill } from "remotion";
import { HomeScreen } from "./scenes/FeatureScenes";
import { QrCode } from "./scenes/Horizontal";
import { MascotLogoFace } from "./scenes/StoryScenes";
import { C, FONT } from "./theme";
import { Phone } from "./ui";

// ================================
// 인스타 피드 포스터 (1080 x 1350, 4:5): 안드로이드(원스토어) 출시 안내
// ================================

export const ONESTORE_URL = "https://m.onestore.co.kr/v2/ko-kr/app/0001012751";

const AndroidIcon: React.FC<{ size: number; color?: string }> = ({ size, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      fill={color}
      d="M17.6 9.48l1.84-3.18a.38.38 0 0 0-.66-.38l-1.86 3.22A11.4 11.4 0 0 0 12 8.1c-1.77 0-3.42.38-4.92 1.04L5.22 5.92a.38.38 0 0 0-.66.38L6.4 9.48A10.8 10.8 0 0 0 1 18h22a10.8 10.8 0 0 0-5.4-8.52ZM7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z"
    />
  </svg>
);

export const AndroidPoster: React.FC = () => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.bg} 35%, ${C.warmBottom} 100%)`, fontFamily: FONT.body, color: C.white, overflow: "hidden" }}>
    <div style={{ position: "absolute", right: -160, top: -140, width: 760, height: 760, borderRadius: "50%", background: `radial-gradient(circle, ${C.primary}55 0%, transparent 65%)` }} />

    {/* 위: 로고 */}
    <div style={{ position: "absolute", left: 80, top: 80, display: "flex", alignItems: "center", gap: 16 }}>
      <MascotLogoFace size={72} eyes={1} mouth={1} />
      <div style={{ fontFamily: FONT.logo, fontSize: 52, color: C.primary, letterSpacing: -1 }}>Rooter</div>
    </div>

    {/* 문구 */}
    <div style={{ position: "absolute", left: 80, top: 210 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 26px 10px 20px", borderRadius: 999, background: C.primary, fontSize: 32, fontWeight: 600 }}>
        <AndroidIcon size={36} />
        안드로이드 출시
      </div>
      <div style={{ marginTop: 28, fontFamily: FONT.logo, fontSize: 104, lineHeight: 1.18, letterSpacing: -3 }}>
        이제 갤럭시에서도
        <br />
        <span style={{ color: C.primary }}>루터랑 공부해요!</span>
      </div>
      <div style={{ marginTop: 26, fontSize: 40, lineHeight: 1.45, color: C.textSub, letterSpacing: -1 }}>
        기다려 주신 안드로이드 버전,
        <br />
        <span style={{ color: C.white, fontWeight: 600 }}>원스토어</span>에서 지금 바로 받아 보세요
      </div>
    </div>

    {/* 왼쪽 아래: 실제 앱 화면 (아래가 잘리게) */}
    <div style={{ position: "absolute", left: 70, top: 790, rotate: "-6deg" }}>
      <Phone scale={0.92}>
        <HomeScreen still />
      </Phone>
    </div>

    {/* 오른쪽 아래: 원스토어 QR */}
    <div
      style={{
        position: "absolute",
        right: 80,
        top: 760,
        width: 470,
        padding: "36px 0 32px",
        borderRadius: 40,
        background: C.card,
        boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 22,
      }}
    >
      <div style={{ padding: 14, borderRadius: 24, background: "#fff" }}>
        <QrCode url={ONESTORE_URL} size={270} />
      </div>
      <div style={{ fontSize: 42, fontWeight: 600, letterSpacing: -1 }}>
        찍고 <span style={{ color: C.primary }}>바로 받기</span>
      </div>
      <div style={{ fontSize: 28, color: C.textSub, marginTop: -10 }}>원스토어에서 &apos;루터&apos; 검색</div>
    </div>

    <div style={{ position: "absolute", bottom: 40, right: 80, width: 470, textAlign: "center", fontSize: 26, color: C.textDim, letterSpacing: 1 }}>
      BSSM Team Hyphen
    </div>
  </AbsoluteFill>
);
