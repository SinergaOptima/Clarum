import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  detectKnownDashboardKind,
  isKnownKind,
  normalizeDashboardsIndex,
  sortDashboards,
} from "@/data/dashboards";

describe("dashboards helpers", () => {
  it("parses dashboards index fixture", () => {
    const fixturePath = path.join(
      process.cwd(),
      "src",
      "data",
      "__fixtures__",
      "dashboards.index.sample.v1.json"
    );
    const raw = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
    const parsed = normalizeDashboardsIndex(raw);
    expect(parsed).not.toBeNull();
    expect(parsed?.dashboards).toHaveLength(4);
    expect(parsed?.dashboards[0].name).toBe("deltas_7c.v1.json");
  });

  it("detects known kinds deterministically", () => {
    expect(detectKnownDashboardKind({ name: "deltas_7c.v1.json" })).toBe("deltas");
    expect(
      detectKnownDashboardKind({ name: "tier_a_backlog_bundle_7c.v1.json" })
    ).toBe("tier_a_backlog_bundle");
    expect(detectKnownDashboardKind({ name: "static_usage_report_7c.v1.json" })).toBe(
      "static_usage_report"
    );
    expect(detectKnownDashboardKind({ name: "quality_lift_wave7_summary_7c.v1.json" })).toBe(
      "quality_lift_wave_summary"
    );
    expect(isKnownKind(undefined, "z_misc.v1.json")).toBe(false);
  });

  it("sorts dashboards stably by known kind then name", () => {
    const input = [
      { name: "z_misc.v1.json", relpath: "dashboards/z_misc.v1.json", kind: null },
      { name: "deltas_7c.v1.json", relpath: "dashboards/deltas_7c.v1.json", kind: "ops_deltas" },
      {
        name: "quality_lift_wave7_summary_7c.v1.json",
        relpath: "dashboards/quality_lift_wave7_summary_7c.v1.json",
        kind: null,
      },
    ];
    const sorted = sortDashboards(input);
    expect(sorted.map((item) => item.name)).toEqual([
      "deltas_7c.v1.json",
      "quality_lift_wave7_summary_7c.v1.json",
      "z_misc.v1.json",
    ]);
  });
});
