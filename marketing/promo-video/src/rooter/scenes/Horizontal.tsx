import React from "react";
import QRCode from "qrcode";
import { AbsoluteFill, Img, interpolate, staticFile, useVideoConfig } from "remotion";
import { shakeAt, useBeats, useExit, useFrame } from "../beat";
import { Flash, Shockwave, SpeedLines } from "../fx";
import { C, FONT, LIGHT, clamp, ease, pop } from "../theme";
import { Bubble, Hl, Phone, Ruti } from "../ui";
import { ChapterScreen, ChatScreen, GrassScreen, HomeScreen, QuizScreen } from "./FeatureScenes";
import { AnimatedLogo, MascotLogoFace, TapHand } from "./StoryScenes";

// ================================
// 가로 영상(1920 x 1080) 전용 장면
// 세로 영상(어두운 톤, 짧고 센 문구)과 겹치지 않도록: 밝은 크림 톤, '루터와 함께하는 하루' 흐름,
// 검색창 인트로, 문구도 모두 따로 씀
// ================================

const W = 1920;
const H = 1080;

/** 가로 영상 공통 배경: 밝은 크림 + 한쪽에 옅은 주황 */
const LBg: React.FC<{ children?: React.ReactNode; angle?: number }> = ({ children, angle = 120 }) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(${angle}deg, ${LIGHT.bg} 45%, ${LIGHT.bg2} 100%)`,
      fontFamily: FONT.body,
      color: LIGHT.ink,
      isolation: "isolate",
      overflow: "hidden",
    }}
  >
    {children}
  </AbsoluteFill>
);

/** 옅은 주황 원 (밝은 바탕용 은은한 빛) */
const Glow: React.FC<{ x: number; y: number; size: number; o?: number }> = ({ x, y, size, o = 0.25 }) => (
  <div
    style={{
      position: "absolute",
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${C.primary} 0%, transparent 65%)`,
      opacity: o,
    }}
  />
);

// ================================
// 0. 인트로: 검색창에 '시험 공부 계획 짜는 법' → 남의 계획이 쏟아짐 → "남의 계획 말고, 내 계획"
// ================================

const QUERY = "시험 공부 계획 짜는 법";
const RESULTS = [
  { t: "전교 1등의 하루 12시간 공부법", v: "조회수 52만", c: C.label.red, x: 150, y: 470, r: -4 },
  { t: "벼락치기 3일 완성 계획표", v: "조회수 31만", c: C.label.deepblue, x: 1290, y: 440, r: 3 },
  { t: "서울대생의 시험 2주 플랜", v: "조회수 88만", c: C.label.green, x: 720, y: 640, r: 2 },
  { t: "이것만 하면 올백 가능?!", v: "조회수 17만", c: C.label.yellow, x: 230, y: 790, r: 5 },
  { t: "시험 기간 루틴 브이로그", v: "조회수 64만", c: C.label.pink, x: 1220, y: 770, r: -3 },
  { t: "공부 계획표 양식 무료 배포", v: "다운로드 9천", c: C.label.lightblue, x: 760, y: 900, r: -5 },
];

