---
# DVTD-ein1
title: 'Gate swatches: badge-themed slot unlocks + gate-slot cap'
status: in-progress
type: feature
priority: normal
created_at: 2026-08-06T09:48:43Z
updated_at: 2026-08-06T13:50:52Z
---

Slot unlocks 4-12 get gym-badge Swatch theming (Boulder..Elite Four) in Kanto colors, shown as a full-width claim row on the shop (replaces the dashed Add slot tile). Mechanic: gate number may never exceed slot count (gate N requires slot N); VICTORY_GATE 5 -> 12 (picks up DVTD-g1p0). Coverage ladder numbers in pipeline.model.ts are live-tuned and untouched.

Related: DVTD-g1p0 (victory at 12), DVTD-g8ty (swatch collectibles, separate draft).

## Todo

- [x] rules.model.ts: VICTORY_GATE 5 -> 12
- [x] run.model.ts: closeWindow gate-slot freeze + clearedGate field
- [x] run.model.spec.ts + gateLadder.model.spec.ts updates
- [x] swatch.model.ts + spec
- [x] app.css swatch theme blocks + src/ui/theme/swatchTheme.ts
- [x] viewmodel clearedGateNumber + RewardScreen wiring
- [x] SlotSwatchRow.ui.tsx + stories + spec
- [x] RoleList shrink (drop LockedSlotRow/nextSlot)
- [x] ShopScreen + ConfiguringScreen swap + specs + stories
- [x] victoryGate story updates (RunHud, RunSummary, GameOverScreen)
- [x] wiki, CHANGELOG, ADR-018, DVTD-g1p0 update
- [x] npm test / lint / build green (113 files, 1106 tests)

## Swatch persistence (added mid-build, 2026-08-06)

Marciano: the swatch is also *gained* and should be stored in the backend.
Chosen: array on the users row, mirroring the shipped borders collectible.

- [x] users.owned_swatch_ids column + guarded migration (20260806120000)
- [x] server-side award in applyActionToRun (idempotent, re-unlock is a no-op)
- [x] getOwnedSwatches server fn + handler + fetchOwnedSwatchIds query
- [x] SwatchChips.ui + spec + stories (earned/locked/redacted)
- [x] surfaces: Configuring stat row, reward screen, run summary, Dex tab
- [ ] npm run db:push on the local database (schema.ts is edited; not pushed)

## Correction: every advance is bought, not just deep ones (2026-08-06)

Playtest on /proto-run: "I am already gate 2 ... even when I don't/can't claim the
slot the gate is increased. That should not happen. The gate only increases when
you claim."

The first pass read the rule as "gate N requires slot N", which let the three
starting slots carry gates 1-3 and only walled the climb on clearing gate 3.
Corrected so every gate past the first is bought with a slot:

- `slotsRequiredForGate(g) = g + BASE_SLOTS - 1` (gate 1 -> 3 slots, gate 12 -> 14).
- `closeWindow` holds unless the NEXT gate already fits.
- `addSlot` lands the pending advance, so the unlock button is literally what
  moves the climb. Extra width in the same shop banks for later gates.
- `MAX_SLOTS` 12 -> 14 with two new swatches (Lavender slot 12, Seafoam slot 13,
  Elite Four moved to 14) so 11 rungs cover the 11 advances to gate 12.
  Marciano chose this over shortening the run to gate 10.
- `VICTORY_GATE` is now derived: `MAX_SLOTS - BASE_SLOTS + 1`, asserted in spec.
- Coverage rungs for slots 13/14 (325, 415) extend the curve's own growth and are
  UNTUNED - flagged in pipeline.model.ts. The nine rungs Marciano set are untouched.
- Shop row now reads "Boulder Swatch . slot 4 . opens gate 2".

Verified by walking three gates through the reducer: cleared gate 1 -> HUD stays
gate 1 (held), unlock slot 4 -> HUD gate 2, cleared gate 2 -> holds, unlock slot 5
-> gate 3.

Pacing note for tuning (not changed): rung 1 is 8% while a solid player holds
~4-6.5% after gate 1, so gate 1 will usually be replayed once. Lower rung 1 if
that opening replay feels bad.

## HUD segment bar + Gate modifiers label (2026-08-06)

