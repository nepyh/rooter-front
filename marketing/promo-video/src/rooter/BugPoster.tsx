import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { AppIcon } from "./appIcons";
import { MascotLogoFace } from "./scenes/StoryScenes";
import { C, FONT } from "./theme";

// ================================
// 인스타 피드 포스터 (1080 x 1350, 4:5): 업데이트 중 + 버그 제보 안내
// ================================

const EMAIL = "qlalfql123@gmail.com";

const DmIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path fill="#fff" d="M21.4 2.6a1 1 0 0 0-1.05-.24l-17 6a1 1 0 0 0-.07 1.86l7.1 3.1 3.1 7.1a1 1 0 0 0 .92.6h.04a1 1 0 0 0 .9-.67l6-17a1 1 0 0 0-.24-1.05ZM14.1 17l-2.03-4.66 3.65-3.65a1 1 0 0 0-1.41-1.41l-3.65 3.65L6 8.9l12.37-4.37Z" />
  </svg>
);

const Row: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 28, padding: "26px 34px", borderRadius: 28, background: C.card }}>
    <div style={{ width: 76, height: 76, borderRadius: 22, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontSize: 30, fontWeight: 500, color: C.textSub }}>{label}</div>
      <div style={{ fontSize: 46, fontWeight: 600, letterSpacing: -1 }}>{value}</div>
    </div>
  </div>
);

export const BugPoster: React.FC = () => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.bg} 35%, ${C.warmBottom} 100%)`, fontFamily: FONT.body, color: C.white, overflow: "hidden" }}>
    <div style={{ position: "absolute", right: -160, top: -140, width: 760, height: 760, borderRadius: "50%", background: `radial-gradient(circle, ${C.primary}55 0%, transparent 65%)` }} />

    {/* 위: 로고 */}
    <div style={{ position: "absolute", left: 80, top: 80, display: "flex", alignItems: "center", gap: 16 }}>
      <MascotLogoFace size={72} eyes={1} mouth={1} />
      <div style={{ fontFamily: FONT.logo, fontSize: 52, color: C.primary, letterSpacing: -1 }}>Rooter</div>
    </div>

    {/* 문구 */}
    <div style={{ position: "absolute", left: 80, top: 210 }}>
      <div style={{ display: "inline-block", padding: "10px 26px", borderRadius: 999, background: C.primary, fontSize: 32, fontWeight: 600 }}>공지</div>
      <div style={{ marginTop: 28, fontFamily: FONT.logo, fontSize: 104, lineHeight: 1.18, letterSpacing: -3 }}>
        루터는 지금도
        <br />
        <span style={{ color: C.primary }}>업데이트 중!</span>
      </div>
      <div style={{ marginTop: 26, fontSize: 40, lineHeight: 1.45, color: C.textSub, letterSpacing: -1 }}>
        쓰다가 버그나 불편한 점을 발견하면
        <br />
        <span style={{ color: C.white, fontWeight: 600 }}>DM 또는 아래 연락처</span>로 알려 주세요
      </div>
    </div>

    {/* 버그 잡는 탐정 루티 */}
    <Img src={staticFile("ruti2/detective.png")} style={{ position: "absolute", right: 40, top: 300, width: 330, rotate: "8deg", filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.4))" }} />

    {/* 연락처 */}
    <div style={{ position: "absolute", left: 80, right: 80, top: 800, display: "flex", flexDirection: "column", gap: 24 }}>
      <Row icon={<DmIcon size={40} />} label="인스타그램" value="DM 보내기" />
      <Row icon={<AppIcon name="mail" size={40} color="#fff" />} label="이메일" value={EMAIL} />
    </div>

    <div style={{ position: "absolute", bottom: 46, width: "100%", textAlign: "center", fontSize: 28, color: C.textDim, letterSpacing: 1 }}>
      여러분의 제보가 루터를 더 좋게 만들어요 · BSSM Team Hyphen
    </div>
  </AbsoluteFill>
);
