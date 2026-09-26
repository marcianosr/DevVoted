import type { PublicBuild } from "~/modules/run/build/domain/publicBuild.model";
import type { CoverageBandId } from "~/modules/run/build/domain/coverageRatio.model";
import type { AuditId } from "~/modules/run/gate/domain/audit.model";
import {
	auditCapacityFor,
	drawPayloads,
	eligibleFor,
	poolForGate,
	rankAudits,
} from "~/modules/run/gate/domain/auditSchedule.model";
import { payloadCountFor } from "~/modules/run/run/domain/heldAudit.model";
import type {
	HeldAuditBand,
	IncidentSender,
	LastClose,
	LockedIncident,
} from "~/modules/run/run/domain/run.model";
import { VICTORY_GATE } from "~/modules/run/run/domain/rules.model";
import { shuffleSeeded } from "~/shared/lib/seededRandom";

/** A rival's audit filed against a gate this run has not reached yet. */
export type QueuedIncident = {
	readonly id: number;
	readonly auditId: AuditId;
	readonly sentBy: IncidentSender;
};

/**
 * How a rival is drawn wherever their build is open (ADR-101). Every field is
 * optional because none of it is required to be a valid target: an account with
 * no photo, no border and no title is still fair game.
 */
export type RivalFace = {
	readonly photoUrl?: string;
	readonly borderUrl?: string;
	readonly title?: string;
};

/** What a rival's live run tells us about whether it is fair game. */
export type RivalCandidate = RivalFace & {
	readonly runId: number;
	readonly userId: string;
	readonly name: string;
	readonly gatesCleared: number;
	readonly lastClose?: LastClose;
	readonly build: PublicBuild;
};

export type Attacker = {
	readonly runId: number;
	readonly userId: string;
	readonly gatesCleared: number;
	readonly band: HeldAuditBand;
};

/** Audit ids already queued per target run, keyed on the gate they aim at. */
export type QueuedByRun = ReadonlyMap<
	number,
	ReadonlyMap<number, readonly AuditId[]>
>;

/** One queued row, as the fold below needs it. */
export type QueuedEntry = {
	readonly runId: number;
	readonly gate: number;
	readonly auditId: AuditId;
};

export type AttackOffer = RivalFace & {
	readonly targetRunId: number;
	readonly targetUserId: string;
	readonly name: string;
	readonly targetGate: number;
	readonly build: PublicBuild;
	readonly payloads: readonly AuditId[];
};

export type LockOutcome = {
	readonly locked: readonly LockedIncident[];
	readonly carried: readonly QueuedIncident[];
	readonly lapsed: readonly QueuedIncident[];
};

export const OFFER_COUNT = 3;

/** Audit ids per target run and gate, so capacity and family rules read one map. */
export const queuedByRun = (entries: readonly QueuedEntry[]): QueuedByRun =>
	entries.reduce<Map<number, Map<number, readonly AuditId[]>>>(
		(byRun, entry) => {
			const byGate =
				byRun.get(entry.runId) ?? new Map<number, readonly AuditId[]>();
			byGate.set(entry.gate, [
				...(byGate.get(entry.gate) ?? []),
				entry.auditId,
			]);
			return byRun.set(entry.runId, byGate);
		},
		new Map()
	);

/** An audit never interrupts the gate a rival is in: it aims at the next one. */
export const targetGateOf = (
	rival: Pick<RivalCandidate, "gatesCleared">
): number => rival.gatesCleared + 1;

const queuedAt = (
	queued: QueuedByRun,
	runId: number,
	gate: number
): readonly AuditId[] => queued.get(runId)?.get(gate) ?? [];

/**
 * OK and SHAKY players are already struggling; only a strong clear is fair
 * game. Its own list, not the hand's: an OK clear hands an audit (ADR-119) but
 * still never draws one.
 */
const STRONG_CLOSE: readonly CoverageBandId[] = ["healthy", "perfect"];

const closedStrong = (rival: RivalCandidate): boolean =>
	rival.lastClose !== undefined &&
	rival.lastClose.cleared &&
	STRONG_CLOSE.includes(rival.lastClose.band);

