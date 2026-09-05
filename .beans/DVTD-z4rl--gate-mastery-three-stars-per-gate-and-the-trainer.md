---
# DVTD-z4rl
title: 'Gate mastery: three stars per gate, and the trainer card'
status: todo
type: feature
priority: normal
created_at: 2026-09-05T08:21:03Z
updated_at: 2026-09-05T08:21:03Z
parent: DVTD-z2r2
---

A gate is binary today: you cleared it or it peeled you. Nothing records *how well*, so a 5-of-5 clear on a bare build and a scraped clear bought with four linter runs leave the same mark. Mastery grades the clear, and the trainer card is where the grades live.

## What the engine already counts

Stars 1 and 2 need **no new run state**. `GateWindow` is reset by `freshWindow` on every clear and already carries:

| field | means | note |
| --- | --- | --- |
| `correct` | polls fully correct this gate | increments only on `grade.outcome === "correct"`, so a partial multi-select does not count |
| `answered` | polls answered this gate | the window is `SLICE_WINDOW = 5` |
| `linted` | paid linter runs this gate | priced 8/16/32/64/128/256 KB, escalating |
| `peeked` | paid peeks this gate | priced 32/64/128/256/512 KB |
| `budget` | the *pick* budget | sum of correct options across the window, not a poll count |

That last row is why the first star should be worded on polls, not on five: `budget` counts picks, and a `.length`-style config pays for extra picks, so "5 of 5" stops being true the moment the window shape changes.

## The stars

**1. Flawless — every poll in the window correct.** `window.correct === window.answered` at the moment of clear. A partial multi-select breaks it, which is a defensible reading but should be a conscious one: DVTD-2ooc is the open bean on what partial answers do elsewhere, and the two should agree.

**2. Unaided — no paid help.** `(window.linted ?? 0) === 0 && (window.peeked ?? 0) === 0`.

The git tag half sits at a different scope and needs a decision. ADR-036's tag is `users.pinned_gate`, bought in the shop, consumed at run start, and it hands the new run `PIN_START_KB_PER_GATE (32) × startAtGate` in free storage. It is not an in-gate action at all: it makes the gate you *start at* cheaper, because you arrive holding KB you did not earn. Options: a tagged run forfeits stars everywhere, forfeits on the gate it starts at, or forfeits nothing because the skipped gates were never played. My pick: forfeit on the starting gate only, since that is the one gate the free KB subsidised.

**3. TBD.** Four candidates, with what each needs:

- **Margin** — cleared with double the demanded coverage. Reads off `window.coverageGained` against `coverageDemandFor`, needs nothing new, works identically at every gate, and rewards the build rather than the draw. Sibling bean: DVTD-nljz (coverage spill above the demand).
- **Audit honesty** — faced the gate's audit without a config suppressing it. Uses the `suppressed` flag that already exists, and it is thematically the best of the four. Problem: gates 0 to 2 are clean, so three gates would need a substitute rule.
- **Speed** — every poll under N seconds. `elapsedMs` already rides on `AnsweredPoll`, so it is measurable, but the Timeout audits already own time in this game and a second time rule would crowd them.
- **Bare build** — cleared without buying anything in the shop before it. Very legible, and the hardest way to play.

My pick is **margin**: no new state, no gate-shape exception, and the number is already on screen during the gate.

## Decisions beyond the third star

1. **Where stars live.** `owned_swatch_ids` is the account's gate ledger and is deliberately permanent ("re-clearing it later is a no-op"). Mirror that: a `gate_stars` column on `users` holding best-ever per gate. A `run_gate_results` table is only worth it if the trainer card wants dates and history. My pick: column now, table if the card asks for it.
2. **Best-ever or per-run.** My pick: best-ever, so the card is a record of what you have ever done, matching the swatch rule.
3. **Do stars pay anything?** My pick: no. The moment a star grants storage or coverage, the Unaided star turns the linter and the peek into traps, and the shop is selling those tools. Identity only. This is the same question DVTD-gxce asks about category strength, and the two answers should agree.

## The trainer card

Gen 1's trainer card is badges plus a name plus a clock, which is exactly the shape here: thirteen swatches, nought to three pips each, plus whatever totals are worth printing. Note this overlaps the dev card already designed elsewhere (avatar, category-identity border, pinnacle award): that card is the *category* half of a player's identity, this is the *gate* half. Decision: one card with two faces, or two artefacts. My pick: one card, gates on the back.

Related: DVTD-g8ty (Collect Swatches) is the per-category chip idea and should be settled in the same pass, or the account ends up with three competing badge shelves.

## Todo

- [ ] Pick the third star, and settle the git tag scope
- [ ] `gateStars(state)` in `src/modules/run/gate/domain/`, pure over `RunState` at clear, with specs per star
- [ ] Persist best-ever per gate; migration guarded per ADR-012
- [ ] Gate-clear screen shows the three stars, including the ones missed and why
- [ ] Trainer card surface, after the dev card decision above
- [ ] Dex Gates tab shows stars per gate (folds into DVTD-e15y if that lands first)
- [ ] Wiki: mastery rules alongside §2.8
