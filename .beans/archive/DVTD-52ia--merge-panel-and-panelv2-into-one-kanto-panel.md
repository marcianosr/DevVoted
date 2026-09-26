---
# DVTD-52ia
title: Merge Panel and PanelV2 into one kanto Panel
status: completed
type: task
priority: normal
created_at: 2026-09-14T15:37:06Z
updated_at: 2026-09-14T15:50:59Z
---

The kanto kit ships two panels. `Panel.ui.tsx` is the old one: a bare div carrying chrome and padding in one class string, plus a `PANEL_CHROME` escape hatch. `PanelV2.ui.tsx` is the current design: a compound section with Header/Body/Columns/Rows/Row/Footer whose surface has no padding, so each region pads itself and the rules reach the edge.

Every rebuilt screen already wears V2. Seven stragglers still use the old one, and the "V2" suffix is now noise on the only design that is current.

Merge them: migrate the stragglers, delete the old file, rename PanelV2 to Panel.

## Decisions

- **Drop `w-full` from the surface.** No tailwind-merge here, so conflicts resolve by emitted-CSS order, and `.w-full` is emitted after `.w-80`/`.w-100`/`.w-fit`. A base `w-full` silently beats every call-site width. Load-bearing: `ConfigChip` floats ConfigInfo and Upgrades in an absolutely positioned span that shrink-wraps its child, so `w-full` there would collapse a 320px info card to chip width. Safe to drop: every current call site sits in a block, flex-col or grid parent where a block-level section fills anyway.
- **Like-for-like swap, no restyle.** `Panel.Body` reproduces the old surface's `gap-4 px-4 py-4` exactly. Restyling CommunityScreen's lists into headed row panels is separate work.

## Todo

- [x] Migrate CodeBlock, ConfigInfo, Upgrades, CommunityScreen onto PanelV2 + Panel.Body
- [x] Migrate Confirm.stories and PlanChange.stories scenery
- [x] Modal: swap to the V2 surface constant, wrap children in Body
- [x] PollResult: swap to the V2 surface, move padding into its own FOLD const, keep its inset rule
- [x] Drop `w-full` from PANEL_V2_SURFACE
- [x] Delete old Panel.ui/spec/stories, carrying the Modal-dialog test into the V2 spec
- [x] Fix the misleading width test so it asserts the surface has no `w-full`
- [x] Rename PANEL_V2_SURFACE then PanelV2, git mv the three files, retitle the story
- [x] Update the two open beans that cite PanelV2 by name
- [x] Verify: npm test, npm run lint, npm run build

## Summary of Changes

One `Panel` in the kanto kit. The V1 file, spec and stories are gone; `PanelV2` took the name.

**Migrated onto the compound panel** (children wrapped in `Panel.Body`, which reproduces V1's `gap-4 px-4 py-4` exactly): `CodeBlock`, `ConfigInfo`, `Upgrades`, `CommunityScreen` (3 sites), `Confirm.stories`, `PlanChange.stories`. `Modal` keeps its own `role="dialog"` div for the aria wiring, wears `PANEL_SURFACE`, and wraps its children in `Panel.Body`. `PollResult` swaps `PANEL_CHROME` for `PANEL_SURFACE` and carries the padding in its own `FOLD` const, so its rule stays inset rather than full-bleed.

**`w-full` is off the surface.** Measured in headless Chrome against Storybook: a `w-80` panel is 320px, ConfigInfo 320px, Upgrades 386px (hugging, under its 448 cap), Modal 400px, and an unconstrained panel still fills its column (834px) and its grid cell (401px of 834px). Before this, the base `w-full` would have won all four.

**Renamed** `PANEL_V2_SURFACE` to `PANEL_SURFACE` and `PanelV2` to `Panel` across 25 files, including all nine exported types. The stories file had local scenery helpers `BuildPanelV2`/`RegistryPanelV2` that would have collided with its own exported stories `BuildPanel`/`RegistryPanel`; they are now `BuildCard`/`RegistryCard`/`RegistryCardInRows`. The redundant `const SURFACE = PANEL_SURFACE` alias is gone.

**Specs:** V1's "is the surface a modal's dialog wears" carried over (it was the only thing pinning Modal to the kit chrome). V1's `InAFixedColumn` story carried over as `AtAFixedWidth`. Added "claims no width of its own" - the old width test asserted only that `w-80` was *present*, so it passed while `w-full` overrode it.

**Verification:** `tsc --noEmit` clean; 4346 passing, the only 2 failures are the pre-existing `gate.model.spec` floor-rule pair; `lint:arch` clean (984 modules). `terminal-theme` and `old-theme` untouched.

## Follow-ups worth a bean

- `PanelTable.ui.tsx` is now the last V1-era artefact in the kit. Its `-mx-4 -my-4` bleed exists to cancel a padded surface, which is exactly what PanelV2 was built to remove. Sole consumer is `Ledger`.
- `CommunityScreen`'s Turnout and Conversation panels are row lists wearing a plain `Panel.Body`. They would read better as `Panel.Header` + `Panel.Rows`, like the shop and prep panels. Deliberately out of scope here (like-for-like swap).
- Compound subcomponents are still an unwritten convention: the kit otherwise uses slot props, and 11 components now depend on this one. Possibly ADR-082.
