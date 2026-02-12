const fs = require("node:fs");
const path = require("node:path");
const AdmZip = require("adm-zip");

const zipPath = path.resolve(process.env.CLARUM_VAULT_ZIP || "13 - Lattice Labs.zip");
const vaultPrefix = "13 - Lattice Labs/Clarum/";
const destRoot = path.resolve(".context", "clarum-vault", "13 - Lattice Labs", "Clarum");

const notePaths = [
  "01 - Framework/Lattice Risk Framework.md",
  "01 - Framework/LRF-1 — Indicator Library (v1).md",
  "01 - Framework/LRF-1 — Rubric Anchors & Thresholds (v1).md",
  "01 - Framework/LRF-1 — Weight Profiles (EV, Battery, Semis).md",
  "02 - Evidence Library/Evidence Tiering & Gating.md",
  "02 - Evidence Library/Source Register.md",
  "03 - Product/Clarum — PRD.md",
  "03 - Product/Clarum — Output Spec (Dossier).md",
  "03 - Product/Clarum — Report Schema (JSON).md",
  "04 - Data & Ontology/Clarum — Data Quality Flags.md",
  "08 - Operations/Clarum — AI Chat Context.md",
  "09 - Legal & Brand/Disclaimers & Limitations.md",
  "00 - Dashboard & Index/Clarum — Roadmap.md",
];

if (!fs.existsSync(zipPath)) {
  console.error(`Missing vault zip at ${zipPath}`);
  process.exit(1);
}

const targets = new Set(
  notePaths.map((rel) => `${vaultPrefix}${rel}`.replace(/\\/g, "/"))
);

let extractedCount = 0;
const extractedRelPaths = new Set();
const topLevelFolders = new Set();

try {
  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries();

  for (const entry of entries) {
    const entryName = entry.entryName.replace(/\\/g, "/");
    if (!targets.has(entryName)) continue;
    if (entry.isDirectory) continue;

    const relativePath = entryName.slice(vaultPrefix.length);
    if (!relativePath) continue;

    const outputPath = path.join(destRoot, relativePath);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, entry.getData());
    extractedCount += 1;
    extractedRelPaths.add(relativePath);

    const topLevel = relativePath.split("/")[0];
    if (topLevel) topLevelFolders.add(topLevel);
  }
} catch (error) {
  console.error("[sync-notes] Failed to extract vault notes.");
  process.exit(1);
}

const missing = notePaths.filter((rel) => !extractedRelPaths.has(rel));
if (missing.length) {
  console.warn(`[sync-notes] Missing ${missing.length} note(s):`);
  for (const rel of missing) {
    console.warn(`- ${rel}`);
  }
}

console.log(`[sync-notes] Extracted ${extractedCount} files into .context.`);
console.log(`[sync-notes] Top-level folders: ${Array.from(topLevelFolders).join(", ")}`);
