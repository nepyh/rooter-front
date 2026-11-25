import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useVideoConfig } from "remotion";
import { shakeAt, useBeatPulse, useBeats, useExit, useFrame } from "../beat";
import { Flash, Shockwave, SpeedLines } from "../fx";
import { C, FONT, clamp, ease, pop } from "../theme";
import { BeatGlow, Bubble, DarkBg, Hl, Phone, Ruti } from "../ui";
import { ChapterScreen, ChatScreen, GrassScreen, HomeScreen, QuizScreen } from "./FeatureScenes";

const headline: React.CSSProperties = { fontWeight: 600, letterSpacing: -2, lineHeight: 1.24, textAlign: "center" };

// ================================
// 로고 모션 (RooterLogo: 주황 마스코트 + Jalnan "Rooter")
// 입(반원)이 튀어 오르고 → 눈이 위에서 떨어지고 → 글자가 한 자씩 올라오고 → 눈 깜빡
// ================================

// Figma 배너 파일의 Ruti/Face/기본 (머리·눈·입), 볼 터치 없음. 테두리 없이 빛·그림자로 배경과 구분
const HEAD = "M74.9 3.6C69.62 3.39 61.81 3.65 52.78 6.05C38.2 9.92 28.88 17.16 26.95 18.69C22.76 22.03 13.82 29.31 8.19 42.36C1.41 58.09 3.77 72.15 4.73 77.43C5.71 82.85 7.25 91.32 13.55 99.78C20.38 108.94 28.92 112.87 36.79 116.38C50.91 122.67 64.48 124.09 74.9 123.89H74.98C85.4 124.09 98.98 122.67 113.1 116.38C120.97 112.87 129.5 108.94 136.34 99.78C142.64 91.32 144.17 82.86 145.16 77.43C146.12 72.15 148.47 58.09 141.69 42.36C136.07 29.31 127.13 22.03 122.93 18.69C121.01 17.16 111.68 9.93 97.11 6.05C88.08 3.64 80.27 3.39 74.98 3.6H74.9Z";
const MOUTH = "M74.9 99.63C76.81 99.5 78.86 99.26 81.03 98.86C87.99 97.58 93.63 95.07 97.79 92.71C97.79 92.71 104.81 88.2 105.97 83.21C106.14 82.46 106.53 80.9 105.62 79.8C105.02 79.08 104.11 78.71 103.16 78.71H74.89H46.62C45.67 78.71 44.77 79.08 44.16 79.8C43.26 80.9 43.64 82.46 43.82 83.21C44.97 88.2 52 92.71 52 92.71C56.15 95.07 61.79 97.57 68.76 98.86C70.92 99.27 72.97 99.5 74.88 99.63H74.9Z";

export const MascotLogoFace: React.FC<{ size: number; eyes: number; mouth: number }> = ({ size, eyes, mouth }) => (
  <svg width={size} height={size * (127.559 / 150)} viewBox="0 0 150 127.559" overflow="visible">
    <path d={HEAD} fill={C.ink} />
    <ellipse cx="60" cy="66.61" rx="3.84" ry={3.84 * eyes} fill={C.primary} />
    <ellipse cx="89.47" cy="66.61" rx="3.84" ry={3.84 * eyes} fill={C.primary} />
    <g style={{ transformOrigin: "75px 89px", scale: `${mouth} ${mouth}` }}>
      <path d={MOUTH} fill={C.primary} />
    </g>
  </svg>
);