Marciano: "I miss the screen where you go see the message you stay on the gate" ->
root cause was proto-run.tsx never passing `slots`/`heldAtGate` to RewardScreen,
so the held state could not render on the rig (the real /run/reward route was
already wired). Also added `slots` to proto-run's RunSummary.

Then, from the HUD screenshot: "maybe you start on gate 0 ... I think this needs
segmented bars, instead of gate 1/12 only, then that can be combined with coverage
since it depends on coverage."

- [x] New Tier-1 `src/ui/runs/GateSegmentBar.ui.tsx` (+ spec + stories): one
  segment per gate, banked solid, live segment fills with coverage toward the
  next slot. Clamped, `role="progressbar"`.
- [x] Viewmodel exposes `unlockProgress` (0-1) so Tier 2 does no math.
- [x] HUD caption is now "gate {n} - {cleared} / {victoryGate} cleared" (chose
  showing BOTH over cleared-only, since the gate being played sets demands and
  the payout multiplier).
- [x] Configuring stat row labelled "Gate modifiers"; swatch tally split out
  under its own "Swatches n / 11" heading with an empty-state line.
- [x] RunHud props gained `gatesCleared` + `unlockProgress`; all 4 call sites
  updated (RunLayout, proto-run, spec, stories).

Verified by rendering the HUD from real reducer state: fresh run "gate 1 - 0/12"
bar 0%; held at gate 1 still "gate 1 - 0/12" but live segment 81% (6.5% of 8%);
after unlocking slot 4 "gate 2 - 1/12" with segment 1 solid and the live one 50%.

## Gate bar is the swatch ladder + hover map (2026-08-06)

Marciano: "on hover, you should see the gate names, and coverage requirements.
Each name, like 'boulder swatch' should be in the correct color" then "maybe show
each swatch as segmented bar already and just one per swatch".

- [x] `gateLadderRungs(victoryGate)` in swatch.model: gate -> opening swatch ->
  coverage price. Gate 1 has no swatch (base width), so no price.
- [x] `GateLadderPanel.ui.tsx` (+ spec + stories): the hover map. Each row is
  gate number, swatch chip, name in its own Kanto colour (`text-theme` under
  `data-swatch-theme`; Elite Four in zinc + legendary ring), and the coverage
  price, green once affordable. Cleared rungs ticked, current marked, gate 1
  reads "Starting pipeline / -". Hung off the HUD's gate block with `Tooltip`
  (CSS group-hover, so genuinely hover, matching the ask).
- [x] `GateSegmentBar` rewritten: segments now wear the colour of the swatch that
  opens each gate. Held solid, the rung being bought fills by coverage progress,
  the rest dimmed (opacity-20) as a collection preview. Gate 1 neutral zinc.
- [x] Elite Four needed a gradient FILL (a 1px `.legendary-ring` is invisible at
  1.5px tall) -> new `@utility bg-legendary` in app.css reusing the same stops
  and the same colour vars. No colour values in TS.
- [x] Viewmodel: `unlockProgress` replaced by `unlock: { gate, progress }` so the
  fill lands on the gate actually being paid for. Matters because width can be
  bought ahead, which would otherwise put the fill on the wrong segment.
- [x] **Moved GateSegmentBar out of `src/ui/runs/` into
  `modules/run/presentation/run/`**: `lint:arch` (ui-stays-presentational)
  correctly rejected the spec importing model *values*. The component understands
  gate rungs now, so generic UI was the wrong home. Rule not weakened.

Verified by printing every segment from real ladder data: gate 1 none/solid,
gates 2-5 boulder/cascade/thunder/rainbow solid, gate 6 soul at 68%, gates 7-12
dimmed in their colours with 12 = LEGENDARY.

## Mobile tap + the Pallet Swatch (2026-08-06)

"IT should also be tappable on mobile" -> the ladder only hung off the desktop
block via CSS-hover Tooltip. Mobile block restructured: row 1 keeps storage /
polls / streak + the Stakes dropdown; the gate block below is now its own
SummaryDropdown (tap), carrying the same caption, the same segment bar, and the
same GateLadderPanel. Panel gets max-w-[calc(100vw-2rem)] + overflow-x-auto so 12
rows fit a narrow screen. Desktop keeps hover.

