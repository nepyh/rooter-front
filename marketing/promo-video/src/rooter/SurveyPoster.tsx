import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { QrCode } from "./scenes/Horizontal";
import { MascotLogoFace } from "./scenes/StoryScenes";
import { C, FONT } from "./theme";

// ================================
// 루터 사용 후기 설문 홍보: 인스타 피드(1080x1350) · 스토리(1080x1920)
// 설문: 약 2분, 질문 4개, 개인정보 안 받음
// ================================

export const SURVEY_URL = "https://docs.google.com/forms/d/e/1FAIpQLSenvP3u_MsCyz5dvE0mB5JKQ5WGLnl_VtnjZ4F2etjxF7eW0A/viewform";

const QUESTIONS = ["공부 계획, 지키기 적당했나요?", "할 일 뒤 퀴즈, 도움이 됐나요?", "가장 자주 쓴 기능은?", "불편했거나 있었으면 하는 점"];

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ padding: "12px 24px", borderRadius: 999, background: C.card, fontSize: 30, fontWeight: 600, color: C.white, letterSpacing: -0.5 }}>{children}</div>
);

const Questions: React.FC<{ width: number }> = ({ width }) => (
  <div style={{ width, display: "flex", flexDirection: "column", gap: 14 }}>
    {QUESTIONS.map((q, i) => (
      <div key={q} style={{ display: "flex", alignItems: "center", gap: 20, padding: "20px 26px", borderRadius: 22, background: C.card }}>
        <div style={{ width: 46, height: 46, borderRadius: 14, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 600, flexShrink: 0 }}>{i + 1}</div>
        <div style={{ fontSize: 31, fontWeight: 600, letterSpacing: -0.8 }}>{q}</div>
      </div>
    ))}
  </div>
);

const Base: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.bg} 35%, ${C.warmBottom} 100%)`, fontFamily: FONT.body, color: C.white, overflow: "hidden" }}>
    <div style={{ position: "absolute", right: -200, top: -160, width: 820, height: 820, borderRadius: "50%", background: `radial-gradient(circle, ${C.primary}55 0%, transparent 65%)` }} />
    {children}
  </AbsoluteFill>
);

const Logo: React.FC = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
    <MascotLogoFace size={72} eyes={1} mouth={1} />
    <div style={{ fontFamily: FONT.logo, fontSize: 52, color: C.primary, letterSpacing: -1 }}>Rooter</div>
  </div>
);

const Headline: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ fontFamily: FONT.logo, fontSize: size, lineHeight: 1.2, letterSpacing: -3 }}>
    루터 써 보셨나요?
    <br />
    <span style={{ color: C.primary }}>사용 후기</span>를
    <br />
    들려주세요
  </div>
);

/** 피드 포스터 1080 x 1350 */
export const SurveyPoster: React.FC = () => (
  <Base>
    <div style={{ position: "absolute", left: 80, top: 80 }}><Logo /></div>

    <div style={{ position: "absolute", left: 80, top: 210 }}>
      <div style={{ display: "inline-block", padding: "10px 26px", borderRadius: 999, background: C.primary, fontSize: 32, fontWeight: 600 }}>SURVEY</div>
      <div style={{ marginTop: 26 }}><Headline size={88} /></div>
      <div style={{ marginTop: 26, display: "flex", gap: 12 }}>
        <Chip>약 2분</Chip>
        <Chip>질문 4개</Chip>
        <Chip>개인정보 없음</Chip>
      </div>
    </div>

    <Img src={staticFile("ruti2/teacher.png")} style={{ position: "absolute", right: 60, top: 450, width: 300 }} />

    <div style={{ position: "absolute", left: 80, top: 792 }}>
      <div style={{ fontSize: 28, fontWeight: 600, color: C.textDim, marginBottom: 16 }}>이런 걸 물어봐요</div>
      <Questions width={600} />
    </div>

    {/* QR */}
    <div style={{ position: "absolute", right: 80, top: 840, width: 300, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <div style={{ padding: 22, borderRadius: 30, background: "#fff" }}><QrCode url={SURVEY_URL} size={256} /></div>
      <div style={{ fontSize: 27, fontWeight: 600, color: C.textSub, textAlign: "center", lineHeight: 1.35 }}>카메라로 찍어서
        <br />바로 참여</div>
    </div>

    <div style={{ position: "absolute", bottom: 50, left: 80, right: 80, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ fontSize: 28, fontWeight: 600, color: C.textSub }}>여러분의 답이 다음 루터를 만들어요</div>
      <div style={{ fontSize: 26, color: C.textDim }}>링크는 프로필에</div>
    </div>
  </Base>
);

/** 스토리 1080 x 1920 (위 250·아래 340px는 인스타 UI 자리라 비움, 링크 스티커는 QR 아래 빈칸에) */
export const SurveyStory: React.FC = () => (
  <Base>
    <div style={{ position: "absolute", left: 80, top: 260 }}><Logo /></div>

    <div style={{ position: "absolute", left: 80, top: 400 }}>
      <div style={{ display: "inline-block", padding: "10px 26px", borderRadius: 999, background: C.primary, fontSize: 32, fontWeight: 600 }}>SURVEY</div>
      <div style={{ marginTop: 28 }}><Headline size={100} /></div>
      <div style={{ marginTop: 30, display: "flex", gap: 12 }}>
        <Chip>약 2분</Chip>
        <Chip>질문 4개</Chip>
        <Chip>개인정보 없음</Chip>
      </div>
    </div>

    <Img src={staticFile("ruti2/teacher.png")} style={{ position: "absolute", right: 50, top: 660, width: 300 }} />

    <div style={{ position: "absolute", left: 80, top: 1010 }}>
      <Questions width={920} />
    </div>

    {/* 아래: QR + 링크 스티커 자리 */}
    <div style={{ position: "absolute", left: 80, right: 80, top: 1440, display: "flex", alignItems: "center", gap: 36 }}>
      <div style={{ padding: 16, borderRadius: 24, background: "#fff", flexShrink: 0 }}><QrCode url={SURVEY_URL} size={230} /></div>
      <div style={{ fontSize: 34, fontWeight: 600, lineHeight: 1.4, letterSpacing: -0.8 }}>
        아래 링크를 누르거나
        <br />
        <span style={{ color: C.textSub }}>QR을 찍어 참여해 주세요</span>
      </div>
    </div>
  </Base>
);
