---
# DVTD-6ce4
title: Planning Poker becomes a hand of cards you spend
status: todo
type: feature
priority: high
created_at: 2026-09-08T14:12:46Z
updated_at: 2026-09-08T14:13:02Z
parent: DVTD-72d9
---

Playtest verdict on the shipped v1 (DVTD-68jr, ADR-063): the bet has risk but no
loss, so the decision is an EV lookup rather than a choice, and the low cards are
unplayable. Redesign it as a hand of cards you spend.

## What is actually broken

"Players always go with 5" is only true at 80%+ accuracy. The exact-match EV peak
sits at `k = 5p`, so at 60% the best card is 3 and at 50% it is 3 as well. ADR-063's
balance note is arithmetically right.

The real fault is that exact-match **inverts what a low card means**. In the ritual a
low card says "this is easy, I am confident". Under a bullseye rule, playing 1 is a
prediction that you will bomb four of five. Caution and low cards should be the same
gesture; here they are opposites, so there is no cautious bet anywhere on the board
and "why would you ever play the 1" has no answer.

Second fault, independent of the risk model: the payout is flat at 32 KB per point
while `gateClearPayout` scales with `gatesCleared + 1`. So the config is worth 5x a
gate reward at gate 0 and 0.4x at gate 12. It is a gate-1 config that is noise by
gate 8.

## Design

**The number is a floor, not a bullseye.** Play card k and the bet is "at least k of
this window's 5 correct". Low is safe, high is greedy, which is what the cards mean.
Hit rates at 80% accuracy: [1] 100%, [2] 99%, [3] 94%, [5] 33%.

**You are dealt the deck once: 1, 2, 3, 5. One card per gate, and it is spent.** No
fee and no penalty; the cost is opportunity. This is the whole answer to "why play the
1": the card you spend now is not in your hand at gate 11.

**The payout scales with depth like everything else.**
`round(GATE_REWARD_KB * (gatesCleared + 1) * k / SLICE_WINDOW)`, paid when
`correct >= k`. Card 5 is worth exactly a second gate reward, at 33% odds.

| gate | [1] | [2] | [3] | [5] | gate clear at 5/5 |
| --- | --- | --- | --- | --- | --- |
| 0 | 6 KB | 13 KB | 19 KB | 32 KB | 32 KB |
| 4 | 32 KB | 64 KB | 96 KB | 160 KB | 160 KB |
| 8 | 58 KB | 115 KB | 173 KB | 288 KB | 288 KB |
| 12 | 83 KB | 166 KB | 250 KB | 416 KB | 416 KB |

Depth scaling is what makes the deck a run-long decision instead of four separate
ones. At 80% accuracy the same four cards are worth ~446 KB played late (gates
5/7/9/11) and ~128 KB dumped early (gates 0/1/2/3), so holding is strictly better for
value and the counterweight is death: coverage demands run 3 to 375, so the deep gates
that pay best are the ones most likely to end the run before you cash. Hold for value
against bank before you die. Playing the 1 late is a near-guaranteed 83 KB, so no card
is ever garbage; the question is ordering.

**It still pays after a missed gate**, unchanged from ADR-063, and the card is spent
either way. That is what makes the hedge real.

## Version ladder

Selling information rather than certainty, per the Upgrade-sells-calibration line.

- v1: commit before the gate starts. `canEstimate` stays as it is.
- v2: commit after the window's first answer. One poll of evidence, still a real bet.
- v3: the deck gains the 8, which is not a floor but the perfect-window card: all five
  correct, paid at 8 points (666 KB at gate 12, 33% odds).

Rejected: **re-estimating every poll.** After three answers you know your own count,
so a per-poll re-estimate is a collect button, not a bet. A level that deletes the
config's decision is worse than no level.

Requires `storagePerEstimate` to join `isUpgradable` and `maxLevel: 3` on the roster
entry.

## Engine changes

- `estimate.model.ts`: `ESTIMATE_CHOICES` becomes the deck `[1, 2, 3, 5]` (v3 adds 8),
  not `1..SLICE_WINDOW`. `estimatePayoutKb` compares `correct >= estimated` instead of
  `===`, and takes `gatesCleared` for the depth multiplier.
- `RunState` gains the spent-card set; `estimatedCorrect` and `estimateThisGateKb`
  survive as they are. Both new and old fields must ride `RunSnapshot`, and
  `resumeClimb` clears the live bet but must NOT clear the spent set.
- `commitEstimate` refuses a spent card as well as an out-of-deck number.
- `closeWindow` marks the card spent on both branches, clear and miss.
- Gate report verdict still reads off the KB the engine paid, not a recomputed
  comparison.

## UI

`Estimate.ui.tsx` gains a spent state: the button renders disabled with the reason on
hover, per lock-reason-is-the-label. Hint copy changes from "pays X if exact" to
"at least k correct, pays X". The prep Section note should say what is left in hand,
since the hand is now the interesting state.

## Todo

- [ ] ADR-069 supersedes ADR-063's payout, range and no-upgrade decisions; keep its
      pays-after-a-miss and asking-is-not-a-demand decisions, which still hold
- [ ] Deck and floor semantics in `estimate.model.ts` + specs
- [ ] Depth-scaled payout, spent-card set on `RunState`, snapshot round-trip
- [ ] `closeWindow` spends the card on both branches
- [ ] Roster copy, `isUpgradable`, `maxLevel: 3`
- [ ] `Estimate.ui.tsx` spent state + hint copy, prep Section note
- [ ] wiki 4.3 and the 2.6 miss-payout row
- [ ] CHANGELOG (player-visible)
- [ ] lint, typecheck, tests

## Open knobs

1. The `k / SLICE_WINDOW` rate. Card 5 paying exactly a second gate reward is a
   defensible anchor but it is a playtest knob, not a derived number.
2. Whether v3's 8 belongs in the deck at all, or whether the deck should simply be
   1/2/3/5/8 from v1 with 8 unreachable until the window grows.

Blocked-by nothing. The circular unlock is split out into its own bug.