"We start at gate 0, the pallet swatch! We should add that new color."

Slot 3 -- the last of the three you start with -- is now the **Pallet Swatch**,
free and held from the run's first moment. This removes the one wart in the model:
gate 1 previously had no opener ("Starting pipeline / -"), so now EVERY gate is
opened by a swatch, and the roster is exactly 12 for 12 gates.

- [x] `SLOT_SWATCHES[3]` = Pallet, theme "pallet"; `[data-swatch-theme="pallet"]`
  added to app.css pointing at the existing `--color-pallet` token.
- [x] `gateLadderRungs` prices base-slot rungs as free (no coverageRequired), and
  the panel renders "free" instead of "-".
- [x] Awarded server-side in `createSessionRunWithState` (run start), reusing the
  same idempotent `awardSlotSwatch` guard. Helper moved above its first use.
- [x] Invariant flipped: `ALL_SWATCHES.length === VICTORY_GATE` (was -1).
- [x] Bar's first segment now wears pallet instead of neutral grey.

NOTE ON NUMBERING: gates stay 1..12; Pallet opens gate 1. I did NOT renumber to
gates 0..11 (which would move the summit to gate 11 and churn every doc, ADR and
copy) -- "start at gate 0" is carried by the HUD's "0 / 12 cleared". Say the word
if you want the literal 0-indexed numbering.

Verified from real data: bar reads pallet-100% / boulder-20% / rest dimmed in
their own colours ending in the legendary gradient; ladder reads
"gate 1 Pallet Swatch free" then the 11 priced rungs.

## Gates count from 0 + HUD rework (2026-08-06)

Marciano: "I think everything should start at gate 0, not gate 1 - you work
towards gate 1 starting from 0." (The renumbering I had declined earlier.)

- [x] `slotsRequiredForGate(g) = g + BASE_SLOTS`; `gateOpenedBySlot(s) = s - BASE_SLOTS`.
  Pallet opens gate 0, Elite Four opens gate 11.
- [x] `VICTORY_GATE` 12 -> **11** (the summit's NUMBER, = MAX_SLOTS - BASE_SLOTS);
  new `GATE_COUNT` = 12 (how many gates). storageCreditRate divides by GATE_COUNT.
- [x] closeWindow: the gate being cleared IS `state.gatesCleared`; it increments
  on advance. Victory records `gateNumber + 1` so gatesCleared stays a true count.
- [x] **New `heldAtGate` flag on RunState.** Under 0-based numbering `clearedGate`
  and `gatesCleared` are EQUAL while held, so the old inference silently returned
  false and the held reward screen stopped appearing. The flag is explicit;
  `addSlot` reads it to land a pending advance; the viewmodel passes it through.
  This was a real bug caught by walking the reducer, not by the type checker.
- [x] `deriveGateLadder` + `gateLadderRungs` both take the FINAL gate and yield
  0…final inclusive, so the two agree.
- [x] HUD caption is one number: "gate 0 / 11" (gatesCleared == gate being played).
  `gateNumber` prop removed from RunHud as redundant.

### HUD, per Marciano's mockups
- [x] Pips: 12 squares (h-3 w-3, gap-1), each wearing its swatch colour; held
  solid, unheld dimmed and filling by coverage. Each pip is a `<button>` with a
  hover/tap popover: "gate 3 / Thunder Swatch / Opens at 28% coverage / you have
  19% · 9% to go" + GainBar. Gate label sits on top, per his last note.
- [x] **StorageGauge** (new): "328 KB free" big, bar of committed, "184 of 512
  used" caption. Replaces the inline KB meter. Stale "caps at 1 MB" copy fixed to
  512KB (STORAGE_CAP_KB was already 512).
- [x] He deleted GateLadderPanel (+spec/stories) and the mobile Stakes panel
  mid-session; I cleaned up the orphaned imports/tests rather than restoring them.

Caution for next time: I damaged RunHud.ui.tsx twice with bulk python str.replace
(lost MobileStakesPanel, the desktop streak readout, and the GateLadderPanel
import). On files being edited concurrently, use Edit with exact context or
rewrite whole - not multi-line pattern surgery.
