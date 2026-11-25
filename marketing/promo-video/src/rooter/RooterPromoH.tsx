import React from "react";
import { type TransitionPresentation } from "@remotion/transitions";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { fade } from "@remotion/transitions/fade";
import { iris } from "@remotion/transitions/iris";
import { slide } from "@remotion/transitions/slide";
import {
  ChatScene,
  GrassScene,
  InputScene,
  PersonalizeScene,
  PlanScene,
  QuizScene,
} from "./scenes/FeatureScenes";
import {
  HEndCardScene,
  HIntroScene,
  HMontageScene,
  HOpeningScene,
} from "./scenes/Horizontal";
import { LOOP_FRAMES, MUSIC } from "./theme";
import {
  buildTimeline,
  PromoTimeline,
  type SceneDef,
} from "./timeline";

// ================================
// 가로 영상 (1920 x 1080): 밝은 크림 톤의 '루터와 함께하는 하루'. 검색창 인트로, 아래쪽 하루 표시줄, 문구는 세로와 따로
// BGM 은 세로에서 안 쓴 드럼 곡. 세로 영상과 같은 흐름·비슷한 박자. 기능 장면은 같은 앱 화면을 쓰되 폰과 설명을 나란히 놓고(좌우 번갈아),
// 인트로·로고·맞춤 조정·몰아보기·마무리·엔딩은 가로 전용 구성으로 따로 만듦
// ================================

const SCENES: SceneDef[] = [
  {
    id: "cold",
    name: "인트로: 검색창 → 남의 계획 → 내 계획",
    len: 150,
    C: HIntroScene,
  },
  { id: "opening", name: "등장: 가로 로고 + 폰", len: 120, C: HOpeningScene },
  { id: "input", name: "STEP1 계획", len: 182, C: InputScene },
  { id: "plan", name: "STEP2 시간표", len: 140, C: PlanScene },
  { id: "quiz", name: "STEP3 퀴즈", len: 160, C: QuizScene },
  {
    id: "personalize",
    name: "맞춤: 공부 스타일 설문",
    len: 150,
    C: PersonalizeScene,
  },
  { id: "chat", name: "STEP4 채팅", len: 130, C: ChatScene },
  { id: "grass", name: "STEP5 잔디", len: 105, C: GrassScene },
  {
    id: "montage",
    name: "다섯 칸 불 켜기 → 루터 하나면 끝",
    len: 165,
    C: HMontageScene,
  },
  { id: "end", name: "엔딩 카드", len: 178, C: HEndCardScene },
];

const SIZE = { width: 1920, height: 1080 };

// 기능 장면은 가운데 폰이 그대로 있고 앱 화면·설명만 바뀌도록 모두 페이드로 이어 붙임 (실제 시연처럼)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PRESENTATIONS: TransitionPresentation<any>[] = [
  iris(SIZE), // 인트로 → 로고 (가운데서 원이 열림)
  slide({ direction: "from-bottom" }), // 로고 → STEP1 (폰이 가운데로)
  fade(), // STEP1 → STEP2
  fade(), // STEP2 → STEP3
  fade(), // STEP3 → 공부 스타일 설문
  fade(), // 공부 스타일 설문 → STEP4
  fade(), // STEP4 → STEP5
  clockWipe(SIZE), // STEP5 → 몰아보기
  fade(), // 몰아보기 → 엔딩 (QR)
];


export const PROMO_H_DURATION = buildTimeline(SCENES, MUSIC.drumsLoop, LOOP_FRAMES).total;

export const RooterPromoH: React.FC = () => (
  <PromoTimeline
    scenes={SCENES}
    presentations={PRESENTATIONS}
    layout="h"
    music={MUSIC.drumsLoop}
    loopFrames={LOOP_FRAMES}
  />
);
