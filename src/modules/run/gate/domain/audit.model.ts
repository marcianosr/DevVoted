import type { Config } from "~/modules/run/config/domain/config.model";
import { failPeelShareFor } from "~/modules/run/run/domain/rules.model";

const asPercent = (share: number): string => `${Math.round(share * 100)}%`;
import { selectSeededRandom } from "~/shared/lib/seededRandom";

export type Audit = {
	readonly id: string;
	readonly code: number;
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
	readonly paidActionLimit?: number;
	readonly closesShop?: boolean;
	readonly hidesCategory?: boolean;
	readonly overWidthBurn?: { readonly freeSlots: number; readonly kb: number };
	readonly disablesConfig?: OfflinePick;
	readonly timedPolls?: { readonly count: number; readonly limitMs: number };
};

export type OfflinePick =
	| "one-per-attempt"
	| "random-per-poll"
	| "rotating-per-poll"
	| "highest-level"
	| "lowest-level";

const MIRROR: Audit = {
	id: "mirrored",
	code: 300,
	name: "Multiple Choices",
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
	code: 507,
	name: "Insufficient Storage",
	description: `Storage leaks on every poll: −${LEAK_BASE_KB}KB, −${LEAK_WRONG_KB}KB on a miss.`,
	answerCue: `Storage is leaking: −${LEAK_BASE_KB}KB a poll, −${LEAK_WRONG_KB}KB on a miss.`,
	burnKb: { base: LEAK_BASE_KB, wrong: LEAK_WRONG_KB },
};

const FEE_OVERRUN_MULTIPLIER = 2;

const COST_OVERRUN: Audit = {
	id: "cost-overrun",
	code: 402,
	name: "Payment Required",
	description: `Every paid action costs ×${FEE_OVERRUN_MULTIPLIER} — linting and peeking both.`,
	answerCue: `Paid actions are running ×${FEE_OVERRUN_MULTIPLIER} over budget this gate.`,
	feeMultiplier: FEE_OVERRUN_MULTIPLIER,
};

const FEATURE_FREEZE: Audit = {
	id: "feature-freeze",
	code: 403,
	name: "Forbidden",
	description:
		"No paid actions at all: the linter and the community peek are frozen.",
	answerCue: "Paid actions are forbidden — the linter and the peek are out.",
	freezesManualEffects: true,
};

const READ_ONLY: Audit = {
	id: "read-only",
	code: 405,
	name: "Method Not Allowed",
	description:
		"The shop before this gate is read-only: no drafting, upgrades, rebuilds or plan changes.",
	closesShop: true,
};

const DEPENDENCY_OUTAGE: Audit = {
	id: "dependency-outage",
	code: 424,
	name: "Failed Dependency",
	description:
		"One config in your build goes offline for the whole attempt — its effect does nothing.",
	answerCue: "A dependency is down: one of your configs is offline this gate.",
	disablesConfig: "one-per-attempt",
};

const FLAKY_BUILD: Audit = {
	id: "flaky-build",
	code: 502,
	name: "Bad Gateway",
	description:
		"One config fails to trigger on every poll — a different one each time, and it can flake twice in a row.",
	answerCue: "Flaking: one config drops out on every poll.",
	disablesConfig: "random-per-poll",
};

const ROLLING_OUTAGE: Audit = {
	id: "rolling-outage",
	code: 503,
	name: "Service Unavailable",
	description:
		"The outage rolls through your build: a different config is down for each poll of the window.",
	answerCue: "Rolling outage: the config that is down moves every poll.",
	disablesConfig: "rotating-per-poll",
};

const BREAKING_CHANGE: Audit = {
	id: "breaking-change",
	code: 409,
	name: "Conflict",
	description:
		"Your highest-level config takes a breaking change for the whole attempt — the one you upgraded most does nothing.",
	answerCue:
		"Breaking change: your most-upgraded config is switched off this gate.",
	disablesConfig: "highest-level",
};

const timeoutAudit = (count: number, seconds: number): Audit => ({
	id: `timeout-${count}`,
	code: 408,
	name: "Request Timeout",
	description: `The first ${count} polls are on a ${seconds}s clock — an answer over the limit scores as a miss.`,
	dexRule:
		"The window's first polls run on a clock, tighter and longer the deeper the gate. A late answer scores as a miss.",
	answerCue: `On the clock: ${seconds}s to answer, or it counts as a miss.`,
	timedPolls: { count, limitMs: seconds * 1000 },
});

const NOT_FOUND: Audit = {
	id: "not-found",
	code: 404,
	name: "Not Found",
	description:
		"No poll says which category it belongs to, so which of your configs is about to pay is yours to work out.",
	answerCue: "Category hidden: you are answering blind on which configs pay.",
	hidesCategory: true,
};

const PAID_ACTION_ALLOWANCE = 1;

const TOO_MANY_REQUESTS: Audit = {
	id: "too-many-requests",
	code: 429,
	name: "Too Many Requests",
	description: `Rate limited to ${PAID_ACTION_ALLOWANCE} paid action for the whole window — the linter or the peek, not both.`,
	answerCue: `Rate limited: ${PAID_ACTION_ALLOWANCE} paid action left for this gate.`,
	paidActionLimit: PAID_ACTION_ALLOWANCE,
};

