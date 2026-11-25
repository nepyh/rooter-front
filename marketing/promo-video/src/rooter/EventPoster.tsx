import React from "react";
import { AbsoluteFill } from "remotion";
import { MascotLogoFace } from "./scenes/StoryScenes";
import { C, FONT } from "./theme";

// ================================
// 인스타 피드 포스터 (1080 x 1350, 4:5): 설치 + 회원가입 인증 → 굿즈 룰렛 이벤트
// 굿즈 실물이 제때 안 올 수 있어 종류는 밝히지 않고 '굿즈'로만, 룰렛 나머지 칸은 '간식'
// ================================

/** 룰렛 판: 굿즈·간식 번갈아 8칸, 가운데 루터 얼굴, 위에 화살표 */
const Roulette: React.FC<{ size: number }> = ({ size }) => {
  const n = 8;
  const r = 100;
  const seg = (i: number) => {
    const a0 = ((i / n) * 360 - 90 - 360 / n / 2) * (Math.PI / 180);
    const a1 = (((i + 1) / n) * 360 - 90 - 360 / n / 2) * (Math.PI / 180);
    return `M0 0 L${r * Math.cos(a0)} ${r * Math.sin(a0)} A${r} ${r} 0 0 1 ${r * Math.cos(a1)} ${r * Math.sin(a1)} Z`;
  };
  return (
    <div style={{ position: "relative", width: size, height: size + 40 }}>
      <svg width={size} height={size} viewBox="-110 -110 220 220" style={{ position: "absolute", top: 40, rotate: "12deg", filter: "drop-shadow(0 24px 40px rgba(0,0,0,0.45))" }}>
        <circle r={108} fill="#FFF6EF" />
        {Array.from({ length: n }).map((_, i) => {
          const goods = i % 2 === 0;
          const mid = ((i / n) * 360 - 90) * (Math.PI / 180);
          return (
            <g key={i}>
              <path d={seg(i)} fill={goods ? C.primary : "#FFE4D8"} stroke="#FFF6EF" strokeWidth={2} />
              <text
                x={64 * Math.cos(mid)}
                y={64 * Math.sin(mid)}
                fill={goods ? "#fff" : C.ink}
                fontSize={15}
                fontWeight={600}
                fontFamily={FONT.body}
                textAnchor="middle"
                dominantBaseline="central"
                transform={`rotate(${(i / n) * 360} ${64 * Math.cos(mid)} ${64 * Math.sin(mid)})`}
              >
                {goods ? "굿즈" : "간식"}
              </text>
            </g>
          );
        })}
        <circle r={30} fill="#FFF6EF" />
      </svg>
      {/* 가운데 얼굴 (판과 같이 돌지 않게 따로 얹음) */}
      <div style={{ position: "absolute", left: size / 2 - size * 0.11, top: 40 + size / 2 - size * 0.11, width: size * 0.22, height: size * 0.22, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <MascotLogoFace size={size * 0.2} eyes={1} mouth={1} />
      </div>
      {/* 위 화살표 */}
      <svg width={56} height={64} viewBox="0 0 56 64" style={{ position: "absolute", left: size / 2 - 28, top: 6, filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.35))" }}>
        <path d="M28 62 L4 14 A26 26 0 1 1 52 14 Z" fill={C.ink} stroke="#fff" strokeWidth={4} strokeLinejoin="round" />
        <circle cx={28} cy={22} r={8} fill={C.primary} />
      </svg>
    </div>
  );
};

const Step: React.FC<{ no: number; title: string; desc: React.ReactNode }> = ({ no, title, desc }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 26, padding: "22px 32px", borderRadius: 26, background: C.card }}>
    <div style={{ width: 64, height: 64, borderRadius: 20, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 600, flexShrink: 0 }}>{no}</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontSize: 38, fontWeight: 600, letterSpacing: -1 }}>{title}</div>
      <div style={{ fontSize: 27, fontWeight: 500, color: C.textSub, letterSpacing: -0.5, lineHeight: 1.35 }}>{desc}</div>
    </div>
  </div>
);

