/* @vitest-environment node */

import { describe, expect, it } from "vitest";
import { getAllReportsIndex, getDossier } from "@/data/loaders";
import type { Indicator, ReportIndexEntry } from "@/data/types";

const TARGET_ISO3 = new Set(["HUN", "MEX", "MYS"]);
const REQUIRED_INDICATORS = [
  "IND-A1-REG-001",
  "IND-A1-REG-002",
  "IND-A8-ESG-004",
  "IND-A4-INF-001",
  "IND-A6-LAB-001",
] as const;

const REQUIRED_BY_DOMAIN: Record<string, readonly string[]> = {
  A1: ["IND-A1-REG-001", "IND-A1-REG-002"],
  A4: ["IND-A4-INF-001"],
  A6: ["IND-A6-LAB-001"],
  A8: ["IND-A8-ESG-004"],
};

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

describe("Sprint 16 expansion v2 wiring", () => {
  it("keeps WGI/LPI/HCI indicators present and shaped for HU/MX/MY dossiers", async () => {
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

      const indicatorsById = new Map(
        dossier.domains.flatMap((domain) => domain.indicators.map((indicator) => [indicator.id, indicator]))
      );

      for (const indicatorId of REQUIRED_INDICATORS) {
        const indicator = indicatorsById.get(indicatorId);
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

        const year = parseYear(indicator.year);
        expect(
          year,
          `Dossier "${slug}" indicator "${indicatorId}" has invalid year "${indicator.year ?? "null"}".`
        ).not.toBeNull();
        if (year !== null) {
          expect(year).toBeGreaterThanOrEqual(1990);
          expect(year).toBeLessThanOrEqual(currentYear + 1);
        }

        expect(indicator.unit.trim().length).toBeGreaterThan(0);
        expect(Array.isArray(indicator.urls)).toBe(true);
        expect(indicator.urls?.some((url) => url.trim().length > 0)).toBe(true);
      }

      for (const [domainId, ids] of Object.entries(REQUIRED_BY_DOMAIN)) {
        const domain = dossier.domains.find((item) => item.id === domainId);
        expect(domain, `Dossier "${slug}" is missing ${domainId} domain.`).toBeDefined();
        if (!domain) continue;

        for (const id of ids) {
          const inDomain = domain.indicators.some((indicator) => indicator.id === id);
          expect(
            inDomain,
            `Dossier "${slug}" domain ${domainId} is missing indicator ${id}.`
          ).toBe(true);
        }
      }
    }
  });
});
