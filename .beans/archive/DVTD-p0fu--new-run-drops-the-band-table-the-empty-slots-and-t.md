---
# DVTD-p0fu
title: New run drops the band table, the empty slots and the doubled build
status: completed
type: feature
priority: high
created_at: 2026-09-13T16:13:59Z
updated_at: 2026-09-13T16:13:59Z
---

Follow-on from DVTD-ju54. The New run screen drew the build twice (a readout with
no list, a list with no readout), stacked a dashed `empty slot` box per free slot
under a track that already drew them, and closed on the same five-band payout table
prep opens with.

## Summary of Changes

**The band table is prep's alone.** `NewRunScreenProps` lost `outcomes`;
`newRunOutcomesFor` and the `kantoNewRunOutcomes` fixture are deleted. New run's
footer now carries `NEW_RUN_FOOTER_NOTE` ("Prep shows what Pallet asks before
anything is locked.") with `noteAt: "row"`, so the handoff is a sentence rather
than a repeat of prep's opener.

**Two columns, one build.** Hand left, Build right — the same grid prep uses. The
second headless `<Build>` is gone.

**`Build` gained two knobs, both used only by New run.** `emptySlots={false}` drops
the plain vacancy boxes but KEEPS the one carrying the refund press, so cashing a
start slot back stays reachable (it would otherwise have become unreachable, since
the press rides the box nearest the hatching). `configCount={false}` drops the
"N configs ·" prefix where the chips are listed directly underneath. The shop is
untouched on both.

**`SlotOffer` gained a `locked` form**, mirroring `WeightOffer`'s Offered|Locked
union: a dimmed, unhatched, unpressable rung quoting the slot after the buyable one.
New domain helper `startSlotNextPriceKb`, surfaced as `StartSlotsView.next`.

**Copy correction.** The mockup's build note said a bought slot "stays bought for
every run after this one". `slotsBought` is run state, and the wiki says the start
slot is "refundable at cost until Start" — so the note now reads "...and is
refundable at cost until the run starts" instead of shipping a false claim.

## Verification

lint clean (0 depcruise violations, 973 modules), `npm run build` exit 0,
4221 tests pass. The same 4 pre-existing out-of-scope failures remain
(PollScreen.spec x2, gate.model.spec x2).

## Known divergence from the mockup

- The `kantoNewRunAt` story fixture still uses Build's `weight` arm (ADR-074, not
  built), so the Storybook page shows a WeightTrack and no slot ladder. The live
  app uses the `slots` arm. Pre-existing; noted in DVTD-c76y.
- `SlotOffer` rows stay centre-aligned as the kit draws them; the mockup spreads
  label left / price right. Not changed, because the shop draws the same component.
