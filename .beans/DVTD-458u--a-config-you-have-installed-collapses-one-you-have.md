---
# DVTD-458u
title: A config you have installed collapses, one you have not stays open
status: in-progress
type: feature
priority: normal
created_at: 2026-09-26T11:02:35Z
updated_at: 2026-09-26T14:12:25Z
---

**What:** A config card collapses to its header row once it is installed, and stays expanded while you are still deciding whether to install it, with a chevron on the row to flip either one and an expand all / collapse all press on the panel.

**Why:** An installed build restates effect sentences the player already read when they bought them, which buries the shelf of offers they are actually deciding on under a column of settled facts.

## Done when

- [x] An installed config draws as its header row alone, and an offer draws its effect, weight, version and uninstall value
- [x] A chevron on any card opens or shuts that card, and every press on the row keeps working while it is shut
- [x] A panel can open or shut all of its cards at once
- [x] A newly rolled offer arrives open and a freshly installed config arrives shut, without the screen remembering a stale list
- [ ] The card states the ladder ceiling and where the config came from, instead of an info press
- [x] The footer says what the config uninstalls for

## Notes

Follows DVTD-sg5i, which grew the chip into the always-expanded card this builds on.

Marciano's mock: Build header reads `2 of 4 weight · 2 free` with an `expand all` press and collapsed rows; Registry header reads `5 offers · free` with `collapse all` and expanded cards.

Decisions taken: expansion is a set of open keys, not one open name; the chevron replaces the `i`; the dossier's two lines fold into the expanded footer.

Plan: `~/.claude-work/plans/create-the-config-cards-jaunty-metcalfe.md`.

## Summary of Changes

The card laid out wrong before it could fold: `Registry` and `Build` forced two cards to a
row (`sm:grid-cols-2`) inside a half-width column, so a card came out ~180px wide and the
header's only shrinkable part — the name, under `truncate` — shrank to nothing. Both now
flow `grid-cols-[repeat(auto-fill,minmax(20rem,1fr))]` (`CARD_FLOW`, owned by
`ConfigChip.ui.tsx`): as many to a row as fit, never under a header's width, empty tracks
kept so two cards do not stretch across a wide panel. `Build`'s `layout` prop and its
`wrap` arm are deleted — one live value left.

- **expand all / collapse all.** `Panel.Header` takes `trailing`; `DiscloseAll.ui.tsx` owns
  the copy and `discloseAllFor(panel, cards)` derives "all open" from the set the cards are
  given, so the press cannot name a move it is not about to make. `disclosure.ts` gains
  `discloseAll`, still storing flips-from-default. Wired in `ShopView` and `StartView`.
- **A card with no fold states itself.** `onToggleInfo` absent now means no chevron and an
  open card. `GateChoice` renders cards with no toggle wired, so its refund figures had
  gone behind an inert press.
- **Badges follow the fold.** Decorative badges ride the head while shut and the footer
  (beside the version) while open, so `suggested` reads as the mock draws it without the
  poll rail's live counters (`bump in 3`) disappearing into a collapsed card.
- **`Installed`.** A hand card already taken keeps a disabled press saying so; `ChipInstall`
  gains an optional `label`, which the viewmodel owns (ADR-102).
- **One vacancy row.** `SlotBox` takes `slots` and states the room left as `empty` + a
  `Weight` block, replacing one box per free slot; it follows the *list*, not the readout,
  and the new-run screen stopped suppressing it.
- **Header line** drops `a slot`; **`uninstalls for`** replaces `sells for`; the weight block
  is wider (ladder starts `w-6`, `h-6`); the fold chevron is an `Icon` on a new chrome-free
  `bare` Button tone, so it has no outline and no filled active state.
- **Fixtures were the reason the shelf looked shut.** `createKantoRegistryProps` and
  `kantoNewRunRegistry` passed no `openInfo`, so every story and spec drew collapsed cards
  no player ever sees; both now deal open, and `kantoHandCards` delegates to `handCardFor`
  instead of rebuilding a hand card beside it.

Verification: 3958 tests across 206 files, typecheck, oxlint, dependency-cruiser and
`docs:check` green. All 569 stories rendered via the throwaway jsdom spec, which was deleted.

## Still open

- The ladder ceiling (`v1 of 3`) and provenance are still not on the card — the only
  unchecked box above. Marciano's mock draws a bare `v1` footer, so this needs a decision
  before it is built, not just building.
- `uninstalls for` now reads on the shelf too, where the figure is a refund you cannot yet
  collect. One line to split it per column if that reads wrong.

## Follow-up pass, same session

Marciano iterated on the live screens; six further changes, each from a screenshot:

- **Head gap.** `gap-3` → `gap-2`. The weight block got wider while its digit stayed
  centred, so the whitespace the eye reads beside the figure grew by the padding; the
  gap gives that back.
- **Cards keep their own height.** `CARD_FLOW` gained `items-start` — a grid row
  otherwise stretches every cell to the tallest, and a shut card padded to an open
  one's height reads as a card missing its body.
- **The skip reason is a badge.** `pollNoteFor`'s `skipped` arm returned
  `{ detail }` — muted prose — where the kit's own fixtures draw a pewter badge. It
  returns `{ badge }` now, pewter, and the press beside it is found by being
  pressable rather than by position.
- **Figures sit in the sentence.** `ConfigEffect`'s `EFFECT`/`NOTE` were
  `flex flex-wrap`, making every text run and badge a flex item, so a figure
  mid-sentence broke onto its own line. Normal flow + `leading-relaxed`.
- **A bare figure before "units" badges.** `Figures` gained `COUNTED`, a lookahead so
  the word stays in the prose and only the number is boxed.
- **A faucet states its run cap, counting down.** `ConfigStatus` online gains
  `capLeftKb` (the run's shared figure, reported only by configs that draw on it);
  `pollNoteFor` badges it saffron; `ConfigChipBadge` gained `count`, and the new
  `CountedFigure.ui.tsx` tweens the digits through a registered `--figure-count`
  property and `counter()` — the same JS-free mechanism as the coverage ring, with
  its own property so two counters cannot fight over one. No `@starting-style`: a cap
  arrives at what it has left, and sweeping it up from zero would read as spending.

Verification after the pass: 3998 tests / 207 files, typecheck, oxlint,
dependency-cruiser, docs:check and the production build all green.
