import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: () => null,
}));

vi.mock("@/components/DomainNav", () => ({
  DomainNav: () => null,
}));

vi.mock("@/components/IndicatorTable", () => ({
  IndicatorTable: () => null,
}));

vi.mock("@/components/InfoPanel", () => ({
  InfoPanel: () => null,
}));

vi.mock("@/components/KeyValueRow", () => ({
  KeyValueRow: () => null,
}));

vi.mock("@/components/SectionHeader", () => ({
  SectionHeader: () => null,
}));

vi.mock("@/components/ui/Badge", () => ({
  Badge: () => null,
}));

vi.mock("@/data/loaders", () => ({
  getAllDossiers: () =>
    Promise.resolve([
      {
        id: "hungary-gd-hun-ev-oem-export-001",
        slug: "hungary-gd-hun-ev-oem-export-001",
        title: "Hungary EV OEM Export Readiness",
        country: "Hungary",
        track: "export",
        trackLabel: "Export",
        profileId: "WP-EV-OEM-EXPORT-1.1",
        confidenceScore: 0.33,
        completenessScore: 0.49,
        summary: "Summary",
        tierSummary: { A: 1, B: 0 },
        flags: [],
      },
    ]),
  getAllEvidenceList: () => Promise.resolve([]),
  getDossier: () => Promise.resolve(null),
}));

import { generateStaticParams } from "./page";

describe("DossierDetailPage", () => {
  it("generates static params from dossier slugs", async () => {
    const params = await generateStaticParams();

    expect(params.length).toBeGreaterThan(0);
    expect(params).toContainEqual({ slug: "hungary-gd-hun-ev-oem-export-001" });
  });
});
