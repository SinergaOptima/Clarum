import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import EvidenceDetailPage, { generateStaticParams } from "./page";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/data/loaders", () => ({
  getAllEvidenceList: () =>
    Promise.resolve([
      {
        id: "ev-hun-customs-2024",
        title: "Hungary customs throughput update",
        publicationDate: "2024-01-02",
        sourceType: "Report",
        tier: "A",
        urls: [],
        summary: "Summary",
        tags: ["customs"],
      },
    ]),
  getEvidence: (id: string) =>
    Promise.resolve(
      id === "ev-hun-customs-2024"
        ? {
            item: {
              id: "ev-hun-customs-2024",
              title: "Hungary customs throughput update",
              publicationDate: "2024-01-02",
              sourceType: "Report",
              tier: "A",
              urls: [],
              summary: "Summary",
              tags: ["customs"],
            },
            markdown: "Rail clearance times fell by ~12% year over year.",
          }
        : null
    ),
  getEvidenceBacklinks: () =>
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
}));

describe("EvidenceDetailPage", () => {
  it("renders evidence content and backlinks", async () => {
    const element = await EvidenceDetailPage({
      params: Promise.resolve({ id: "ev-hun-customs-2024" }),
    });
    render(element);

    expect(
      screen.getByRole("heading", { name: "Hungary customs throughput update" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Rail clearance times fell by ~12% year over year.")
    ).toBeInTheDocument();
    expect(screen.getByText("Hungary EV OEM Export Readiness")).toBeInTheDocument();
    expect(screen.getByText("customs")).toBeInTheDocument();
  });

  it("renders not found when the id is missing", async () => {
    const element = await EvidenceDetailPage({
      params: Promise.resolve({ id: "missing-id" }),
    });
    render(element);

    expect(screen.getByText("Evidence not found")).toBeInTheDocument();
  });

  it("generates static params from evidence ids", async () => {
    const params = await generateStaticParams();

    expect(params.length).toBeGreaterThan(0);
    expect(params).toContainEqual({ id: "ev-hun-customs-2024" });
  });
});
