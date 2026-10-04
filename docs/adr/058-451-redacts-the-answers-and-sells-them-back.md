# ADR-058: 451 redacts the answers and sells them back

## Status

Accepted — 2026-09-05 (Marciano, DVTD-ltqb). Adds a sixteenth audit to [ADR-038](038-the-audit-roster.md)'s roster and a third paid action to the two in wiki §4.5. Amends [ADR-056](056-audits-are-drawn-not-scheduled.md)'s pool and family tables. Departs from ADR-038 Decision 3 on what an audit's pick is seeded by, deliberately; see Decision 3. `DVTD-e3tg` folds into `DVTD-ltqb`.

## Context

The ask was a config a player buys to hide answers for everyone else, with victims paying to see them again. It cannot ship in that shape. No cross-player write exists in the live tree, and three of [ADR-042](042-design-pillars-and-anti-pillars.md)'s pillars refuse it: pillar 2 forbids a mechanic that only works as an ambush, pillar 3 puts friction on gates rather than configs, and anti-pillar 4 refuses to let competitive ranking drive design, which is all a pure griefing config pays in. ADR-056 Decision 2 and ADR-009 add a fourth: the day's rules are seeded on the date so a posted result is comparable, and a mid-day attack breaks that.

Every objection is about *who inflicts it and when*, none about the redaction itself. Gates already carry hostile rules disclosed before entry and identical for everyone that day. So the mechanic becomes an audit, and the social half a separate phase that fills the same slot.

## Decision 1: the redaction is an audit, not a config

**451 Unavailable For Legal Reasons** — the window's first 3 polls arrive with 2 answers sealed as `?????`, and 4 KB buys one back. A sealed answer stays **pickable**: gambling blind is the play the audit sells, and `gradeAnswer` never validated picks against the crossed-out set anyway.

Being an audit satisfies the pillars. It is stated on the stake receipt before the gate (pillar 2), it is a gate demanding rather than a config (pillar 3), and it is drawn by the date so everyone climbing that day meets it (ADR-056 D2). 451 is the real status for redacted content, which is pillar 4's test.

## Decision 2: family `poll-reading`

451 joins `poll-reading` with 300 and 404. All three attack the same reading step, and stacking any two is the punishing case: the family rule blocks 451 + 300 (select every incorrect option, two of them unreadable) and 451 + 404 (blind on category *and* on half the answers).

`paid-actions` was rejected. It would have blocked 403 in one stroke, but it costs the two most legible stacks in the roster and makes 451's own rules unobservable: `auditFeeMultiplier` only moves from 402 and `auditPaidActionLimit` only from 429, so filing 451 alongside them means the fee rule and the rate-limit rule can never be reached in play. ADR-056 D3 also calls `paid-actions` "one axis at three intensities"; 451 is not on that axis, it *creates* a paid action rather than modulating one.

403 Forbidden needs no denial. It freezes the linter and the peek but **not the buy-back** (Decision 4), so the two stack into a hard but honest gate rather than a trap. An explicit `DENY_PAIRS` entry was added and removed once Decision 4 settled: the pair was only dangerous because the freeze reached the escape hatch.

Pools **A and C** (B inherits A). 451 is the one audit needing **no config to counter it**: the linter needs a linter for the category and the peek needs Telemetry, but the buy-back is always available. That makes it build-independent and so the safest rule for a one-audit gate where a player may own nothing relevant. ADR-056's Consequences name pool A as the first tuning lever.

## Decision 3: the sealed set is derived, seeded on the poll

`redactedOptionIdsFor` is pure and stores nothing. Two properties it must have:

- **Blind to `correct`.** Which answers are sealed never reads the correctness flag, or `?????` would be a tell rather than a veil. The whole audit rests on this, and it has its own spec.
- **A readable floor of 2.** No poll is reduced to a coin flip; a two-option poll seals nothing.

**Seeded on the poll id, not on the window start index**, a deliberate departure from ADR-038 Decision 3, which seeds offline picks on the window so a retry re-rolls them. Three reasons: a missed gate serves *fresh polls*, so re-roll-on-retry comes free from new ids; seeding on window position would seal the same option letters all window, which players learn; and it is the seam for Decision 5, since a filed redaction's natural key is `(pollId, optionId)`.

