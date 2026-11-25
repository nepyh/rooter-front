import React, { createContext, useContext } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useVideoConfig } from "remotion";
import { useBeatPulse, useExit, useFrame } from "./beat";
import { MascotFace } from "./mascots";
import { C, FONT, LIGHT, clamp, ease, pop } from "./theme";

// ================================
// 영상 레이아웃: 세로(1080 x 1920) / 가로(1920 x 1080)
// ================================

/** 지금 그리는 영상이 세로("v")인지 가로("h")인지. 같은 장면 코드를 두 영상이 함께 씀 */
export const LayoutCtx = createContext<"v" | "h">("v");
export const useLayout = () => useContext(LayoutCtx);

/** 앱 다크 톤 배경. Figma 퀴즈 결과 화면의 #33363F → #55393B 그라데이션 */
export const DarkBg: React.FC<{ children?: React.ReactNode; flip?: boolean }> = ({ children, flip }) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(${flip ? "0deg" : "180deg"}, ${C.bg} 35%, ${C.warmBottom} 100%)`,
      fontFamily: FONT.body,
      color: C.white,
      isolation: "isolate",
      overflow: "hidden",
    }}
  >
    {children}
  </AbsoluteFill>
);

/** 은은한 primary 빛. 비트마다 살짝 밝아짐 */
export const BeatGlow: React.FC<{ top: number; size?: number; strength?: number; left?: number }> = ({ top, size = 1100, strength = 0.22, left }) => {
  const beat = useBeatPulse(5);
  return (
    <div
      style={{
        position: "absolute",
        left: (left ?? 540) - size / 2,
        top: top - size / 2,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${C.primary} 0%, transparent 65%)`,
        opacity: strength + beat * 0.08,
      }}
    />
  );
};

export const Hl: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ color: C.primary }}>{children}</span>
);

/** 기능 장면: 상단 STEP 뱃지 + 자막, 아래 폰 */
export const FeatureScene: React.FC<{
  step: string;
  caption: React.ReactNode;
  captionB?: React.ReactNode;
  switchAt?: number;
  ruti?: RutiProps;
  /** 폰 위에 얹을 추가 스티커·말풍선 */
  extras?: React.ReactNode;
  /** 가로 영상용: 폰 위치, 설명 줄, 가로 화면용 스티커 */
  h?: HFeatureProps;
  children: React.ReactNode;
}> = ({ step, caption, captionB, switchAt = 9999, ruti, extras, h, children }) => {
  const frame = useFrame();
  const { fps } = useVideoConfig();
  const layout = useLayout();
  const phoneIn = ease(frame, fps, 4);
  if (layout === "h" && h) {
    return (
      <HFeature step={step} switchAt={switchAt} {...h}>
        {children}
      </HFeature>
    );
  }
  return (
    <DarkBg>
      <BeatGlow top={1150} />
      <Caption step={step} a={caption} b={captionB} switchAt={switchAt} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 480,
          display: "flex",
          justifyContent: "center",
          translate: `0px ${interpolate(phoneIn, [0, 1], [500, 0])}px`,
        }}
      >
        <Phone>{children}</Phone>
      </div>
      {ruti ? <Ruti {...ruti} /> : null}
      {extras}
    </DarkBg>
  );
};

export type HPoint = {
  text: string;
  /** 폰 화면(402 x 874) 안에서 가리킬 곳 */
  x: number;
  y: number;
  /** 나타나는 시점 (장면 단위) */
  at: number;
};

export type HFeatureProps = {
  /** 가로 영상 전용 자막 (세로와 다른 문구) */
  caption: React.ReactNode;
  captionB?: React.ReactNode;
  /** STEP 옆에 붙는 기능 이름 (예: "AI 계획") */
  label?: string;
  /** 오른쪽 설명 카드. 폰 화면의 해당 부분을 선으로 가리킴 */
  points: HPoint[];
  /** 왼쪽 아래 캐릭터 (public/ruti2) */
  ruti?: string;
};