const UPGRADE_REQUIRED: Audit = {
	id: "upgrade-required",
	code: 426,
	name: "Upgrade Required",
	description:
		"The config you neglected goes out of date: your lowest-level one sits the whole attempt out.",
	answerCue:
		"Upgrade required: your least-upgraded config is offline this gate.",
	disablesConfig: "lowest-level",
};

const PAYLOAD_FREE_SLOTS = 12;
const PAYLOAD_KB_PER_SLOT = 8;

const PAYLOAD_TOO_LARGE: Audit = {
	id: "payload-too-large",
	code: 413,
	name: "Payload Too Large",
	description: `Every slot past the ${PAYLOAD_FREE_SLOTS}th leaks ${PAYLOAD_KB_PER_SLOT}KB a poll, so a wide build pays to carry itself.`,
	answerCue: `Payload over ${PAYLOAD_FREE_SLOTS} slots: ${PAYLOAD_KB_PER_SLOT}KB a poll for each one past it.`,
	overWidthBurn: { freeSlots: PAYLOAD_FREE_SLOTS, kb: PAYLOAD_KB_PER_SLOT },
};

const stripAudit = (gate: number, extra: number): Audit => ({
	id: `strip-${Math.round(extra * 100)}`,
	code: 410,
	name: "Gone",
	description: `Failing this gate peels ${asPercent(failPeelShareFor(gate) + extra)} of your build instead of ${asPercent(failPeelShareFor(gate))} — a build it can empty ends the run here.`,
	dexRule:
		"Failing this gate peels a bigger share of the build than its own row. A build it can empty ends the run there.",
	peelShareOnFail: extra,
});

export const GATE_AUDITS: Readonly<Record<number, readonly Audit[]>> = {
	3: [COST_OVERRUN],
	4: [DEPENDENCY_OUTAGE],
	5: [NOT_FOUND],
	6: [READ_ONLY],
	7: [MIRROR],
	8: [timeoutAudit(3, 30), FLAKY_BUILD],
	9: [ROLLING_OUTAGE, MEMORY_LEAK],
	10: [BREAKING_CHANGE, TOO_MANY_REQUESTS],
	11: [stripAudit(11, 0.1), UPGRADE_REQUIRED, FEATURE_FREEZE],
	12: [timeoutAudit(5, 20), stripAudit(12, 0.15), PAYLOAD_TOO_LARGE],
};

export const auditsForGate = (gate: number): readonly Audit[] =>
	GATE_AUDITS[gate] ?? [];

export const auditLabel = (audit: Audit): string =>
	`${audit.code} ${audit.name}`;

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

const overWidthKb = (audit: Audit, slotsHeld: number): number => {
	const over = audit.overWidthBurn;
	if (over === undefined) return 0;
	return Math.max(0, slotsHeld - over.freeSlots) * over.kb;
};

export const auditBurnKb = (
	audits: readonly Audit[],
	wrong: boolean,
	slotsHeld = 0
): number =>
	audits.reduce(
		(sum, audit) =>
			sum +
			(wrong ? (audit.burnKb?.wrong ?? 0) : (audit.burnKb?.base ?? 0)) +
			overWidthKb(audit, slotsHeld),
		0
	);

export const auditsHideCategory = (audits: readonly Audit[]): boolean =>
	audits.some((audit) => audit.hidesCategory === true);

export const auditPaidActionLimit = (
	audits: readonly Audit[]
): number | undefined =>
	audits.reduce<number | undefined>((limit, audit) => {
		if (audit.paidActionLimit === undefined) return limit;
		return limit === undefined
			? audit.paidActionLimit
			: Math.min(limit, audit.paidActionLimit);
	}, undefined);

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
		return pickOffline(pick, sorted, windowStart, answeredThisWindow).map(
			(config) => ({ config, audit })
		);
	});
};

const onlyFound = (config: Config | undefined | null): readonly Config[] =>
	config ? [config] : [];

const FIRST_VERSION = 1;

const pickOffline = (
	pick: OfflinePick,
	sorted: readonly Config[],
	windowStart: number,
	answeredThisWindow: number
): readonly Config[] => {
	if (pick === "one-per-attempt")
		return onlyFound(selectSeededRandom([...sorted], `outage-${windowStart}`));
	if (pick === "random-per-poll")
		return onlyFound(
			selectSeededRandom(
				[...sorted],
				`flake-${windowStart}-${answeredThisWindow}`
			)
		);
	if (pick === "rotating-per-poll")
		return onlyFound(
			sorted[(windowStart + answeredThisWindow) % sorted.length]
		);
	if (pick === "lowest-level")
		return onlyFound(atLevelEdge(sorted, windowStart, "lowest"));
	return onlyFound(atLevelEdge(sorted, windowStart, "highest"));
};

const atLevelEdge = (
	sorted: readonly Config[],
	windowStart: number,
	edge: "highest" | "lowest"
): Config | undefined => {
	const levelOf = (config: Config) => config.level ?? FIRST_VERSION;
	const pick = edge === "highest" ? Math.max : Math.min;
	const edgeLevel = sorted.reduce(
		(best, config) => pick(best, levelOf(config)),
		edge === "highest" ? FIRST_VERSION : Number.POSITIVE_INFINITY
	);
	const tied = sorted.filter((config) => levelOf(config) === edgeLevel);
	return (
		selectSeededRandom([...tied], `${edge}-level-${windowStart}`) ?? undefined
	);
};
