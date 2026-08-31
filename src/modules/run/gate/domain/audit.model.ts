import type { Config } from "~/modules/run/config/domain/config.model";
import { failPeelShareFor } from "~/modules/run/run/domain/rules.model";

const asPercent = (share: number): string => `${Math.round(share * 100)}%`;
import { selectSeededRandom } from "~/shared/lib/seededRandom";

export type Audit = {
	readonly id: string;
	readonly name: string;
	readonly description: string;
	readonly dexRule?: string;
	readonly answerCue?: string;
	readonly scoreShare?: (share: number) => number;
	readonly mirrorsPolls?: boolean;
	readonly burnKb?: { readonly base: number; readonly wrong: number };
	readonly peelShareOnFail?: number;
	readonly demandFactor?: number;
	readonly feeMultiplier?: number;
	readonly freezesManualEffects?: boolean;
	readonly closesShop?: boolean;
	readonly disablesConfig?: OfflinePick;
	readonly timedPolls?: { readonly count: number; readonly limitMs: number };
};

export type OfflinePick =
	"one-per-attempt" | "random-per-poll" | "rotating-per-poll" | "highest-level";

const MIRROR: Audit = {
	id: "mirrored",
	name: "Mirror",
	description:
		"Every poll asks for the INCORRECT options instead — pick all of them.",
	answerCue:
		"Mirrored: pick every WRONG option. A single-answer poll usually has several.",
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
		"One config in your build goes offline for the whole attempt — its effect does nothing.",
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
		"The outage rolls through your build: a different config is down for each poll of the window.",
	answerCue: "Rolling outage: the config that is down moves every poll.",
	disablesConfig: "rotating-per-poll",
};

const BREAKING_CHANGE: Audit = {
	id: "breaking-change",
	name: "Breaking Change",
	description:
		"Your highest-level config takes a breaking change for the whole attempt — the one you upgraded most does nothing.",
	answerCue:
		"Breaking change: your most-upgraded config is switched off this gate.",
	disablesConfig: "highest-level",
};

const timeoutAudit = (count: number, seconds: number): Audit => ({
	id: `timeout-${count}`,
	name: "Timeout",
	description: `The first ${count} polls are on a ${seconds}s clock — an answer over the limit scores as a miss.`,
	dexRule:
		"The window's first polls run on a clock, tighter and longer the deeper the gate. A late answer scores as a miss.",
	answerCue: `On the clock: ${seconds}s to answer, or it counts as a miss.`,
	timedPolls: { count, limitMs: seconds * 1000 },
});

const stripAudit = (gate: number, extra: number): Audit => ({
	id: `strip-${Math.round(extra * 100)}`,
	name: "Strip",
	description: `Failing this gate peels ${asPercent(failPeelShareFor(gate) + extra)} of your build instead of ${asPercent(failPeelShareFor(gate))} — a build it can empty ends the run here.`,
	dexRule:
		"Failing this gate peels a bigger share of the build than its own row. A build it can empty ends the run there.",
	peelShareOnFail: extra,
});

export const GATE_AUDITS: Readonly<Record<number, readonly Audit[]>> = {
	3: [COST_OVERRUN],
	4: [DEPENDENCY_OUTAGE],
	5: [READ_ONLY],
	6: [FEATURE_FREEZE],
	7: [MIRROR],
	8: [timeoutAudit(3, 30), FLAKY_BUILD],
	9: [MEMORY_LEAK, ROLLING_OUTAGE],
	10: [BREAKING_CHANGE, timeoutAudit(4, 25)],
	11: [stripAudit(11, 0.1), MIRROR, FLAKY_BUILD],
	12: [MEMORY_LEAK, stripAudit(12, 0.15), timeoutAudit(5, 20)],
};

export const auditsForGate = (gate: number): readonly Audit[] =>
	GATE_AUDITS[gate] ?? [];

export const nextAuditedGateFrom = (
	gate: number
): { readonly gate: number; readonly audit: Audit } | undefined => {
	const next = Object.keys(GATE_AUDITS)
		.map(Number)
		.filter((auditedGate) => auditedGate >= gate)
		.sort((a, b) => a - b)[0];
	const audit = next === undefined ? undefined : GATE_AUDITS[next]?.[0];
	if (next === undefined || audit === undefined) return undefined;
	return { gate: next, audit };
};

const suppressorOf = (configs: readonly Config[]): Config | undefined =>
	configs.find((config) => config.suppressesAudit === true);

export const suppressedAuditFor = (
	configs: readonly Config[],
	gate: number
): Audit | undefined =>
	suppressorOf(configs) ? auditsForGate(gate)[0] : undefined;

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

export const auditExtraPeelShare = (audits: readonly Audit[]): number =>
	audits.reduce((sum, audit) => sum + (audit.peelShareOnFail ?? 0), 0);

export const auditDemandFactor = (audits: readonly Audit[]): number =>
	audits.reduce((factor, audit) => factor * (audit.demandFactor ?? 1), 1);

export const auditFeeMultiplier = (audits: readonly Audit[]): number =>
	audits.reduce((factor, audit) => factor * (audit.feeMultiplier ?? 1), 1);

export const auditsFreezeManualEffects = (audits: readonly Audit[]): boolean =>
	audits.some((audit) => audit.freezesManualEffects === true);

export const auditsCloseShop = (audits: readonly Audit[]): boolean =>
	audits.some((audit) => audit.closesShop === true);

export const auditTimeLimitMs = (
	audits: readonly Audit[],
	answeredBefore: number
): number | undefined =>
	audits.reduce<number | undefined>((limit, audit) => {
		const timed = audit.timedPolls;
		if (!timed || answeredBefore >= timed.count) return limit;
		return limit === undefined ? timed.limitMs : Math.min(limit, timed.limitMs);
	}, undefined);

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
	return sortedById(configs).filter((config) =>
		down.some((pair) => pair.config.id === config.id)
	);
};

const sortedById = (configs: readonly Config[]): readonly Config[] =>
	[...configs].sort((a, b) => a.id.localeCompare(b.id));

export type OfflinePair = { readonly config: Config; readonly audit: Audit };

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
		return sorted[(windowStart + answeredThisWindow) % sorted.length];
	return highestLevel(sorted, windowStart);
};

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
