import type { AuditId } from "~/modules/run/gate/domain/audit.model";
import { VICTORY_GATE } from "~/modules/run/run/domain/rules.model";
import { shuffleSeeded } from "~/shared/lib/seededRandom";

export type AuditFamily =
	| "meter"
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
	"multi-status": "poll-reading",
	"not-found": "poll-reading",
	"legal-hold": "poll-reading",
	"read-only": "shop",
	timeout: "clock",
	strip: "stake",
	"too-early": "offline-config",
	"not-extended": "offline-config",
	"meter-down": "meter",
} as const satisfies Record<AuditId, AuditFamily>;

export const familyOf = (id: AuditId): AuditFamily => FAMILY_OF[id];

const DENY_PAIRS: readonly (readonly [AuditId, AuditId])[] = [
	["mirrored", "timeout"],
];

export const AUDIT_RANK: readonly AuditId[] = [
	"strip",
	"mirrored",
	"not-extended",
	"multi-status",
	"timeout",
	"feature-freeze",
	"read-only",
	"memory-leak",
	"payload-too-large",
	"breaking-change",
	"upgrade-required",
	"too-early",
	"rolling-outage",
	"flaky-build",
	"dependency-outage",
	"legal-hold",
	"not-found",
	"meter-down",
	"too-many-requests",
	"cost-overrun",
];

const POOL_A: readonly AuditId[] = [
	"not-found",
	"multi-status",
	"read-only",
	"dependency-outage",
	"too-many-requests",
	"flaky-build",
	"memory-leak",
	"legal-hold",
	"meter-down",
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
	"too-early",
];

const POOL_C: readonly AuditId[] = [
	"feature-freeze",
	"mirrored",
	"multi-status",
	"timeout",
	"breaking-change",
	"upgrade-required",
	"rolling-outage",
	"memory-leak",
	"payload-too-large",
	"flaky-build",
	"legal-hold",
	"strip",
	"too-early",
	"not-extended",
	"meter-down",
];

export type AuditTier = {
	readonly gates: readonly number[];
	readonly capacity: number;
	readonly pool: readonly AuditId[];
};

export const AUDIT_TIERS: readonly AuditTier[] = [
	{ gates: [3, 4, 5, 6, 7], capacity: 1, pool: POOL_A },
	{ gates: [8, 9, 10], capacity: 2, pool: POOL_B },
	{ gates: [11, VICTORY_GATE], capacity: 3, pool: POOL_C },
];

export const AUDITS_FROM_GATE: number = Math.min(
	...AUDIT_TIERS.flatMap((tier) => tier.gates)
);

export const FIRST_AUDITED_GATE = Math.min(
	...AUDIT_TIERS.flatMap((tier) => tier.gates)
);

export const tierForGate = (gate: number): AuditTier | undefined =>
	AUDIT_TIERS.find((tier) => tier.gates.includes(gate));

export const auditCapacityFor = (gate: number): number =>
	tierForGate(gate)?.capacity ?? 0;

export const poolForGate = (gate: number): readonly AuditId[] =>
	tierForGate(gate)?.pool ?? [];

export const appearsAtGates = (id: AuditId): readonly number[] =>
	AUDIT_TIERS.filter((tier) => tier.pool.includes(id))
		.flatMap((tier) => tier.gates)
		.sort((a, b) => a - b);

const deniedWith = (id: AuditId, taken: readonly AuditId[]): boolean =>
	DENY_PAIRS.some(
		([one, other]) =>
			(id === one && taken.includes(other)) ||
			(id === other && taken.includes(one))
	);

export const eligibleFor = (
	pool: readonly AuditId[],
	taken: readonly AuditId[]
): readonly AuditId[] => {
	const families = new Set(taken.map(familyOf));
	return pool.filter(
		(id) =>
			!taken.includes(id) &&
			!families.has(familyOf(id)) &&
			!deniedWith(id, taken)
	);
};

export const rankAudits = (ids: readonly AuditId[]): readonly AuditId[] =>
	[...ids].sort((a, b) => AUDIT_RANK.indexOf(a) - AUDIT_RANK.indexOf(b));

export const drawPayloads = (
	pool: readonly AuditId[],
	taken: readonly AuditId[],
	seed: string,
	count: number
): readonly AuditId[] =>
	shuffleSeeded(eligibleFor(pool, taken), seed).slice(0, count);
