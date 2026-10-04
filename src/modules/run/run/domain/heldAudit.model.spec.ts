import { describe, expect, it } from "vitest";

import {
	AUDITS_FROM_GATE,
	poolForGate,
} from "~/modules/run/gate/domain/auditSchedule.model";
import {
	buyIncident,
	canBuyIncident,
	canRefreshIncident,
	dealIncidentOffer,
	deskOpenAt,
	fireAudit,
	incidentRefreshCost,
	landingGateFor,
	landingPoolFor,
	refreshIncident,
} from "~/modules/run/run/domain/heldAudit.model";
import {
	INCIDENT_KB,
	INCIDENT_REFRESH_COST_KB,
} from "~/modules/run/run/domain/rules.model";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import { clearGate, started } from "~/modules/run/run/domain/run.factory";
import type { RunState } from "~/modules/run/run/domain/run.model";

const shopping = (extra: Partial<RunState> = {}): RunState => ({
	...clearGate(started(["js"])),
	storage: 256,
	...extra,
});

const atGate = (gatesCleared: number, extra: Partial<RunState> = {}) =>
	shopping({ gatesCleared, ...extra });

const windowOf = (gate: number) => gate * SLICE_WINDOW;

const deal = (gate: number, extra: Partial<RunState> = {}) =>
	dealIncidentOffer(atGate(gate, extra), gate, windowOf(gate));

const firstGateDealing = (): number => {
	for (let gate = AUDITS_FROM_GATE; gate < 12; gate++)
		if (deal(gate).incidentOffer !== undefined) return gate;
	throw new Error("no gate deals an incident");
};

describe("where an incident can land", () => {
	it("aims at the gate in front, never below the first audited one", () => {
		expect(landingGateFor(5)).toBe(6);
		expect(landingGateFor(0)).toBe(AUDITS_FROM_GATE);
	});

	it("draws from the pool of the gate it would land on", () => {
		expect(landingPoolFor(5)).toEqual(poolForGate(6));
	});
});

describe("the desk opens where you could be fired at in return (ADR-105)", () => {
	it("stays shut below the first audited gate", () => {
		expect(deskOpenAt(AUDITS_FROM_GATE - 1)).toBe(false);
		expect(deskOpenAt(AUDITS_FROM_GATE)).toBe(true);
	});

	it("deals nothing at all while it is shut", () => {
		for (let gate = 0; gate < AUDITS_FROM_GATE; gate++)
			expect(deal(gate).incidentOffer).toBeUndefined();
	});
});

describe("the shop deals an incident now and then", () => {
	it("leaves most shops without one, so finding one is a find", () => {
		const gates = Array.from(
			{ length: 10 },
			(_, step) => step + AUDITS_FROM_GATE
		);
		const dealt = gates.filter(
			(gate) => deal(gate).incidentOffer !== undefined
		);

		expect(dealt.length).toBeGreaterThan(0);
		expect(dealt.length).toBeLessThan(gates.length);
	});

	it("does not deal at the same gates every day", () => {
		const scheduleFor = (day: string): string => {
			const base = shopping();
			const polls = base.polls.map((poll) => ({
				...poll,
				id: `${day}-${poll.id}`,
			}));
			return Array.from({ length: 10 }, (_, step) => {
				const gate = step + AUDITS_FROM_GATE;
				const offer = dealIncidentOffer(
					{ ...base, polls, gatesCleared: gate },
					gate,
					windowOf(gate)
				).incidentOffer;
				return offer === undefined ? "." : "!";
			}).join("");
		};

		const days = new Set(["mon", "tue", "wed", "thu", "fri"].map(scheduleFor));
		expect(days.size).toBeGreaterThan(1);
	});

	it("deals the same shop the same incident, so a reload never re-rolls it", () => {
		const gate = firstGateDealing();

		expect(deal(gate).incidentOffer).toBe(deal(gate).incidentOffer);
	});

	it("deals an audit the gate in front could draw", () => {
		const gate = firstGateDealing();
		const { incidentOffer } = deal(gate);

		expect(landingPoolFor(gate)).toContain(incidentOffer);
	});

	it("clears the refresh ladder when a new shop opens", () => {
		const gate = firstGateDealing();
		const opened = deal(gate, { incidentRefreshes: 3 });

		expect(opened.incidentRefreshes).toBeUndefined();
	});
});

describe("buying the incident on offer", () => {
	const offering = (extra: Partial<RunState> = {}) =>
		atGate(5, { incidentOffer: "not-found", ...extra });

	it("takes it into hand for a flat price", () => {
		const bought = buyIncident(offering({ storage: 100 }));

		expect(bought.heldAudit).toEqual({ auditId: "not-found" });
		expect(bought.storage).toBe(100 - INCIDENT_KB);
		expect(bought.incidentOffer).toBeUndefined();
	});

	it("replaces whatever was already in hand", () => {
		const bought = buyIncident(
			offering({ heldAudit: { auditId: "memory-leak" } })
		);

		expect(bought.heldAudit).toEqual({ auditId: "not-found" });
	});

	it("refuses when the balance will not cover it", () => {
		const broke = offering({ storage: INCIDENT_KB - 1 });

		expect(canBuyIncident(broke)).toBe(false);
		expect(buyIncident(broke)).toBe(broke);
	});

	it("refuses when the shop dealt nothing", () => {
		const quiet = atGate(5);

		expect(canBuyIncident(quiet)).toBe(false);
		expect(buyIncident(quiet)).toBe(quiet);
	});
});

describe("refreshing the offer", () => {
	const offering = (extra: Partial<RunState> = {}) =>
		atGate(5, { incidentOffer: "not-found", ...extra });

	it("doubles its price with every deal this shop", () => {
		expect(INCIDENT_REFRESH_COST_KB.slice(0, 4)).toEqual([8, 16, 32, 64]);
		expect(incidentRefreshCost(0)).toBe(8);
		expect(incidentRefreshCost(3)).toBe(64);
	});

	it("holds at the last rung rather than running off the ladder", () => {
		const last = INCIDENT_REFRESH_COST_KB[INCIDENT_REFRESH_COST_KB.length - 1];

		expect(incidentRefreshCost(INCIDENT_REFRESH_COST_KB.length + 5)).toBe(last);
	});

	it("deals a different incident and bills the rung", () => {
		const refreshed = refreshIncident(offering({ storage: 100 }));

		expect(refreshed.incidentOffer).not.toBe("not-found");
		expect(refreshed.incidentOffer).toBeDefined();
		expect(refreshed.storage).toBe(100 - incidentRefreshCost(0));
		expect(refreshed.incidentRefreshes).toBe(1);
	});

	it("climbs the ladder on the second deal", () => {
		const twice = refreshIncident(refreshIncident(offering()));

		expect(twice.incidentRefreshes).toBe(2);
	});

	it("refuses when the balance will not cover the rung", () => {
		const broke = offering({ storage: incidentRefreshCost(0) - 1 });

		expect(canRefreshIncident(broke)).toBe(false);
		expect(refreshIncident(broke)).toBe(broke);
	});

	it("refuses when the shop dealt nothing to refresh", () => {
		const quiet = atGate(5);

		expect(canRefreshIncident(quiet)).toBe(false);
		expect(refreshIncident(quiet)).toBe(quiet);
	});
});

describe("filing what you hold", () => {
	it("empties the hand", () => {
		const held = atGate(5, { heldAudit: { auditId: "not-found" } });

		expect(fireAudit(held).heldAudit).toBeUndefined();
	});

	it("does nothing with an empty hand", () => {
		const empty = atGate(5);

		expect(fireAudit(empty)).toBe(empty);
	});
});
