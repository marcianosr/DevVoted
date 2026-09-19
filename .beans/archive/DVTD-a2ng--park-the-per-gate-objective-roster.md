---
# DVTD-a2ng
title: Park the per-gate objective roster
status: completed
type: task
priority: normal
created_at: 2026-09-14T14:51:09Z
updated_at: 2026-09-14T15:06:28Z
---

Prep holds only two objectives again: the required clear line and the swatch. The thirteen authored per-gate objectives (ADR-082) come out, along with the x1.15 bonus they funded.

## Todo

- [x] Delete the roster, its spec and ADR-082
- [x] Drop the authored row from `objectivesFor` and `windowOutcomes` from the frame
- [x] Drop the "ahead" chip from the gate debrief
- [x] Drop `objectiveBonusKb` from the clear settlement and `RunState`
- [x] Restore `GATE_REWARD_KB` to 32, delete `OBJECTIVE_BONUS`
- [x] Docs: ADR README, ADR-080, wiki, CONTEXT.md, CHANGELOG
- [x] lint + typecheck + tests

## Why parked, not lost

Every file ADR-082 touched was still untracked when this landed, so deleting it
would have lost the reasoning and the roster outright. Both are pasted below
verbatim. Unparking is: restore the two files, re-add the authored row in
`objectivesFor`, the `ahead` chip, `objectiveBonusKb`, and take `GATE_REWARD_KB`
back to 28.

## Parked: ADR-082

```markdown
# ADR-082: Every gate asks something of its own

## Status

Accepted 2026-09-14 (Marciano, DVTD-xj95). Amends
[ADR-035](035-gates-are-auditors.md) Decision 4 by addition, and
[ADR-080](080-the-swatch-is-won-by-the-window.md) Decision 4, which said prep
opens on two objectives. It opens on three.

## Context

ADR-035 made audits the gate's personality. [ADR-056](056-audits-are-drawn-not-scheduled.md)
then made them **drawn**, so two runs of the same gate no longer carry the same
ones. The personality survived as mood and stopped being a name: gate 7 is "one
of pool A", which is a difficulty, not an identity.

Prep showed the cost of that. Its panel carried two rows identical at all
thirteen gates, and the panel is titled "Objectives and rewards".

`docs/brainstorm/23-03-2026-variable-gate-requirements.md` is the obvious answer
and the wrong one: it gave each gate a different **clear requirement**, which
ADR-035 replaced on purpose. Gates that judge you differently are gates you
cannot learn.

## Decision

1. **Each gate carries one authored objective, and it is a bonus.** It never
   appears in `GateClose`, `gateClosingFor`, `gateLadderFor` or `bandAtClose`.
   The clear gates the bonus; the bonus never gates the clear. Missing it costs
   nothing. **Audits are what the gate does to you and they vary; the objective
   is what the gate is about and it never does.**

2. **It reads the window's five answers and nothing else** — no build, no
   balance, no schedule, no category. That is what keeps a roster entry from
   fighting a build the player already committed, and from leaking the poll
   details prep deliberately seals (`pollRowsFor` withholds them without a
   prefetcher). The roster is a pure function of `readonly AnswerOutcome[]`,
   which is why it can be proved rather than argued about.

3. **Outcomes read as the streak reads them** — `correct` advances, `wrong`
   misses, `partial` is neither. The one exception is a named position: "answer
   poll 1 right" has no counter for a partial to leave alone, so a partial loses
   it.

4. **Every shape is monotone under `wrong ≤ partial ≤ correct`.** This is the
   property that makes a bonus safe: no row can read better for a worse answer,
   so none of them can pay for playing badly. It is asserted exhaustively — 13
   shapes × 3⁵ windows × every single-answer improvement.

   It is not free. A "back to green after your **first** miss" shape was cut for
   failing it: improving poll 2 can move the first miss later and turn met into
   lost. The generalised "never two misses in a row" is monotone, and is what
   gate 3 carries instead.

5. **No row pays for abstaining from anything the shop sells.** Not the linter,
   the peek, the reroll or the draft. `DVTD-z4rl` reached the same rule from the
   other side. The argument is not arithmetic — a bonus is by construction worth
   less than the clear it might cost — it is that the game would be refunding a
   purchase it had just sold you.

6. **It pays ×1.15 on the clear payout, funded rather than minted.**
   `GATE_REWARD_KB` drops 32 → 28 to pay for it. A run that meets every
   objective lands within 1% of where the old flat payout already was; a run
   that meets none lands 12.5% below it. The bonus rides `gateClearPayout` alone
   — never interest, extra picks, overflow or an estimate, which would compound
   it with income only some builds earn.

7. **The next gate's objective is named the gate before it**, on the outcome
   screen, so it is something to shop for rather than something met cold. Same
   forward disclosure ADR-035 gives audits.

The roster, the payout and the wiring live in
`src/modules/run/gate/domain/gateObjective.model.ts`. Three families on three
dials — position, miss budget, streak — and the curve **eases at every gate
where the audit load steps** (3 takes the first pinned audit, 8 doubles them, 12
carries three), so the two difficulties sum smoothly instead of spiking
together.

## Consequences

**The run's income now answers how you played, not only how deep you got.**
Because it is a multiplier, the ratio holds at every build strength:
`rewardMultiplierFor` and `streakMultiplier` scale both sides. A multiplier can
change the height of the payout curve, never its shape.

**1.15 and 28 are unvalidated.** The repository's only simulation
(`coverageRatio.model.spec.ts`) models coverage win rates, not KB, so it cannot
see this change. The numbers are arithmetic, not balance. Sim them.

**The bonus rides the flat config payouts folded into `gateClearPayout`.**
`storageOnClearFor` (Unit Tests, AGENTS.md) is inside that function, so a build
holding one earns 15% on it too. Defensible — it is the gate's clear payout by
definition — but it is the one place the "never compound with config-specific
income" rule bends, and worth revisiting with the sim.

**A row can now be lost before the window ends**, which a `met` boolean cannot
say. `Objective` gained `lost`, and the mark a struck variant: a row still
reading "not yet" once it is unreachable hides a cost the player already paid
(ADR-042 pillar 2). Ten of the thirteen can settle short.

**"Objective" now names three things** — account unlocks (ADR-051), the two
rows ADR-080 added, and these. CONTEXT.md carries the split: **unlock
objectives** are account-level and cross-run; **gate objectives** are per-gate
and per-attempt. One metric flows up; nothing flows down.

**`PERFECT_BONUS` is still stated and never routed.** ADR-075 flagged it;
`GateOutcomeView` hardcodes `bonusKb: 0`, so the panel never renders and nothing
lies today. It is now the second unrouted bonus in the same ledger, which makes
it likelier to be read as precedent. Route it or delete it.
```

