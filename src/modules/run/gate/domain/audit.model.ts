import type { Config } from "~/modules/run/config/domain/config.model";
import { failStripsFor } from "~/modules/run/run/domain/rules.model";
import { selectSeededRandom } from "~/shared/lib/seededRandom";

/**
 * An audit is a gate's fixed rule (ADR-035, roster in ADR-038): stated on the
 * stake receipt, applied by the reducer, never rolled. Gates 0–2 are always
 * clean, one audit runs from gate 3, two from gate 8, three from gate 11 — the
 * count is the escalation, and it steps where the peel's does.
 *
 * Every field is data, folded by the helpers below, so a new audit is a roster
 * entry rather than a branch in the reducer.
 */
export type Audit = {
	readonly id: string;
	readonly name: string;
	/** The stake receipt's sentence — what this gate does differently. */
	readonly description: string;
	/** The catalogue's sentence, for the audits whose numbers change from gate to
	 * gate. Timeout and Strip state this gate's figures in `description`, which
	 * reads as a lie in a Dex row that covers three gates at once. */
	readonly dexRule?: string;
	/** The answering screen's persistent banner; present when the rule changes
	 * how a poll should be played, not just what it costs. */
	readonly answerCue?: string;
	/** Transforms the answer's raw share before multipliers, which inverts the
	 * bleed for free: a share of 0 scores nothing and bleeds. */
	readonly scoreShare?: (share: number) => number;
	/** Flips the poll itself: every option's correctness inverts, so the question
	 * becomes "pick every INCORRECT option" (ADR-038). Graded normally after
	 * that, which is why it needs no `scoreShare` and no demand discount. */
	readonly mirrorsPolls?: boolean;
	/** KB burned as each poll resolves; `wrong` lands on a full miss. */
	readonly burnKb?: { readonly base: number; readonly wrong: number };
	/** Configs stripped on top of the gate's own peel row when its attempt fails
	 * (ADR-037) — how a deep gate bites harder than the table already does. */
	readonly stripQuotaOnFail?: number;
	/** Scales the gate's demand where the audit suppresses normal earning
	 * (mirrored answers forfeit their streak bonuses). */
	readonly demandFactor?: number;
	/** Multiplies what the paid actions charge (lint, peek) inside this gate. */
	readonly feeMultiplier?: number;
	/** Takes the paid actions away entirely — the buttons stop existing. */
	readonly freezesManualEffects?: boolean;
	/** Shuts the shop that precedes this gate: nothing may be bought or sold. */
	readonly closesShop?: boolean;
	/** How this audit takes configs offline — the four flavours differ only in
	 * which config they pick and how often (`offlineConfigsFor`). */
	readonly disablesConfig?: OfflinePick;
	/** The window's first `count` polls must be answered inside `limitMs`. */
	readonly timedPolls?: { readonly count: number; readonly limitMs: number };
};

/**
 * Which config an audit takes offline, and for how long. Same effect at the
 * scoring end — the config contributes nothing — so the whole family is one
 * fold; only the pick differs, and that is the entire personality of each.
 */
export type OfflinePick =
	/** One config, chosen once, down for the whole attempt (Dependency Outage). */
	| "one-per-attempt"
	/** A fresh roll every poll — it can hit the same config twice (Flaky Build). */
	| "random-per-poll"
	/** Steps through the pipeline, a different config every poll (Rolling Outage). */
	| "rotating-per-poll"
	/** The one you invested most in (Breaking Change). No roll: it is a
	 * punishment for having a favourite. */
	| "highest-level";

const MIRROR: Audit = {
	id: "mirrored",
	name: "Mirror",
	description:
		"Every poll asks for the INCORRECT options instead — pick all of them.",
	answerCue:
		"Mirrored: pick every WRONG option. A single-answer poll usually has several.",
	// The poll is flipped rather than the score, so a mirrored answer is graded
	// like any other: streaks build, partials pay, and the gate charges its full
	// demand. The old score-inverting mirror needed a 0.5 discount because
	// streakless play could not reach the row; this one does not.
	mirrorsPolls: true,
};

