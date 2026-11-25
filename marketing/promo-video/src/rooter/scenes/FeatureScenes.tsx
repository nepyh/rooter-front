import React from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";
import { useFrame } from "../beat";
import { A, BackHeader, Button, Icon, LoadingSpinner, MascotFace, NavBar, NextButton, Page, PageTitle, T } from "../appUi";
import { clamp, ease, pop } from "../theme";
import { Bubble, FeatureScene, Hl, Ruti, Screen, Tap } from "../ui";

// ================================
// 기능 소개 장면의 폰 화면은 모두 루터 앱(rooter-front) 화면을 그대로 옮긴 것
// 화면마다 위에 해당 앱 파일 이름을 적어 둠. 좌표는 폰 화면(402 x 874) 기준
// 영상 속 오늘 = 2026-11-17 (화), 시험 = 2026-11-30 (월), D-13, 지금 18:42
// ================================

// ================================
// STEP 1 시험 날짜 → 목차 선택 → 플랜 생성
// ================================

/** app/Home/ExamDatePage + ExamDatePage/MonthNavigator, DateGrid (2026년 11월) */
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const NOV_WEEKS = [
  [1, 2, 3, 4, 5, 6, 7],
  [8, 9, 10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19, 20, 21],
  [22, 23, 24, 25, 26, 27, 28],
  [29, 30, -1, -2, -3, -4, -5], // 음수 = 다음 달
];
const TODAY = 17;
const EXAM = 30;

