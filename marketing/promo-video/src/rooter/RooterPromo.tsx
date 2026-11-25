import React from "react";
import { type TransitionPresentation } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { ChatScene, GrassScene, InputScene, PersonalizeScene, PlanScene, QuizScene } from "./scenes/FeatureScenes";
import { ColdOpenScene, EndCardScene, MontageScene, OpeningScene, OutroScene } from "./scenes/StoryScenes";
import { MUSIC } from "./theme";
import { buildTimeline, PromoTimeline, type SceneDef } from "./timeline";

// ================================
// 세로 영상 (1080 x 1920)
// ================================

const SCENES: SceneDef[] = [
  { id: "cold", name: "0 인트로: 시험 기간 → 산더미 → 계획은...?", len: 146, C: ColdOpenScene },
  { id: "opening", name: "1 등장: 로고 + 폰", len: 120, C: OpeningScene },
  { id: "input", name: "2 STEP1 날짜·범위 → AI 플랜", len: 182, C: InputScene },
  { id: "plan", name: "3 STEP2 홈 시간표", len: 140, C: PlanScene },
  { id: "quiz", name: "4 STEP3 퀴즈 · 피드백", len: 160, C: QuizScene },
  { id: "personalize", name: "5 공부 스타일 설문", len: 170, C: PersonalizeScene },
  { id: "chat", name: "6 STEP4 AI 채팅", len: 130, C: ChatScene },
  { id: "grass", name: "7 STEP5 마이페이지 잔디", len: 105, C: GrassScene },
  { id: "montage", name: "8 기능 몰아보기 → 루터 하나로", len: 165, C: MontageScene },
  { id: "outro", name: "9 마무리 메시지", len: 112, C: OutroScene },
  { id: "end", name: "10 엔딩 카드", len: 178, C: EndCardScene },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PRESENTATIONS: TransitionPresentation<any>[] = [
  fade(), // 인트로 '계획은...?' → 로고 등장
  wipe({ direction: "from-bottom" }), // 로고 → STEP1
  slide({ direction: "from-right" }), // STEP1 → STEP2
  slide({ direction: "from-right" }), // STEP2 → STEP3
  wipe({ direction: "from-bottom" }), // STEP3 → 맞춤 조정
  wipe({ direction: "from-bottom" }), // 맞춤 조정 → STEP4
  slide({ direction: "from-right" }), // STEP4 → STEP5
  wipe({ direction: "from-bottom" }), // STEP5 → 몰아보기
  fade(), // 몰아보기 → 마무리
  fade(), // 마무리 → 엔딩
];

export const PROMO_DURATION = buildTimeline(SCENES, MUSIC.happy).total;

export const RooterPromo: React.FC = () => <PromoTimeline scenes={SCENES} presentations={PRESENTATIONS} layout="v" music={MUSIC.happy} />;
