import { describe, expect, it } from "vitest";
import {
  deriveTrackFromReportId,
  normalizeTrack,
  parseTrackFromSearchParam,
} from "@/data/track";

describe("track parsing", () => {
  it("derives critical minerals and maritime logistics tracks from report ids", () => {
    expect(
      deriveTrackFromReportId("india.critical_minerals.wp-critical-minerals-1.0.report.v1")
    ).toBe("critical_minerals");
    expect(
      deriveTrackFromReportId(
        "singapore.maritime_logistics.wp-maritime-logistics-1.0.report.v1.json"
      )
    ).toBe("maritime_logistics");
  });

  it("keeps existing track derivations stable", () => {
    expect(deriveTrackFromReportId("mexico.ev_oem_export.sample.report.v1.json")).toBe(
      "ev_oem_export"
    );
    expect(deriveTrackFromReportId("hungary.ev_oem_domestic.sample.report.v1.json")).toBe(
      "ev_oem_domestic"
    );
    expect(deriveTrackFromReportId("mys.semi_osat_export.sample.report.v1.json")).toBe(
      "semi_osat_export"
    );
  });

  it("falls back safely for unknown values", () => {
    expect(deriveTrackFromReportId("unknown.track.example")).toBe("other");
    expect(normalizeTrack("export")).toBe("ev_oem_export");
    expect(normalizeTrack("domestic")).toBe("ev_oem_domestic");
    expect(parseTrackFromSearchParam("not-real-track")).toBeNull();
  });
});