const ExamDateScreen: React.FC<{ pick: number }> = ({ pick }) => (
  <Page>
    <BackHeader />
    <PageTitle title="시험 날짜 선택" description="시험 날짜를 선택해주세요" style={{ paddingBottom: 20, borderBottom: `1px solid ${A.n600}` }} />
    <div style={{ flex: 1, paddingTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <T v="header-large">2026년 11월</T>
        <div style={{ display: "flex", gap: 4 }}>
          <div style={{ padding: 4 }}><Icon name="chevronLeft" size={24} /></div>
          <div style={{ padding: 4 }}><Icon name="chevronRight" size={24} /></div>
        </div>
      </div>
      <div>
        <div style={{ display: "flex", borderBottom: `1px solid ${A.n600}` }}>
          {WEEKDAYS.map((d, i) => (
            <div key={d} style={{ flex: 1, display: "flex", justifyContent: "center", padding: "8px 12px" }}>
              <T color={i === 0 || i === 6 ? A.textDim : A.text}>{d}</T>
            </div>
          ))}
        </div>
        {NOV_WEEKS.map((week, r) => (
          <div key={r} style={{ height: 87, display: "flex", borderBottom: r < NOV_WEEKS.length - 1 ? `1px solid ${A.n600}` : undefined }}>
            {week.map((d, i) => {
              const inMonth = d > 0;
              const weekend = i === 0 || i === 6;
              const selectable = !inMonth || d > TODAY;
              const selected = d === EXAM && pick > 0;
              return (
                <div key={i} style={{ flex: 1, position: "relative", display: "flex", justifyContent: "center", padding: "16px 4px" }}>
                  {selected ? (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 12,
                        border: `2px solid ${A.primary}`,
                        background: A.primary30,
                        opacity: Math.min(1, pick),
                        scale: String(0.85 + 0.15 * pick),
                      }}
                    />
                  ) : null}
                  {d === TODAY ? (
                    <div style={{ width: 28, height: 28, margin: "-4px 0", borderRadius: 99, background: A.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <T>{d}</T>
                    </div>
                  ) : (
                    <T color={inMonth && !weekend && selectable ? A.text : A.textDim} style={{ position: "relative" }}>{Math.abs(d)}</T>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
    <NextButton disabled={pick <= 0} />
  </Page>
);

/** app/Home/ChapterSelectPage + ChapterSelectPage/TopLevelAccordion, ChapterNode (11/17 변경: 하나라도 고르면 "N개 선택됨"이 주황색) */
const LEAVES = ["01. 일차함수의 뜻", "02. 일차함수의 그래프", "03. 기울기와 y절편", "04. 일차함수의 그래프의 성질"];

const Accordion: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
  <div style={children ? { background: A.n700, borderRadius: 12, overflow: "hidden" } : undefined}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
      <T v="header-large">{title}</T>
      <Icon name="chevronRight" size={28} style={{ rotate: children ? "90deg" : undefined }} />
    </div>
    {children ? (
      <div style={{ padding: "16px 20px 12px", display: "flex", flexDirection: "column", gap: 12, background: `linear-gradient(180deg, ${A.bg} 0%, ${A.n700} 8.4%)` }}>{children}</div>
    ) : null}
  </div>
);

export const ChapterScreen: React.FC<{ picked: number }> = ({ picked }) => (
  <Page>
    <BackHeader title="교과서 선택" right={<T v="base-large" w="semibold" color={picked > 0 ? A.primary : A.textDim}>{`${picked}개 선택됨`}</T>} />
    <PageTitle title="목차 선택" description="시험 범위에 알맞는 교과서의 목차를 선택해주세요" style={{ paddingBottom: 20 }} />
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Accordion title="1. 수와 식의 계산" />
      <Accordion title="2. 부등식과 연립방정식" />
      <Accordion title="3. 일차함수">
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <T v="base-large" w="medium">1. 일차함수와 그래프</T>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {LEAVES.map((leaf, i) => {
              const on = i < picked;
              return (
                <div key={leaf} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 8, background: on ? A.n600 : undefined }}>
                  {on ? <Icon name="check" size={20} /> : null}
                  <T v="base-large" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{leaf}</T>
                </div>
              );
            })}
          </div>
        </div>
      </Accordion>
      <Accordion title="4. 일차함수와 일차방정식" />
    </div>
  </Page>
);

/** app/Home/PlanGeneratingPage */
const GeneratingScreen: React.FC<{ frame: number }> = ({ frame }) => (
  <Page>
    <BackHeader />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28 }}>
      <LoadingSpinner frame={frame} />
      <T v="title-small">플랜 생성 중...</T>
    </div>
  </Page>
);

const PICK_AT = [66, 78];

export const InputScene: React.FC = () => {
  const frame = useFrame();
  const { fps } = useVideoConfig();
  const pickExam = pop(frame, fps, 26, 12);
  const picked = PICK_AT.filter((at) => frame >= at).length;

  return (
    <FeatureScene step="STEP 1" caption={<>시험 날짜랑<br />범위만 <Hl>콕콕</Hl></>} captionB={<>계획은 <Hl>AI가</Hl><br />알아서 뚝딱!</>} switchAt={112}
      ruti={{ name: "ai-robot", x: 740, y: 1490, w: 310, rotate: 8, delay: 104, from: "right" }}
      extras={
        <>
          <Ruti name="pencil-king" x={10} y={250} w={240} rotate={-12} delay={18} from="left" />
          <Bubble text="범위만 콕!" x={20} y={130} delay={28} />
          <Bubble text="계획 짜는 중..." x={470} y={1410} delay={114} tail="bottom-right" />
        </>
      }
      h={{
        label: "AI 계획",
        caption: <>범위만 알려 주면<br />계획은 <Hl>1분 컷</Hl></>,
        captionB: <><Hl>AI</Hl>가 시험 날까지<br />하루씩 나눠 줘요</>,
        points: [
          { text: "시험 날짜 고르기", x: 100, y: 685, at: 26 },
          { text: "교과서 목차에서 범위 콕", x: 150, y: 457, at: 66 },
          { text: "AI가 하루 단위로 계획", x: 201, y: 450, at: 114 },
        ],
      }}
    >
      <Screen from={0} to={52}>
        <ExamDateScreen pick={pickExam} />
        <Tap x={100} y={685} at={26} />
        <Tap x={201} y={788} at={44} />
      </Screen>

      <Screen from={52} to={110}>
        <ChapterScreen picked={picked} />
        <Tap x={180} y={457} at={PICK_AT[0]} />
        <Tap x={200} y={505} at={PICK_AT[1]} />
      </Screen>

      <Screen from={110} to={9999}>
        <GeneratingScreen frame={frame} />
      </Screen>
    </FeatureScene>
  );
};

// ================================
// STEP 2 홈 타임라인 (app/Home/Home + Home/HomeHeader, HourLines, PlanBlockCard, BusyBlockView, CurrentTimeLine, FloatingActions)
// ================================

const HEADER_BOTTOM = 62 + 12 + 28 + 16; // 홈 헤더 아래 끝
const TIMELINE_LEFT = 52;
const VIEW_FROM = 13.75 * 60; // 처음 보이는 시각(분). 1분 = 1px
const min = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

type Block = {
  start: string;
  end: string;
  title: string;
  bar: string;
  /** 교과서 할 일 이름 (없으면 시간 줄만) */
  task?: string;
  /** 바쁜 시간(학교·수면): 제목 + 시간 */
  busy?: boolean;
  at: number;
};

// src/constants/category.ts 과목 색: 국어 빨강, 수학 주황, 영어 진파랑, 과학 초록, 사회 노랑, 직접 추가한 일정은 회색
const BLOCKS: Block[] = [
  { start: "08:30", end: "16:30", title: "학교", bar: "#998F7A", busy: true, at: 0 },
  { start: "17:30", end: "19:30", title: "수학", bar: "#FF9452", task: "일차함수의 그래프 개념 정리", at: 14 },
  { start: "19:30", end: "20:30", title: "저녁 식사", bar: "#6C6C6C", at: 6 },
  { start: "20:30", end: "21:30", title: "영어", bar: "#5283FF", task: "Lesson 3 단어 외우기", at: 22 },
  { start: "22:00", end: "23:30", title: "과학", bar: "#81E468", task: "물질의 구성 요약", at: 30 },
  { start: "23:30", end: "24:00", title: "사회", bar: "#FFE252", task: "지도 읽기 복습", at: 38 },
];

/** utils/home/timeline.ts formatDuration */
const duration = (mins: number) => (mins % 60 === 0 ? `${mins / 60}시간` : mins < 60 ? `${mins}분` : `${Math.floor(mins / 60)}시간 ${mins % 60}분`);

const Line: React.FC<{ icon: "book" | "history"; text: string; flex?: boolean }> = ({ icon, text, flex }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 4, flex: flex ? 1 : undefined, minWidth: 0 }}>
    <Icon name={icon} size={12} color={A.muted} />
    <T v="base-caption" color={A.muted} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{text}</T>
  </div>
);

/** Home/PlanBlockCard + PlanBlockText: 칸 높이에 맞춰 세로 줄 → 가로 한 줄 → 제목만 */
const PlanBlock: React.FC<{ b: Block; style?: React.CSSProperties }> = ({ b, style }) => {
  const mins = min(b.end) - min(b.start);
  const lines: { icon: "book" | "history"; text: string }[] = [
    ...(b.task ? [{ icon: "book" as const, text: b.task }] : []),
    { icon: "history", text: `${b.start} - ${b.end === "24:00" ? "00:00" : b.end} | ${duration(mins)}` },
  ];
  const avail = mins - 12;
  const column = 18 + lines.length * 18;
  const layout = b.busy ? (mins >= 40 ? "column" : "none") : column <= avail ? "column" : 36 <= avail ? "row" : "none";
  const shown = b.busy ? lines.slice(-1) : lines;
  return (
    <div
      style={{
        position: "absolute",
        top: min(b.start),
        height: mins,
        left: TIMELINE_LEFT,
        right: 0,
        display: "flex",
        gap: 8,
        padding: 4,
        borderRadius: 4,
        overflow: "hidden",
        background: `${b.bar}26`,
        ...style,
      }}
    >
      <div style={{ width: 4, height: "100%", borderRadius: 99, background: b.bar, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0, padding: "2px 0", display: "flex", flexDirection: "column", gap: 4 }}>
        <T v="base-small" w="medium">{b.title}</T>
        {layout === "column" ? shown.map((l) => <Line key={l.icon} {...l} />) : null}
        {layout === "row" ? (
          <div style={{ display: "flex" }}>
            {shown.map((l) => <Line key={l.icon} {...l} flex />)}
          </div>
        ) : null}
      </div>
    </div>
  );
};

/** 홈 화면. delay 만큼 늦게 블록이 차례로 들어오고, scroll 로 타임라인을 내림 */
export const HomeScreen: React.FC<{ delay?: number; scroll?: number; still?: boolean }> = ({ delay = 0, scroll = 0, still }) => {
  const now = useFrame();
  const frame = still ? 999 : now - delay;
  const { fps } = useVideoConfig();
  const fab = pop(frame, fps, 50, 12);

  return (
    <>
      {/* 타임라인 (스크롤 영역) */}
      <div style={{ position: "absolute", top: HEADER_BOTTOM, left: 24, right: 24, bottom: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: -VIEW_FROM + scroll, height: 1440 }}>
          {Array.from({ length: 24 }).map((_, h) => (
            <div key={h} style={{ position: "absolute", top: h * 60, left: 0, right: 0, display: "flex", alignItems: "center" }}>
              <T v="base-caption" color={A.textDim}>{`${String(h).padStart(2, "0")}:00`}</T>
              <div style={{ flex: 1, height: 1, background: A.n600, marginLeft: 8 }} />
            </div>
          ))}
          {BLOCKS.map((b) => {
            const p = pop(frame, fps, b.at, 13);
            return <PlanBlock key={b.title} b={b} style={{ opacity: p, translate: `${(1 - p) * 120}px 0px` }} />;
          })}
          {/* Home/CurrentTimeLine */}
          <div style={{ position: "absolute", top: min("18:42") - 9, left: 0, right: 0, display: "flex", alignItems: "center" }}>
            <div style={{ background: A.primary, borderRadius: 8, padding: "2px 4px" }}>
              <T v="base-caption" w="medium">18:42</T>
            </div>
            <div style={{ flex: 1, height: 2, background: A.primary, borderRadius: "0 99px 99px 0" }} />
          </div>
        </div>
      </div>

      {/* Home/HomeHeader */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: HEADER_BOTTOM, background: A.bg }}>
        <div style={{ position: "absolute", top: 62, left: 24, right: 24, padding: "12px 0 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <T v="header-large">11월 17일 (화)</T>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <T v="base-small" w="medium" color={A.textSub}>시험</T>
            <T v="header-medium">D-13</T>
          </div>
        </div>
      </div>

      {/* Home/FloatingActions: + / 반짝이(AI 채팅) */}
      <div style={{ position: "absolute", bottom: 874 - 840 + 96, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", padding: 4, borderRadius: 99, background: A.n700, border: `1px solid ${A.n600}`, scale: String(fab) }}>
          <div style={{ padding: 12 }}><Icon name="plus" size={20} /></div>
          <div style={{ padding: 12 }}><Icon name="sparkle" size={20} /></div>
        </div>
      </div>
      <NavBar active="홈" />
    </>
  );
};

export const PlanScene: React.FC = () => {
  const frame = useFrame();
  const scroll = interpolate(frame, [60, 140], [0, -60], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  return (
    <FeatureScene step="STEP 2" caption={<>오늘 뭐 할지<br /><Hl>시간표로 쫙</Hl></>} ruti={{ name: "model-student", x: 380, y: 1560, w: 330, rotate: -4, delay: 56, from: "bottom" }}
      extras={
        <>
          <Bubble text="학교 끝나고 바로 시작!" x={240} y={1470} delay={66} tail="bottom-right" />
        </>
      }
      h={{
        label: "오늘 시간표",
        caption: <>오늘은 <Hl>몇 시에</Hl><br /><Hl>뭘 할지</Hl>까지</>,
        points: [
          { text: "과목별 분량과 시간까지", x: 200, y: 300, at: 22 },
          { text: "식사·학교 시간은 빼고", x: 200, y: 425, at: 44 },
          { text: "할 일이 한눈에 정리", x: 330, y: 560, at: 66 },
        ],
      }}
    >
      <HomeScreen scroll={scroll} />
    </FeatureScene>
  );
};

// ================================
// STEP 3 학습 테스트 → 피드백 → 보충 학습
// ================================

/** quiz/QuizPage/QuizOptionRow 상태 */
type OptionState = "default" | "selected" | "correct";
const OPTION_STYLE: Record<OptionState, React.CSSProperties> = {
  default: { borderColor: A.n600 },
  selected: { borderColor: A.primary, background: A.primary30 },
  correct: { borderColor: A.success, background: A.success30 },
};

const OptionRow: React.FC<{ label: string; state: OptionState }> = ({ label, state }) => (
  <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center", padding: 20, borderRadius: 16, border: "2px solid", ...OPTION_STYLE[state] }}>
    {state === "correct" ? <Icon name="check" size={20} color={A.success} /> : null}
    <T v="base-large" style={{ textAlign: "center" }}>{label}</T>
  </div>
);

/** quiz/QuizPage/MascotBubble */
const QuizBubble: React.FC<{ text: string; p: number }> = ({ text, p }) => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: 4, display: "flex", gap: 12, alignItems: "flex-end", opacity: p, translate: `0px ${(1 - p) * 30}px` }}>
    <div style={{ flex: 1, background: A.n700, padding: "16px 20px", borderRadius: "20px 20px 0 20px" }}>
      <T v="base-large">{text}</T>
    </div>
    <MascotFace size={52} />
  </div>
);

const OPTIONS = ["1", "2", "-1"];
const ANSWER = 1;

/** app/Quiz/QuizPage + QuizCloseButton, QuizProgressBar, QuestionCard */
export const QuizScreen: React.FC<{ selected: boolean; graded: boolean; bubble: number }> = ({ selected, graded, bubble }) => (
  <Page>
    <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", gap: 32 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="close" size={24} />
        </div>
        <div style={{ flex: 1, display: "flex", gap: 4, height: 6 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ flex: 1, borderRadius: 99, background: i === 0 ? A.primary : A.n600 }} />
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <div style={{ minHeight: 200, padding: 20, borderRadius: 16, background: A.n700, display: "flex", flexDirection: "column", gap: 40, boxSizing: "border-box" }}>
          <div style={{ alignSelf: "flex-start", background: A.n600, borderRadius: 8, padding: "4px 12px" }}>
            <T v="header-small">Q1</T>
          </div>
          <T v="title-medium" style={{ textAlign: "center" }}>{"y = 2x + 1 의\n기울기는?"}</T>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {OPTIONS.map((o, i) => (
            <OptionRow key={o} label={o} state={i === ANSWER && selected ? (graded ? "correct" : "selected") : "default"} />
          ))}
        </div>
      </div>
      <QuizBubble text="정답이에요!" p={bubble} />
    </div>
    <div style={{ paddingTop: 16 }}>
      <Button disabled={!selected}>{graded ? "다음" : "확인"}</Button>
    </div>
  </Page>
);

/** quiz/FeedbackPage/FeedbackChip */
const Chip: React.FC<{ label: string; on: boolean }> = ({ label, on }) => (
  <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: 20, borderRadius: 16, border: `2px solid ${on ? A.primary : A.n600}`, background: on ? A.primary30 : undefined }}>
    <T v="base-large">{label}</T>
  </div>
);

/** quiz/FeedbackPage/FeedbackField */
const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <T>{label}</T>
    {children}
  </div>
);

/** app/Quiz/FeedbackPage */
const FeedbackScreen: React.FC<{ hard: boolean; focus: boolean }> = ({ hard, focus }) => (
  <Page>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
      <MascotFace size={76} />
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <T v="title-medium">오늘 공부 어땠나요?</T>
          <T color={A.textSub}>답변을 바탕으로 남은 계획에 보충 학습을 추가해 드릴게요</T>
        </div>
        <Field label="난이도">
          <div style={{ display: "flex", gap: 8 }}>
            {["쉬움", "중간", "어려움"].map((d) => <Chip key={d} label={d} on={d === "어려움" && hard} />)}
          </div>
        </Field>
        <Field label="집중도">
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2, 3, 4, 5].map((n) => <Chip key={n} label={String(n)} on={n === 4 && focus} />)}
          </div>
        </Field>
        <Field label="공부한 시간">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[["시작 시간", "17:30"], ["종료한 시간", "19:30"]].map(([l, v]) => (
              <div key={l} style={{ padding: "16px 20px", borderRadius: 16, background: A.n700 }}>
                <div style={{ minHeight: 34, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <T v="base-large" w="medium">{l}</T>
                  <div style={{ padding: "8px 12px", borderRadius: 99, background: A.n600 }}>
                    <T v="base-small">{v}</T>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Field>
      </div>
    </div>
    <Button disabled={!focus}>선택</Button>
  </Page>
);

/** quiz/FeedbackPage/FeedbackResult */
const FeedbackResultScreen: React.FC<{ added: number }> = ({ added }) => (
  <Page>
    <div style={{ flex: 1, paddingTop: 100, display: "flex", flexDirection: "column", gap: 20 }}>
      <MascotFace size={100} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <T v="title-medium">피드백을 완료했어요</T>
        <T v="base-large">{"오늘 공부는 '어려움'이었어요.\n남은 계획에 보충 학습을 추가했어요."}</T>
      </div>
      <div style={{ padding: 12, borderRadius: 8, background: A.n700, opacity: added, translate: `0px ${(1 - added) * 24}px` }}>
        <T w="medium">일차함수의 그래프 보충 학습</T>
        <T v="base-small" color={A.textSub}>2026-11-18</T>
      </div>
    </div>
    <Button>학습 테스트 종료</Button>
  </Page>
);

export const QuizScene: React.FC = () => {
  const frame = useFrame();
  const { fps } = useVideoConfig();
  const selected = frame >= 22;
  const graded = frame >= 38;
  const bubble = ease(frame, fps, 42);
  const hard = frame >= 84;
  const focus = frame >= 96;
  const added = pop(frame, fps, 124, 14);

  return (
    <FeatureScene step="STEP 3" caption={<>공부 끝나면<br /><Hl>퀴즈로</Hl> 확인</>} captionB={<>어려웠던 건<br /><Hl>알아서 보충!</Hl></>} switchAt={74} ruti={{ name: "detective", x: -40, y: 960, w: 280, rotate: -10, delay: 40, from: "left" }}
      extras={
        <>
          <Bubble text="정답!" x={20} y={860} delay={46} />
          <Ruti name="f-gongti" x={830} y={250} w={220} rotate={10} delay={92} />
          <Bubble text="보충도 알아서" x={660} y={150} delay={100} tail="bottom-right" />
        </>
      }
      h={{
        label: "퀴즈 · 피드백",
        caption: <>공부했으면<br /><Hl>바로 확인</Hl></>,
        captionB: <>약한 부분은<br /><Hl>보충 학습으로</Hl></>,
        points: [
          { text: "배운 범위로 바로 퀴즈", x: 201, y: 465, at: 24 },
          { text: "난이도·집중도 피드백", x: 322, y: 329, at: 86 },
          { text: "남은 계획에 보충 추가", x: 201, y: 420, at: 126 },
        ],
      }}
    >
      <Screen from={0} to={72}>
        <QuizScreen selected={selected} graded={graded} bubble={bubble} />
        <Tap x={201} y={465} at={22} />
        <Tap x={201} y={810} at={38} />
      </Screen>

      <Screen from={72} to={118}>
        <FeedbackScreen hard={hard} focus={focus} />
        <Tap x={322} y={329} at={84} />
        <Tap x={273} y={455} at={96} />
        <Tap x={201} y={810} at={112} />
      </Screen>

      <Screen from={118} to={9999}>
        <FeedbackResultScreen added={added} />
      </Screen>
    </FeatureScene>
  );
};

// ================================
// 맞춤: 공부 스타일 설문 (app/LearningSurvey/StudySurveyQuestion → StudySurveyLoading → StudySurveyComplete)
// 설문 문항은 src/api/learningSurvey/StudySurveyQuestion/questions.ts 그대로
// ================================

const SURVEY_TOTAL = 7;
const SURVEY: { step: number; title: string; options: string[]; pick: number }[] = [
  { step: 1, title: "하루 중 공부가 가장 잘 되는\n시간대는 언제인가요?", options: ["아침 (등교 전)", "오후 (학교 마친 직후)", "밤 (자기 전)", "모르겠어요"], pick: 2 },
  {
    step: 2,
    title: "새로운 내용을 공부할 때\n어떤 방식을 더 선호하나요?",
    options: ["교과서를 처음부터 차근차근 읽기", "문제부터 풀어보고 안 풀리는 부분만 찾아보기", "인강이나 영상으로 먼저 훑어보기", "모르겠어요"],
    pick: 1,
  },
];

/** learningSurvey/StudySurveyQuestion: SurveyQuestionHeader + SurveyQuestionView + 다음 버튼 */
const SurveyScreen: React.FC<{ q: (typeof SURVEY)[number]; picked: boolean }> = ({ q, picked }) => (
  <Page style={{ gap: 20 }}>
    <div style={{ display: "flex", gap: 16, alignItems: "center", padding: "16px 0" }}>
      <Icon name="chevronLeft" size={32} />
      <div style={{ flex: 1, display: "flex", gap: 4, height: 6 }}>
        {Array.from({ length: SURVEY_TOTAL }).map((_, i) => (
          <div key={i} style={{ flex: 1, borderRadius: 99, background: i <= q.step ? A.primary : A.n600 }} />
        ))}
      </div>
    </div>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 32 }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
        <MascotFace size={76} />
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <T v="title-medium">{q.title}</T>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {q.options.map((o, i) => {
              const on = picked && i === q.pick;
              return (
                <div key={o} style={{ padding: 20, borderRadius: 16, border: `2px solid ${on ? A.primary : A.n600}`, background: on ? A.primary30 : undefined }}>
                  <T v="base-large">{o}</T>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Button disabled={!picked}>다음</Button>
    </div>
  </Page>
);

/** ui/LoadingScreen ("공부 스타일 분석 중...") */
const SurveyLoadingScreen: React.FC<{ frame: number }> = ({ frame }) => (
  <Page>
    <div style={{ display: "flex", paddingBottom: 16 }}>
      <Icon name="chevronLeft" size={28} />
    </div>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28 }}>
      <LoadingSpinner frame={frame} />
      <T v="title-small">공부 스타일 분석 중...</T>
    </div>
  </Page>
);

/** learningSurvey/common/SurveyMessageScreen (StudySurveyComplete) */
const SurveyCompleteScreen: React.FC<{ p: number }> = ({ p }) => (
  <Page>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ scale: String(0.6 + 0.4 * p), transformOrigin: "0 100%" }}>
        <MascotFace size={100} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <T v="title-medium">공부 스타일 분석을 완료했어요</T>
        <T v="base-large">{"내 프로필에서 언제든지 다시\n공부 스타일을 분석할 수 있어요."}</T>
      </div>
    </div>
    <Button>다음</Button>
  </Page>
);

// 화면 전환 시점 (장면 단위)
const Q2 = 50;
const LOADING = 92;
const DONE = 118;

export const PersonalizeScene: React.FC = () => {
  const frame = useFrame();
  const { fps } = useVideoConfig();
  const done = pop(frame, fps, DONE, 11);

  return (
    <FeatureScene step="맞춤 설정" caption={<>나한테 맞는 공부법,<br /><Hl>설문 한 번</Hl>이면 끝</>} captionB={<>내 스타일 그대로<br /><Hl>계획에 쏙</Hl></>} switchAt={LOADING}
      h={{
        label: "공부 스타일",
        caption: <>내 공부 스타일까지<br /><Hl>알아서 맞춰요</Hl></>,
        captionB: <>잘 되는 시간대에<br /><Hl>맞춘 계획</Hl></>,
        points: [
          { text: "짧은 공부 스타일 설문", x: 201, y: 527, at: 24 },
          { text: "답에 맞춰 계획을 짜요", x: 201, y: 460, at: 66 },
          { text: "프로필에서 언제든 다시", x: 200, y: 262, at: 124 },
        ],
      }}
    >
      <Screen from={0} to={Q2}>
        <SurveyScreen q={SURVEY[0]} picked={frame >= 22} />
        <Tap x={201} y={527} at={22} />
        <Tap x={201} y={810} at={36} />
      </Screen>
      <Screen from={Q2} to={LOADING}>
        <SurveyScreen q={SURVEY[1]} picked={frame >= 64} />
        <Tap x={201} y={460} at={64} />
        <Tap x={201} y={810} at={78} />
      </Screen>
      <Screen from={LOADING} to={DONE}>
        <SurveyLoadingScreen frame={frame} />
      </Screen>
      <Screen from={DONE} to={9999}>
        <SurveyCompleteScreen p={done} />
      </Screen>
    </FeatureScene>
  );
};

// ================================
// STEP 4 AI 채팅 (Home/AiChatModal + ChatHeader, ChatSuggestions, ChatMessageItem, ChatInput)
// 홈에서 반짝이 버튼을 누르면 화면 90% 높이의 시트로 열림
// ================================

const USER_MSG = "오늘 너무 피곤해ㅠ 영어 단어 내일로 미뤄줘";
const AI_MSG = "알겠어요! 오늘 영어 단어 외우기를 내일 오후 5시로 옮겼어요.\n\n남은 일정은 그대로 두었으니 오늘은 푹 쉬고 내일 다시 힘내요!";
const SHEET_TOP = 874 - Math.round(874 * 0.9);

const HeaderButton: React.FC<{ icon: "listMinus" | "messagePlus" }> = ({ icon }) => (
  <div style={{ width: 44, height: 44, borderRadius: 99, background: A.n700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <Icon name={icon} size={24} />
  </div>
);

/** AI 채팅 시트 (frame 에 따라 입력 → 보내기 → 답변) */
export const ChatScreen: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const typing = frame >= 8 && frame < 46;
  const typed = Math.floor(interpolate(frame, [8, 40], [0, USER_MSG.length], clamp));
  const sent = frame >= 46;
  const userBubble = pop(frame, fps, 46, 14);
  const thinking = frame >= 54 && frame < 70;
  const aiTyped = Math.floor(interpolate(frame, [70, 112], [0, AI_MSG.length], clamp));
  const tools = ease(frame, fps, 114);
  const title = frame >= 70 ? "영어 단어 일정 미루기" : sent ? USER_MSG : "";
  const hasText = typing && typed > 0;

  return (
    <>
      {/* 시트 뒤: 어둡게 덮인 홈 화면 */}
      <HomeScreen still />
      <AbsoluteFill style={{ background: "rgba(0,0,0,0.4)" }} />

      {/* 시트 */}
      <div
        style={{
          position: "absolute",
          top: SHEET_TOP,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: "32px 32px 0 0",
          overflow: "hidden",
          background: `linear-gradient(180deg, ${A.bg} 0%, ${A.bg} 50%, ${A.chatBottom} 100%)`,
          padding: "8px 24px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        <div style={{ width: 104, height: 4, borderRadius: 99, background: A.n600, flexShrink: 0 }} />
        <div style={{ flex: 1, width: "100%", position: "relative" }}>
          {/* ChatHeader */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 36 }}>
            <HeaderButton icon="listMinus" />
            <T v="header-medium" style={{ flex: 1, minWidth: 0, textAlign: "center", padding: "0 20px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</T>
            <HeaderButton icon="messagePlus" />
          </div>

          {/* 메시지 */}
          {sent ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 40, paddingTop: 8 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, opacity: userBubble, translate: `0px ${(1 - userBubble) * 30}px` }}>
                <div style={{ maxWidth: "90%", padding: 16, borderRadius: "16px 0 16px 16px", background: A.n700 }}>
                  <T v="base-large" style={{ lineHeight: "24px", textAlign: "right" }}>{USER_MSG}</T>
                </div>
                <T v="base-small" color={A.textDim} style={{ paddingRight: 16 }}>오후 6시 42분</T>
              </div>
              {thinking ? <T v="base-large" color={A.textDim} style={{ lineHeight: "24px" }}>답변 생성 중...</T> : null}
              {frame >= 70 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <T v="base-large" style={{ lineHeight: "24px" }}>{AI_MSG.slice(0, aiTyped)}</T>
                  <div style={{ display: "flex", gap: 12, opacity: tools }}>
                    <Icon name="copy" size={24} color={A.n500} />
                    <Icon name="thumbUp" size={24} color={A.n500} />
                    <Icon name="thumbDown" size={24} color={A.n500} />
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            /* ChatSuggestions: 빈 대화일 때 입력창 위 */
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 40 + 58 + 40, display: "flex", flexDirection: "column", gap: 12 }}>
              {(
                [
                  ["calendarLine", A.primary, "일정 조절하기"],
                  ["pencilLine", A.secondary, "모르는 문제 질문하기"],
                ] as const
              ).map(([icon, color, label]) => (
                <div key={label} style={{ height: 58, display: "flex", alignItems: "center", gap: 10, padding: "0 12px 0 20px", borderRadius: 99, background: `${A.n700}80`, border: `1px solid ${A.n600}` }}>
                  <Icon name={icon} size={28} color={color} />
                  <T v="base-large" w="medium" style={{ lineHeight: "24px" }}>{label}</T>
                </div>
              ))}
            </div>
          )}

          {/* ChatInput */}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 40, display: "flex", alignItems: "flex-end", gap: 10, padding: "8px 8px 8px 20px", borderRadius: 28, background: A.n700, border: `1px solid ${A.n600}` }}>
            <T v="base-large" w="medium" color={hasText ? A.text : A.textDim} style={{ flex: 1, padding: "8px 0", lineHeight: "24px" }}>
              {hasText ? USER_MSG.slice(0, typed) : "루티에게 질문하기..."}
            </T>
            <div style={{ width: 40, height: 40, borderRadius: 99, background: hasText ? A.primary : A.n600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name="arrowUp" size={24} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const ChatScene: React.FC = () => {
  const frame = useFrame();
  return (
    <FeatureScene step="STEP 4" caption={<>일정 바꾸고 싶으면<br /><Hl>말만 해</Hl></>} ruti={{ name: "teacher", x: 10, y: 1500, w: 310, rotate: -6, delay: 74, from: "left" }}
      extras={
        <>
          <Bubble text="오늘은 푹 쉬어!" x={60} y={1410} delay={84} />
        </>
      }
      h={{
        label: "AI 채팅",
        caption: <>피곤한 날엔<br /><Hl>말 한마디</Hl>면 돼요</>,
        points: [
          { text: "일정 조절·문제 질문", x: 200, y: 640, at: 4 },
          { text: "채팅으로 일정 미루기", x: 200, y: 805, at: 30 },
          { text: "남은 계획은 알아서 정리", x: 200, y: 400, at: 88 },
        ],
      }}
    >
      <ChatScreen frame={frame} />
      <Tap x={354} y={806} at={44} />
    </FeatureScene>
  );
};

// ================================
// STEP 5 마이페이지 잔디 (app/More/More + More/ProfileCard, common/MoreSection, MenuGroup, MenuRow, More/ContributionGraph)
// ================================

// ContributionGraph 색: 0 = neutral-600, 1~5 = primary 진하기
const LEVEL_COLORS = [A.n600, `${A.primary}33`, `${A.primary}66`, `${A.primary}99`, `${A.primary}CC`, A.primary];

// 주(일요일 시작)를 첫날의 달로 묶음 (utils/more/contribution.ts). 오른쪽 끝(이번 주)까지 스크롤된 상태
const MONTHS = [
  { label: "8월", weeks: 2 },
  { label: "9월", weeks: 4 },
  { label: "10월", weeks: 4 },
  { label: "11월", weeks: 3 },
];
const WEEK_COUNT = MONTHS.reduce((s, m) => s + m.weeks, 0);
const TODAY_D = 2; // 11/17 화

/** 주(w)·요일(d) 칸의 완료 단계. 시험이 가까울수록 진해지도록 */
const levelOf = (w: number, d: number) => {
  const seed = Math.abs(Math.sin(w * 12.9898 + d * 78.233) * 43758.5453) % 1;
  if (w >= 10) return seed < 0.12 ? 3 : 3 + Math.floor(seed * 3);
  if (w >= 8) return seed < 0.25 ? 0 : 1 + Math.floor(seed * 3);
  return seed < 0.6 ? 0 : 1 + Math.floor(seed * 2);
};

const MenuRow: React.FC<{ icon: "bell" | "lock"; label: string }> = ({ icon, label }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, borderRadius: 12 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Icon name={icon} size={20} />
      <T w="medium">{label}</T>
    </div>
    <Icon name="chevronRight" size={24} color={A.n400} />
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ paddingTop: 32, display: "flex", flexDirection: "column", gap: 16 }}>
    <T w="medium" color={A.textSub}>{title}</T>
    {children}
  </div>
);

/** 마이페이지 (frame 에 따라 잔디가 차오름) */
export const GrassScreen: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const lastW = WEEK_COUNT - 1;
  const today = pop(frame, fps, 6 + lastW * 4 + 8, 8);

  let w0 = 0;
  const groups = MONTHS.map((m) => {
    const g = { ...m, from: w0 };
    w0 += m.weeks;
    return g;
  });

  return (
    <>
      <Page>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16 }}>
          <T v="header-large">마이페이지</T>
          <Icon name="bell" size={24} color={A.n400} />
        </div>

        {/* More/ProfileCard */}
        <div style={{ padding: 16, borderRadius: 16, background: A.n700, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: 99, background: A.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <T v="base-large" w="medium">루</T>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <T w="medium">루띠</T>
              <T color={A.textSub}>rootee@rooter.com</T>
            </div>
          </div>
          <Icon name="chevronRight" size={24} />
        </div>

        <Section title="일반">
          <div style={{ padding: 4, display: "flex", flexDirection: "column", gap: 4, borderRadius: 16, background: A.n700 }}>
            <MenuRow icon="bell" label="알림 설정" />
            <MenuRow icon="lock" label="계정" />
          </div>
        </Section>

        <Section title="데일리">
          {/* More/ContributionGraph */}
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", padding: 16, borderRadius: 16, background: A.n700 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {WEEKDAYS.map((d) => (
                <div key={d} style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <T v="base-small">{d}</T>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, overflow: "hidden", display: "flex", justifyContent: "flex-end" }}>
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                {groups.map((m) => (
                  <div key={m.label} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <T v="base-small" style={{ whiteSpace: "nowrap" }}>{m.label}</T>
                    <div style={{ display: "flex", gap: 4 }}>
                      {Array.from({ length: m.weeks }).map((_, j) => {
                        const w = m.from + j;
                        return (
                          <div key={w} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {Array.from({ length: 7 }).map((__, d) => {
                              if (w === lastW && d > TODAY_D) return <div key={d} style={{ width: 20, height: 20 }} />;
                              const isToday = w === lastW && d === TODAY_D;
                              const level = isToday ? 5 : levelOf(w, d);
                              const p = interpolate(frame, [6 + w * 4 + d, 14 + w * 4 + d], [0, 1], clamp);
                              return (
                                <div key={d} style={{ position: "relative", width: 20, height: 20, borderRadius: 4, background: A.n600 }}>
                                  {level > 0 ? (
                                    <div
                                      style={{
                                        position: "absolute",
                                        inset: 0,
                                        borderRadius: 4,
                                        background: LEVEL_COLORS[level],
                                        opacity: p,
                                        scale: String(isToday ? today * (1 + 0.15 * Math.sin(Math.min(today, 1) * Math.PI)) : 0.6 + 0.4 * p),
                                      }}
                                    />
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      </Page>
      <NavBar active="더보기" />
    </>
  );
};

export const GrassScene: React.FC = () => {
  const frame = useFrame();
  return (
    <FeatureScene step="STEP 5" caption={<>매일 채워지는<br /><Hl>공부 잔디</Hl></>} ruti={{ name: "fighting", x: 180, y: 1520, w: 300, rotate: -4, delay: 30, from: "bottom" }}
      extras={
        <>
          <Bubble text="오늘도 한 칸!" x={200} y={1430} delay={40} />
        </>
      }
      h={{
        label: "공부 잔디",
        caption: <>오늘 공부가<br /><Hl>한 칸씩</Hl> 쌓여요</>,
        points: [
          { text: "지킨 만큼 진해지는 잔디", x: 300, y: 560, at: 24 },
          { text: "꾸준함이 눈에 보여요", x: 340, y: 640, at: 56 },
        ],
      }}
    >
      <GrassScreen frame={frame} />
    </FeatureScene>
  );
};
