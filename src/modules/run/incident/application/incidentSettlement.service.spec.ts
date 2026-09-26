import { beforeEach, describe, expect, it, vi } from "vitest";

import { settleIncidents } from "~/modules/run/incident/application/incidentSettlement.service";
import type { QueuedIncident } from "~/modules/run/incident/domain/incident.model";
import * as repository from "~/modules/run/incident/infrastructure/incident.repository";
import type { RunTx } from "~/modules/run/run/infrastructure/run.repository";
import { clearGate, started } from "~/modules/run/run/domain/run.factory";
import { VICTORY_GATE } from "~/modules/run/run/domain/rules.model";

vi.mock("~/modules/run/incident/infrastructure/incident.repository", () => ({
	fetchQueuedIncidents: vi.fn().mockResolvedValue([]),
	markIncidents: vi.fn(),
	carryIncidentsForward: vi.fn(),
	markSurvived: vi.fn(),
	endIncidentsForRun: vi.fn(),
}));

const RUN_ID = 64;
const tx = {} as unknown as RunTx;
const misty = { id: "misty", name: "Misty" };
const queued = (id: number, auditId: QueuedIncident["auditId"]) => ({
	id,
	auditId,
	sentBy: misty,
});

const fetched = vi.mocked(repository.fetchQueuedIncidents);
const marked = vi.mocked(repository.markIncidents);
const carried = vi.mocked(repository.carryIncidentsForward);
const survived = vi.mocked(repository.markSurvived);
const ended = vi.mocked(repository.endIncidentsForRun);

describe("settleIncidents", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		fetched.mockResolvedValue([]);
	});

	it("touches nothing while the gate is still being played", async () => {
		const before = started(["js"]);
		const after = { ...before, currentIndex: before.currentIndex + 1 };

		expect(await settleIncidents(RUN_ID)(tx, before, after)).toBe(after);
		expect(fetched).not.toHaveBeenCalled();
		expect(survived).not.toHaveBeenCalled();
	});

	it("locks what rivals queued for the gate in front, up to its capacity, ranked", async () => {
		const before = { ...started(["js"]), gatesCleared: 8, bankedUnits: 40 };
		const after = clearGate(before);
		expect(after.gatesCleared).toBe(9);
		fetched.mockResolvedValue([
			queued(1, "not-found"),
			queued(2, "memory-leak"),
			queued(3, "read-only"),
		]);

		const settled = await settleIncidents(RUN_ID)(tx, before, after);

		expect(fetched).toHaveBeenCalledWith(tx, RUN_ID, 9);
		expect(settled.auditSchedule?.[9]).toEqual(["memory-leak", "not-found"]);
		expect(settled.incidents?.map((incident) => incident.id)).toEqual([2, 1]);
		expect(marked).toHaveBeenCalledWith(tx, [2, 1], "locked");
		expect(carried).toHaveBeenCalledWith(tx, [3]);
	});

	it("marks the incidents on the gate just cleared as survived", async () => {
		const before = { ...started(["js"]), gatesCleared: 8, bankedUnits: 40 };
		await settleIncidents(RUN_ID)(tx, before, clearGate(before));

		expect(survived).toHaveBeenCalledWith(tx, RUN_ID, 8);
	});

	it("fails what was locked and lapses what was queued when the run ends", async () => {
		const before = started(["js"]);
		const dead = { ...before, status: "dead" as const };

		await settleIncidents(RUN_ID)(tx, before, dead);

		expect(ended).toHaveBeenCalledWith(RUN_ID, tx);
	});

	it("has no gate to lock past the summit, and closes the book on the win", async () => {
		const before = {
			...started(["js"]),
			gatesCleared: VICTORY_GATE,
			bankedUnits: 60,
		};
		const won = clearGate(before);
		expect(won.status).toBe("won");

		await settleIncidents(RUN_ID)(tx, before, won);

		expect(survived).toHaveBeenCalledWith(tx, RUN_ID, VICTORY_GATE);
		expect(fetched).not.toHaveBeenCalled();
		expect(ended).toHaveBeenCalledWith(RUN_ID, tx);
	});
});