// 가로(부스) 기능 장면의 폰 위치: 화면 가운데 고정. 장면이 바뀌어도 폰은 그대로, 앱 화면만 바뀜
const HP_SCALE = 1.04;
const HP_W = 402 * HP_SCALE + 32;
const HP_LEFT = 960 - HP_W / 2;
const HP_TOP = 70;
const toGlobal = (x: number, y: number) => ({ x: HP_LEFT + 16 + x * HP_SCALE, y: HP_TOP + 16 + y * HP_SCALE });
const CARD_X = 1300;
const cardTop = (i: number) => 250 + i * 200;

/** 가로(부스) 기능 장면: 가운데 큰 폰으로 실제 사용을 보여 주고, 왼쪽엔 시각 + 자막, 오른쪽엔 화면을 가리키는 설명 카드 */
const HFeature: React.FC<HFeatureProps & { step: string; switchAt: number; children: React.ReactNode }> = ({ caption, captionB, points, ruti, label, step, switchAt, children }) => {
  const frame = useFrame();
  const { fps } = useVideoConfig();
  const head = ease(frame, fps, 0);
  const inA = pop(frame, fps, 4, 14);
  const outA = captionB ? interpolate(frame, [switchAt, switchAt + 8], [0, 1], clamp) : 0;
  const toB = captionB ? ease(frame, fps, switchAt + 8) : 0;
  const exit = useExit(4, 8);
  const capLine = (content: React.ReactNode, p: number, out: number) => (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        fontWeight: 600,
        fontSize: 64,
        lineHeight: 1.25,
        whiteSpace: "nowrap",
        letterSpacing: -2.5,
        color: LIGHT.ink,
        opacity: p * (1 - out),
        translate: `0px ${(1 - p) * 50 - out * 30}px`,
      }}
    >
      {content}
    </div>
  );
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 90% at 50% 50%, ${LIGHT.bg} 30%, ${LIGHT.bg2} 100%)`, fontFamily: FONT.body, color: LIGHT.ink, isolation: "isolate", overflow: "hidden" }}>
      {/* 폰 뒤 주황 빛 */}
      <div style={{ position: "absolute", left: 960 - 520, top: 20, width: 1040, height: 1040, borderRadius: "50%", background: `radial-gradient(circle, ${C.primary}38 0%, ${C.primary}0D 55%, transparent 70%)` }} />

      {/* 왼쪽: STEP + 자막 */}
      <div style={{ position: "absolute", left: 130, top: 370, display: "flex", opacity: head * (1 - exit), translate: `0px ${(1 - head) * -20}px` }}>
        <div style={{ padding: "10px 26px", borderRadius: 999, background: C.primary, color: C.white, fontSize: 34, fontWeight: 600, letterSpacing: 1 }}>
          {step}
          {label ? <span style={{ opacity: 0.85 }}>{`  ·  ${label}`}</span> : null}
        </div>
      </div>

      {/* 왼쪽 위: 언제 보더라도 무슨 앱인지 알 수 있게 로고 */}
      <div style={{ position: "absolute", left: 70, top: 56, display: "flex", alignItems: "center", gap: 14 }}>
        <MascotFace size={64} />
        <div style={{ fontFamily: FONT.logo, fontSize: 44, color: C.primary, letterSpacing: -1 }}>Rooter</div>
        <div style={{ marginLeft: 8, fontSize: 28, fontWeight: 500, color: LIGHT.sub }}>중학생을 위한 AI 시험공부 플래너</div>
      </div>
      <div style={{ position: "absolute", left: 130, top: 470, width: 600, height: 220, opacity: 1 - exit }}>
        {capLine(caption, inA, outA)}
        {captionB ? capLine(captionB, toB, 0) : null}
      </div>
      {ruti ? <Ruti name={ruti} x={150} y={640} w={250} rotate={-6} delay={10} from="bottom" /> : null}

      {/* 가운데: 폰 (고정) */}
      <div style={{ position: "absolute", top: HP_TOP, left: HP_LEFT }}>
        <Phone scale={HP_SCALE}>{children}</Phone>
      </div>

      {/* 오른쪽: 설명 카드 + 화면을 가리키는 선 */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: 1 - exit }}>
        {points.map((pt, i) => {
          // 선은 지금 설명하는 카드 하나만 (다음 카드가 나오면 앞 선은 걷힘)
          const next = points[i + 1]?.at ?? Infinity;
          const p = ease(frame, fps, pt.at) * (Number.isFinite(next) ? 1 - interpolate(frame, [next - 6, next], [0, 1], clamp) : 1);
          if (p <= 0.001) return null;
          const g = toGlobal(pt.x, pt.y);
          const sx = CARD_X;
          const sy = cardTop(i) + 50;
          const ring = interpolate(frame, [pt.at, pt.at + 16], [0, 1], clamp);
          return (
            <g key={pt.text}>
              <line x1={sx} y1={sy} x2={sx + (g.x - sx) * p} y2={sy + (g.y - sy) * p} stroke={C.primary} strokeWidth={4} strokeLinecap="round" />
              <circle cx={g.x} cy={g.y} r={12 * p} fill={C.primary} stroke="#fff" strokeWidth={4} />
              <circle cx={g.x} cy={g.y} r={12 + ring * 30} fill="none" stroke={C.primary} strokeWidth={3} opacity={1 - ring} />
            </g>
          );
        })}
      </svg>
      {points.map((pt, i) => {
        const p = pop(frame, fps, pt.at, 14);
        const next = points[i + 1]?.at ?? Infinity;
        const past = Number.isFinite(next) ? interpolate(frame, [next - 6, next], [0, 1], clamp) : 0;
        return (
          <div
            key={pt.text}
            style={{
              position: "absolute",
              left: CARD_X,
              top: cardTop(i),
              width: 500,
              minHeight: 100,
              padding: "20px 28px",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              gap: 18,
              borderRadius: 24,
              background: "#FFFFFF",
              boxShadow: "0 16px 36px rgba(60,30,20,0.14)",
              fontSize: 38,
              fontWeight: 600,
              letterSpacing: -1,
              color: LIGHT.ink,
              opacity: Math.min(1, p * 2) * (1 - exit) * (1 - past * 0.45),
              translate: `${(1 - p) * 80}px 0px`,
              scale: String(1 - past * 0.04),
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 99, background: C.primary, color: "#fff", fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
            {pt.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Caption: React.FC<{ step: string; a: React.ReactNode; b?: React.ReactNode; switchAt: number }> = ({ step, a, b, switchAt }) => {
  const frame = useFrame();
  const { fps } = useVideoConfig();
  const inA = pop(frame, fps, 0, 14);
  // 앞 문구가 먼저 빠지고(8f), 그 다음 새 문구가 들어옴 → 글자가 겹치지 않음
  const outA = b ? interpolate(frame, [switchAt, switchAt + 8], [0, 1], clamp) : 0;
  const toB = b ? ease(frame, fps, switchAt + 8) : 0;
  const beat = useBeatPulse();
  const line = (content: React.ReactNode, p: number, out: number) => (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: 210,
        textAlign: "center",
        fontWeight: 600,
        fontSize: 84,
        lineHeight: 1.24,
        letterSpacing: -2,
        opacity: p * (1 - out),
        translate: `0px ${(1 - p) * 40 - out * 40}px`,
      }}
    >
      {content}
    </div>
  );
  return (
    <>
      <div style={{ position: "absolute", top: 110, width: "100%", display: "flex", justifyContent: "center" }}>
        {/* Figma 퀴즈 'Q1' 태그 모양 */}
        <div
          style={{
            background: C.line,
            borderRadius: 16,
            padding: "8px 26px",
            fontSize: 38,
            fontWeight: 600,
            scale: String(inA * (1 + beat * 0.05)),
            boxShadow: `0 0 ${24 * beat}px ${C.primary}88`,
          }}
        >
          {step}
        </div>
      </div>
      {line(a, inA, outA)}
      {b ? line(b, toB, 0) : null}
    </>
  );
};

// ================================
// 폰 (Figma 프레임 402 x 874 를 그대로 그리고 확대)
// ================================

export const SCREEN_W = 402;
export const SCREEN_H = 874;
export const Phone: React.FC<{ children: React.ReactNode; scale?: number }> = ({ children, scale: S = 1.55 }) => (
  <div style={{ padding: 16, borderRadius: 55 * S + 16, background: "#121419", boxShadow: "0 40px 90px rgba(0,0,0,0.45)" }}>
    <div style={{ width: SCREEN_W * S, height: SCREEN_H * S, borderRadius: 55 * S, overflow: "hidden", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          width: SCREEN_W,
          height: SCREEN_H,
          scale: String(S),
          transformOrigin: "0 0",
          background: C.bg,
          color: C.white,
          fontFamily: FONT.body,
          letterSpacing: "-0.01em",
          wordBreak: "keep-all",
          overflow: "hidden",
        }}
      >
        {children}
        <StatusBar />
        <HomeIndicator />
        {/* 다이내믹 아일랜드 */}
        <div style={{ position: "absolute", top: 11, left: 140, width: 122, height: 36, borderRadius: 20, background: "#000" }} />
      </div>
    </div>
  </div>
);

export const Icon: React.FC<{ name: string; size?: number; w?: number; h?: number; style?: React.CSSProperties }> = ({ name, size = 24, w, h, style }) => (
  <Img src={staticFile(`figma/${name}.svg`)} style={{ width: w ?? size, height: h ?? size, display: "block", ...style }} />
);

const StatusBar: React.FC<{ dim?: boolean }> = () => (
  <div style={{ position: "absolute", top: 0, left: 0, width: SCREEN_W, height: 50, paddingTop: 21, display: "flex", alignItems: "center" }}>
    <div style={{ flex: 1, textAlign: "center", fontFamily: FONT.system, fontWeight: 600, fontSize: 17, paddingLeft: 16 }}>9:41</div>
    <div style={{ width: 124 }} />
    <div style={{ flex: 1, display: "flex", gap: 7, alignItems: "center", justifyContent: "center", paddingRight: 16 }}>
      <Icon name="cellular" w={19.2} h={12.2} />
      <Icon name="wifi" w={17.1} h={12.3} />
      <Icon name="battery" w={27.3} h={13} />
    </div>
  </div>
);

const HomeIndicator: React.FC = () => (
  <div style={{ position: "absolute", bottom: 8, left: (SCREEN_W - 144) / 2, width: 144, height: 5, borderRadius: 100, background: C.white }} />
);

/** Figma 공통 헤더: 뒤로가기 + 제목 + 설명 + 하단 구분선 */
export const PageHeader: React.FC<{ title: string; sub: string; right?: string; backLabel?: string }> = ({ title, sub, right, backLabel }) => (
  <div style={{ position: "absolute", top: 66, left: 0, width: SCREEN_W, padding: "0 24px 24px", borderBottom: `1px solid ${C.line}` }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <Icon name="back" size={backLabel ? 24 : 32} />
        {backLabel ? <span style={{ fontSize: 17, fontWeight: 500 }}>{backLabel}</span> : null}
      </div>
      {right ? <span style={{ fontSize: 15, color: C.textDim }}>{right}</span> : null}
    </div>
    <div style={{ marginTop: 20, fontSize: 28, fontWeight: 600, lineHeight: 1.2 }}>{title}</div>
    <div style={{ marginTop: 8, fontSize: 17, color: C.textSub, lineHeight: 1.2 }}>{sub}</div>
  </div>
);

/** Figma 하단 버튼 (354 x 64, radius 16) */
export const BottomButton: React.FC<{ label: string; active?: boolean; bottom?: number }> = ({ label, active = true, bottom = 72 }) => (
  <div
    style={{
      position: "absolute",
      left: 24,
      bottom,
      width: 354,
      height: 64,
      borderRadius: 16,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 17,
      fontWeight: 500,
      background: active ? C.primary : C.card,
      color: active ? C.white : C.textDim,
    }}
  >
    {label}
  </div>
);

/** Figma 하단 탭바 */
const TABS = [
  { label: "홈", icon: "tab-home", w: 18, h: 21.6 },
  { label: "할일", icon: "tab-todo", w: 18.7, h: 21.3 },
  { label: "퀴즈", icon: "tab-quiz", w: 24, h: 24 },
  { label: "캘린더", icon: "tab-calendar", w: 18, h: 20.8 },
  { label: "더보기", icon: "tab-more", w: 19, h: 20.3 },
];

export const TabBar: React.FC<{ active: string }> = ({ active }) => (
  <div style={{ position: "absolute", bottom: 0, left: 0, width: SCREEN_W, height: 104, background: C.bg }}>
    <div style={{ display: "flex", gap: 4, padding: "8px 20px 0", borderTop: `1px solid ${C.line}` }}>
      {TABS.map((t) => (
        <div key={t.label} style={{ flex: 1, height: 62, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, paddingTop: 8 }}>
          <div style={{ width: 24, height: 24, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <Icon
              name={t.icon}
              w={t.w}
              h={t.h}
              style={{ filter: t.label === active ? "brightness(0) invert(1)" : t.icon === "tab-home" ? "brightness(0.54)" : undefined }}
            />
          </div>
          <div style={{ fontSize: 15, color: t.label === active ? C.white : C.tabDim }}>{t.label}</div>
        </div>
      ))}
    </div>
  </div>
);

/** 화면 전환: from~to 사이에만 보이고 살짝 밀려 들어옴 */
export const Screen: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const frame = useFrame();
  if (frame < from || frame >= to) return null;
  const inP = interpolate(frame, [from, from + 8], [0, 1], clamp);
  return <AbsoluteFill style={{ opacity: inP, translate: `${(1 - inP) * 40}px 0px` }}>{children}</AbsoluteFill>;
};

/** 화면을 누르는 손가락 표시 (좌표는 Figma 402 x 874 기준) */
export const Tap: React.FC<{ x: number; y: number; at: number }> = ({ x, y, at }) => {
  const frame = useFrame();
  const appear = interpolate(frame, [at - 10, at - 4], [0, 1], clamp);
  const press = interpolate(frame, [at - 2, at, at + 4], [1, 0.75, 1], clamp);
  const fade = interpolate(frame, [at + 6, at + 14], [1, 0], clamp);
  const ring = interpolate(frame, [at, at + 14], [0, 1], clamp);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: x - 20,
          top: y - 20,
          width: 40,
          height: 40,
          borderRadius: 99,
          border: `3px solid ${C.white}`,
          opacity: (1 - ring) * (frame >= at ? 1 : 0),
          scale: String(1 + ring * 1.2),
          zIndex: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: x - 17,
          top: y - 17,
          width: 34,
          height: 34,
          borderRadius: 99,
          background: "rgba(255,255,255,0.55)",
          opacity: appear * fade,
          scale: String(press),
          zIndex: 20,
        }}
      />
    </>
  );
};

// ================================
// 루티 스티커 (Figma '배너' 파일의 스티커/엽서 일러스트)
// ================================

export type RutiProps = {
  name: string; // public/ruti2/{name}.png
  x: number;
  y: number;
  w: number;
  rotate?: number;
  delay?: number;
  /** 흰 테두리가 없는 일러스트에 스티커처럼 흰 외곽선을 둘러 줌 */
  outline?: boolean;
  flip?: boolean;
  /** 정해진 시점(장면 코드 기준 프레임)에 폴짝 뛰어 화면 아래로 퇴장. 없으면 장면 끝나기 직전에 쏙 들어감 */
  jumpAt?: number;
  /** 등장 방식: 제자리에서 톡(pop) 또는 화면 밖 해당 방향에서 미끄러져 들어옴 */
  from?: "pop" | "left" | "right" | "top" | "bottom";
};

const ENTER_OFFSET = { pop: [0, 0], left: [-520, 0], right: [520, 0], top: [0, -560], bottom: [0, 620] } as const;

export const Ruti: React.FC<RutiProps> = ({ name, x, y, w, rotate = 0, delay = 10, outline, flip, jumpAt, from = "pop" }) => {
  const frame = useFrame();
  const { fps } = useVideoConfig();
  const beat = useBeatPulse(6);
  // 여러 스티커가 한꺼번에 사라지지 않게 위치에 따라 1~2프레임씩 어긋나게
  const out = useExit(2 + (Math.abs(Math.round(x)) % 3) * 2);
  const jump = jumpAt === undefined ? 0 : Math.max(0, frame - jumpAt);
  const jumpY = jump > 0 ? -34 * jump + 2.1 * jump * jump : 0;
  const slideIn = from !== "pop";
  const pIn = slideIn ? pop(frame, fps, delay, 14) : pop(frame, fps, delay, 9);
  const [ox, oy] = ENTER_OFFSET[from];
  // 들어갈 때: 살짝 커졌다가 작아지며 사라짐
  const size = slideIn ? (frame >= delay ? 1 : 0) : pIn;
  const p = size * (out < 0.25 ? 1 + out * 0.4 : 1.1 * (1 - (out - 0.25) / 0.75));
  const bob = Math.sin((frame - delay) / 9) * 6;
  const o = 5;
  return (
    <Img
      src={staticFile(`ruti2/${name}.png`)}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        zIndex: 5,
        opacity: Math.min(1, p * 1.5),
        scale: `${(flip ? -1 : 1) * p * (1 + beat * 0.03)} ${p * (1 + beat * 0.03)}`,
        rotate: `${rotate + (1 - pIn) * (slideIn ? (ox > 0 || oy > 0 ? 18 : -18) : -25) + out * 30 + jump * (x > 500 ? 2.2 : -2.2)}deg`,
        translate: `${(1 - pIn) * ox}px ${bob + jumpY + (1 - pIn) * oy}px`,
        filter: [
          outline
            ? `drop-shadow(${o}px 0 0 #fff) drop-shadow(-${o}px 0 0 #fff) drop-shadow(0 ${o}px 0 #fff) drop-shadow(0 -${o}px 0 #fff)`
            : "",
          // 테두리 대신 은은한 빛 + 그림자로 어두운 배경과 구분
          "drop-shadow(0 0 18px rgba(255,255,255,0.22))",
          "drop-shadow(0 18px 24px rgba(0,0,0,0.35))",
        ].join(" "),
      }}
    />
  );
};