const hasRoom = (rival: RivalCandidate, queued: QueuedByRun): boolean => {
	const gate = targetGateOf(rival);
	return auditCapacityFor(gate) > queuedAt(queued, rival.runId, gate).length;
};

/**
 * A gate that cannot carry an audit cannot fire one. Without this an early
 * climber shoots at gate-4 leaders from gate 0, where nothing can reach back:
 * the shell is only fair while you stand in range of one yourself.
 */
export const canFireFrom = (
	attacker: Pick<Attacker, "gatesCleared">
): boolean => auditCapacityFor(attacker.gatesCleared) > 0;

export const isEligibleRival = (
	attacker: Attacker,
	rival: RivalCandidate,
	queued: QueuedByRun,
	lastTargetUserId: string | null
): boolean =>
	rival.userId !== attacker.userId &&
	rival.userId !== lastTargetUserId &&
	rival.gatesCleared >= attacker.gatesCleared &&
	targetGateOf(rival) <= VICTORY_GATE &&
	closedStrong(rival) &&
	hasRoom(rival, queued);

export const eligibleRivals = (
	attacker: Attacker,
	rivals: readonly RivalCandidate[],
	queued: QueuedByRun,
	lastTargetUserId: string | null
): readonly RivalCandidate[] =>
	canFireFrom(attacker)
		? rivals.filter((rival) =>
				isEligibleRival(attacker, rival, queued, lastTargetUserId)
			)
		: [];

const payloadSeed = (attacker: Attacker, rival: RivalCandidate, date: string) =>
	`${attacker.runId}:${rival.runId}:${targetGateOf(rival)}:${date}`;

/**
 * Leaders first, ties broken by a seeded shuffle, three offered: rubber-banding
 * without letting a refresh re-deal the rivals or the payloads.
 */
export const offersFor = (
	attacker: Attacker,
	eligible: readonly RivalCandidate[],
	queued: QueuedByRun,
	date: string
): readonly AttackOffer[] =>
	shuffleSeeded(eligible, `${attacker.runId}:${date}`)
		.sort((a, b) => b.gatesCleared - a.gatesCleared)
		.slice(0, OFFER_COUNT)
		.map((rival) => {
			const gate = targetGateOf(rival);
			return {
				targetRunId: rival.runId,
				targetUserId: rival.userId,
				name: rival.name,
				...(rival.photoUrl === undefined ? {} : { photoUrl: rival.photoUrl }),
				...(rival.borderUrl === undefined
					? {}
					: { borderUrl: rival.borderUrl }),
				...(rival.title === undefined ? {} : { title: rival.title }),
				targetGate: gate,
				build: rival.build,
				payloads: drawPayloads(
					poolForGate(gate),
					queuedAt(queued, rival.runId, gate),
					payloadSeed(attacker, rival, date),
					payloadCountFor(attacker.band)
				),
			};
		});

const admits = (taken: readonly AuditId[], id: AuditId, capacity: number) =>
	taken.length < capacity && eligibleFor([id], taken).length === 1;

/**
 * First come, first locked, up to the gate's capacity; an incident that clashes
 * with one already taken waits for the following gate, or lapses past the
 * summit. The locked set is ranked so the defeat device stays predictable.
 */
export const lockIncidents = (
	gate: number,
	queued: readonly QueuedIncident[]
): LockOutcome => {
	const capacity = auditCapacityFor(gate);
	const split = queued.reduce<{
		locked: readonly QueuedIncident[];
		carried: readonly QueuedIncident[];
	}>(
		(acc, incident) =>
			admits(
				acc.locked.map((taken) => taken.auditId),
				incident.auditId,
				capacity
			)
				? { ...acc, locked: [...acc.locked, incident] }
				: { ...acc, carried: [...acc.carried, incident] },
		{ locked: [], carried: [] }
	);
	const order = rankAudits(split.locked.map((incident) => incident.auditId));
	const locked = [...split.locked]
		.sort((a, b) => order.indexOf(a.auditId) - order.indexOf(b.auditId))
		.map((incident) => ({ ...incident, gate }));

	return gate + 1 > VICTORY_GATE
		? { locked, carried: [], lapsed: split.carried }
		: { locked, carried: split.carried, lapsed: [] };
};
