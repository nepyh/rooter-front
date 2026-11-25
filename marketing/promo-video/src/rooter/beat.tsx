import React, { createContext, useContext } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { MUSIC, SPEED, type Music } from "./theme";

/** 각 장면이 영상 전체에서 시작하는 프레임. 장면 안에서도 BGM 비트를 알 수 있게 함 */
export const SceneStart = createContext(0);
/** 장면이 다음 장면으로 넘어가기 시작하는 프레임(장면 기준, 실제 프레임). 스티커·말풍선은 이 전에 빠짐 */
export const SceneExit = createContext(Infinity);
/** 지금 영상의 BGM (비트 위치 계산용) */
export const MusicCtx = createContext<Music>(MUSIC.happy);

/** 비트마다 1 → 0 으로 빠르게 줄어드는 값 (은은한 박자 강조용) */
export const useBeatPulse = (sharpness = 7) => {
  const start = useContext(SceneStart);
  const { beat, offset } = useContext(MusicCtx);
  const frame = useCurrentFrame();
  const t = start + frame - offset;
  if (t < 0) return 0;
  // 비트가 빨라서(약 0.4~0.5초) 시각 강조는 두 비트에 한 번만
  const phase = (t % (beat * 2)) / (beat * 2);
  return Math.exp(-phase * sharpness);
};

/** 장면 시작 뒤 k 번째 비트가 오는 시점 (장면 코드 기준 프레임, useFrame 단위) */
export const useBeats = () => {
  const start = useContext(SceneStart);
  const { beat, offset } = useContext(MusicCtx);
  const n0 = Math.ceil((start - offset) / beat);
  return (k: number) => (offset + (n0 + k) * beat - start) * SPEED;
};

/**
 * 장면이 끝나기 직전 빠지는 정도 0 → 1.
 * lead 만큼(실제 프레임) 일찍 빠지기 시작해서 다음 장면과 겹치기 전에 사라짐
 */
export const useExit = (lead = 0, len = 9) => {
  const exitAt = useContext(SceneExit);
  const frame = useCurrentFrame();
  // 마지막 장면처럼 다음 장면이 없으면 빠지지 않음
  if (!Number.isFinite(exitAt)) return 0;
  const t = interpolate(frame, [exitAt - len - lead, exitAt - lead], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return t * t;
};

/** 장면 시작 순간 살짝 확대돼 있다가 제자리로 (컷마다 '탁' 치는 느낌) */
const Punch: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 18, mass: 0.5 } });
  return <AbsoluteFill style={{ scale: String(1.07 - 0.07 * p), isolation: "isolate" }}>{children}</AbsoluteFill>;
};

export const SceneAt: React.FC<{ start: number; exitAt: number; children: React.ReactNode }> = ({ start, exitAt, children }) => (
  <SceneStart.Provider value={start}>
    <SceneExit.Provider value={exitAt}>
      <Punch>{children}</Punch>
    </SceneExit.Provider>
  </SceneStart.Provider>
);

/** 장면 안 모션용 프레임. SPEED 만큼 천천히 흐름 (장면 코드는 이 값 기준 프레임으로 타이밍을 적음) */
export const useFrame = () => useCurrentFrame() * SPEED;

/** 강한 등장 순간에 화면을 흔듦. hits 는 useFrame 단위 시점 목록 */
export const shakeAt = (frame: number, hits: number[], power = 22) => {
  let x = 0;
  let y = 0;
  for (const h of hits) {
    const t = frame - h;
    if (t < 0 || t > 14) continue;
    const a = power * Math.exp(-t / 3.5);
    x += Math.sin(t * 2.7 + h) * a;
    y += Math.cos(t * 3.3 + h) * a * 0.7;
  }
  return `${x}px ${y}px`;
};
