---
# DVTD-gxce
title: What does per-category coverage actually buy the player?
status: todo
type: feature
priority: high
created_at: 2026-09-03T14:46:32Z
updated_at: 2026-09-03T14:46:38Z
parent: DVTD-u35m
blocking:
    - DVTD-h9s5
    - DVTD-4ova
---

Decide what per-category coverage is for, then either give it consumers or delete it. Output is an ADR plus a re-scope of the four beans listed at the bottom.

## What exists today

Three different per-category quantities are already tracked, and they are easy to confuse:

| quantity | where | scope | who reads it |
| --- | --- | --- | --- |
| `coverageByCategory` | `RunState`, written in `answer.model.ts:413` | run-cumulative, survives a gate clear (`freshWindow` resets the window, not this) | **one rule**: the Focus upgrade requirement |
| `window.byCategory` | `RunState.window` | per gate, reset every clear | the gate's own scoring |
| lifetime `category-correct:{code}` | ADR-051 §objectives | account | **nothing yet**, the ledger is unbuilt (DVTD-clgs) |

The one live rule is `upgradeCoverageRequired(level) = level × 5` checked against that category's run coverage (`shopAction.model.ts:140`, mirrored in `ShopScreen.ui.tsx:230`). Everything else is display: `CoverageByCategory.ui`, the RunHud, the run summary, the Dex's per-category accuracy.

Category *identity* does more work than category *coverage*: a Focus config multiplies only its own category, and a linter only fires on a poll in its category (`canLint`). Those are 11 plus 3 roster entries whose whole value is category-shaped, sitting on top of an axis that pays out in exactly one place.

## Why it does not currently answer "I am good at Vue"

1. **It is circular.** Vue coverage's only use is upgrading the `.vue` config, whose only job is generating Vue coverage. Nothing outside that loop cares which category your points came from.
2. **It measures the wrong thing.** Coverage is points earned, so it rises with how many Vue polls you were *served*, not with how well you know Vue. A player served twelve Vue polls and answering half beats a player served two and answering both. The skill signal is accuracy, and accuracy lives in the Polldex, where nothing mechanical reads it.
3. **The player cannot aim at it.** Categories come from the daily draw. There is no skip in the engine, and the only lever is Prefetch, which reveals upcoming categories without changing them (DVTD-4ova wants to change that). So an in-run per-category requirement is partly a lottery, which is a bad place to hang a config's power.
4. **The docs claim more than the code delivers.** Wiki §2.8 names category coverage as one of the climb's two staging axes, next to gate number. One upgrade rule is not an axis.

That third point is the load-bearing one: **the account is where category strength can mean something, because that is the only level where the player's history, not the day's draw, decides.**

## Options

- **A. Identity only.** Category mastery pays in Dex, titles, a per-category chip (DVTD-g8ty). No mechanical edge. Cheap, no balance risk, and it does answer "what do I get" with "recognition", which for a daily game is not nothing.
- **B. Unlocks, which is ADR-051's answer.** Ten of its twenty-one objectives are already `category-correct:{code} · 10`, so answering ten Vue polls correctly unlocks the `.vue` config. Strength pays once, permanently, in options rather than power. Needs DVTD-clgs and nothing else.
- **C. Draft leverage.** Lifetime strength in Vue biases what the shop offers or what the day serves. Real power, and the one option that actively fights the game's purpose: it points the player at what they already know. Rejecting this on those grounds is defensible, and worth writing down so it stops coming back.
- **D. Insurance.** Strength buys mitigation rather than upside: a category you are strong in resists the audits that punish a category, or peels last. Pays without raising the ceiling, and reads as expertise.
- **E. Bounties on gaps.** The inverse: thin categories pay more coverage per correct answer. Fits a learning game, gives a reason to answer the Python poll you would rather skip, and it is the only option that makes the Dex's unseen list interesting.

These are not exclusive. My pick is **B for the meta, E for the run, A alongside both, and delete or repurpose `coverageByCategory`** if B and E land, since neither needs a run-cumulative per-category figure. C stays rejected in the ADR with the reason.

## What the decision unblocks

- [ ] ADR: what each of the three quantities is for, and which of them the game may ever gate on
- [ ] The Focus upgrade requirement: keep, re-base on accuracy, or drop. **DVTD-h9s5 proposes what already shipped** and needs closing or narrowing either way
- [ ] Wiki §2.8: stop calling category coverage a staging axis, or make it one
- [ ] `DVTD-clgs` (ADR-051 ledger): confirms `category-correct` is the counter the objectives read
- [ ] `DVTD-4ova` (configs that steer the category mix): only worth building if in-run category aim survives the decision
- [ ] `DVTD-g8ty` (per-category chip): becomes concrete under option A
- [ ] `DVTD-in1b` (Open Source wills leftover KB to a category pool): its pool needs this vocabulary
- [ ] Dex Polls tab (DVTD-e15y): decides whether the tab shows coverage, accuracy, or both, and which of them a player is meant to chase

## Todo

- [ ] Design session on the five options, with the four beans above on the table
- [ ] Write the ADR, including the rejection of C
- [ ] Re-scope DVTD-h9s5, DVTD-4ova, DVTD-g8ty per the outcome
- [ ] Wiki §2.8 and §4.4 corrected in the same pass
