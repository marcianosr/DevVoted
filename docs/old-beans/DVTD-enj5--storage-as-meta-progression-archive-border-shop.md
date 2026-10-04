---
# DVTD-enj5
title: 'Storage as meta-progression: archive + border shop'
status: in-progress
type: feature
priority: normal
created_at: 2026-06-04T06:58:36Z
updated_at: 2026-06-04T07:09:56Z
---

Add persistent archive currency earned from leftover storage at run end. Profile page shows accumulated archive. Border shop lets users buy avatar frames with archive. See conversation for design decisions.

## Design decisions (locked)

- **Leftover definition**: `storageAvailable` only (`storageLimit - storageUsed`)
- **Death behavior**: Full conversion regardless of outcome (death or manual end-run)
- **Conversion rate**: 1:1 bytes for now; tune unlock prices later
- **Meta unlocks**: Cosmetics (avatar borders) + future starting-run resources
- **Naming**: "Archive" — symmetric with "Junk" already in StorageBreakdown
- **Home domain**: economy (owns storage, owns archive)
- **Border art**: user supplies asset files at public/borders/<id>.png

## Todo

- [x] Slice 1: Schema — add users.archived_storage bigint
- [x] Slice 1: Migration generated and applied (0056_burly_thunderbird.sql)
- [x] Slice 1: queries.archiveStorage + service.archiveLeftoverStorage
- [x] Slice 1: Hook into completeRunWithThresholdFailure (both death + manual paths)
- [x] Slice 1: Service tests (8 cases passing)
- [x] Slice 2: Simpler than planned — 3 cols on users instead of separate tables
- [x] Slice 2: Border catalog with 8 placeholder entries (user supplies art)
- [x] Slice 2: Server fns + handlers + transactional purchase
- [x] Slice 2: ArchiveSummary + BorderShop components, wired into profile route
- [x] Slice 2: AvatarWithBorder component used on profile header
- [x] All passing: lint 0/0, tsc clean, 372 tests, build success


## Summary of Changes

Implemented storage-as-meta-progression in one PR.

### Foundation (Slice 1)
- Added 3 columns to users table: archived_storage (bigint), owned_border_ids (text[]), equipped_border_id (text)
- Migration: drizzle/0056_burly_thunderbird.sql (applied to local dev DB)
- New service: src/domains/economy/services/archive.service.ts with calculateArchiveCredit + archiveLeftoverStorage
- New queries: src/domains/economy/api/archive.queries.ts with atomic credit + transactional purchase
- Wired into both run-end paths in runCompletion.service.ts (death + manual end)
- 8 unit tests covering: full credit, leftover after reroll/junk, zero on overspend, error swallowing

### UI + Shop (Slices 2+3)
- Border catalog: src/domains/economy/data/borders.ts — 8 dev-themed entries, 4 rarity tiers, pricing 256KB to 32MB
- Server fns: getArchiveStateServerFn, purchaseBorderServerFn, equipBorderServerFn
- TanStack Query hooks: useArchiveState, usePurchaseBorder, useEquipBorder with cache invalidation
- Components: ArchiveSummary, BorderShop (rarity-coded card grid), AvatarWithBorder
- Profile route updated to render archive section + shop for owner, avatar+border for everyone

### Design decisions in code
- Conversion rate: 1.0 (1:1), constant `ARCHIVE_CONVERSION_RATE` for easy tuning
- Death and manual end both credit fully
- Archive credit failure is non-critical (logs, swallows) — mirrors leaderboard pattern
- bigint column type (long-tail accounts can exceed int32)
- text[] for owned_border_ids matches existing active_config_ids pattern

### NOT done (user follow-up)
- Border art files: placeholders at /borders/<id>.png — user has assets, needs to drop them into public/borders/
- Browser verification: build + tests pass but no manual visual check
- No tuning of unlock prices — pricing is initial guess
