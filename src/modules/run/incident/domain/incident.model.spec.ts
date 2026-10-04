import { describe, expect, it } from "vitest";

import {
	type Attacker,
	canFireFrom,
	eligibleRivals,
	isEligibleRival,
	lockIncidents,
	offersFor,
	type QueuedByRun,
	type QueuedIncident,
	queuedByRun,
	type RivalCandidate,
	targetGateOf,
} from "~/modules/run/incident/domain/incident.model";
import type { AuditId } from "~/modules/run/gate/domain/audit.model";
import {
	AUDITS_FROM_GATE,
	poolForGate,
} from "~/modules/run/gate/domain/auditSchedule.model";
import type { LastClose } from "~/modules/run/run/domain/run.model";
import { VICTORY_GATE } from "~/modules/run/run/domain/rules.model";

const NO_QUEUE: QueuedByRun = new Map();
const BARE_BUILD = { configs: [] };

const strong = (gate: number): LastClose => ({
	gate,
	band: "healthy",
	cleared: true,
});

const red: Attacker = {
	runId: 1,
	userId: "red",
	gatesCleared: 5,
	auditId: "legal-hold",
};

const rival = (overrides: Partial<RivalCandidate> = {}): RivalCandidate => ({
	runId: 2,
	userId: "misty",
	name: "Misty",
	gatesCleared: 6,
	lastClose: strong(5),
	build: BARE_BUILD,
	...overrides,
});

const queuedFor = (
	runId: number,
	gate: number,
	ids: readonly AuditId[]
): QueuedByRun => new Map([[runId, new Map([[gate, ids]])]]);

const eligible = (candidate: RivalCandidate, queued = NO_QUEUE) =>
	isEligibleRival(red, candidate, queued, null);

describe("who a rival may aim at (ADR-099)", () => {
	it("targets the gate after the one a rival is in, never the one they are in", () => {
		expect(targetGateOf({ gatesCleared: 6 })).toBe(7);
	});

	it("offers a rival at the same gate or ahead who last cleared strong", () => {
		expect(eligible(rival())).toBe(true);
		expect(eligible(rival({ gatesCleared: 5 }))).toBe(true);
	});

	it("never offers yourself", () => {
		expect(eligible(rival({ userId: "red" }))).toBe(false);
	});

	it("protects a rival who is behind you — a shell at twelfth place is paperwork", () => {
		expect(eligible(rival({ gatesCleared: 4 }))).toBe(false);
	});

	it("protects a rival whose last close was thin, held or never happened — an OK clear hands an audit, it never draws one", () => {
		expect(eligible(rival({ lastClose: { ...strong(5), band: "ok" } }))).toBe(
			false
		);
		expect(
			eligible(rival({ lastClose: { ...strong(5), cleared: false } }))
		).toBe(false);
		expect(eligible(rival({ lastClose: undefined }))).toBe(false);
	});

	it("leaves a rival alone once their next gate is full", () => {
		const full = queuedFor(2, 7, ["not-found"]);
		expect(eligible(rival(), full)).toBe(false);
		expect(
			eligible(rival({ gatesCleared: 8 }), queuedFor(2, 9, ["not-found"]))
		).toBe(true);
	});

	it("has no gate to aim at past the summit", () => {
		expect(eligible(rival({ gatesCleared: VICTORY_GATE }))).toBe(false);
	});

	it("skips the rival you fired at last time", () => {
		expect(isEligibleRival(red, rival(), NO_QUEUE, "misty")).toBe(false);
		expect(eligibleRivals(red, [rival()], NO_QUEUE, "misty")).toEqual([]);
	});
});

describe("you may only fire from a gate that can be fired at (ADR-105)", () => {
	it("offers nobody while your own gate carries no capacity", () => {
		const early = { ...red, gatesCleared: AUDITS_FROM_GATE - 1 };

		expect(canFireFrom(early)).toBe(false);
		expect(eligibleRivals(early, [rival()], NO_QUEUE, null)).toEqual([]);
	});

	it("opens the moment your own gate could carry one", () => {
		const opened = { ...red, gatesCleared: AUDITS_FROM_GATE };

		expect(canFireFrom(opened)).toBe(true);
		expect(eligibleRivals(opened, [rival()], NO_QUEUE, null)).toHaveLength(1);
	});
});

describe("a rival can only take an audit their gate draws from", () => {
	it("offers a rival whose next gate's pool holds the audit you carry", () => {
		expect(eligible(rival())).toBe(true);
	});

	it("protects a rival standing too deep for the audit you bought", () => {
		const cheap = { ...red, auditId: "not-found" as const };
		const champion = rival({ gatesCleared: VICTORY_GATE - 1 });

		expect(poolForGate(targetGateOf(champion))).not.toContain("not-found");
		expect(isEligibleRival(cheap, champion, NO_QUEUE, null)).toBe(false);
	});

	it("reaches the summit with an audit the summit draws", () => {
		const deep = { ...red, auditId: "feature-freeze" as const };
		const champion = rival({ gatesCleared: VICTORY_GATE - 1 });

		expect(isEligibleRival(deep, champion, NO_QUEUE, null)).toBe(true);
		expect(isEligibleRival(deep, rival(), NO_QUEUE, null)).toBe(false);
	});
});

