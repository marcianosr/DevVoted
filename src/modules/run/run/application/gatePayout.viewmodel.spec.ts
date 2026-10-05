import { describe, expect, it } from "vitest";

import { gatePayoutFor } from "~/modules/run/run/application/gatePayout.viewmodel";
import { clearGate, started } from "~/modules/run/run/domain/run.factory";
import { runReducer } from "~/modules/run/run/domain/runAction.model";

describe("gatePayoutFor", () => {
	it("names the gate a clear beat, one behind the count it advanced", () => {
		const first = clearGate(started([]));
		const second = clearGate(runReducer(first, { type: "finish-reward" }));

		expect(gatePayoutFor(first).clearedGateNumber).toBe(0);
		expect(gatePayoutFor(second).clearedGateNumber).toBe(1);
	});

	it("hands over the parts a clear was paid in, and they sum to the reward", () => {
		const payout = gatePayoutFor(clearGate(started([])));
		const parts =
			payout.clearThisGateKb +
			payout.bandBonusThisGateKb +
			payout.overflowThisGateKb +
			payout.interestThisGateKb +
			payout.extraPickThisGateKb +
			payout.escrowCommittedKb +
			payout.slaUpliftKb +
			payout.incidentSurvivalKb;

		expect(parts).toBe(payout.gateRewardPaidKb);
	});
});