// ================================
// 말풍선 (흰 바탕 + 꼬리). 스티커 옆에서 톡 튀어나옴
// ================================

export const Bubble: React.FC<{
  text: React.ReactNode;
  x: number;
  y: number;
  delay?: number;
  /** 꼬리 위치 */
  tail?: "bottom-left" | "bottom-right" | "left" | "right";
  size?: number;
}> = ({ text, x, y, delay = 20, tail = "bottom-left", size = 40 }) => {
  const frame = useFrame();
  const { fps } = useVideoConfig();
  // 가로(밝은 바탕)에서는 어두운 풍선
  const bg = useLayout() === "h" ? C.ink : "#fff";
  // 말풍선은 캐릭터보다 먼저 빠짐
  const out = useExit(7, 7);
  const p = pop(frame, fps, delay, 10) * (1 - out);
  const origin = { "bottom-left": "15% 100%", "bottom-right": "85% 100%", left: "0% 50%", right: "100% 50%" }[tail];
  const tailStyle: React.CSSProperties = {
    "bottom-left": { left: 44, bottom: -18, borderWidth: "22px 14px 0 14px", borderColor: `${bg} transparent transparent transparent` },
    "bottom-right": { right: 44, bottom: -18, borderWidth: "22px 14px 0 14px", borderColor: `${bg} transparent transparent transparent` },
    left: { left: -18, top: "50%", marginTop: -14, borderWidth: "14px 22px 14px 0", borderColor: `transparent ${bg} transparent transparent` },
    right: { right: -18, top: "50%", marginTop: -14, borderWidth: "14px 0 14px 22px", borderColor: `transparent transparent transparent ${bg}` },
  }[tail];
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        zIndex: 6,
        padding: "18px 30px",
        borderRadius: 40,
        background: bg,
        color: bg === "#fff" ? C.ink : C.white,
        fontFamily: FONT.body,
        fontSize: size,
        fontWeight: 600,
        letterSpacing: -1,
        whiteSpace: "nowrap",
        boxShadow: "0 16px 30px rgba(0,0,0,0.3)",
        transformOrigin: origin,
        scale: String(p),
        opacity: Math.min(1, p * 2),
      }}
    >
      {text}
      <div style={{ position: "absolute", width: 0, height: 0, borderStyle: "solid", ...tailStyle }} />
    </div>
  );
};
