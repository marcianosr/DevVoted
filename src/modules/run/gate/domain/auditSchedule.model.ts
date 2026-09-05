import {
	type AuditId,
	type AuditSchedule,
} from "~/modules/run/gate/domain/audit.model";
import { VICTORY_GATE } from "~/modules/run/run/domain/rules.model";
import { shuffleSeeded } from "~/shared/lib/seededRandom";

export type AuditFamily =
	| "paid-actions"
	| "offline-config"
	| "storage-burn"
	| "poll-reading"
	| "shop"
	| "clock"
	| "stake";

const FAMILY_OF = {
	"cost-overrun": "paid-actions",
	"too-many-requests": "paid-actions",
	"feature-freeze": "paid-actions",
	"dependency-outage": "offline-config",
	"flaky-build": "offline-config",
	"rolling-outage": "offline-config",
	"breaking-change": "offline-config",
	"upgrade-required": "offline-config",
	"memory-leak": "storage-burn",
	"payload-too-large": "storage-burn",
	mirrored: "poll-reading",
	"not-found": "poll-reading",
	"read-only": "shop",
	timeout: "clock",
	strip: "stake",
} as const satisfies Record<AuditId, AuditFamily>;

export const familyOf = (id: AuditId): AuditFamily => FAMILY_OF[id];

const DENY_PAIRS: readonly (readonly [AuditId, AuditId])[] = [
	["mirrored", "timeout"],
];

export const AUDIT_RANK: readonly AuditId[] = [
	"strip",
	"mirrored",
	"timeout",
	"feature-freeze",
	"read-only",
	"memory-leak",
	"payload-too-large",
	"breaking-change",
	"upgrade-required",
	"rolling-outage",
	"flaky-build",
	"dependency-outage",
	"not-found",
	"too-many-requests",
	"cost-overrun",
];

const POOL_A: readonly AuditId[] = [
	"not-found",
	"read-only",
	"dependency-outage",
	"too-many-requests",
	"flaky-build",
	"memory-leak",
];

const POOL_B: readonly AuditId[] = [
	...POOL_A,
	"cost-overrun",
	"breaking-change",
	"upgrade-required",
	"rolling-outage",
	"mirrored",
	"timeout",
	"payload-too-large",
];

const POOL_C: readonly AuditId[] = [
	"feature-freeze",
	"mirrored",
	"timeout",
	"breaking-change",
	"upgrade-required",
	"rolling-outage",
	"memory-leak",
	"payload-too-large",
	"flaky-build",
];

export const INTRO_GATE = 3;
export const INTRO_AUDITS: readonly AuditId[] = ["cost-overrun"];

const CHAMPION_AUDITS: readonly AuditId[] = [
	"timeout",
	"strip",
	"payload-too-large",
];

export type AuditBand = {
	readonly name: string;
	readonly gates: readonly number[];
	readonly perGate: number;
	readonly pool: readonly AuditId[];
	readonly pinned: readonly AuditId[];
};

export const AUDIT_BANDS: readonly AuditBand[] = [
	{ name: "a", gates: [4, 5, 6, 7], perGate: 1, pool: POOL_A, pinned: [] },
	{ name: "b", gates: [8, 9, 10], perGate: 2, pool: POOL_B, pinned: [] },
	{ name: "c", gates: [11], perGate: 2, pool: POOL_C, pinned: ["strip"] },
];

const UNIQUE_WITHIN: "band" | "run" = "band";

export const bandForGate = (gate: number): AuditBand | undefined =>
	AUDIT_BANDS.find((band) => band.gates.includes(gate));

export const certainAuditsFor = (gate: number): readonly AuditId[] => {
	if (gate === INTRO_GATE) return INTRO_AUDITS;
	if (gate === VICTORY_GATE) return CHAMPION_AUDITS;
	return bandForGate(gate)?.pinned ?? [];
};

export const certainGatesOf = (id: AuditId): readonly number[] =>
	[INTRO_GATE, ...AUDIT_BANDS.flatMap((band) => band.gates), VICTORY_GATE]
		.filter((gate) => certainAuditsFor(gate).includes(id))
		.sort((a, b) => a - b);

export const appearsAtGates = (id: AuditId): readonly number[] => {
	const fixed = [INTRO_GATE, VICTORY_GATE].filter((gate) =>
		certainAuditsFor(gate).includes(id)
	);
	const drawable = AUDIT_BANDS.filter(
		(band) => band.pool.includes(id) || band.pinned.includes(id)
	).flatMap((band) => band.gates);
	return [...new Set([...fixed, ...drawable])].sort((a, b) => a - b);
};

const deniedWith = (id: AuditId, taken: readonly AuditId[]): boolean =>
	DENY_PAIRS.some(
		([one, other]) =>
			(id === one && taken.includes(other)) ||
			(id === other && taken.includes(one))
	);

const eligibleFor = (
	pool: readonly AuditId[],
	used: ReadonlySet<AuditId>,
	taken: readonly AuditId[]
): readonly AuditId[] => {
	const families = new Set(taken.map(familyOf));
	return pool.filter(
		(id) =>
			!used.has(id) && !families.has(familyOf(id)) && !deniedWith(id, taken)
	);
};

const byRank = (ids: readonly AuditId[]): readonly AuditId[] =>
	[...ids].sort((a, b) => AUDIT_RANK.indexOf(a) - AUDIT_RANK.indexOf(b));

const fillGate = (
	band: AuditBand,
	gate: number,
	used: Set<AuditId>,
	seed: string
): readonly AuditId[] => {
	const taken = [...band.pinned];
	band.pinned.forEach((id) => used.add(id));

	for (let pick = 0; pick < band.perGate; pick++) {
		const eligible = eligibleFor(band.pool, used, taken);
		const drawn = shuffleSeeded(eligible, `${seed}:${gate}:${pick}`)[0];
		if (drawn === undefined) break;
		taken.push(drawn);
		used.add(drawn);
	}

	return byRank(taken);
};

export const drawAuditSchedule = (seed: string): AuditSchedule => {
	const runUsed = new Set<AuditId>();

	const drawn = AUDIT_BANDS.reduce<Record<number, readonly AuditId[]>>(
		(schedule, band) => {
			const used = UNIQUE_WITHIN === "band" ? new Set(runUsed) : runUsed;
			const filled = band.gates.reduce<Record<number, readonly AuditId[]>>(
				(gates, gate) => ({
					...gates,
					[gate]: fillGate(band, gate, used, `${seed}:${band.name}`),
				}),
				{}
			);
			return { ...schedule, ...filled };
		},
		{}
	);

	return {
		...drawn,
		[INTRO_GATE]: INTRO_AUDITS,
		[VICTORY_GATE]: CHAMPION_AUDITS,
	};
};

export const DEFAULT_AUDIT_SCHEDULE = drawAuditSchedule("");
