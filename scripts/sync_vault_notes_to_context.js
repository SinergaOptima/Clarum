const fs = require("node:fs");
const path = require("node:path");
const AdmZip = require("adm-zip");

const vaultDir = process.env.CLARUM_VAULT_DIR;
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

const vaultCandidateRoots = vaultDir
  ? [path.resolve(vaultDir), path.join(path.resolve(vaultDir), "Clarum")]
  : [];

function resolveFromVaultDir(relativePathUnderClarumRoot) {
  for (const candidateRoot of vaultCandidateRoots) {
    const abs = path.join(candidateRoot, relativePathUnderClarumRoot);
    if (fs.existsSync(abs)) {
      return { absolutePath: abs, rootUsed: candidateRoot };
    }
  }
  return null;
}

let extractedCount = 0;
const extractedRelPaths = new Set();
const topLevelFolders = new Set();
const folderRootsUsed = new Set();
const unresolvedForZip = [];
let zip = null;
let zipEntriesByName = null;

for (const relativePath of notePaths) {
  const resolved = resolveFromVaultDir(relativePath);
  if (resolved) {
    const outputPath = path.join(destRoot, relativePath);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, fs.readFileSync(resolved.absolutePath));
    extractedCount += 1;
    extractedRelPaths.add(relativePath);
    folderRootsUsed.add(resolved.rootUsed);

    const topLevel = relativePath.split("/")[0];
    if (topLevel) topLevelFolders.add(topLevel);
    continue;
  }

  unresolvedForZip.push(relativePath);
}

if (unresolvedForZip.length > 0) {
  if (!fs.existsSync(zipPath)) {
    console.error(`Missing vault zip at ${zipPath}`);
    process.exit(1);
  }

  try {
    zip = new AdmZip(zipPath);
    zipEntriesByName = new Map(
      zip
        .getEntries()
        .filter((entry) => !entry.isDirectory)
        .map((entry) => [entry.entryName.replace(/\\/g, "/"), entry])
    );
  } catch (error) {
    console.error("[sync-notes] Failed to read vault zip.");
    process.exit(1);
  }

  for (const relativePath of unresolvedForZip) {
    const zipEntryPath = `${vaultPrefix}${relativePath}`.replace(/\\/g, "/");
    const entry = zipEntriesByName.get(zipEntryPath);
    if (!entry) continue;

    const outputPath = path.join(destRoot, relativePath);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, entry.getData());
    extractedCount += 1;
    extractedRelPaths.add(relativePath);

    const topLevel = relativePath.split("/")[0];
    if (topLevel) topLevelFolders.add(topLevel);
  }
}

const missing = notePaths.filter((rel) => !extractedRelPaths.has(rel));
if (missing.length) {
  console.warn(`[sync-notes] Missing ${missing.length} note(s):`);
  for (const rel of missing) {
    console.warn(`- ${rel}`);
  }
}

if (folderRootsUsed.size > 0) {
  console.log(`[sync-notes] Source: vault_dir (${Array.from(folderRootsUsed).join(", ")})`);
} else {
  console.log(`[sync-notes] Source: vault_zip (${zipPath})`);
}
console.log(`[sync-notes] Wrote ${extractedCount} notes.`);
console.log(`[sync-notes] Top-level folders: ${Array.from(topLevelFolders).join(", ")}`);

const missingOutputs = notePaths.filter((rel) => {
  const outputPath = path.join(destRoot, rel);
  return !fs.existsSync(outputPath);
});
if (missingOutputs.length) {
  console.warn(`[sync-notes] Missing ${missingOutputs.length} output file(s) under .context:`);
  for (const rel of missingOutputs) {
    console.warn(`- ${rel}`);
  }
}