## Parked: gateObjective.model.ts

```typescript
import {
	OBJECTIVE_BONUS,
	SLICE_WINDOW,
} from "~/modules/run/run/domain/rules.model";
import type { AnswerOutcome } from "~/modules/run/run/domain/runPoll.model";

/**
 * A gate's own objective: a third prize on the same five answers, beside the
 * clear and the swatch. It is a **bonus and never a demand** — it cannot appear
 * in `GateClose`, `gateClosingFor`, `gateLadderFor` or `bandAtClose`, and
 * missing it costs nothing. The clear gates the bonus; the bonus never gates the
 * clear (ADR-035 Decision 4 stands).
 *
 * Audits are drawn (ADR-056), so two runs of the same gate no longer carry the
 * same ones: the gate's personality survives as mood but not as name. The
 * objective is the name. It is authored per gate and never varies.
 *
 * Every entry reads nothing but the window's answers in order. No build, no
 * balance, no schedule, no category — which is what keeps a roster entry from
 * fighting a build the player already committed, and from leaking the poll
 * details prep deliberately seals.
 */
export type GateObjectiveState = "open" | "met" | "lost";

export type GateObjectiveProgress = {
	readonly outcomes: readonly AnswerOutcome[];
	readonly windowSize: number;
};

export type GateObjective = {
	readonly id: string;
	readonly gate: number;
	readonly name: string;
	readonly detail: string;
	readonly lead: string;
	readonly figure: string;
	readonly trail?: string;
	readonly stateOf: (progress: GateObjectiveProgress) => GateObjectiveState;
};

const isRight = (outcome: AnswerOutcome): boolean => outcome === "correct";
const isMiss = (outcome: AnswerOutcome): boolean => outcome === "wrong";

const settled = ({ outcomes, windowSize }: GateObjectiveProgress): boolean =>
	outcomes.length >= windowSize;

/**
 * Named polls have to land right. A partial is not right, so it loses a position
 * the way a miss does — the one place the streak's "a partial is neither" does
 * not carry, because there is no counter for it to leave alone.
 */
const atPolls =
	(positions: readonly number[]) =>
	(progress: GateObjectiveProgress): GateObjectiveState => {
		const { outcomes } = progress;
		const landed = positions.filter((at) => at < outcomes.length);

		if (landed.some((at) => !isRight(outcomes[at]))) return "lost";
		return landed.length === positions.length ? "met" : "open";
	};

/** Misses counted, partials left alone, exactly as the streak counts them. */
const missBudget =
	(allowed: number) =>
	(progress: GateObjectiveProgress): GateObjectiveState => {
		const missed = progress.outcomes.filter(isMiss).length;

		if (missed > allowed) return "lost";
		return settled(progress) ? "met" : "open";
	};

const hasTwoMissesRunning = (outcomes: readonly AnswerOutcome[]): boolean =>
	outcomes.some(
		(outcome, index) => index > 0 && isMiss(outcome) && isMiss(outcomes[index - 1])
	);

const missesApart = (progress: GateObjectiveProgress): GateObjectiveState => {
	if (hasTwoMissesRunning(progress.outcomes)) return "lost";
	return settled(progress) ? "met" : "open";
};

type StreakReading = { readonly best: number; readonly running: number };

const streakReading = (outcomes: readonly AnswerOutcome[]): StreakReading =>
	outcomes.reduce<StreakReading>(
		({ best, running }, outcome) => {
			if (isMiss(outcome)) return { best, running: 0 };
			const next = isRight(outcome) ? running + 1 : running;
			return { best: Math.max(best, next), running: next };
		},
		{ best: 0, running: 0 }
	);

const streakOf =
	(length: number) =>
	(progress: GateObjectiveProgress): GateObjectiveState => {
		const { best, running } = streakReading(progress.outcomes);
		const left = Math.max(0, progress.windowSize - progress.outcomes.length);

		if (best >= length) return "met";
		return running + left >= length ? "open" : "lost";
	};

/**
 * Three families on three dials. **Position** names which polls have to land and
 * escalates one to four, moving head, middle and tail so two rows of equal
 * difficulty still feel different. **Miss budget** tightens from "spread them
 * out" to one to none. **Streak** floats free, so it is easier than a fixed
 * shape of the same length.
 *
 * The curve eases wherever the audit load steps — gate 3 takes the first pinned
 * audit, gate 8 doubles them, gate 12 carries three — so the two difficulties
 * sum smoothly instead of spiking together.
 */
const OBJECTIVES: readonly GateObjective[] = [
	{
		id: "smoke-test",
		gate: 0,
		name: "Smoke test",
		detail: "the first answer sets the tone",
		lead: "answer",
		figure: "poll 1",
		trail: "right",
		stateOf: atPolls([0]),
	},
	{
		id: "sign-off",
		gate: 1,
		name: "Sign off",
		detail: "finish what you opened",
		lead: "answer",
		figure: "poll 5",
		trail: "right",
		stateOf: atPolls([4]),
	},
	{
		id: "bookend-it",
		gate: 2,
		name: "Bookend it",
		detail: "green at both ends",
		lead: "answer",
		figure: "polls 1 and 5",
		trail: "right",
		stateOf: atPolls([0, 4]),
	},
	{
		id: "no-two-in-a-row",
		gate: 3,
		name: "No two in a row",
		detail: "a miss is not a slide",
		lead: "keep",
		figure: "misses",
		trail: "apart",
		stateOf: missesApart,
	},
	{
		id: "one-and-done",
		gate: 4,
		name: "One and done",
		detail: "one miss is all you get",
		lead: "take",
		figure: "1 miss",
		trail: "at most",
		stateOf: missBudget(1),
	},
	{
		id: "three-green",
		gate: 5,
		name: "Three green",
		detail: "three straight, anywhere in the window",
		lead: "answer",
		figure: "3 in a row",
		stateOf: streakOf(3),
	},
	{
		id: "hold-the-middle",
		gate: 6,
		name: "Hold the middle",
		detail: "the opener and the closer are free",
		lead: "answer",
		figure: "polls 2–4",
		trail: "right",
		stateOf: atPolls([1, 2, 3]),
	},
	{
		id: "strong-finish",
		gate: 7,
		name: "Strong finish",
		detail: "a rough open can still land",
		lead: "answer",
		figure: "the last 3",
		trail: "right",
		stateOf: atPolls([2, 3, 4]),
	},
	{
		id: "fast-start",
		gate: 8,
		name: "Fast start",
		detail: "settle it before the back half",
		lead: "answer",
		figure: "the first 3",
		trail: "right",
		stateOf: atPolls([0, 1, 2]),
	},
	{
		id: "four-green",
		gate: 9,
		name: "Four green",
		detail: "four straight, anywhere in the window",
		lead: "answer",
		figure: "4 in a row",
		stateOf: streakOf(4),
	},
	{
		id: "lead-it-clean",
		gate: 10,
		name: "Lead it clean",
		detail: "no repairs at the start",
		lead: "answer",
		figure: "the first 4",
		trail: "right",
		stateOf: atPolls([0, 1, 2, 3]),
	},
	{
		id: "land-it-clean",
		gate: 11,
		name: "Land it clean",
		detail: "no repairs at the end",
		lead: "answer",
		figure: "the last 4",
		trail: "right",
		stateOf: atPolls([1, 2, 3, 4]),
	},
	{
		id: "never-wrong",
		gate: 12,
		name: "Never wrong",
		detail: "a partial holds the line, a wrong ends it",
		lead: "take",
		figure: "0 wrong",
		trail: "partials hold",
		stateOf: missBudget(0),
	},
];

export const GATE_OBJECTIVES: Readonly<Record<number, GateObjective>> =
	Object.fromEntries(
		OBJECTIVES.map((objective) => [objective.gate, objective])
	);

export const objectiveForGate = (gate: number): GateObjective | undefined =>
	GATE_OBJECTIVES[gate];

export const ALL_GATE_OBJECTIVES: readonly GateObjective[] = OBJECTIVES;

export const objectiveMetAt = (
	gate: number,
	outcomes: readonly AnswerOutcome[]
): boolean =>
	objectiveForGate(gate)?.stateOf({ outcomes, windowSize: SLICE_WINDOW }) ===
	"met";

/**
 * What the gate's objective adds to a clear. Zero unless it was met, and zero on
 * a gate that does not clear, because the clear payout it rides on is zero there
 * too: a bonus on nothing can never be worth losing a day for.
 */
export const objectiveBonusFor = (
	gate: number,
	outcomes: readonly AnswerOutcome[],
	clearKb: number
): number =>
	objectiveMetAt(gate, outcomes)
		? Math.round(clearKb * (OBJECTIVE_BONUS - 1))
		: 0;
```