describe("the rivals you may file against", () => {
	const field = [
		rival({ runId: 2, userId: "misty", name: "Misty", gatesCleared: 6 }),
		rival({ runId: 3, userId: "brock", name: "Brock", gatesCleared: 9 }),
		rival({ runId: 4, userId: "erika", name: "Erika", gatesCleared: 7 }),
		rival({ runId: 5, userId: "koga", name: "Koga", gatesCleared: 7 }),
		rival({ runId: 6, userId: "sabrina", name: "Sabrina", gatesCleared: 5 }),
	];

	it("offers every eligible rival, leaders first, now that the shot was paid for", () => {
		const offers = offersFor(red, field);

		expect(offers).toHaveLength(field.length);
		expect(offers[0].name).toBe("Brock");
		expect(offers.map((offer) => offer.targetGate)).toEqual([10, 8, 8, 7, 6]);
	});

	it("aims each offer at the rival's next gate carrying the audit you hold", () => {
		const [brock] = offersFor(red, field);

		expect(brock.targetGate).toBe(10);
		expect(brock.auditId).toBe(red.auditId);
	});

	it("names the rival so their card can state who it would reach", () => {
		const [brock] = offersFor(red, field);

		expect(brock.targetRunId).toBe(3);
		expect(brock.targetUserId).toBe("brock");
	});
});

describe("queuedByRun", () => {
	it("folds queued rows into audit ids per run and gate", () => {
		const queued = queuedByRun([
			{ runId: 2, gate: 7, auditId: "not-found" },
			{ runId: 2, gate: 7, auditId: "memory-leak" },
			{ runId: 3, gate: 9, auditId: "timeout" },
		]);

		expect(queued.get(2)?.get(7)).toEqual(["not-found", "memory-leak"]);
		expect(queued.get(3)?.get(9)).toEqual(["timeout"]);
		expect(queued.get(3)?.get(7)).toBeUndefined();
	});
});

describe("lockIncidents", () => {
	const misty = { id: "misty", name: "Misty" };
	const queued = (id: number, auditId: AuditId): QueuedIncident => ({
		id,
		auditId,
		sentBy: misty,
	});

	it("locks first come first served, up to the gate's capacity", () => {
		const outcome = lockIncidents(9, [
			queued(1, "not-found"),
			queued(2, "memory-leak"),
			queued(3, "read-only"),
		]);
		expect(outcome.locked.map((incident) => incident.id).sort()).toEqual([
			1, 2,
		]);
		expect(outcome.carried.map((incident) => incident.id)).toEqual([3]);
	});

	it("stamps the gate on what it locks", () => {
		const [locked] = lockIncidents(9, [queued(1, "not-found")]).locked;
		expect(locked).toEqual({ ...queued(1, "not-found"), gate: 9 });
	});

	it("carries a clash with what is already taken to the following gate", () => {
		const outcome = lockIncidents(9, [
			queued(1, "dependency-outage"),
			queued(2, "flaky-build"),
			queued(3, "mirrored"),
		]);
		expect(outcome.locked.map((incident) => incident.auditId)).toEqual([
			"mirrored",
			"dependency-outage",
		]);
		expect(outcome.carried.map((incident) => incident.id)).toEqual([2]);
	});

	it("never clocks a mirrored gate", () => {
		const outcome = lockIncidents(9, [
			queued(1, "mirrored"),
			queued(2, "timeout"),
		]);
		expect(outcome.locked.map((incident) => incident.auditId)).toEqual([
			"mirrored",
		]);
	});

	it("ranks what it locks so the defeat device is predictable", () => {
		const outcome = lockIncidents(VICTORY_GATE, [
			queued(1, "cost-overrun"),
			queued(2, "strip"),
			queued(3, "timeout"),
		]);
		expect(outcome.locked.map((incident) => incident.auditId)).toEqual([
			"strip",
			"timeout",
			"cost-overrun",
		]);
	});

	it("lapses what cannot lock at the summit, since no gate follows", () => {
		const outcome = lockIncidents(VICTORY_GATE, [
			queued(1, "dependency-outage"),
			queued(2, "flaky-build"),
		]);
		expect(outcome.carried).toEqual([]);
		expect(outcome.lapsed.map((incident) => incident.id)).toEqual([2]);
	});

	it("locks nothing at a clean gate and carries everything", () => {
		const outcome = lockIncidents(2, [queued(1, "not-found")]);
		expect(outcome.locked).toEqual([]);
		expect(outcome.carried).toHaveLength(1);
	});
});

describe("what an offer says about its rival (ADR-101)", () => {
	it("carries the rival's public build onto the offer", () => {
		const build = {
			configs: [{ id: "cache", label: "Cache", slots: 4, level: 2 }],
			vendorLockedConfigId: "cache",
		};

		const [offer] = offersFor(red, [rival({ build })]);

		expect(offer.build).toEqual(build);
	});
});