const Base: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.bg} 35%, ${C.warmBottom} 100%)`, fontFamily: FONT.body, color: C.white, overflow: "hidden" }}>
    <div style={{ position: "absolute", right: -200, top: -120, width: 820, height: 820, borderRadius: "50%", background: `radial-gradient(circle, ${C.primary}55 0%, transparent 65%)` }} />
    {children}
  </AbsoluteFill>
);

const Logo: React.FC = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
    <MascotLogoFace size={72} eyes={1} mouth={1} />
    <div style={{ fontFamily: FONT.logo, fontSize: 52, color: C.primary, letterSpacing: -1 }}>Rooter</div>
  </div>
);

/** EVENT 태그 + 제목 + 설명 두 줄 */
const Copy: React.FC<{ size: number }> = ({ size }) => (
  <>
    <div style={{ display: "inline-block", padding: "10px 26px", borderRadius: 999, background: C.primary, fontSize: 32, fontWeight: 600 }}>EVENT</div>
    <div style={{ marginTop: 26, fontFamily: FONT.logo, fontSize: size, lineHeight: 1.2, letterSpacing: -3 }}>
      루터 깔고
      <br />
      <span style={{ color: C.primary }}>굿즈 룰렛</span>
      <br />
      돌리자!
    </div>
    <div style={{ marginTop: 24, fontSize: 36, lineHeight: 1.45, color: C.textSub, letterSpacing: -1 }}>
      회원가입 인증하면 <span style={{ color: C.white, fontWeight: 600 }}>굿즈 룰렛 기회!</span>
      <br />혹시 기회를 놓쳐도 <span style={{ color: C.white, fontWeight: 600 }}>간식</span>을 드려요
    </div>
  </>
);

const Steps: React.FC = () => (
  <>
    <Step no={1} title="루터 설치하기" desc={<><span style={{ color: C.white }}>iOS</span> 앱스토어 · <span style={{ color: C.white }}>안드로이드</span> 원스토어에서 '루터' 검색</>} />
    <Step no={2} title="회원가입 인증하기" desc={<>현장에서 가입 화면 보여주기, 또는 <span style={{ color: C.white }}>DM으로 캡처</span> 보내기</>} />
    <Step no={3} title="현장에서 룰렛 돌리기" desc="DM으로 인증했어도 현장에 와야 받을 수 있어요" />
  </>
);

const DateLine: React.FC = () => (
  <>
    <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5 }}>
      <span style={{ color: C.primary }}>11.26 (목)</span> 전공동아리 최종발표회
    </div>
    <div style={{ fontSize: 26, color: C.textDim }}>수량 소진 시 종료</div>
  </>
);

/** 피드 1080 x 1350 */
export const EventPoster: React.FC = () => (
  <Base>
    <div style={{ position: "absolute", left: 80, top: 80 }}><Logo /></div>
    <div style={{ position: "absolute", left: 80, top: 210 }}><Copy size={92} /></div>
    <div style={{ position: "absolute", right: 60, top: 200 }}><Roulette size={380} /></div>
    <div style={{ position: "absolute", left: 80, right: 80, top: 792, display: "flex", flexDirection: "column", gap: 16 }}><Steps /></div>
    <div style={{ position: "absolute", bottom: 50, left: 80, right: 80, display: "flex", justifyContent: "space-between", alignItems: "center" }}><DateLine /></div>
  </Base>
);

/** 스토리 1080 x 1920 (위 250·아래 340px는 인스타 UI 자리라 비움) */
export const EventStory: React.FC = () => (
  <Base>
    <div style={{ position: "absolute", left: 80, top: 250 }}><Logo /></div>
    <div style={{ position: "absolute", left: 80, top: 380 }}><Copy size={100} /></div>
    <div style={{ position: "absolute", right: 50, top: 360 }}><Roulette size={400} /></div>
    <div style={{ position: "absolute", left: 80, right: 80, top: 1020, display: "flex", flexDirection: "column", gap: 18 }}><Steps /></div>
    <div style={{ position: "absolute", top: 1500, left: 80, right: 80, display: "flex", justifyContent: "space-between", alignItems: "center" }}><DateLine /></div>
  </Base>
);
