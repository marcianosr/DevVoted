---
# DVTD-x939
title: StoragePlan meter section — terminal theme, story only
status: completed
type: task
priority: normal
created_at: 2026-09-02T17:17:27Z
updated_at: 2026-09-02T17:22:53Z
---

Replace design for the shop's seven-row storage-plan radio: one three-zone meter (held / paid headroom / next-rung dashed extension), current+next rung rows with drop/upgrade pills, ladder summary line, persistent burn state. Story variants only — NOT wired into ShopScreen until the DVTD-unjq fork is decided.

- [x] StoragePlan.ui.tsx in src/ui/terminal-theme (plain data props, no radios, real buttons)
- [x] Meter: proportional dashed zone, 2px cap tick, labels under zones, role=img
- [x] Burn state: amber drop pill, amber doomed slice, persistent aria-live line
- [x] StoragePlan.stories.tsx: mid-run, free rung, burn, ceiling (data derived from STORAGE_PLANS)
- [x] Verify: lint, tests, build, story typecheck via scratchpad tsconfig

Deferred (integration, blocked on DVTD-unjq fork): mount in ShopScreen replacing PlanRow list; collapse BUILD STORAGE slot band to '18 of 24 · 6 free' while this section renders; dex ↗ target (Dex Storage tab).

## Summary of Changes

- `src/ui/terminal-theme/StoragePlan.ui.tsx` — new Tier-1 section: inline-rule header (cap · bill, rent amount in saffron, free on rung 1), three-zone CapMeter (bar total = next rung cap so the dashed zone is proportional to what upgrading buys; 2px zinc tick; labels absolutely positioned under their zones; role=img with a three-zone aria-label), current/next rung rows using Dot on/off glyphs (no radios), local pill Action buttons (zinc / viridian upgrade / saffron burn-drop), derived burn state (heldKb minus drop.toKb → amber slice + amber drop pill + persistent aria-live line described-by the drop button), ladder summary via plural() with an at-the-ceiling reading when next is absent. KB formatting reuses shared formatStorage (KB under 1024, MB one decimal, space before unit). One sanctioned comment marks the upgrade/drop verb exception.
- `src/ui/terminal-theme/StoragePlan.stories.tsx` — four variants derived from the real STORAGE_PLANS ladder: OnTheOneMbRung, FreeRung, DropWouldBurn (812 KB on 1 MB → burns 44 KB · Telemetry), AtTheCeiling.
- Not wired into ShopScreen (blocked on the DVTD-unjq fork); the old PlanRow radio list stays live.

Verification: lint clean (oxlint + depcruise, 903 modules), tsc --noEmit clean, story typechecked clean via a scratchpad tsconfig (stories are excluded from the project tsconfig), tests 2633 passed / 3 failed — the 3 failures are pre-existing in the committed, superseded modern-theme RewardScreen spec, untouched by this change.

Known compromise: Dot fixed aria-labels read running/skipped for the current/next rung — the spec pinned the existing glyphs, so their labels came along.
