import React from "react";
import { Audio } from "@remotion/media";
import {
  springTiming,
  TransitionSeries,
  type TransitionPresentation,
} from "@remotion/transitions";
import {
  AbsoluteFill,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { MusicCtx, SceneAt } from "./beat";
import { SPEED, snapToBeat, type Music } from "./theme";
import { LayoutCtx } from "./ui";

// ================================
// 세로·가로 영상이 함께 쓰는 타임라인
// len 은 장면 코드 기준 프레임(SPEED 적용 전) "대략" 값. 실제 길이는 len / SPEED 로 늘린 뒤
// 장면 시작점을 BGM 비트에 맞춰 자동으로 당기거나 밉니다.
// ================================

export const TRANSITION = Math.round(12 / SPEED);

export type SceneDef = { id: string; name: string; len: number; C: React.FC };

/** 각 장면 시작점(전환 한가운데가 비트에 오도록)과 길이 */
export const buildTimeline = (scenes: SceneDef[], music: Music, loopFrames?: number) => {
  const starts = scenes.reduce<number[]>((acc, s, i) => {
    if (i === 0) return [0];
    const raw = acc[i - 1] + scenes[i - 1].len / SPEED - TRANSITION;
    return [
      ...acc,
      Math.round(snapToBeat(music, raw + TRANSITION / 2) - TRANSITION / 2),
    ];
  }, []);
  // 반복 재생 영상은 전체 길이를 음악 반복 길이에 딱 맞추고, 남는 시간은 마지막 장면이 가짐
  const durations = scenes.map((s, i) =>
    i < scenes.length - 1
      ? starts[i + 1] - starts[i] + TRANSITION
      : loopFrames
        ? loopFrames - starts[i]
        : Math.round(s.len / SPEED),
  );
  return {
    starts,
    durations,
    total: starts[starts.length - 1] + durations[durations.length - 1],
  };
};

const T = springTiming({
  config: { damping: 200 },
  durationInFrames: TRANSITION,
});

/** 가장자리를 어둡게 눌러 화면을 모아 줌 */
const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.38) 100%)",
      pointerEvents: "none",
    }}
  />
);

// BGM: 곡 처음부터 원래 속도로. 1초 페이드 인, 마지막 2.5초 페이드 아웃
const FADE_IN = 30;
const FADE_OUT = 75;

const Bgm: React.FC<{ music: Music; loop: boolean }> = ({ music, loop }) => {
  const { durationInFrames } = useVideoConfig();
  return (
    <Audio
      src={staticFile(music.src)}
      trimBefore={music.trim}
      // 반복 재생 영상은 처음·끝에서 소리를 줄이지 않음 (이어질 때 끊기지 않게)
      volume={(f) =>
        loop
          ? 0.55
          : interpolate(
              f,
              [0, FADE_IN, durationInFrames - FADE_OUT, durationInFrames],
              [0, 0.55, 0.55, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: (t) => t * t * (3 - 2 * t),
              },
            )
      }
    />
  );
};

/** 시작은 검은 화면에서 밝아지고, 끝은 음악과 함께 어두워짐 */
const FadeBlack: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacity = interpolate(
    frame,
    [0, 6, durationInFrames - 30, durationInFrames - 2],
    [1, 0, 0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  return (
    <AbsoluteFill
      style={{ background: "#000", opacity, pointerEvents: "none" }}
    />
  );
};

export const PromoTimeline: React.FC<{
  scenes: SceneDef[];
  // 장면 사이 전환 (i 번째 장면 → i+1 번째)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  presentations: TransitionPresentation<any>[];
  layout: "v" | "h";
  music: Music;
  /** 모든 장면 위에 겹쳐 그릴 것 (장면 시작점을 받아서 그림) */
  overlay?: (t: { starts: number[]; durations: number[] }) => React.ReactNode;
  /** 반복 재생용 전체 길이 (주면 마지막 장면도 끝에서 빠지고, 음악은 페이드 없이) */
  loopFrames?: number;
}> = ({ scenes, presentations, layout, music, overlay, loopFrames }) => {
  const { starts, durations } = buildTimeline(scenes, music, loopFrames);
  return (
    <LayoutCtx.Provider value={layout}>
      <MusicCtx.Provider value={music}>
        <AbsoluteFill style={{ background: "#33363F" }}>
          <Bgm music={music} loop={!!loopFrames} />
          <TransitionSeries>
            {scenes.flatMap((s, i) => {
              const items = [
                <TransitionSeries.Sequence
                  key={s.id}
                  name={s.name}
                  durationInFrames={durations[i]}
                >
                  <SceneAt
                    start={starts[i]}
                    exitAt={
                      i < scenes.length - 1
                        ? durations[i] - TRANSITION
                        : loopFrames
                          ? durations[i]
                          : Infinity
                    }
                  >
                    <s.C />
                  </SceneAt>
                </TransitionSeries.Sequence>,
              ];
              if (i < scenes.length - 1) {
                items.push(
                  <TransitionSeries.Transition
                    key={`${s.id}-t`}
                    presentation={presentations[i]}
                    timing={T}
                  />,
                );
              }
              return items;
            })}
          </TransitionSeries>
          {overlay ? overlay({ starts, durations }) : null}
        {/* 밝은 가로 영상에는 가장자리 어둡게 하지 않음 */}
        {layout === "v" ? <Vignette /> : null}
          {/* 가로(부스)는 반복 재생하므로 검은 화면으로 열고 닫지 않음 */}
          {layout === "v" ? <FadeBlack /> : null}
        </AbsoluteFill>
      </MusicCtx.Provider>
    </LayoutCtx.Provider>
  );
};