Which *polls* are sealed is not seeded at all: the window's first 3, read off `window.answered`, as 408 clocks its first polls. It is a fact the wiki can print.

## Decision 4: the buy-back is flat, and outside both meters

4 KB, the same every press. Every other paid action climbs a ladder because it is metered per gate; this one is charged **per answer**, so a ladder would price the audit's own escape hatch out of reach.

It is **exempt from every meter**: not 429's allowance, not 403's freeze. Rationing the way out to one press a window would leave the window unreadable and price a 4 KB press at the run's whole paid-action budget, and freezing it is worse. The rule: **a restorative action is not metered like an advantageous one**. Buy-back returns information the gate took away rather than buying information it never offered, so 451 always hands out the answer to the problem it set, however the seal arrived. 402 still doubles the price, which is a cost rather than a wall.

Bought answers stay bought **for the whole run** (`boughtBackOptionIds`, never reset), following `peekedPollIds`: information already paid for is never re-charged.

**The linter may not touch a sealed answer.** This is a leak fix, not a balance choice: `disabledOptionIds` ships to the client, so crossing out a sealed answer would state that it is wrong, the exact leak the server-side redaction exists to prevent, and since the linter picks the first wrong option in poll order it would be a free scanner over the sealed set. A sealed answer becomes lintable once bought back, which makes buy-then-lint a real ordering decision.

## Decision 5: the social half is a second phase

Phase 2 lets a player pay 32 → 64 → 128 → 256 per answer to file 451 onto **tomorrow's** shared day, collecting the 4 KB buy-backs into their `archived_storage`, capped at 3× the stake. Settled 2026-09-05:

- **A shop control, not a config**: a fourth press beside Rebuild / Lock / Extend, on the horizon past all three (this visit / next shop / rest of run / **tomorrow's world**), where the Feature Request design put it. It costs KB and no slots, because a passive that does nothing for your own climb is a strange thing to spend build width on.
- **The filer is immune to their own filing**: `DVTD-mvhv` rejects symmetric effects, self-cancellation first among its reasons.
- **The filer is named**, on the stake receipt and in the answer cue. `DVTD-mvhv` requires a thwart to be attributable, and the toll sharpens it: someone is earning off the seal. This closes the question `DVTD-w5pb` left open.
- **403 does not defeat a filed hold**, because Decision 4 already exempts the buy-back from the freeze. The pool-drawn and filed cases behave identically, which is the point of one redaction engine with two generators.

⚠ **The filing cannot name the polls it seals.** A day's sequence is rolled lazily by its first player (`getOrCreateDailyRunSeed`), so when a filing is bought, tomorrow's `daily_run_polls` rows do not exist yet, and forcing the roll early is what the frozen-day rule forbids. So the record is an **intent**, `(date, by_user_id, seals)`, and the seals are assigned to polls and options when the day rolls, through the same seeded function Phase 1 uses. This is also why a filing cannot be aimed at a category or a rival.

Phase 1 changes nothing to allow this: the audit's copy is a plain string, so a filer name slots into the two surfaces that already print it, and `redactedOptionIdsFor` is the one function a filed hold replaces.

The toll is the one piece that cannot live in the reducer, which is pure and may not read or write another player's row. Crediting the filer belongs in the service layer beside the dispatch, the way the peek splits a fee from the data it buys.

## Consequences

- The reveal had to be fixed to ship this. `correctOptionIdsFor` matches correct answers **by label**, and `sendWith` does not commit until the player dismisses the reveal, so a redacted poll would have stayed `?????` with no ✓ or ✕ through the whole reveal: gamble blind, learn nothing, pillar 1's exact failure. `revealedPoll` restores the real text before the marks are computed.
- Buy-back is the first paid action with **no owning config**, so it sits on the answer row rather than a build row. `AnsweringScreen`'s "both paid actions hang off the row of the config that sells them" is now true of two of three.
- Three specs hard-coded the roster at fifteen (`audit.model.spec.ts` twice, `auditdex.model.spec.ts` once). The Dex needs no other change: a ranked, pooled audit appears in it automatically, though it must also join the modern-theme kit's own `AuditId` union or it renders as permanently unseen.
- Open: 451 is flat rather than dialled by depth, unlike 408 and 410. The dial is the first tuning lever if it plays soft.
