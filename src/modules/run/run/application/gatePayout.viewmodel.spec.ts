import { describe, expect, it } from "vitest";

import { gatePayoutFor } from "~/modules/run/run/application/gatePayout.viewmodel";
import {
	clearGate,
	failGate,
	started,
} from "~/modules/run/run/domain/run.factory";
import { runReducer } from "~/modules/run/run/domain/runAction.model";

describe("gatePayoutFor", () => {
	it("reports a flawless opening gate as a full window, not as its healthy line", () => {
		const cleared = clearGate(started([]));

		expect(cleared.gatesCleared).toBe(1);
		expect(gatePayoutFor(cleared).clearedGateNumber).toBe(0);
		expect(gatePayoutFor(cleared).clearedCoverageHeld).toBe(100);
	});

	it("measures the level against the gate that closed, not the one ahead", () => {
		const first = clearGate(started([]));
		const second = clearGate(runReducer(first, { type: "finish-reward" }));

		expect(gatePayoutFor(second).clearedGateNumber).toBe(1);
		expect(gatePayoutFor(second).clearedCoverageHeld).toBe(100);
	});

	it("hands over the parts a clear was paid in, and they sum to the reward", () => {
		const payout = gatePayoutFor(clearGate(started([])));
		const parts =
			payout.clearThisGateKb +
			payout.overflowThisGateKb +
			payout.interestThisGateKb +
			payout.extraPickThisGateKb +
			payout.escrowCommittedKb +
			payout.slaUpliftKb +
			payout.incidentSurvivalKb;

		expect(parts).toBe(payout.gateRewardPaidKb);
		expect(payout.streakAtClose).not.toBeNull();
	});

	it("hands over why the gate held, and nothing on a clear", () => {
		const held = failGate({ ...started(["js"]), gatesCleared: 4 });

		expect(gatePayoutFor(held).heldBy).toBe("floor");
		expect(gatePayoutFor(clearGate(started([]))).heldBy).toBeNull();
	});
});
