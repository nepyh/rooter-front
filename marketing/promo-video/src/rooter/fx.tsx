import React from "react";
import { AbsoluteFill, interpolate, random } from "remotion";
import { useFrame } from "./beat";
import { C, clamp } from "./theme";

// ================================
// 임팩트 효과 (시점은 모두 장면 코드 기준 프레임 = useFrame 단위)
// ================================

/** 중심에서 퍼져 나가는 링 */
export const Shockwave: React.FC<{ at: number; x: number; y: number; size?: number; color?: string; len?: number }> = ({
  at,
  x,
  y,
  size = 1400,
  color = C.primary,
  len = 20,
}) => {
  const frame = useFrame();
  const t = interpolate(frame, [at, at + len], [0, 1], clamp);
  if (frame < at || t >= 1) return null;
  const e = 1 - Math.pow(1 - t, 3);
  const d = size * e;
  return (
    <div
      style={{
        position: "absolute",
        left: x - d / 2,
        top: y - d / 2,
        width: d,
        height: d,
        borderRadius: "50%",
        border: `${Math.max(2, 34 * (1 - t))}px solid ${color}`,
        opacity: 1 - t,
        pointerEvents: "none",
      }}
    />
  );
};

/** 화면 전체가 순간 번쩍 */
export const Flash: React.FC<{ at: number; len?: number; strength?: number; color?: string }> = ({ at, len = 8, strength = 0.7, color = "#fff" }) => {
  const frame = useFrame();
  const o = interpolate(frame, [at, at + 1, at + len], [0, strength, 0], clamp);
  if (o <= 0) return null;
  return <AbsoluteFill style={{ background: color, opacity: o, pointerEvents: "none", zIndex: 30 }} />;
};

/** 한 점에서 사방으로 튀는 불꽃 */
export const Sparks: React.FC<{ at: number; x: number; y: number; count?: number; dist?: number; seed?: string; colors?: string[] }> = ({
  at,
  x,
  y,
  count = 18,
  dist = 520,
  seed = "s",
  colors = [C.primary, "#FFE252", "#fff", "#FF7E9B"],
}) => {
  const frame = useFrame();
  const t = (frame - at) / 26;
  if (t < 0 || t >= 1) return null;
  const e = 1 - Math.pow(1 - t, 3);
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2 + random(`${seed}a${i}`) * 0.5;
        const r = dist * (0.55 + random(`${seed}r${i}`) * 0.45) * e;
        const s = 10 + random(`${seed}s${i}`) * 16;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.cos(a) * r - s / 2,
              top: y + Math.sin(a) * r - s / 2 + t * t * 120,
              width: s,
              height: s,
              borderRadius: i % 3 === 0 ? 3 : "50%",
              rotate: `${t * 360 + i * 20}deg`,
              background: colors[i % colors.length],
              opacity: 1 - t,
              scale: String(1 - t * 0.6),
              pointerEvents: "none",
            }}
          />
        );
      })}
    </>
  );
};

/** 가운데로 빨려 드는 집중선 */
export const SpeedLines: React.FC<{ opacity?: number; color?: string; spin?: number }> = ({ opacity = 1, color = "rgba(255,255,255,0.14)", spin = 0 }) => (
  <AbsoluteFill
    style={{
      background: `repeating-conic-gradient(from ${spin}deg at 50% 50%, ${color} 0deg 1.6deg, transparent 1.6deg 7deg)`,
      WebkitMaskImage: "radial-gradient(circle at 50% 50%, transparent 22%, #000 60%)",
      maskImage: "radial-gradient(circle at 50% 50%, transparent 22%, #000 60%)",
      opacity,
      pointerEvents: "none",
    }}
  />
);
