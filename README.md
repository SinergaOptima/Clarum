# Clarum

Clarum is an evidence-led interface for market entry readiness. The site is
locked to the v2 visual system to keep hierarchy, spacing, and interaction
patterns consistent across pages.

## Quickstart (Bun)

```bash
bun install
bun dev
```

Then open http://localhost:3000.

## Data

Content in `src/demo/` is sample content used to validate information
architecture and evidence linkage patterns.

### Memos (site_export)

Report index entries may include `memo_json_path` and `memo_md_path`. When
`public/data/site_export.v1` is synced from the vault, memo files are expected
to live under that bundle (relative to the export root). If memos are missing,
regenerate them in the vault pipeline (Fill Runner + generate_memos +
site_export rebuild) and re-run the sync script.

## Static export

Dynamic routes for dossiers and evidence use `generateStaticParams()` to
pre-render all demo slugs and ids at build time.

## Scripts

- `bun dev` - run the Next.js app
- `bun run build` - build
- `bun run lint` - Biome lint
- `bun run format` - Biome format
