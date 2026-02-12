const fs = require("node:fs");
const path = require("node:path");
const AdmZip = require("adm-zip");

const vaultDir = process.env.CLARUM_VAULT_DIR ? path.resolve(process.env.CLARUM_VAULT_DIR) : null;
const zipPath = path.resolve(process.env.CLARUM_VAULT_ZIP || "13 - Lattice Labs.zip");
const exportPrefix = "13 - Lattice Labs/Clarum/09 - Publishing/site_export/v1/";
const exportDirRelative = path.join("Clarum", "09 - Publishing", "site_export", "v1");
const exportDirFromVault = vaultDir ? path.join(vaultDir, exportDirRelative) : null;
const destDir = path.resolve("public", "data", "site_export.v1");
const indexPath = path.join(destDir, "index", "index.reports.v1.json");

function copyDirectoryRecursive(sourceDir, targetDir) {
  let fileCount = 0;
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(targetPath, { recursive: true });
      fileCount += copyDirectoryRecursive(sourcePath, targetPath);
      continue;
    }

    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(sourcePath, targetPath);
    fileCount += 1;
  }

  return fileCount;
}

fs.rmSync(destDir, { recursive: true, force: true });
fs.mkdirSync(destDir, { recursive: true });

let extractedCount = 0;
let syncSource = "none";

if (exportDirFromVault && fs.existsSync(exportDirFromVault)) {
  extractedCount = copyDirectoryRecursive(exportDirFromVault, destDir);
  syncSource = `vault_dir (${exportDirFromVault})`;
} else {
  if (vaultDir) {
    console.warn(
      `[sync] CLARUM_VAULT_DIR set but export folder not found at ${exportDirFromVault}; falling back to zip source.`
    );
  }

  if (!fs.existsSync(zipPath)) {
    console.warn(
      `[sync] Export zip not found at ${zipPath}; skipping site_export sync. (Set CLARUM_VAULT_DIR to sync from a folder.)`
    );
    process.exit(0);
  }

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
    syncSource = `zip (${zipPath})`;
  } catch (error) {
    console.warn("[sync] Failed to extract site_export from zip.");
    process.exit(0);
  }
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

console.log(`[sync] Source: ${syncSource}`);
console.log(`[sync] Extracted ${extractedCount} files to public/data/site_export.v1.`);
console.log(`[sync] Index present: ${hasIndex ? "yes" : "no"}`);
console.log(`[sync] Sample report present: ${hasReport ? "yes" : "no"}`);