// 머리가 통통 튀어나오고 → 입이 웃고 → 눈이 뜨고 → 글자가 한 자씩 올라오고 → 두 번 깜빡
/** row: 가로 영상용으로 얼굴 옆에 글자를 놓음 */
export const AnimatedLogo: React.FC<{ size: number; delay?: number; withName?: boolean; row?: boolean }> = ({ size, delay = 0, withName = true, row }) => {
  const frame = useFrame() - delay;
  const { fps } = useVideoConfig();
  const beat = useBeatPulse(8);
  const head = pop(frame, fps, 0, 8);
  const mouth = pop(frame, fps, 10, 9);
  const eyesOpen = interpolate(frame, [6, 12], [0.1, 1], clamp);
  const blink =
    interpolate(frame, [36, 39, 42], [1, 0.1, 1], clamp) * interpolate(frame, [48, 51, 54], [1, 0.1, 1], clamp);
  const tilt = interpolate(frame, [36, 46, 60], [0, -6, 0], clamp);
  const settled = frame > 30 ? beat * 0.03 : 0;

  return (
    <div style={{ display: "flex", flexDirection: row ? "row" : "column", alignItems: "center", gap: size * (row ? 0.22 : 0.1) }}>
      <div style={{ scale: String(head * (1 + settled)), rotate: `${tilt}deg`, filter: "drop-shadow(0 0 28px rgba(255,255,255,0.28)) drop-shadow(0 22px 34px rgba(0,0,0,0.45))" }}>
        <MascotLogoFace size={size} eyes={eyesOpen * blink} mouth={mouth} />
      </div>
      {withName ? (
        <div style={{ display: "flex", fontFamily: FONT.logo, fontSize: size * 0.6, lineHeight: 1.15, color: C.primary, overflow: "hidden", paddingBottom: 6 }}>
          {"Rooter".split("").map((ch, i) => {
            const p = pop(frame, fps, 14 + i * 3, 13);
            return (
              <span key={i} style={{ display: "inline-block", translate: `0px ${(1 - p) * 110}%`, opacity: p }}>
                {ch}
              </span>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

// ================================
// 0. 오프닝 (메인 화면): 로고 모션 + 폰 등장
// ================================

export const OpeningScene: React.FC = () => {
  const frame = useFrame();
  const { fps } = useVideoConfig();
  const tag = ease(frame, fps, 36);
  const phone = ease(frame, fps, 22);
  const float = Math.sin(frame / 18) * 6;

  return (
    <DarkBg>
      <BeatGlow top={520} size={1300} strength={0.18} />
      <div style={{ position: "absolute", top: 210, width: "100%", display: "flex", justifyContent: "center" }}>
        <AnimatedLogo size={200} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 640,
          width: "100%",
          textAlign: "center",
          fontSize: 48,
          fontWeight: 500,
          color: C.textSub,
          opacity: tag,
          translate: `0px ${(1 - tag) * 24}px`,
        }}
      >
        중학생을 위한 <span style={{ color: C.white, fontWeight: 600 }}>AI 시험공부 플래너</span>
      </div>
      <div
        style={{
          position: "absolute",
          top: 870,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          translate: `0px ${(1 - phone) * 1100 + float}px`,
          rotate: `${(1 - phone) * 6}deg`,
        }}
      >
        <Phone>
          <HomeScreen delay={30} />
        </Phone>
      </div>
      <FlyingRuti />
      <Bubble text="시험 계획, 나한테 맡겨!" x={250} y={770} delay={66} tail="right" />
      {/* 폰 아래쪽을 배경으로 자연스럽게 덮음 */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 360, background: `linear-gradient(180deg, transparent, ${C.warmBottom})` }} />
    </DarkBg>
  );
};

/** 엽서 일러스트 '활공 비행 + 필기구' 루티가 왼쪽 아래에서 날아와 폰 위에 자리 잡음 */
/** 엽서 일러스트 '활공 비행 + 필기구' 루티가 왼쪽 아래에서 날아와 폰 위에 자리 잡음 */
const FlyingRuti: React.FC = () => {
  const frame = useFrame();
  const { fps } = useVideoConfig();
  const p = ease(frame, fps, 34);
  const x = interpolate(p, [0, 1], [-520, 650]);
  const y = interpolate(p, [0, 1], [1500, 640]) - Math.sin(p * Math.PI) * 260;
  const flap = Math.sin(frame / 3.2) * 4 * (1 - p * 0.6);
  const hover = Math.sin(frame / 10) * 10 * p;
  // 장면이 끝나기 전에 오른쪽 위로 날아가며 퇴장
  const out = useExit(4, 12);
  return (
    <Img
      src={staticFile("ruti2/fly-pen.png")}
      style={{
        position: "absolute",
        left: x + out * 520,
        top: y + hover - out * 700,
        width: 400,
        rotate: `${interpolate(p, [0, 1], [-18, -6]) + flap - out * 20}deg`,
        filter: "drop-shadow(0 0 18px rgba(255,255,255,0.22)) drop-shadow(0 24px 30px rgba(0,0,0,0.4))",
      }}
    />
  );
};

// ================================
// 9. 마무리 메시지 (Figma 온보딩 문구)
// ================================

export const OutroScene: React.FC = () => {
  const frame = useFrame();
  const { fps } = useVideoConfig();
  const l1 = pop(frame, fps, 0, 14);
  const l2 = pop(frame, fps, 10, 14);
  const sub = ease(frame, fps, 30);
  const btn = pop(frame, fps, 44, 12);
  // 손가락이 들어와서 버튼을 꾹 누름 → 엔딩으로
  const PRESS = 86;
  const hand = ease(frame, fps, 60);
  const press = interpolate(frame, [PRESS - 4, PRESS, PRESS + 6], [0, 1, 0], clamp);
  const pressed = frame >= PRESS;
  const handOut = useExit(0, 8);

  return (
    <DarkBg flip>
      <BeatGlow top={820} size={1200} strength={0.14} />
      <div style={{ ...headline, position: "absolute", top: 600, width: "100%", fontSize: 112 }}>
        <div style={{ opacity: l1, translate: `0px ${(1 - l1) * 40}px` }}>공부는 내가,</div>
        <div style={{ opacity: l2, translate: `0px ${(1 - l2) * 40}px` }}>
          계획은 <Hl>루터가!</Hl>
        </div>
      </div>
      <div style={{ position: "absolute", top: 940, width: "100%", textAlign: "center", fontSize: 48, lineHeight: 1.4, color: C.textSub, opacity: sub }}>
        언제나 힘든 공부 계획 세우기,
        <br />
        루터와 함께해요!
      </div>
      {/* Figma 온보딩 버튼 모양 */}
      <div style={{ position: "absolute", top: 1220, left: 140, right: 140, scale: String(btn * (1 - press * 0.08)) }}>
        <div
          style={{
            height: 150,
            borderRadius: 40,
            background: C.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 54,
            fontWeight: 600,
            filter: `brightness(${1 - press * 0.18})`,
            boxShadow: pressed ? `0 0 ${80 * interpolate(frame, [PRESS, PRESS + 20], [1, 0.4], clamp)}px ${C.primary}` : "none",
          }}
        >
          루터와 함께 공부하기
        </div>
      </div>
      <Shockwave at={PRESS} x={540} y={1295} size={700} color="#fff" len={16} />
      <TapHand
        x={interpolate(hand, [0, 1], [880, 540])}
        y={interpolate(hand, [0, 1], [2050, 1310]) + handOut * 700}
        scale={1 - press * 0.12}
        opacity={Math.min(1, hand * 3)}
      />
      <Ruti name="fire" x={90} y={1530} w={300} rotate={-8} delay={36} />
      <Ruti name="cheer-pose" x={690} y={1460} w={320} rotate={6} delay={42} />
      <Bubble text="같이 해보자!" x={120} y={1440} delay={50} />
    </DarkBg>
  );
};

/** 버튼을 누르는 손 (Material 'touch_app' 아이콘). x, y 는 손가락 끝 위치 */
export const TapHand: React.FC<{ x: number; y: number; scale: number; opacity: number }> = ({ x, y, scale, opacity }) => {
  const size = 240;
  // 아이콘 24 기준 손가락 끝 좌표 (11.5, 5.2)
  const tipX = (11.5 / 24) * size;
  const tipY = (5.2 / 24) * size;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{
        position: "absolute",
        left: x - tipX,
        top: y - tipY,
        zIndex: 8,
        opacity,
        scale: String(scale),
        transformOrigin: `${tipX}px ${tipY}px`,
        rotate: "-12deg",
        filter: "drop-shadow(0 14px 22px rgba(0,0,0,0.45))",
        overflow: "visible",
      }}
    >
      <path
        fill="#fff"
        stroke={C.ink}
        strokeWidth={0.5}
        strokeLinejoin="round"
        d="M18.84 15.87l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z"
      />
    </svg>
  );
};

// ================================
// 10. 엔딩 카드
// ================================

export const EndCardScene: React.FC = () => {
  const frame = useFrame();
  const { fps } = useVideoConfig();
  const sub = ease(frame, fps, 34);
  const team = ease(frame, fps, 48);
  // 다섯 친구가 인사하고 → 차례로 폴짝 뛰어 퇴장 → 그 자리에 CTA
  const JUMP = 104;
  const cta = pop(frame, fps, JUMP + 20, 11);

  return (
    <DarkBg>
      <BeatGlow top={820} size={1300} strength={0.2} />
      <div style={{ position: "absolute", top: 520, width: "100%", display: "flex", justifyContent: "center" }}>
        <AnimatedLogo size={240} />
      </div>
      <div style={{ position: "absolute", top: 1110, width: "100%", textAlign: "center", fontSize: 52, fontWeight: 500, color: C.textSub, opacity: sub, translate: `0px ${(1 - sub) * 24}px` }}>
        AI 시험공부 플래너
      </div>
      <div style={{ position: "absolute", bottom: 200, width: "100%", textAlign: "center", fontSize: 36, color: C.textDim, letterSpacing: 2, opacity: team }}>
        BSSM 전공동아리 · Team Hyphen
      </div>
      {["f-moti", "f-sti", "f-hati", "f-noti", "f-gongti"].map((n, i) => (
        <Ruti key={n} name={n} x={60 + i * 192} y={1300 + (i % 2) * 40} w={190} rotate={(i % 2 ? 1 : -1) * 6} delay={40 + i * 4} jumpAt={JUMP + Math.abs(i - 2) * 3} />
      ))}
      <div style={{ position: "absolute", top: 1330, width: "100%", display: "flex", justifyContent: "center", opacity: Math.min(1, cta * 2), scale: String(cta) }}>
        <div style={{ padding: "30px 64px", borderRadius: 999, background: C.primary, fontSize: 56, fontWeight: 600, boxShadow: `0 0 60px ${C.primary}88` }}>
          시험공부, 이제 루터랑!
        </div>
      </div>
    </DarkBg>
  );
};

// ================================
// 콜드 오프닝: 한 화면에서 이어짐 (빈 화면 없이)
// "시험 기간" → 비트마다 교과서가 떨어져 탑처럼 쌓임 + "범위는 산더미" → 탑이 흔들리고 "계획은...?" → 물음표와 함께 와르르 무너짐 → 로고
// 배경은 어두운 색 하나, 책이 쌓일수록 아래 주황 빛이 진해짐
// ================================

const BIG: React.CSSProperties = { fontFamily: FONT.logo, lineHeight: 1.2, letterSpacing: -4, textShadow: "0 10px 30px rgba(0,0,0,0.35)", whiteSpace: "nowrap" };
const DARK = "#111318";

export const SUBJECTS: { name: string; bg: string; fg: string; mark: string; font?: string; spacing?: number }[] = [
  { name: "국어", bg: C.label.yellow, fg: C.ink, mark: "가나다" },
  { name: "영어", bg: C.label.deepblue, fg: C.white, mark: "ABC", font: "Georgia, 'Times New Roman', serif", spacing: 2 },
  { name: "수학", bg: C.label.green, fg: C.ink, mark: "π ÷ √", font: "'Times New Roman', serif" },
  { name: "사회", bg: C.label.pink, fg: C.ink, mark: "史" },
  { name: "과학", bg: C.label.lightblue, fg: C.ink, mark: "H₂O" },
];

// 쌓이는 순서 (아래부터). w: 책 너비, dx: 가운데에서 어긋난 정도, r: 기울기
const PILE = [
  { k: 2, w: 640, dx: -10, r: -1.5 },
  { k: 0, w: 600, dx: 24, r: 2 },
  { k: 4, w: 620, dx: -30, r: -2.5 },
  { k: 1, w: 570, dx: 34, r: 3 },
  { k: 3, w: 590, dx: -18, r: -3.5 },
  { k: -1, w: 520, dx: 26, r: 4 }, // 맨 위: 기출문제 묶음
];
const BOOK_H = 116;
const GROUND = 1640; // 탑 바닥 y
// 무너질 때 책마다 날아가는 방향
const FLY = [
  { vx: -26, vy: -10, spin: -9 },
  { vx: 30, vy: -16, spin: 11 },
  { vx: -34, vy: -22, spin: -13 },
  { vx: 36, vy: -26, spin: 14 },
  { vx: -30, vy: -32, spin: -16 },
  { vx: 22, vy: -38, spin: 18 },
];

/** 교과서 한 권 (옆에서 본 모양: 등 + 과목 + 기호 + 종이 단면) */
export const Book: React.FC<{ k: number; w: number }> = ({ k, w }) => {
  if (k < 0) {
    // 기출문제 묶음: 흰 종이 몇 장이 어긋나게 겹침
    return (
      <div style={{ position: "relative", width: w, height: BOOK_H }}>
        {[10, 5, 0].map((o, i) => (
          <div key={i} style={{ position: "absolute", left: o * 2, top: o, width: w - 30, height: BOOK_H - 16, borderRadius: 8, background: i === 2 ? "#FFFFFF" : "#E8EAEE", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }} />
        ))}
        <div style={{ position: "absolute", left: 0, top: 0, width: w - 30, height: BOOK_H - 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 18, color: C.ink }}>
          <span style={{ fontFamily: FONT.logo, fontSize: 50 }}>기출문제</span>
          <span style={{ fontSize: 34, fontWeight: 600, color: C.primary }}>100제</span>
        </div>
      </div>
    );
  }
  const s = SUBJECTS[k];
  return (
    <div style={{ width: w, height: BOOK_H, borderRadius: 16, background: s.bg, color: s.fg, display: "flex", alignItems: "center", overflow: "hidden", boxShadow: "0 10px 24px rgba(0,0,0,0.35)" }}>
      <div style={{ width: 30, height: "100%", background: "rgba(0,0,0,0.18)" }} />
      <div style={{ flex: 1, display: "flex", alignItems: "baseline", justifyContent: "center", gap: 22 }}>
        <span style={{ fontFamily: FONT.logo, fontSize: 58 }}>{s.name}</span>
        <span style={{ fontFamily: s.font ?? FONT.body, fontSize: 34, fontWeight: 600, opacity: 0.75, letterSpacing: s.spacing ?? 0 }}>{s.mark}</span>
      </div>
      <div style={{ width: 22, height: "78%", marginRight: 10, borderRadius: 4, background: "repeating-linear-gradient(180deg, #FFFFFF 0 5px, #D1D5DB 5px 7px)" }} />
    </div>
  );
};

export const ColdOpenScene: React.FC = () => {
  const frame = useFrame();
  const { fps } = useVideoConfig();
  const beatAt = useBeats();

  const examAt = beatAt(0);
  const drops = PILE.map((_, i) => beatAt(1 + i)); // 비트 1~6 에 한 권씩
  const pileAt = beatAt(3);
  const askAt = beatAt(7);
  const fallAt = beatAt(8.5); // 물음표가 톡 → 와르르

  const landed = drops.filter((d) => frame >= d + 4).length;
  const falling = frame >= fallAt;
  const tf = frame - fallAt;

  // 탑 흔들림: 쌓일수록 크게, "계획은" 부터 더 크게
  const sway =
    (Math.sin(frame / 5.5) * (0.25 + landed * 0.22) + (frame >= askAt ? Math.sin(frame / 2.3) * interpolate(frame, [askAt, fallAt], [0.5, 2.2], clamp) : 0)) * (falling ? 0 : 1);

  // 문장
  const examP = pop(frame, fps, examAt, 12);
  const toTop = ease(frame, fps, pileAt);
  const pileP = pop(frame, fps, pileAt, 12);
  const askP = ease(frame, fps, askAt);
  // 앞 문장은 "계획은" 이 나오기 직전에 먼저 빠짐 (두 문장이 겹쳐 보이지 않게)
  const oldOut = interpolate(frame, [askAt - 7, askAt - 1], [0, 1], clamp);
  const typed = Math.floor(interpolate(frame, [askAt, askAt + 12], [0, 6], clamp));
  const q = pop(frame, fps, fallAt, 7);
  const wobble = falling ? Math.sin(tf / 2.2) * 10 * Math.exp(-tf / 10) : 0;
  const glow = falling ? interpolate(tf, [0, 4, 30], [0.5, 0.75, 0.4], clamp) : 0.12 + landed * 0.06;

  return (
    <AbsoluteFill style={{ background: DARK, fontFamily: FONT.body, color: C.white, overflow: "hidden", isolation: "isolate" }}>
      {/* 아래에서 올라오는 주황 빛 (책이 쌓일수록 진해짐) */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 55% at 50% 100%, ${C.primary} 0%, transparent 70%)`, opacity: glow }} />

      {/* 교과서 탑 (글자보다 뒤에) */}
      <AbsoluteFill style={{ rotate: `${sway}deg`, transformOrigin: `540px ${GROUND}px`, translate: shakeAt(frame, drops.map((d) => d + 4), 6) }}>
        {PILE.map((b, i) => {
          const d = drops[i];
          if (frame < d - 6) return null;
          const p = pop(frame, fps, d - 6, 13);
          const restY = GROUND - (i + 1) * BOOK_H;
          let x = 540 - b.w / 2 + b.dx;
          let y = interpolate(p, [0, 1], [-260, restY]);
          let r = b.r + (1 - p) * (i % 2 ? 14 : -14);
          // 바닥에 닿을 때 살짝 눌림
          const squash = interpolate(frame, [d - 1, d + 2, d + 7], [1, 0.9, 1], clamp);
          if (falling) {
            // 위에 있는 책부터 먼저, 바깥으로 튕겨 나가며 떨어짐
            const t = Math.max(0, tf - (PILE.length - 1 - i) * 1.2);
            const f = FLY[i];
            x += f.vx * t;
            y += f.vy * t + 1.6 * t * t;
            r += f.spin * t;
          }
          return (
            <div key={i} style={{ position: "absolute", left: x, top: y, rotate: `${r}deg`, scale: `1 ${squash}`, transformOrigin: "50% 100%" }}>
              <Book k={b.k} w={b.w} />
            </div>
          );
        })}
      </AbsoluteFill>

      {/* 문장 1·2: "시험 기간" 이 위로 올라가 작아지고, 아래에 "범위는 산더미" */}
      <AbsoluteFill style={{ opacity: 1 - oldOut, filter: oldOut > 0 ? `blur(${oldOut * 10}px)` : undefined, scale: String(1 - oldOut * 0.06) }}>
        <div
          style={{
            position: "absolute",
            top: interpolate(toTop, [0, 1], [560, 200]),
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            scale: String(interpolate(toTop, [0, 1], [1, 0.55])),
            transformOrigin: "50% 0%",
          }}
        >
          <div style={{ ...BIG, fontSize: 176, display: "flex" }}>
            {"시험 기간".split("").map((ch, k) => {
              const p = pop(frame, fps, examAt + k * 3, 12);
              return (
                <span key={k} style={{ display: "inline-block", whiteSpace: "pre", translate: `0px ${(1 - p) * -220}px`, opacity: Math.min(1, p * 2) }}>
                  {ch}
                </span>
              );
            })}
          </div>
          <div style={{ marginTop: 10, height: 16, width: 640 * interpolate(frame, [examAt + 14, examAt + 24], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) }), borderRadius: 8, background: C.primary, opacity: examP }} />
        </div>
        <div style={{ position: "absolute", top: 360, width: "100%", textAlign: "center", ...BIG, fontSize: 140, opacity: Math.min(1, pileP * 2), scale: String(interpolate(pileP, [0, 1], [1.5, 1])) }}>
          범위는 <span style={{ color: C.primary }}>산더미</span>
        </div>
      </AbsoluteFill>

      {/* 문장 3: "계획은...?" */}
      {frame >= askAt ? (
        <div style={{ position: "absolute", top: 330, width: "100%", display: "flex", justifyContent: "center", opacity: askP, translate: shakeAt(frame, [fallAt], 14) }}>
          <div style={{ ...BIG, fontSize: 176, display: "flex", alignItems: "baseline", scale: String(1 + Math.max(0, tf) * 0.002) }}>
            {"계획은...".split("").map((ch, k) => (
              <span key={k} style={{ opacity: k < typed ? 1 : 0 }}>{ch}</span>
            ))}
            <span style={{ display: "inline-block", color: C.primary, scale: String(q * 1.25), rotate: `${wobble}deg`, opacity: Math.min(1, q * 3), marginLeft: 8 }}>?</span>
          </div>
        </div>
      ) : null}

    </AbsoluteFill>
  );
};

// ================================
// 기능 몰아보기: 비트마다 실제 앱 화면이 담긴 폰이 아래에서 올라와 카드처럼 겹겹이 쌓임
// → 다섯 장이 모이면 한데 모여 작아지며 "이 모든 걸," → "루터 하나로."
// ================================

const RECAP: { word: string; screen: React.ReactNode }[] = [
  { word: "AI 플랜", screen: <ChapterScreen picked={2} /> },
  { word: "시간표", screen: <HomeScreen still /> },
  { word: "퀴즈", screen: <QuizScreen selected graded bubble={1} /> },
  { word: "AI 채팅", screen: <ChatScreen frame={130} /> },
  { word: "공부 잔디", screen: <GrassScreen frame={200} /> },
];
const CARD_TOP = 600;
const DEPTH_Y = 46;

export const MontageScene: React.FC = () => {
  const frame = useFrame();
  const { fps } = useVideoConfig();
  const beatAt = useBeats();
  // 한 기능당 1.25비트 (처음 버전의 80% 속도)
  const STEP = 1.25;
  const cuts = RECAP.map((_, i) => beatAt(i * STEP));
  const allAt = beatAt(RECAP.length * STEP);
  const finalAt = beatAt(8);
  const exit = useExit(0, 10);

  const current = Math.max(0, cuts.filter((c) => frame >= c - 1).length - 1);
  const gather = ease(frame, fps, allAt); // 다섯 장이 한데 모여 작아짐
  const label = pop(frame, fps, cuts[current], 12);

  // 이 모든 걸, → 루터 하나로.
  const a = pop(frame, fps, allAt + 4, 13);
  const isFinal = frame >= finalAt - 1;
  const f = pop(frame, fps, finalAt, 10);

  return (
    <DarkBg>
      <BeatGlow top={1100} size={1400} strength={isFinal ? 0.3 : 0.14} />

      {/* 기능 이름 */}
      {frame < allAt + 8 ? (
        <div
          style={{
            position: "absolute",
            top: 210,
            width: "100%",
            textAlign: "center",
            fontFamily: FONT.logo,
            fontSize: 150,
            letterSpacing: -3,
            textShadow: "0 16px 40px rgba(0,0,0,0.35)",
            scale: String(interpolate(label, [0, 1], [1.35, 1])),
            opacity: Math.min(1, label * 2) * (1 - gather),
          }}
        >
          {RECAP[current].word}
        </div>
      ) : null}

      {/* 폰 카드 더미 */}
      {frame < finalAt ? (
        <AbsoluteFill style={{ scale: String(1 - gather * 0.55), opacity: 1 - interpolate(gather, [0.5, 1], [0, 1], clamp), transformOrigin: "50% 62%" }}>
          {RECAP.map((r, i) => {
            if (frame < cuts[i] - 1) return null;
            const p = pop(frame, fps, cuts[i], 14);
            // 뒤로 밀린 정도 (부드럽게): 새 카드가 올라올 때마다 한 칸씩
            const depth = cuts.slice(i + 1).reduce((d, c) => d + ease(frame, fps, c), 0) * (1 - gather);
            return (
              <div
                key={r.word}
                style={{
                  position: "absolute",
                  top: CARD_TOP - depth * DEPTH_Y + (1 - p) * 1400,
                  left: 0,
                  right: 0,
                  display: "flex",
                  justifyContent: "center",
                  scale: String(1 - depth * 0.07),
                  transformOrigin: "50% 0%",
                  filter: `brightness(${1 - Math.min(depth, 4) * 0.16})`,
                  rotate: `${(1 - p) * (i % 2 ? 6 : -6)}deg`,
                }}
              >
                <Phone scale={1.15}>{r.screen}</Phone>
              </div>
            );
          })}
        </AbsoluteFill>
      ) : null}

      {isFinal ? <SpeedLines opacity={interpolate(frame - finalAt, [0, 3, 30], [0, 1, 0.3], clamp)} spin={frame} /> : null}
      <Shockwave at={finalAt} x={540} y={900} size={1700} />
      <AbsoluteFill style={{ translate: shakeAt(frame, [finalAt], 28), opacity: 1 - exit, scale: String(1 + exit * 0.15) }}>
        {frame >= allAt + 4 ? (
          <div style={{ position: "absolute", top: 560, width: "100%", textAlign: "center", fontSize: 92, fontWeight: 600, letterSpacing: -2, color: isFinal ? C.textSub : C.white, opacity: a, scale: String(isFinal ? 0.8 : interpolate(a, [0, 1], [1.4, 1])), translate: `0px ${isFinal ? -40 : 0}px` }}>
            이 모든 걸,
          </div>
        ) : null}
        {isFinal ? (
          <div style={{ position: "absolute", top: 740, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 30, scale: String(interpolate(f, [0, 1], [2.4, 1])), opacity: Math.min(1, f * 3) }}>
            <MascotLogoFace size={230} eyes={1} mouth={1} />
          </div>
        ) : null}
        {isFinal ? (
          <div style={{ position: "absolute", top: 1010, width: "100%", textAlign: "center", fontFamily: FONT.logo, fontSize: 150, letterSpacing: -3, scale: String(interpolate(f, [0, 1], [2, 1])), opacity: Math.min(1, f * 3) }}>
            <Hl>루터</Hl> 하나로.
          </div>
        ) : null}
      </AbsoluteFill>
      <Flash at={finalAt} len={8} strength={0.6} />
    </DarkBg>
  );
};

