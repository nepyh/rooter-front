import assert from "node:assert/strict";
import test from "node:test";
import {
  findGenerationNotice,
  getGenerationSignature,
  getGenerationStatus,
  hasGeneratingBoard,
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
