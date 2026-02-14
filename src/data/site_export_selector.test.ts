/* @vitest-environment node */

import { describe, expect, it } from "vitest";

const selector = require("../../scripts/site_export_selector.js");

describe("site export selector", () => {
  it("selects the best candidate by score formula", () => {
    const candidates = [
      {
        root: "A",
        valid: true,
        totalReports: 30,
        focusSum: 0,
        hasEvidenceIndex: true,
        indexMtimeMs: 1000,
      },
      {
        root: "B",
        valid: true,
        totalReports: 20,
        focusSum: 14,
        hasEvidenceIndex: true,
        indexMtimeMs: 900,
      },
      {
        root: "C",
        valid: false,
        totalReports: 999,
        focusSum: 999,
        hasEvidenceIndex: true,
        indexMtimeMs: 9999,
      },
    ];

    expect(selector.computeCandidateScore(candidates[0])).toBe(30010);
    expect(selector.computeCandidateScore(candidates[1])).toBe(21410);

    const result = selector.chooseCandidateFromList(candidates, {
      focusTracks: ["critical_minerals", "maritime_logistics"],
    });
    expect(result.selected.root).toBe("A");
  });

  it("finds better focus candidate when selected has zero focus", () => {
    const selected = {
      root: "A",
      valid: true,
      totalReports: 30,
      focusSum: 0,
      hasEvidenceIndex: true,
      indexMtimeMs: 1000,
    };
    const better = {
      root: "B",
      valid: true,
      totalReports: 20,
      focusSum: 14,
      hasEvidenceIndex: true,
      indexMtimeMs: 900,
    };
    const other = {
      root: "C",
      valid: true,
      totalReports: 10,
      focusSum: 4,
      hasEvidenceIndex: true,
      indexMtimeMs: 1100,
    };

    const found = selector.findBetterFocusCandidate(selected, [selected, better, other]);
    expect(found?.root).toBe("B");
  });

  it("supports explicit override root", () => {
    const candidates = [
      {
        root: "A",
        valid: true,
        totalReports: 10,
        focusSum: 0,
        hasEvidenceIndex: true,
        indexMtimeMs: 100,
      },
      {
        root: "B",
        valid: true,
        totalReports: 5,
        focusSum: 14,
        hasEvidenceIndex: true,
        indexMtimeMs: 200,
      },
    ];

    const result = selector.chooseCandidateFromList(candidates, {
      explicitRoot: "A",
      focusTracks: ["critical_minerals", "maritime_logistics"],
    });
    expect(result.reason).toBe("explicit_override");
    expect(result.selected.root).toBe("A");
  });

  it("uses lexical path order as final deterministic tie-breaker", () => {
    const candidates = [
      {
        root: "C:/vault/site_export/v1-b",
        valid: true,
        totalReports: 10,
        focusSum: 2,
        hasEvidenceIndex: true,
        indexMtimeMs: 1000,
      },
      {
        root: "C:/vault/site_export/v1-a",
        valid: true,
        totalReports: 10,
        focusSum: 2,
        hasEvidenceIndex: true,
        indexMtimeMs: 1000,
      },
    ];

    const result = selector.chooseCandidateFromList(candidates, {
      focusTracks: ["critical_minerals", "maritime_logistics"],
    });
    expect(result.selected.root).toBe("C:/vault/site_export/v1-a");
  });
});
