/* @vitest-environment node */

import { describe, expect, it } from "vitest";
import { getAllReportsIndex, getDossier } from "@/data/loaders";
import type { Indicator, ReportIndexEntry } from "@/data/types";

const TARGET_ISO3 = new Set(["HUN", "MEX", "MYS"]);
const REQUIRED_A8_IDS = ["IND-A8-ESG-001", "IND-A8-ESG-002"] as const;
const COUNTRY_NAME_TO_ISO3: Record<string, string> = {
  HUNGARY: "HUN",
  MALAYSIA: "MYS",
  MEXICO: "MEX",
};

type ReportIndexEntryWithIso3 = ReportIndexEntry & {
  country_iso3?: string;
};

function resolveIso3(entry: ReportIndexEntryWithIso3) {
  const explicitIso3 = entry.country_iso3?.trim().toUpperCase();
  if (explicitIso3) return explicitIso3;
  const normalizedCountry = entry.country?.trim().toUpperCase();
  return COUNTRY_NAME_TO_ISO3[normalizedCountry] ?? null;
}

function parseNumericValue(value: Indicator["value"]) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  const trimmed = value.trim();
  if (!trimmed) return null;
  const numeric = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
}

function parseYear(value: string | null) {
  if (!value) return null;
  const match = value.match(/\b(19|20)\d{2}\b/);
  if (!match) return null;
  const year = Number(match[0]);
  return Number.isFinite(year) ? year : null;
}

describe("A8 ESG export wiring", () => {
  it("keeps CPI and EPI indicators present for HU/MX/MY dossiers", async () => {
    const index = await getAllReportsIndex();
    const targetEntries = index.reports.filter((entry) =>
      TARGET_ISO3.has(resolveIso3(entry as ReportIndexEntryWithIso3) ?? "")
    );

    expect(targetEntries.length).toBeGreaterThan(0);

    const currentYear = new Date().getFullYear();

    for (const entry of targetEntries) {
      const slug = entry.dossier_slug || entry.id;
      expect(slug).toBeTruthy();

      const dossier = await getDossier(slug);
      expect(dossier, `Failed to load dossier "${slug}" via getDossier().`).not.toBeNull();
      if (!dossier) continue;

      const a8Domain = dossier.domains.find((domain) => domain.id === "A8");
      expect(a8Domain, `Dossier "${slug}" is missing A8 domain.`).toBeDefined();
      if (!a8Domain) continue;

      for (const indicatorId of REQUIRED_A8_IDS) {
        const indicator = a8Domain.indicators.find((item) => item.id === indicatorId);
        expect(
          indicator,
          `Dossier "${slug}" is missing expected indicator ${indicatorId}.`
        ).toBeDefined();
        if (!indicator) continue;

        const numericValue = parseNumericValue(indicator.value);
        expect(
          numericValue,
          `Dossier "${slug}" indicator "${indicatorId}" has non-numeric value "${indicator.value}".`
        ).not.toBeNull();
        if (numericValue === null) continue;
        expect(numericValue).toBeGreaterThanOrEqual(0);
        expect(numericValue).toBeLessThanOrEqual(100);

        const year = parseYear(indicator.year);
        expect(
          year,
          `Dossier "${slug}" indicator "${indicatorId}" has invalid year "${indicator.year ?? "null"}".`
        ).not.toBeNull();
        if (year === null) continue;
        expect(year).toBeGreaterThanOrEqual(1990);
        expect(year).toBeLessThanOrEqual(currentYear + 1);

        expect(indicator.unit).toContain("Score");
        expect(Array.isArray(indicator.urls)).toBe(true);
        expect(indicator.urls?.[0]?.trim().length ?? 0).toBeGreaterThan(0);
      }
    }
  });
});
