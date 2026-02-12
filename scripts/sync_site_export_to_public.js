const fs = require("node:fs");
const path = require("node:path");
const AdmZip = require("adm-zip");

const zipPath = path.resolve(process.env.CLARUM_VAULT_ZIP || "13 - Lattice Labs.zip");
const exportPrefix = "13 - Lattice Labs/Clarum/09 - Publishing/site_export/v1/";
const destDir = path.resolve("public", "data", "site_export.v1");
const indexPath = path.join(destDir, "index", "index.reports.v1.json");

if (!fs.existsSync(zipPath)) {
  console.warn(`[sync] Export zip not found at ${zipPath}; skipping site_export sync.`);
  process.exit(0);
}

fs.rmSync(destDir, { recursive: true, force: true });
fs.mkdirSync(destDir, { recursive: true });

let extractedCount = 0;

try {
  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries();

  for (const entry of entries) {
    const entryName = entry.entryName.replace(/\\/g, "/");
    if (!entryName.startsWith(exportPrefix)) continue;
    if (entry.isDirectory) continue;

    const relativePath = entryName.slice(exportPrefix.length);
    if (!relativePath) continue;

    const outputPath = path.join(destDir, relativePath);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, entry.getData());
    extractedCount += 1;
  }
} catch (error) {
  console.warn("[sync] Failed to extract site_export from zip.");
  process.exit(0);
}

const hasIndex = fs.existsSync(indexPath);
let hasReport = false;
if (hasIndex) {
  try {
    const indexRaw = fs.readFileSync(indexPath, "utf8");
    const indexJson = JSON.parse(indexRaw);
    const firstReport = indexJson?.reports?.[0];
    if (firstReport?.path) {
      hasReport = fs.existsSync(path.join(destDir, firstReport.path));
    }
  } catch {
    hasReport = false;
  }
}

console.log(`[sync] Extracted ${extractedCount} files to public/data/site_export.v1.`);
console.log(`[sync] Index present: ${hasIndex ? "yes" : "no"}`);
console.log(`[sync] Sample report present: ${hasReport ? "yes" : "no"}`);
