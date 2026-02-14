/* @vitest-environment node */

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const {
  copyDashboardsToDestination,
  DASHBOARD_TARGET_FILENAMES,
} = require("../../scripts/site_export_dashboards.js");

const tempDirs: string[] = [];

async function makeDir(root: string, relativePath: string) {
  const target = path.join(root, relativePath);
  await fs.mkdir(target, { recursive: true });
  return target;
}

async function writeJson(root: string, relativePath: string, value: Record<string, unknown>) {
  const filePath = path.join(root, relativePath);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value)}\n`, "utf8");
}

async function createTempWorkspace() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "clarum-site-export-dash-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  while (tempDirs.length > 0) {
    const target = tempDirs.pop();
    if (!target) continue;
    await fs.rm(target, { recursive: true, force: true });
  }
});

describe("site export dashboards sync", () => {
  it("chooses the dashboards source with most target matches", async () => {
    const root = await createTempWorkspace();
    const exportRoot = await makeDir(root, "Clarum/09 - Publishing/site_export/v1");
    const destinationRoot = await makeDir(root, "website/public/data/site_export.v1");

    const preferred = await makeDir(root, "Clarum/04 - Data & Ontology/Ontology/_machine/dashboards");
    const secondary = await makeDir(root, "Clarum/09 - Publishing/site_export/_machine/dashboards");

    await writeJson(preferred, DASHBOARD_TARGET_FILENAMES[0], { a: 1 });
    await writeJson(preferred, DASHBOARD_TARGET_FILENAMES[1], { b: 2 });
    await writeJson(secondary, DASHBOARD_TARGET_FILENAMES[0], { c: 3 });

    const result = copyDashboardsToDestination(exportRoot, destinationRoot);

    expect(result.mode).toBe("copied");
    expect(result.source_dir).toBe(path.resolve(preferred));
    expect(result.files_copied).toEqual(
      [DASHBOARD_TARGET_FILENAMES[0], DASHBOARD_TARGET_FILENAMES[1]].sort((a, b) =>
        a.localeCompare(b)
      )
    );
  });

  it("returns missing mode when dashboards source is absent", async () => {
    const root = await createTempWorkspace();
    const exportRoot = await makeDir(root, "Clarum/09 - Publishing/site_export/v1");
    const destinationRoot = await makeDir(root, "website/public/data/site_export.v1");

    const result = copyDashboardsToDestination(exportRoot, destinationRoot);

    expect(result.mode).toBe("missing");
    expect(result.files_copied).toEqual([]);
    expect(result.files_missing.length).toBeGreaterThan(0);
  });
});
