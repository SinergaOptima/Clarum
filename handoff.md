# Clarum Handoff (for next AI session)

## 1) Current Snapshot
- Project: Next.js 16 + React 19 + Bun.
- Visual direction is now **locked to V2 only** (single theme).
- UI focus is dossier/evidence browsing with cleaner copy and hierarchy.
- Command palette remains global (`Ctrl/Cmd + K`) for navigation/search.
- Data now loads from `site_export/v1` when available, with demo fallback.

## 2) What Was Changed

### V2 style lock
- Removed multi-theme plumbing and selectors.
- `src/app/layout.tsx`
  - Hardcoded `data-theme="v2"`.
  - Removed theme provider usage.
  - Reduced font set to `Space_Grotesk`, `Manrope`, `JetBrains_Mono`.
- `src/app/globals.css`
  - Rewritten to a single V2 token set.
  - Removed v1/v3/v4/v5 branches.

### Navigation and shell cleanup
- `src/components/AppShell.tsx`
  - Removed demo badge + theme switch UI.
  - Removed “Design Lab” from primary nav.
  - Added mobile menu toggle + mobile nav panel.
  - Added `useId()` for accessible `aria-controls`.

### Homepage hierarchy improvements
- `src/app/page.tsx`
  - Reworked hero and “at a glance” section.
  - Removed duplicated/redundant stats presentation.
  - Updated copy to product-facing language.
- `src/components/Hero.tsx`
  - Added customizable CTA labels.

### Dossiers/Evidence page quality improvements
- `src/app/dossiers/page.tsx`
- `src/app/evidence/page.tsx`
  - Cleaner copy.
  - Active-state filter chips for better scanability.

### Evidence detail safety fix
- Removed unsafe HTML injection path.
- `src/lib/markdown.ts`
  - Replaced HTML renderer with safe block parser (`heading`/`paragraph`/`list`).
- `src/app/evidence/[id]/page.tsx`
  - Renders structured blocks instead of `dangerouslySetInnerHTML`.

### Copy and docs cleanup
- `src/app/about/page.tsx`
- `src/app/methodology/page.tsx`
- `src/app/not-found.tsx`
- `src/app/design-lab/page.tsx`
- `README.md`
  - Shifted tone away from “design exploration/demo”.

### Tooling fixes
- `biome.json`
  - Fixed key: `trailingCommas`.
  - Scoped scanning via `files.includes` + `ignoreUnknown`.
  - Prevents repo-wide linting of generated/vault files.
- Added `.biomeignore`.
- `package.json`
  - Removed `marked` dependency (no longer used).
  - Added `sync-site-export` script; `predev`/`prebuild` run it before Next.

### Data wiring (Sprint 11)
- Added loader layer: `src/data/types.ts`, `src/data/loaders.ts`.
- Pages now read real `site_export/v1` data (dossiers, evidence, detail pages).
- Command palette indexes real dossiers/evidence.
- Demo fallback shows a footer-only “DEMO MODE” when export bundle is missing.
- `scripts/sync_site_export_to_public.js` extracts `site_export/v1` from `13 - Lattice Labs.zip` into `public/data/site_export.v1` using `adm-zip`.

## 3) Validation Status
Executed successfully:
- `bun install`
- `bun run lint`
- `bun run check`
- `bun run build`

Latest build route output:
- Static: `/`, `/_not-found`, `/about`, `/dossiers`, `/evidence`, `/methodology`
- Dynamic: `/dossiers/[slug]`, `/evidence/[id]`

## 4) Important Notes for Next Bot
- This repo currently has many untracked files (initial/new workspace state). Be careful and avoid broad destructive git operations.
- `lint`/`check` now pass because Biome is scoped to source/config files only.
- Export bundle is sourced from `13 - Lattice Labs.zip` unless an external `public/data/site_export.v1` is present.
- Optional env override: `CLARUM_VAULT_ZIP` points to a different vault zip path.
- Theme system files were deleted:
  - `src/themes/themes.ts`
  - `src/themes/ThemeProvider.tsx`
  - `src/components/ThemeSwitcher.tsx`
  - `src/components/ThemeCard.tsx`
  - `src/components/DemoBadge.tsx`

## 5) Recommended Next Steps
1. Add tests around `renderMarkdown()` and evidence detail rendering to lock safety behavior.
2. Validate real `site_export/v1` bundle with `bun run build` and ensure indexes load.
3. If desired, do a typography micro-pass (heading sizes/line length only) without changing V2 tokens.

## 6) Quick Start for Next Session
```bash
bun install
bun dev
bun run lint
bun run check
bun run build
```
