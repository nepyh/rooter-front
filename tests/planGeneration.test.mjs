import assert from "node:assert/strict";
import test from "node:test";
import {
  buildPendingGenerationItems,
  findGenerationNotice,
  getGenerationSignature,
  getGenerationStatus,
  getPendingGenerationKind,
  hasGeneratingBoard,
  mergeItemsByDate,
} from "../src/utils/home/planGeneration.ts";

const board = (overrides = {}) => ({
  id: 1,
  title: "기말",
  description: null,
  startDate: "2026-12-01",
  endDate: "2026-12-30",
  examDate: "2026-12-31",
  isArchived: false,
  isRepresentative: false,
  createdAt: "",
  updatedAt: "",
  ...overrides,
});

test("generationStatus 가 없는 옛 응답·캐시는 다 만든 플랜으로 본다", () => {
  assert.equal(getGenerationStatus(board()), "COMPLETED");
  assert.equal(hasGeneratingBoard([board()]), false);
  assert.equal(hasGeneratingBoard([board(), board({ id: 2, generationStatus: "GENERATING", generatedUntil: "2026-12-06" })]), true);
});

test("만드는 중인 플랜은 아직 만들지 않은 날짜에만 안내한다", () => {
  const generating = board({ generationStatus: "GENERATING", generatedUntil: "2026-12-06" });
  assert.equal(findGenerationNotice([generating], "2026-12-06"), null);
  assert.deepEqual(findGenerationNotice([generating], "2026-12-07"), { kind: "generating", board: generating });
  assert.equal(findGenerationNotice([generating], "2026-12-31"), null); // 기간 밖
  assert.equal(findGenerationNotice([board()], "2026-12-07"), null);
});

test("실패한 플랜은 다시 만들기 안내, 보관한 플랜은 안내하지 않고, 겹치면 대표 플랜을 먼저 본다", () => {
  const failed = board({ id: 2, generationStatus: "FAILED", generatedUntil: "2026-12-12", isRepresentative: true });
  const generating = board({ id: 3, generationStatus: "GENERATING", generatedUntil: "2026-12-06" });
  assert.deepEqual(findGenerationNotice([generating, failed], "2026-12-20"), { kind: "failed", board: failed });
  assert.equal(findGenerationNotice([board({ generationStatus: "FAILED", generatedUntil: "2026-12-12", isArchived: true })], "2026-12-20"), null);
});

test("생성 진행이 바뀔 때만 요약 문자열이 바뀐다", () => {
  const before = getGenerationSignature([board({ generationStatus: "GENERATING", generatedUntil: "2026-12-06" })]);
  const progressed = getGenerationSignature([board({ generationStatus: "GENERATING", generatedUntil: "2026-12-12" })]);
  const done = getGenerationSignature([board({ generationStatus: "COMPLETED", generatedUntil: null })]);
  assert.notEqual(before, progressed);
  assert.notEqual(progressed, done);
  assert.equal(getGenerationSignature([board()]), "");
});

test("캘린더에는 만들어진 다음 날부터 기간 끝까지, 보이는 범위 안에서만 표시한다", () => {
  const generating = board({ generationStatus: "GENERATING", generatedUntil: "2026-12-06" });
  const items = buildPendingGenerationItems([generating], "2026-11-29", "2026-12-09");
  assert.deepEqual(Object.keys(items), ["2026-12-07", "2026-12-08", "2026-12-09"]);
  assert.equal(items["2026-12-07"][0].kind, "generation");
  assert.equal(items["2026-12-07"][0].label, "계획 만드는 중");

  // 달이 바뀌고 기간이 끝나는 날까지
  const tail = buildPendingGenerationItems([generating], "2026-12-27", "2027-01-02");
  assert.deepEqual(Object.keys(tail), ["2026-12-27", "2026-12-28", "2026-12-29", "2026-12-30"]);

  const failed = board({ generationStatus: "FAILED", generatedUntil: "2026-12-29" });
  assert.equal(buildPendingGenerationItems([failed], "2026-12-01", "2026-12-31")["2026-12-30"][0].label, "계획 만들기 실패");
});

test("다 만들었거나 보관한 플랜은 캘린더에 표시하지 않고, 같은 날 표시는 하나만 둔다", () => {
  assert.equal(getPendingGenerationKind(board()), null);
  assert.equal(getPendingGenerationKind(board({ generationStatus: "GENERATING", isArchived: true })), null);
  assert.deepEqual(buildPendingGenerationItems([board({ generationStatus: "COMPLETED" })], "2026-12-01", "2026-12-31"), {});

  const a = board({ generationStatus: "GENERATING", generatedUntil: "2026-12-06" });
  const b = board({ id: 2, generationStatus: "GENERATING", generatedUntil: "2026-12-06" });
  assert.equal(buildPendingGenerationItems([a, b], "2026-12-07", "2026-12-07")["2026-12-07"].length, 1);

  const merged = mergeItemsByDate({ "2026-12-07": [{ kind: "exam", label: "기말", memo: "", category: "neutral" }] }, buildPendingGenerationItems([a], "2026-12-07", "2026-12-07"));
  assert.deepEqual(merged["2026-12-07"].map((item) => item.kind), ["exam", "generation"]);
});