const LEAK_BASE_KB = 16;
const LEAK_WRONG_KB = 32;

const MEMORY_LEAK: Audit = {
	id: "memory-leak",
	name: "Memory Leak",
	description: `Storage leaks on every poll: −${LEAK_BASE_KB}KB, −${LEAK_WRONG_KB}KB on a miss.`,
	answerCue: `Storage is leaking: −${LEAK_BASE_KB}KB a poll, −${LEAK_WRONG_KB}KB on a miss.`,
	burnKb: { base: LEAK_BASE_KB, wrong: LEAK_WRONG_KB },
};

const FEE_OVERRUN_MULTIPLIER = 2;

const COST_OVERRUN: Audit = {
	id: "cost-overrun",
	name: "Cost Overrun",
	description: `Every paid action costs ×${FEE_OVERRUN_MULTIPLIER} — linting and peeking both.`,
	answerCue: `Paid actions are running ×${FEE_OVERRUN_MULTIPLIER} over budget this gate.`,
	feeMultiplier: FEE_OVERRUN_MULTIPLIER,
};

const FEATURE_FREEZE: Audit = {
	id: "feature-freeze",
	name: "Feature Freeze",
	description:
		"No paid actions at all: the linter and the community peek are frozen.",
	answerCue: "Feature freeze — the linter and the peek are unavailable.",
	freezesManualEffects: true,
};

const READ_ONLY: Audit = {
	id: "read-only",
	name: "Read-only",
	description:
		"The shop before this gate is closed: no drafting, upgrades, rebuilds or plan changes.",
	closesShop: true,
};

const DEPENDENCY_OUTAGE: Audit = {
	id: "dependency-outage",
	name: "Dependency Outage",
	description:
		"One config in your pipeline goes offline for the whole attempt — its effect does nothing.",
	answerCue: "A dependency is down: one of your configs is offline this gate.",
	disablesConfig: "one-per-attempt",
};

const FLAKY_BUILD: Audit = {
	id: "flaky-build",
	name: "Flaky Build",
	description:
		"One config fails to trigger on every poll — a different one each time, and it can flake twice in a row.",
	answerCue: "Flaky build: one config drops out on every poll.",
	disablesConfig: "random-per-poll",
};

const ROLLING_OUTAGE: Audit = {
	id: "rolling-outage",
	name: "Rolling Outage",
	description:
		"The outage rolls through your pipeline: a different config is down for each poll of the window.",
	answerCue: "Rolling outage: the config that is down moves every poll.",
	disablesConfig: "rotating-per-poll",
};

// Renamed from "Deprecated" (2026-08-20): that name now belongs to the config
// whose mechanic actually is deprecation — works, fades, removed. This audit
// is a breakage, and it hits the config at the highest version on purpose.
const BREAKING_CHANGE: Audit = {
	id: "breaking-change",
	name: "Breaking Change",
	description:
		"Your highest-level config takes a breaking change for the whole attempt — the one you upgraded most does nothing.",
	answerCue:
		"Breaking change: your most-upgraded config is switched off this gate.",
	disablesConfig: "highest-level",
};

/** Seconds, not milliseconds, in the copy the player reads. */
const timeoutAudit = (count: number, seconds: number): Audit => ({
	id: `timeout-${count}`,
	name: "Timeout",
	description: `The first ${count} polls are on a ${seconds}s clock — an answer over the limit scores as a miss.`,
	dexRule:
		"The window's first polls run on a clock, tighter and longer the deeper the gate. A late answer scores as a miss.",
	answerCue: `On the clock: ${seconds}s to answer, or it counts as a miss.`,
	timedPolls: { count, limitMs: seconds * 1000 },
});

