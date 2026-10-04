---
# DVTD-bam1
title: Add 50 new profile frames from the frame pack
status: completed
type: task
priority: normal
created_at: 2026-10-04T16:59:58Z
updated_at: 2026-10-04T17:28:06Z
---

**What:** Fifty new frames from the downloaded frame pack join the borders players can buy, compressed and priced across all four rarities.

**Why:** The shop has 33 frames; the pack holds 1280 unused ones, and a first batch tests size and pricing before adding the rest.

## Done when
- [x] Fifty frames not already in the shop are on sale
- [x] Each has a name, a description, a rarity and a price
- [x] The new images are compressed so the shipped folder stays small
- [x] Lint, typecheck and tests pass

## Notes
Source: ~/Downloads/Frames (1304 files, SHA-1 names; 24 already shipped in public/borders). Catalog lives in border.model.ts.

## Summary of Changes

50 frames added to border.model.ts (24 common, 15 rare, 10 epic, 1 legendary). 46 PNGs converted to WebP with cwebp (q85, alpha_q90): 42 MB down to 0.46 MB, no visible loss. 4 APNGs kept as-is (3.2 MB): no ffmpeg, so ImageMagick can't make animated WebP. public/borders went from 20 MB to 24 MB. The wiki's top border price is now 48 MB. Changelog entry added. 1230 frames remain in the pack.

Follow-up: hand-drawn Route 64 border (Kanto × Banjo-Kazooie SVG, epic, 6 MB).

Follow-up: pixel-art tributes Twycross Farm (Rareware × Stardew) and Chips × Mult (Balatro), both epic 8 MB; borders tab and Dex notes moved under the header; services note shortened.

Follow-up: Stardew and Rareware split into Pelican Town and Twycross; added Wild Encounter (Game Freak) and Dot Matrix (Nintendo DMG).
