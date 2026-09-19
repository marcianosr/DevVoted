---
# DVTD-ghl2
title: New run's dealt hand reads as the Registry, beside the build
status: completed
type: task
priority: normal
created_at: 2026-09-13T19:33:55Z
updated_at: 2026-09-13T19:42:28Z
---

The New run screen shows its dealt configs in a section titled Dealt (Hand.ui), left of the build. The shop shows its offers in a Registry (Registry.ui), right of the build. Same job, two components, mirrored order. Make New run compose like the shop: Build left, Registry right, the dealt five listed as offers priced free. Reverses ADR-078 Decision 7's column order.

## Summary of Changes

**New run composes like the shop.** `NewRunScreen` now puts `Build` in the left
column and `Registry` in the right, the order `ShopScreen` uses. `Hand.ui` is
deleted along with its spec and stories; its one job (list configs you can
install) is the registry's.

**The deal is priced free.** `newRunRegistryFor` in the new run viewmodel builds
`RegistryProps` with `slotPrice: "free"`, so the summary reads
*5 offers · free a slot* against the shop's *32 KB a slot*. A starting config
costs room, not storage.

**The hand note moved into the viewmodel** as `NEW_RUN_REGISTRY_NOTE` and is now
one string. `StartView.component` and `kantoPoll.factory` had drifted apart —
the component said "Nothing is required, and the smallest three always fit
together", the fixture said "Two are marked as advice; ...", so every spec and
story asserted a sentence the app never rendered. The live string won.

**Build's knobs are unchanged.** `configCount`, `emptySlots`, `offeredSlot` and
`caption` stay off for New run (DVTD-p0fu's choices); only the column order and
the offer component changed.

**Fixtures.** `kantoHandProps` → `kantoNewRunRegistry` (returns `RegistryProps`
via the viewmodel); `handCardsLeft` and `NEW_RUN_HAND_NOTE` deleted with the
component that used them; `kantoHandCards` survives as the card list.

**Coverage.** The assertions worth keeping from `Hand.spec` moved into
`NewRunScreen.spec` under "the deal the registry lists": advice marks and where
they land, no advice when nothing is recommended, a too-wide card dimmed and
disabled, the install verb, the free price, the note.

**Docs.** ADR-078 Decision 7 rewritten (it had pinned "the hand left, the build
right") with the reason for the reversal. Wiki's New run page entry updated; §6.2
now says "the shop's registry" where it contrasts with the starting hand.
CHANGELOG's existing New run entry amended rather than duplicated, the screen
being unreleased.

## Verification

`npm run lint` clean (0 depcruise violations, 976 modules; one pre-existing
oxlint warning in `Screen.stories.tsx`). `npm run build` exit 0.
4255 tests pass. The same 4 pre-existing out-of-scope failures remain
(`PollScreen.spec` x2, `gate.model.spec` x2), in files this bean did not touch.