/** Takes its own gate so the receipt can state the total, not the surcharge. */
const stripAudit = (gate: number, extra: number): Audit => ({
	id: `strip-${extra}`,
	name: "Strip",
	description: `Failing this gate peels ${failStripsFor(gate) + extra} configs instead of ${failStripsFor(gate)} — a build it can empty ends the run here.`,
	dexRule:
		"Failing this gate peels extra configs on top of its own row. A build it can empty ends the run there.",
	stripQuotaOnFail: extra,
});

/**
 * The roster (ADR-038). Order matters twice: the receipt reads top to bottom,
 * and Volkswagen CI reports the first one as passing — so the entry a player
 * would most want suppressed leads at the gates where that choice is the point.
 */
export const GATE_AUDITS: Readonly<Record<number, readonly Audit[]>> = {
	3: [COST_OVERRUN], // Thunder
	4: [DEPENDENCY_OUTAGE], // Lavender
	// Read-only only ever sits on an odd gate: the storage rungs unlock on even
	// ones (ADR-030), and shutting the shop the gate a rung arrives at would
	// unlock something the player cannot buy until the gate after it.
	5: [READ_ONLY], // Rainbow
	6: [FEATURE_FREEZE], // Soul
	7: [MIRROR], // Marsh
	8: [timeoutAudit(3, 30), FLAKY_BUILD], // Seafoam
	9: [MEMORY_LEAK, ROLLING_OUTAGE], // Volcano
	10: [BREAKING_CHANGE, timeoutAudit(4, 25)], // Earth
	11: [stripAudit(11, 1), MIRROR, FLAKY_BUILD], // Elite
	12: [MEMORY_LEAK, stripAudit(12, 2), timeoutAudit(5, 20)], // Champion
};

export const auditsForGate = (gate: number): readonly Audit[] =>
	GATE_AUDITS[gate] ?? [];

const suppressorOf = (configs: readonly Config[]): Config | undefined =>
	configs.find((config) => config.suppressesAudit === true);

/** The audit Volkswagen CI reports as passing — always the gate's first. */
export const suppressedAuditFor = (
	configs: readonly Config[],
	gate: number
): Audit | undefined =>
	suppressorOf(configs) ? auditsForGate(gate)[0] : undefined;

/**
 * The audits actually in force: the defeat device drops the gate's first one
 * (ADR-028 repurposed). Dropping MIRROR also drops its demand discount —
 * cheating the mirror means paying the full demand.
 */
export const liveAuditsFor = (
	configs: readonly Config[],
	gate: number
): readonly Audit[] => {
	const audits = auditsForGate(gate);
	return suppressorOf(configs) ? audits.slice(1) : audits;
};

export const mirrorsPolls = (audits: readonly Audit[]): boolean =>
	audits.some((audit) => audit.mirrorsPolls === true);

export const auditScoreShare = (
	audits: readonly Audit[],
	share: number
): number => audits.reduce((s, audit) => audit.scoreShare?.(s) ?? s, share);

export const auditBurnKb = (audits: readonly Audit[], wrong: boolean): number =>
	audits.reduce(
		(sum, audit) =>
			sum + (wrong ? (audit.burnKb?.wrong ?? 0) : (audit.burnKb?.base ?? 0)),
		0
	);

/** What the audits add to the base peel — `failStripQuotaFor` owns the total. */
export const auditExtraStrips = (audits: readonly Audit[]): number =>
	audits.reduce((sum, audit) => sum + (audit.stripQuotaOnFail ?? 0), 0);

export const auditDemandFactor = (audits: readonly Audit[]): number =>
	audits.reduce((factor, audit) => factor * (audit.demandFactor ?? 1), 1);

/** Stacked overruns multiply, so a future ×2 and ×3 gate would charge ×6. */
export const auditFeeMultiplier = (audits: readonly Audit[]): number =>
	audits.reduce((factor, audit) => factor * (audit.feeMultiplier ?? 1), 1);

export const auditsFreezeManualEffects = (audits: readonly Audit[]): boolean =>
	audits.some((audit) => audit.freezesManualEffects === true);

