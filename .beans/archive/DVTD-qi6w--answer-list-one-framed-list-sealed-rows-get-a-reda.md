---
# DVTD-qi6w
title: 'Answer list: one framed list, sealed rows get a redaction bar and an unseal press'
status: completed
type: task
priority: normal
created_at: 2026-09-05T17:27:35Z
updated_at: 2026-09-05T17:40:52Z
---

Refactor the terminal-theme answer list to a single bordered container with divided rows (letter circles kept), and replace the sealed row's '????? · 4KB to unseal' text with a redaction bar plus an unseal press and a price tag wired to buy-back.

## Todo

- [x] ChoiceList: owns spacing, keyboard picking and the tip
- [x] Choice: borderless row, keycap letter, seal (bar + unseal press + price)
- [x] PollScreen + RevealScreen use ChoiceList
- [x] PollView: seal wiring, onBuyBack tool, sealed row no longer dimmed
- [x] proto-run + ConfigsInAction pass onBuyBack
- [x] Stories + specs
- [x] lint + typecheck + tests

## Summary of Changes

Three mocks in one session, ending on keycaps: rows are gapped and borderless, the letter is a bordered keycap, selection is a neutral fill plus a themed keycap, and A–H on the keyboard picks. ChoiceList went from a children wrapper to a data-driven list because it had to own the key handling and the tip that advertises it (a window keydown listener guarded on repeat, modifiers and typing targets); RevealScreen passes no onPick, so it gets neither.

Sealed rows (451): the label is replaced by a redaction bar whose width comes from the LETTER, never from the answer, since the client is only served ????? and a length-derived width would falsify information. The bar sits beside an unseal press and a price tag, and buy-back is finally wired on the terminal screen: PollTools gained onBuyBack, so /proto-run dispatches buy-back-option. A sealed row is no longer dimmed (it is unreadable, not ruled out) and it keeps a bought split note, which the old price-in-the-note version had swallowed.

Open: the mock's price tag is green; PriceTag pay is saffron, which is what every other cost in the app wears, so saffron shipped.

Tests: 3411 pass, 12 added. 3 pre-existing failures in src/ui/modern-theme/screens/RewardScreen.spec.tsx, unrelated (that screen imports nothing touched here).