## Summary of Changes

Prep holds two objectives again: the required **Finish at X or better** line and
the optional **Earn the <gate> swatch** row. The thirteen authored per-gate
objectives are gone.

**Deleted**: `gate/domain/gateObjective.model.ts` + spec, `docs/adr/082-*.md`.

**Code**
- `bandOutcomes.viewmodel.ts`: `objectivesFor` returns one optional row; `authoredObjectiveOf` and `BandOutcomesFrame.windowOutcomes` deleted; the panel note no longer promises a share on top of the clear.
- `prepScreen.viewmodel.ts`: stops mapping `answeredThisGate` into the frame.
- `gateOutcome.viewmodel.ts`: the `next gate asks ...` chip and its constants are gone.
- `answer.model.ts` / `run.model.ts`: `objectiveBonusKb` is off the settlement and off `RunState`.
- `rules.model.ts`: `OBJECTIVE_BONUS` deleted, `GATE_REWARD_KB` back to **32** (28 only existed to fund the bonus; leaving it would have been a silent 12.5% economy cut).

**Docs**: ADR-035 and ADR-080 lose their 082 amendments, ADR README drops the row,
CONTEXT.md drops the domain term and the "Two kinds of objective" table, the wiki
gate table drops its objective column and restates the clear payouts at 32 KB a
gate, CHANGELOG keeps the band-table fixes that shipped alongside 082 and drops
the feature.

**Verified**: `npm run lint` clean, `npm run build` (typecheck) clean, 1061 of 1063
passing in `run/gate`, `run/run` and `run/build`. The two reds are `gate.model.spec`
> the floor rule, pre-existing and committed (the floor is a comment in
`gate.model.ts`, not code; see DVTD-xl63).