export const auditsCloseShop = (audits: readonly Audit[]): boolean =>
	audits.some((audit) => audit.closesShop === true);

/**
 * The clock on the poll at `answeredBefore`, or undefined when it runs free.
 * Stacked timeouts take the tightest of each half rather than the first one
 * found, so adding a second can only ever make a gate stricter.
 */
export const auditTimeLimitMs = (
	audits: readonly Audit[],
	answeredBefore: number
): number | undefined =>
	audits.reduce<number | undefined>((limit, audit) => {
		const timed = audit.timedPolls;
		if (!timed || answeredBefore >= timed.count) return limit;
		return limit === undefined ? timed.limitMs : Math.min(limit, timed.limitMs);
	}, undefined);

/**
 * Every config an audit has taken offline for the poll about to be answered
 * (ADR-038). Derived, never stored: the seeds are the window's own start index
 * and the poll's place in it, so a pick is stable for as long as it should last,
 * different on the next attempt, and identical after a reload — with no
 * migration and no chance of drifting from a rehydrated window.
 *
 * Sorted by id first, so every flavour answers to which configs are installed
 * rather than to the order they were bought in.
 */
export const offlineConfigsFor = (
	configs: readonly Config[],
	audits: readonly Audit[],
	windowStart: number,
	answeredThisWindow: number
): readonly Config[] => {
	const down = offlinePairsFor(
		configs,
		audits,
		windowStart,
		answeredThisWindow
	);
	// Two audits can land on the same config; the set is what scoring subtracts.
	return sortedById(configs).filter((config) =>
		down.some((pair) => pair.config.id === config.id)
	);
};

const sortedById = (configs: readonly Config[]): readonly Config[] =>
	[...configs].sort((a, b) => a.id.localeCompare(b.id));

export type OfflinePair = { readonly config: Config; readonly audit: Audit };

/**
 * The same switch-off, read as which audit threw it: scoring only needs the
 * configs, but a rail that cannot name the culprit shows the player a dead row
 * and no reason for it. One derivation, two readings — never two derivations.
 */
export const offlinePairsFor = (
	configs: readonly Config[],
	audits: readonly Audit[],
	windowStart: number,
	answeredThisWindow: number
): readonly OfflinePair[] => {
	if (configs.length === 0) return [];
	const sorted = sortedById(configs);
	return audits.flatMap((audit): readonly OfflinePair[] => {
		const pick = audit.disablesConfig;
		if (pick === undefined) return [];
		const config = pickOffline(pick, sorted, windowStart, answeredThisWindow);
		return config === undefined ? [] : [{ config, audit }];
	});
};

const pickOffline = (
	pick: OfflinePick,
	sorted: readonly Config[],
	windowStart: number,
	answeredThisWindow: number
): Config | undefined => {
	if (pick === "one-per-attempt")
		return (
			selectSeededRandom([...sorted], `outage-${windowStart}`) ?? undefined
		);
	if (pick === "random-per-poll")
		return (
			selectSeededRandom(
				[...sorted],
				`flake-${windowStart}-${answeredThisWindow}`
			) ?? undefined
		);
	if (pick === "rotating-per-poll")
		// Offset by the window, so a retry does not replay the same rotation.
		return sorted[(windowStart + answeredThisWindow) % sorted.length];
	return highestLevel(sorted, windowStart);
};

/**
 * Breaking Change's pick: the config levelled furthest, and a seeded random
 * among the ones tied for it. Ties are the common case — most builds have
 * nothing upgraded — and taking "the first" there would quietly always mean
 * the same config, which is a preference the receipt never stated and the
 * player cannot see.
 */
const highestLevel = (
	sorted: readonly Config[],
	windowStart: number
): Config | undefined => {
	const top = sorted.reduce(
		(best, config) => Math.max(best, config.level ?? 1),
		1
	);
	const tied = sorted.filter((config) => (config.level ?? 1) === top);
	return (
		selectSeededRandom([...tied], `breaking-change-${windowStart}`) ?? undefined
	);
};
