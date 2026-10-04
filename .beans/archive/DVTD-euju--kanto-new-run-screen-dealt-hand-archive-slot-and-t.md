---
# DVTD-euju
title: 'Kanto new run screen: dealt hand, archive slot and the gate-0 stake'
status: completed
type: feature
priority: normal
created_at: 2026-09-10T16:39:02Z
updated_at: 2026-09-10T16:51:45Z
---

Mock #412: the screen a run opens on. Dealt hand of five with two suggested, build on the free four slots, the fifth slot for sale from the archive, and the gate-0 stake over a start button that refuses a bare build. Faithful to ADR-049/052/057/062 — almost every figure already exists in the domain. Plan: ~/.claude-work/plans/lets-design-the-shop-rippling-wren.md

Marciano's calls: Dealt is its own component (Registry keeps meaning the npm registry); Header migrates balance to a funds pair; the note position is fixed for this screen only (the shipped shop keeps its far-right note); badge reads 'suggested' (both other themes and wiki §3 already say it).

## Todos

- [x] Header: subtitle, funds pair replacing balance, noteAt placement
- [x] SlotTrack resting override, SlotBox label, SlotOffer verb
- [x] Build: emptyLabel placeholder + resting passthrough
- [x] ConfigChip: install press (ChipInstall)
- [x] Hand.ui.tsx + Stake.ui.tsx
- [x] NewRunScreen.ui.tsx
- [x] Factory: new-run frames, hand cards, gate-0 stake, archive slot deals
- [x] Stories: NothingPicked, OnePicked, BuildFull, WidenedFromTheArchive, ArchiveTooThin, NothingSuggested, WithPanels
- [x] Specs: new three + extend Header/SlotBox/SlotOffer/SlotTrack/Build/ConfigChip; migrate balance assertions
- [x] lint + tests + build + stories typecheck + prettier

## Summary of Changes

**Two new Tier-1 components, and the screen.** `Hand.ui.tsx` is the Dealt column: title, `N left in the hand`, cards at `width="full"`, prose note. Structurally Registry, deliberately not Registry: the registry is the thing you buy from, this is the thing you were dealt. `Stake.ui.tsx` is the footer: `gate 0 asks`, three badges, the start press pushed right, refusal underneath. `NewRunScreen.ui.tsx` composes Header + [Build + buildNote | Hand] + Stake, reading its colour off `header.swatch.theme` like the other two screens. Gate 0 is Pallet, which app.css paints `oklch(90% 0.05 150)`, so the opening screen is green without a line of TS naming a colour.

**Six small kit extensions, each a pre-formatted string the screen owns.** Header gained `subtitle` (the quiet `gate 0 . Pallet` beside the title), `noteAt: "end" | "track"` (the shop keeps the far end it shipped on; a caption reads beside the track), and `funds: { amount, label }` replacing `balance?: number` -- the run's storage and the account's archive are two purses in one corner, so the word travels with the number instead of being baked in. Then SlotTrack `resting`, SlotBox `label`, SlotOffer `verb`, Build `emptyLabel` + `resting`.

**`ConfigChip.install` is the one behavioural addition.** `ChipInstall = { onPress, disabled?, hint? }` renders a viridian `install` Button before the (i), symmetric with `onUninstall`. A registry offer is bought so its price is the press; a dealt card costs no storage (ADR-052, and `installConfig` provably touches only `build`), so the verb is all there is to press. `disabled` rather than a missing handler, because a card that will not fit keeps its place in the hand.

**The mock reproduces from the engine, including the parts I did not hand-list.** The two `suggested` marks are typed nowhere: `recommendedPicks(hand, BASE_SLOTS)` takes a focus config then a coverage earner that fits, which on this hand is `.js` then Code Coverage -- exactly the two the mock badges. `64 KB archive` is `nextSlotPriceKb(0) * START_SLOT_PREMIUM`, the sixth slot is 80 KB, the refund is that same figure back (ADR-049 D3), and the shortfall reuses `shortfallOf`, still the only place a shortfall subtracts. `3% coverage` / `+32 KB on a clear` / `no peel . no audits` are `coverageDemandFor(0)`, `GATE_REWARD_KB`, `failPeelShareFor(0) === 0` and `START_GATE < INTRO_GATE`. Even the spelled-out numbers derive: `numberWord(VICTORY_GATE + 1)` gives "thirteen", and falls back to the numeral rather than lying if the ladder changes.

**A refused start reads grey, not red.** `Button` turns a disabled action cinnabar, because a refused action normally means "you cannot afford this" -- but a bare build is not a payment problem. Stake goes `ambient` when refused and `action` when live, and the sentence underneath carries the reason. Pinned in `Stake.spec.tsx`.

**Count semantics settled by a failing test.** `left` first meant "installable", which made three picks read "1 left" while two untaken cards sat there. It means untaken: room can be freed by uninstalling, so a card the build has no room for has not left the deal. It dims and its press disables (DVTD-85x7's dim-and-say-nothing), but it is still in your hand.

Seven screen stories, five Hand stories, two Stake stories: the opening frame, one pick, the free four spent, widened from the archive, an archive too thin, no advice, and the interactive info pin.

## Verified

tsc clean, oxlint clean (one pre-existing Screen.stories warning), depcruise 0 violations over 939 modules, **4102 tests pass in 230 files** (+56; kanto-theme alone 731 in 36), build clean, stories typecheck back at exactly the 30-error baseline with none in touched files -- the `funds` migration surfaced two real errors in `PollScreen.stories.tsx` that no repo command typechecks, now fixed. Prettier clean across src/ui/kanto-theme and the factory.

## Not done

Storybook-only, like every kanto screen. Production still passes `archiveKb = 0` and there is no `RunAction` for buying or refunding a start slot, so wiring this to `users.archived_storage` stays DVTD-szzx's job. Build's header reads `0 configs . 0 of 4 slots . 4 free` where the mock omits the free clause: the clause is Build's own derived law and the prose beside it says the same thing in words. Both left alone.