export const HIntroScene: React.FC = () => {
  const frame = useFrame();
  const { fps } = useVideoConfig();
  const beatAt = useBeats();
  const [bType, bEnter, bLine1, bLine2] = [beatAt(0) - 1, beatAt(3) - 1, beatAt(7) - 1, beatAt(9) - 1];
  const bar = ease(frame, fps, 0);
  const typed = Math.floor(interpolate(frame, [bType + 4, bType + 26], [0, QUERY.length], clamp));
  const caret = Math.floor(frame / 6) % 2 === 0 && frame < bEnter;
  // 결과 카드가 다 나오면 흐려지며 뒤로 물러남
  const away = ease(frame, fps, bLine1 - 10);
  const l1 = pop(frame, fps, bLine1, 13);
  const l2 = pop(frame, fps, bLine2, 11);

  return (
    <LBg>
      <Glow x={960} y={540} size={1400} o={0.18} />
      {/* 검색창 */}
      <div
        style={{
          position: "absolute",
          left: 360,
          top: interpolate(away, [0, 1], [230, 120]),
          width: 1200,
          height: 150,
          borderRadius: 999,
          background: LIGHT.card,
          boxShadow: "0 20px 50px rgba(120,60,40,0.15)",
          display: "flex",
          alignItems: "center",
          gap: 30,
          padding: "0 50px",
          opacity: bar * (1 - away),
          scale: String((0.9 + 0.1 * bar) * (1 - away * 0.2)),
          filter: away > 0 ? `blur(${away * 6}px)` : undefined,
        }}
      >
        <svg width={60} height={60} viewBox="0 0 24 24">
          <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke={C.primary} strokeWidth="2.6" />
          <path d="M15.5 15.5L20 20" stroke={C.primary} strokeWidth="2.6" strokeLinecap="round" />
        </svg>
        <div style={{ fontSize: 64, fontWeight: 600, letterSpacing: -1, color: LIGHT.ink }}>
          {QUERY.slice(0, typed)}
          <span style={{ display: "inline-block", width: 5, height: 64, marginLeft: 6, verticalAlign: "-8px", background: C.primary, opacity: caret ? 1 : 0 }} />
        </div>
      </div>

      {/* 쏟아지는 남의 계획 */}
      {RESULTS.map((r, i) => {
        const p = pop(frame, fps, bEnter + i * 2.5, 12);
        return (
          <div
            key={r.t}
            style={{
              position: "absolute",
              left: r.x,
              top: r.y,
              width: 560,
              display: "flex",
              alignItems: "center",
              gap: 22,
              padding: 22,
              borderRadius: 28,
              background: LIGHT.card,
              boxShadow: "0 16px 40px rgba(120,60,40,0.16)",
              rotate: `${r.r}deg`,
              opacity: Math.min(1, p * 2) * (1 - away * 0.85),
              scale: String(p * (1 - away * 0.15)),
              filter: away > 0 ? `blur(${away * 8}px)` : undefined,
              translate: `${(1 - p) * (r.x < 900 ? -120 : 120)}px ${(1 - p) * 80}px`,
            }}
          >
            <div style={{ width: 130, height: 90, borderRadius: 16, background: r.c, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={40} height={40} viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" fill="#fff" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 34, fontWeight: 600, lineHeight: 1.25, letterSpacing: -1 }}>{r.t}</div>
              <div style={{ marginTop: 6, fontSize: 26, color: LIGHT.dim }}>{r.v}</div>
            </div>
          </div>
        );
      })}

      {/* 남의 계획 말고, 내 계획 */}
      <div style={{ position: "absolute", top: 380, width: "100%", textAlign: "center", fontFamily: FONT.logo, letterSpacing: -3 }}>
        <div style={{ fontSize: 110, color: LIGHT.sub, opacity: Math.min(1, l1 * 2), translate: `0px ${(1 - l1) * 40}px` }}>남의 계획 말고,</div>
        <div style={{ fontSize: 170, lineHeight: 1.3, opacity: Math.min(1, l2 * 2), scale: String(interpolate(l2, [0, 1], [1.6, 1])) }}>
          <Hl>내 계획</Hl>이 필요해
        </div>
      </div>
    </LBg>
  );
};

// ================================
// 1. 등장: 왼쪽 가로 로고, 오른쪽 기울어진 폰, 루티가 왼쪽 아래에서 한 번에 날아옴
// ================================

const HFlyingRuti: React.FC = () => {
  const frame = useFrame();
  const { fps } = useVideoConfig();
  const p = ease(frame, fps, 34);
  const x = interpolate(p, [0, 1], [-500, 960]);
  const y = interpolate(p, [0, 1], [1100, 640]) - Math.sin(p * Math.PI) * 220;
  const flap = Math.sin(frame / 3.2) * 4 * (1 - p * 0.6);
  const hover = Math.sin(frame / 10) * 10 * p;
  const out = useExit(4, 12);
  return (
    <Img
      src={staticFile("ruti2/fly-pen.png")}
      style={{
        position: "absolute",
        left: x + out * 700,
        top: y + hover - out * 700,
        width: 340,
        rotate: `${interpolate(p, [0, 1], [-18, -6]) + flap - out * 20}deg`,
        filter: "drop-shadow(0 24px 30px rgba(120,60,40,0.3))",
      }}
    />
  );
};

export const HOpeningScene: React.FC = () => {
  const frame = useFrame();
  const { fps } = useVideoConfig();
  const tag = ease(frame, fps, 36);
  const phone = ease(frame, fps, 22);
  const float = Math.sin(frame / 18) * 6;
  return (
    <LBg>
      <Glow x={1500} y={560} size={1100} o={0.3} />
      <div style={{ position: "absolute", left: 150, top: 250 }}>
        <AnimatedLogo size={190} row />
      </div>
      <div style={{ position: "absolute", left: 160, top: 520, fontSize: 52, fontWeight: 500, color: LIGHT.sub, opacity: tag, translate: `0px ${(1 - tag) * 24}px` }}>
        내 범위, 내 시간에 맞춘 <span style={{ color: LIGHT.ink, fontWeight: 600 }}>시험공부 플래너</span>
      </div>
      <div style={{ position: "absolute", left: 1290, top: 120, translate: `0px ${(1 - phone) * 1000 + float}px`, rotate: `${-4 + (1 - phone) * 8}deg` }}>
        <Phone scale={1.15}>
          <HomeScreen delay={30} />
        </Phone>
      </div>
      <HFlyingRuti />
      <Bubble text="오늘 루틴, 같이 짜자!" x={600} y={700} delay={66} tail="right" />
    </LBg>
  );
};

// ================================
// 8. 몰아보기: 다섯 칸이 나란히 서 있다가 한 칸씩 불이 켜짐 → 계획부터 기록까지, 루터 하나면 끝.
// ================================

// 다섯 칸에 실제 앱 화면을 작게 띄우고, 기능 이름 + 한 줄 설명
const RECAP: { word: string; desc: string; screen: React.ReactNode }[] = [
  { word: "AI 플랜", desc: "범위만 넣으면 계획 완성", screen: <ChapterScreen picked={2} /> },
  { word: "시간표", desc: "오늘 할 일을 시간대별로", screen: <HomeScreen still /> },
  { word: "퀴즈", desc: "공부 끝나고 바로 확인", screen: <QuizScreen selected graded bubble={1} /> },
  { word: "AI 채팅", desc: "말 한마디로 일정 조정", screen: <ChatScreen frame={130} /> },
  { word: "공부 잔디", desc: "꾸준함이 한눈에", screen: <GrassScreen frame={200} /> },
];

export const HMontageScene: React.FC = () => {
  const frame = useFrame();
  const { fps } = useVideoConfig();
  const beatAt = useBeats();
  const STEP = 1.25;
  const cuts = RECAP.map((_, i) => beatAt(i * STEP));
  const allAt = beatAt(RECAP.length * STEP);
  const finalAt = beatAt(8);
  const exit = useExit(0, 10);
  const split = ease(frame, fps, allAt - 2);
  const a = pop(frame, fps, allAt + 2, 13);
  const isFinal = frame >= finalAt - 1;
  const f = pop(frame, fps, finalAt, 10);
  const PANEL = W / 5;

  return (
    <AbsoluteFill style={{ background: LIGHT.bg, fontFamily: FONT.body, color: LIGHT.ink, overflow: "hidden" }}>
      {RECAP.map((r, i) => {
        const lit = pop(frame, fps, cuts[i], 14);
        const on = frame >= cuts[i] - 1;
        const dir = i % 2 ? 1 : -1;
        const dark = i % 2 === 1;
        return (
          <div
            key={r.word}
            style={{
              position: "absolute",
              left: i * PANEL,
              top: 0,
              width: PANEL,
              height: H,
              background: on ? (dark ? C.ink : C.primary) : i % 2 ? "#F7E9E1" : LIGHT.bg,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
              translate: `0px ${split * dir * H}px`,
            }}
          >
            <div
              style={{
                opacity: on ? 1 : 0.3,
                filter: on ? "drop-shadow(0 20px 30px rgba(0,0,0,0.3))" : "grayscale(1)",
                scale: String(on ? 0.9 + 0.1 * lit : 0.9),
                translate: `0px ${on ? (1 - lit) * 60 : 0}px`,
              }}
            >
              <Phone scale={0.62}>{r.screen}</Phone>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ fontFamily: FONT.logo, fontSize: 62, letterSpacing: -2, color: on ? C.white : LIGHT.dim, opacity: on ? 1 : 0.6, scale: String(on ? 0.7 + 0.3 * lit : 1) }}>{r.word}</div>
              <div style={{ fontSize: 28, fontWeight: 600, color: on ? "rgba(255,255,255,0.85)" : "transparent" }}>{r.desc}</div>
            </div>
          </div>
        );
      })}

      {frame >= allAt - 2 ? (
        <AbsoluteFill style={{ opacity: split }}>
          <AbsoluteFill style={{ background: `linear-gradient(120deg, ${LIGHT.bg} 40%, ${LIGHT.bg2} 100%)` }} />
          <Glow x={960} y={540} size={1300} o={isFinal ? 0.35 : 0.15} />
          {isFinal ? <SpeedLines opacity={interpolate(frame - finalAt, [0, 3, 30], [0, 1, 0.35], clamp)} spin={frame} color="rgba(246,72,45,0.12)" /> : null}
          <Shockwave at={finalAt} x={960} y={520} size={2200} />
          <AbsoluteFill style={{ translate: shakeAt(frame, [finalAt], 28), opacity: 1 - exit, scale: String(1 + exit * 0.15) }}>
            <div
              style={{
                position: "absolute",
                top: isFinal ? 200 : 450,
                width: "100%",
                textAlign: "center",
                fontSize: 90,
                fontWeight: 600,
                letterSpacing: -2,
                color: isFinal ? LIGHT.sub : LIGHT.ink,
                opacity: a,
                scale: String(isFinal ? 0.75 : interpolate(a, [0, 1], [1.4, 1])),
              }}
            >
              계획부터 기록까지,
            </div>
            {isFinal ? (
              <div style={{ position: "absolute", top: 380, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 50, scale: String(interpolate(f, [0, 1], [2.2, 1])), opacity: Math.min(1, f * 3) }}>
                <MascotLogoFace size={260} eyes={1} mouth={1} />
                <div style={{ fontFamily: FONT.logo, fontSize: 170, letterSpacing: -3 }}>
                  <Hl>루터</Hl> 하나면 끝.
                </div>
              </div>
            ) : null}
          </AbsoluteFill>
          <Flash at={finalAt} len={8} strength={0.5} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

// ================================
// 9. 마무리: 왼쪽 문구, 오른쪽 '루터 시작하기' 버튼을 손가락이 눌러 엔딩으로
// ================================

export const HOutroScene: React.FC = () => {
  const frame = useFrame();
  const { fps } = useVideoConfig();
  const l1 = pop(frame, fps, 0, 14);
  const l2 = pop(frame, fps, 10, 14);
  const sub = ease(frame, fps, 30);
  const btn = pop(frame, fps, 44, 12);
  const PRESS = 86;
  const hand = ease(frame, fps, 60);
  const press = interpolate(frame, [PRESS - 4, PRESS, PRESS + 6], [0, 1, 0], clamp);
  const pressed = frame >= PRESS;
  const handOut = useExit(0, 8);
  const BX = 1400;
  const BY = 470;

  return (
    <LBg angle={60}>
      <Glow x={BX} y={BY} size={1000} o={0.25} />
      <div style={{ position: "absolute", left: 150, top: 250, fontWeight: 600, fontSize: 110, lineHeight: 1.22, letterSpacing: -3 }}>
        <div style={{ opacity: l1, translate: `${(1 - l1) * -50}px 0px` }}>오늘의 루틴,</div>
        <div style={{ opacity: l2, translate: `${(1 - l2) * -50}px 0px` }}>
          <Hl>루터</Hl>가 챙길게요
        </div>
      </div>
      <div style={{ position: "absolute", left: 156, top: 580, fontSize: 46, lineHeight: 1.4, color: LIGHT.sub, opacity: sub }}>
        시험 기간이 조금 덜 막막해지도록
      </div>
      <div style={{ position: "absolute", left: BX - 300, top: BY - 75, width: 600, scale: String(btn * (1 - press * 0.08)) }}>
        <div
          style={{
            height: 150,
            borderRadius: 999,
            background: C.primary,
            color: C.white,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
            fontWeight: 600,
            filter: `brightness(${1 - press * 0.15})`,
            boxShadow: pressed ? `0 0 ${70 * interpolate(frame, [PRESS, PRESS + 20], [1, 0.4], clamp)}px ${C.primary}` : `0 14px 30px ${C.primary}55`,
          }}
        >
          루터 시작하기
        </div>
      </div>
      <Shockwave at={PRESS} x={BX} y={BY} size={700} color={C.primary} len={16} />
      <TapHand
        x={interpolate(hand, [0, 1], [1780, BX])}
        y={interpolate(hand, [0, 1], [1250, BY + 15]) + handOut * 600}
        scale={1 - press * 0.12}
        opacity={Math.min(1, hand * 3)}
      />
      <Ruti name="fighting" x={1080} y={690} w={270} rotate={-8} delay={36} from="bottom" />
      <Ruti name="model-student" x={1560} y={680} w={290} rotate={6} delay={42} from="right" />
      <Bubble text="가 보자고!" x={820} y={790} delay={50} tail="right" />
    </LBg>
  );
};

// ================================
// 10. 엔딩: 가운데 가로 로고, 다섯 친구가 양옆에서 인사하고 폴짝 퇴장 → CTA
// ================================

// 다운로드 QR 에 넣을 링크 (public/qr/루터다운큐알.png 원본 QR 에 담긴 주소 그대로)
// 루터용으로 다시 그림: 진한 남색 칸 + 가운데 루터 얼굴. 얼굴이 칸을 가려도 읽히도록 오류 복원 단계는 가장 높게(H)
export const APP_URL = "https://q.me-qr.com/q9ue2tgo";

/** QR 코드 (qrcode 라이브러리로 칸을 계산해 svg 로 그림) */
export const QrCode: React.FC<{ url: string; size: number }> = ({ url, size }) => {
  if (!url) {
    return (
      <div style={{ width: size, height: size, borderRadius: 24, border: `6px dashed ${LIGHT.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 600, color: LIGHT.dim }}>
        QR 자리
      </div>
    );
  }
  const qr = QRCode.create(url, { errorCorrectionLevel: "H" });
  const n = qr.modules.size;
  const cells: React.ReactNode[] = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (qr.modules.get(y, x)) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} />);
  const logo = size * 0.24;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`-2 -2 ${n + 4} ${n + 4}`} style={{ display: "block", background: "#fff" }}>
        <g fill={LIGHT.ink} shapeRendering="crispEdges">{cells}</g>
      </svg>
      {/* 가운데 루터 얼굴 */}
      <div style={{ position: "absolute", left: (size - logo) / 2, top: (size - logo) / 2, width: logo, height: logo, borderRadius: logo * 0.22, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <MascotLogoFace size={logo * 0.82} eyes={1} mouth={1} />
      </div>
    </div>
  );
};

// 끝나기 직전 인트로 첫 화면(빈 크림 바탕)과 똑같이 맞춰서, 부스 화면에서 반복 재생해도 끊기지 않게 함

export const HEndCardScene: React.FC = () => {
  const frame = useFrame();
  const { fps } = useVideoConfig();
  const sub = ease(frame, fps, 34);
  const team = ease(frame, fps, 48);
  const cta = pop(frame, fps, 60, 11);
  const qr = pop(frame, fps, 74, 13);
  const loop = useExit(2, 18);

  return (
    <LBg angle={90}>
      <Glow x={620} y={460} size={1300} o={0.2} />
      {/* 왼쪽: 로고 + 한 줄 + 문구 */}
      <div style={{ position: "absolute", left: 140, width: 960, top: 250, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <AnimatedLogo size={190} row />
        <div style={{ marginTop: 40, fontSize: 50, fontWeight: 500, color: LIGHT.sub, opacity: sub, translate: `0px ${(1 - sub) * 24}px` }}>나만의 시험공부 루틴 플래너</div>
        <div style={{ marginTop: 56, padding: "28px 60px", borderRadius: 999, background: C.primary, color: C.white, fontSize: 54, fontWeight: 600, boxShadow: `0 14px 40px ${C.primary}66`, opacity: Math.min(1, cta * 2), scale: String(cta) }}>
          이번 시험, 루터랑!
        </div>
      </div>
      {/* 오른쪽: 다운로드 QR */}
      <div
        style={{
          position: "absolute",
          left: 1200,
          top: 190,
          width: 560,
          padding: "44px 0 40px",
          borderRadius: 44,
          background: LIGHT.card,
          boxShadow: "0 24px 60px rgba(120,60,40,0.18)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 26,
          opacity: Math.min(1, qr * 2),
          scale: String(0.85 + 0.15 * qr),
          rotate: `${(1 - qr) * 6}deg`,
        }}
      >
        <QrCode url={APP_URL} size={380} />
        <div style={{ fontSize: 46, fontWeight: 600, letterSpacing: -1 }}>
          찍고 <Hl>바로 받기</Hl>
        </div>
        <div style={{ fontSize: 30, color: LIGHT.dim, marginTop: -12 }}>앱스토어에서 &apos;루터&apos; 검색</div>
      </div>
      <div style={{ position: "absolute", bottom: 64, width: "100%", textAlign: "center", fontSize: 34, color: LIGHT.dim, letterSpacing: 2, opacity: team }}>
        BSSM 전공동아리 · Team Hyphen
      </div>

      {/* 반복 재생 이음새: 인트로 첫 화면과 같은 바탕으로 덮음 */}
      <AbsoluteFill style={{ opacity: loop }}>
        <LBg>
          <Glow x={960} y={540} size={1400} o={0.18} />
        </LBg>
      </AbsoluteFill>
    </LBg>
  );
};
