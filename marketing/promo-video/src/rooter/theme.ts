import { loadFont } from "@remotion/fonts";
import { spring, staticFile } from "remotion";

// Figma "UX/UI 디자인" 파일 + rooter-front/src/constants/token/color.ts 기준 색상
export const C = {
  primary: "#F6482D",
  primaryTint: "rgba(246,72,45,0.3)",
  bg: "#33363F", // background/background-primary
  card: "#3F4552", // neutral-700
  line: "#525866", // neutral-600
  textSub: "#C9CDD6", // text-secondary
  textDim: "#8B919E", // text-disabled
  tabDim: "#8A919E", // neutral-400
  success: "#22C55E",
  successTint: "rgba(34,197,94,0.3)",
  white: "#FFFFFF",
  ink: "#212530",
  // 퀴즈 결과 화면 그라데이션 끝색 / AI 채팅 그라데이션 끝색
  warmBottom: "#55393B",
  chatBottom: "#3F3333",
  label: {
    red: "#FF5252",
    yellow: "#FFE252",
    green: "#81E468",
    deepblue: "#5283FF",
    lightblue: "#ADD3FF",
    grey: "#6C6C6C",
    pink: "#FF81C4",
  },
};

/** 가로 영상의 밝은 테마 (세로 영상의 어두운 톤과 구분) */
export const LIGHT = {
  bg: "#FFF6EF",
  bg2: "#FFE4D8",
  card: "#FFFFFF",
  line: "#F1DCD1",
  ink: "#212530",
  sub: "#5B6170",
  dim: "#A3A8B3",
};

export const FONT = {
  logo: "Jalnan2",
  body: "Pretendard",
  system: "-apple-system, 'SF Pro Text', Pretendard, sans-serif",
};

loadFont({ family: "Jalnan2", url: staticFile("Jalnan2.otf") });
loadFont({ family: "Pretendard", url: staticFile("Pretendard-Regular.ttf"), weight: "400" });
loadFont({ family: "Pretendard", url: staticFile("Pretendard-Medium.ttf"), weight: "500" });
loadFont({ family: "Pretendard", url: staticFile("Pretendard-SemiBold.ttf"), weight: "600" });

/** delay 프레임 뒤에 0→1 로 튀어오르는 spring */
export const pop = (frame: number, fps: number, delay = 0, damping = 12) =>
  spring({ frame: frame - delay, fps, config: { damping, mass: 0.6 } });

/** 부드럽게 들어오는 spring (튕김 없음) */
export const ease = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: 200 } });

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ================================
// 장면 모션 속도. 1 보다 작으면 글·모션이 그만큼 여유 있게 흐름
// ================================
export const SPEED = 0.9;

// ================================
// BGM과 비트 (영상마다 다른 곡). beat·offset 은 영상 프레임(30fps) 단위
// ================================

export type Music = { src: string; beat: number; offset: number; /** 곡 앞부분을 건너뛸 프레임 수 */ trim?: number };

export const MUSIC = {
  // 세로: Happy and Inspiring. 약 118.7 BPM, 비트 0.5055초, 킥 드럼 기준 첫 비트 0.08초
  happy: { src: "bgm-happy.m4a", beat: 15.165, offset: 2.4 },
  // 가로: Upbeat Drums & Percussion. 72.5 BPM(하프타임)의 두 배인 145 BPM 격자, 비트 0.4138초, 킥 기준 첫 비트 0.095초
  drums: { src: "bgm-drums.m4a", beat: 12.414, offset: 2.85 },
  // 가로(부스) 반복 재생용: 곡의 4마디째(400프레임)부터 16마디(1589프레임)만 씀.
  // 이 구간의 끝과 시작이 같은 드럼 패턴이라, 영상이 처음으로 돌아가도 음악이 끊기지 않고 이어짐
  drumsLoop: { src: "bgm-drums.m4a", beat: 12.414, offset: 0.1, trim: 400 },
} satisfies Record<string, Music>;

/** 가로 영상 한 바퀴 길이 = drumsLoop 16마디 */
export const LOOP_FRAMES = Math.round(16 * 8 * 12.414);

/** 영상 전체 기준 프레임에서 가장 가까운 비트 프레임 */
export const snapToBeat = (m: Music, f: number) => Math.round(m.offset + m.beat * Math.round((f - m.offset) / m.beat));
