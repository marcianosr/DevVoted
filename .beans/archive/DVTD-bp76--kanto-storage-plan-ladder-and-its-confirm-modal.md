---
# DVTD-bp76
title: Kanto storage plan ladder and its confirm modal
status: completed
type: feature
priority: normal
created_at: 2026-09-10T14:41:38Z
updated_at: 2026-09-10T14:51:55Z
---

docs/wiki.md 5.1 and ADR-046 fully specify the storage plan and the domain
implements all of it, but kanto has no storage component at all: ShopScreen
composes only Header + Build + Registry.

Build the ladder from mock 409 and the confirmation from mock 410. The only
genuinely new drawing is the DOT CONNECTOR - nothing in the repo joins dots with
a line; every existing stepper separates items with a text glyph and flex gap.
Everything else composes what exists.

Plan: ~/.claude-work/plans/i-want-to-create-hidden-yeti.md

Marciano's calls: no new buttons; `downgrade` is Button tone=danger size=sm
because dropping a rung burns what is over the new cap; the modal body is
EXTRACTED into a shared Confirm.ui.tsx that Uninstall then composes (the Panel
precedent); ledger values stay Badge-wrapped as Uninstall already does; and
Tier 1 + stories only, nothing mounts.

Measured off both mocks (2x retina): size-2 dots, w-px spine, ~30px row pitch
and NO row gap because the spine is continuous. The blue offer badge measures
L 0.271 C 0.045 H 243 against press-theme's L 0.27 c*0.23 - it IS Badge's press
arm. glow-theme-soft is already tuned for swatch-pip scale, which is this dot.

Two mock-vs-kit conflicts resolved toward the kit: the mock's `downgrade` pill is
the same grey fill as its `locked` pill (a control cannot read like a label, and
a pressable Badge is forced cerulean), and its eyebrow shouts DOWNGRADE where
Uninstall deliberately lowercases.

- [x] Confirm.ui.tsx extracted from Uninstall + spec + stories
- [x] Uninstall composes Confirm; its 12 specs pass UNTOUCHED
- [x] StoragePlan.ui.tsx: the ladder + private Rung dot connector + spec + stories
- [x] PlanChange.ui.tsx: derives eyebrow/title/verb from one direction prop
- [x] Fixtures: kantoStorageRungs + planChangeFor (the only place the burn subtracts)
- [x] Wiki: reword "a rack of cards" now two kits draw the ladder differently
- [x] lint, typecheck, tests, stories typecheck

## Summary of Changes

Four Tier-1 components, one of them extracted from a shipped one.

**`Confirm.ui.tsx`** — `Uninstall`'s body lifted verbatim: eyebrow, title row,
prose, divider, `<dl>` ledger, confirm+cancel. `Uninstall` is now a wrapper that
passes `eyebrow="uninstall"` and `lead={<Weight slots={slots} />}`, and **its 11
specs plus Modal's 6 pass with zero edits** — which is the whole proof the
extraction preserved behaviour. Stays a Fragment: `PANEL_SURFACE`'s own `gap-4`
spaces the blocks, so a body dropped outside a Modal collapses, and that is the
signal it is missing its chrome rather than a layout to patch.

**`StoragePlan.ui.tsx`** — the ladder. `held`/`revealed` per rung mirror
`StoragePlanOption`'s own field names, and the four row readings are **derived**
from `findIndex`, so no `"passed" | "open" | "masked"` union enters the API.
Everything else is a pre-formatted string: the component does no arithmetic and
cannot render NaN.

**The spine is two half-segments per row, not one line.** At the held rung the
half above is climbed and the half below is not, so a single full-height element
per row could only ever paint one of them. `flex-1` on both halves is also what
centres the dot, with no absolute positioning: the row's height is its content's
and the segments split the remainder. The two loose ends are `invisible` rather
than unmounted, or the first and last dots slide off their row's centre.

**Every box states its width through flexGrow** was last bean's lesson; this
one's equivalent: the offered rung's dot carries `data-screen-theme="cerulean"`
so it wears the hue of the press beside it, because blue is what pressable means
here and `Badge`'s press arm forces it. A climbed rung's dot is `badge-theme` —
`Weight`'s and the slot track's paint, so one fill means "this is yours" across
the kit. Held is `bg-theme` + `glow-theme-soft`, which app.css had already tuned
for exactly this ("glow-theme at swatch-pip scale").

**`PlanChange.ui.tsx`** — eyebrow, title and press verb all derive from one
`direction` prop plus `cap`, so the heading and the button cannot name different
rungs. `direction` is a prop rather than a comparison because the component sees
only formatted strings and has no way to know which rung is held. "rent" up,
"drop to" down: the cap is rented by the gate and never bought.

**No new buttons.** `downgrade` is `Button tone="danger" size="sm"`; the offer is
`Badge`'s press arm carrying the bill; `locked` is a decorative `Badge`;
`current` is `Typography variant="accent"`. A refused rung stays a **disabled
press**, never an inert label — room is on sale whether or not you can pay,
which is `SlotOffer`'s existing rule.

**Fixtures** — `kantoStorageRungs(heldTier, peakKb, balanceKb)` maps
`STORAGE_PLANS` (never a hand-typed seven: the open bug on tiers 5 and 6 may
reprice or remove them), and `planChangeFor` is the only place the burn
subtracts, the way `slotDealsAt` is for a slot shortfall.

### Three things measurement settled

1. **Mock 409's peak must be 1024 KB.** It is the only value that opens the 2 MB
   rung — which needs the 1 MB cap filled — while leaving 3 MB masked behind
   "opens at 2 MB". A peak of 2048 opens that rung and loses the mask the mock
   draws. A spec pins the whole frame.
2. **`kbLabel(0)` is `"0 B"`**, not the mock's `"0 KB"`. The `burnt now` row is
   worth keeping at zero — nothing burnt is the reassurance the modal exists to
   give — so zero states the ledger's own unit. A spec rejects "0 B".
3. **The mock's `224 → 96 KB` compression cannot survive the ladder.** The top
   rung bills 1280 KB, which `kbLabel` renders "1.3 MB", so naming the unit once
   breaks. Both bills print in full: `224 KB → 96 KB`.

Wiki: "a rack of cards" was terminal-theme's drawing, and two kits now draw the
ladder differently, so §5.1 names the reading instead; the masked rung's caption
is described as visible text, per ADR-046's citation of ADR-051.

Verified: 4032 tests pass (227 files, +50), oxlint + depcruise clean, tsc clean,
prettier clean over the configured glob. Stories typecheck at the 30 pre-existing
errors with none in the new files. No new CSS, so every utility named was already
declared and emitted.

## Deviations from the mock, for review

- **`downgrade` and `locked` are no longer the same pill.** The mock draws both
  as one warm grey fill, which makes a control read like a status label — and a
  pressable `Badge` is forced cerulean, so grey-and-pressable does not exist in
  the kit. `downgrade` is a `danger` ring; `locked` stays the only grey pill.
- **The eyebrow reads `downgrade`, not `DOWNGRADE`.** `Uninstall` deliberately
  lowercases its own: a shouted string is a style and the variant table carries
  none.
- **`Redaction` renders `???`, the mock shows `????`.** Kit constant, left alone.
- **All seven rungs draw**, where the mock is cropped at five. The domain says
  the registry never has a hole in it, and the wiki that a fresh account must
  not open on one card and six masks.
- **The bill shows inline only on the free rung**, exactly as the mock draws it.
  Worth a second look: dropping to 512 KB still bills 32 KB a gate and the row
  does not say so — only the modal does.
