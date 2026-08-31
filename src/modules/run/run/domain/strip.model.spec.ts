import { describe, expect, it } from "vitest";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	failPeelShareFor,
	SLICE_WINDOW,
} from "~/modules/run/run/domain/rules.model";
import { type RunState } from "~/modules/run/run/domain/run.model";
import { runReducer } from "~/modules/run/run/domain/runAction.model";
import {
	answerWith,
	atGateWithBuild,
	clearGate,
	configIds,
	failGate,
	payPeel,
	started,
} from "~/modules/run/run/domain/run.factory";

describe("failure model (ADR-037: a miss peels, then re-runs the loop)", () => {
	it("owes a share of the occupied slots at the gate it missed", () => {
		const state = failGate(started(["unit-tests"]));
		expect(state.status).toBe("awaiting-strip");
		expect(state.peelSlotsRemaining).toBe(Math.ceil(4 * failPeelShareFor(0)));
		expect(state.gatesCleared).toBe(0);
		expect(state.build.configs).toHaveLength(4);
	});

	it("sends the paid peel to the shop instead of straight back to the polls", () => {
		const state = payPeel(failGate(started(["unit-tests"])));
		expect(state.status).toBe("rewarding");
		expect(state.redoGate).toBe(0);
		expect(state.build.configs).toHaveLength(3);
		expect(state.draftOptions.length).toBeGreaterThan(0);
	});

	it("pays nothing for the attempt it failed", () => {
		const state = payPeel(failGate(started(["indexed-db"])));
		expect(state.gateRewardKb).toBe(0);
		expect(state.interestThisGateKb).toBe(0);
	});

	it("holds the retry on the same gate", () => {
		let state = payPeel(failGate({ ...started(["js"]), gatesCleared: 4 }));
		state = runReducer(state, { type: "finish-reward" });
		expect(state.status).toBe("answering");
		expect(state.gatesCleared).toBe(4);
		expect(state.redoGate).toBeUndefined();
	});

	it("deals fresh polls to the retry instead of replaying the same five", () => {
		const failed = failGate(started(["js"]));
		const firstAttemptIds = failed.polls
			.slice(0, SLICE_WINDOW)
			.map((entry) => entry.id);
		const state = payPeel(failed);
		expect(firstAttemptIds).not.toContain(state.polls[state.currentIndex].id);
	});

	it("peels deeper at a strip-audit gate", () => {
		const audited = failGate(atGateWithBuild(11, 8));
		const clean = failGate(atGateWithBuild(10, 8));
		expect(audited.status).toBe("awaiting-strip");
		expect(audited.peelSlotsRemaining).toBeGreaterThan(
			clean.peelSlotsRemaining
		);
	});

	it("peels more of a deep build than a shallow one", () => {
		expect(failGate(atGateWithBuild(8, 8)).peelSlotsRemaining).toBeGreaterThan(
			failGate(atGateWithBuild(1, 8)).peelSlotsRemaining
		);
	});

	it("ends the run when the peel takes the whole build", () => {
		const base = started(["unit-tests", "eslint"]);
		const state = failGate({
			...base,
			build: {
				...base.build,
				configs: base.build.configs.slice(0, 1),
			},
		});
		expect(state.status).toBe("dead");
		expect(state.log.at(-1)).toContain("the build fills 1");
	});

	it("clears the redo flag on the clear that follows", () => {
		let state = payPeel(failGate(started(["js"])));
		expect(state.redoGate).toBe(0);
		state = clearGate(runReducer(state, { type: "finish-reward" }));
		expect(state.clearedGate).toBe(0);
		expect(state.redoGate).toBeUndefined();
	});

	it("ends the run when a bare build misses — a bare retry would loop forever", () => {
		let state = started(["js"]);
		state = { ...state, build: { ...state.build, configs: [] } };
		expect(failGate(state).status).toBe("dead");
	});

	it("refuses the sell that would empty the build", () => {
		let state = started(["eslint"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		const oneConfig = {
			...state,
			build: { ...state.build, configs: [CONFIGS.eslint] },
		};
		expect(runReducer(oneConfig, { type: "sell", configId: "eslint" })).toBe(
			oneConfig
		);
	});
});

describe("the strip plumbing (strip audits, DVTD-gre4)", () => {
	const awaitingStrip = (quota: number): RunState => {
		let state = started(["unit-tests", "eslint"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, false);
		return {
			...state,
			status: "awaiting-strip",
			peelSlotsRemaining: quota,
		};
	};

	it("routes the peeled build through the shop before the replay", () => {
		let state = awaitingStrip(1);
		state = runReducer(state, { type: "strip", configId: "eslint" });
		expect(state.peelSlotsRemaining).toBe(0);
		state = runReducer(state, { type: "resume-climb" });
		expect(state.status).toBe("rewarding");
		expect(state.redoGate).toBe(0);
		expect(configIds(state)).not.toContain("eslint");
		state = runReducer(state, { type: "finish-reward" });
		expect(state.status).toBe("answering");
		expect(state.gatesCleared).toBe(0);
	});

	it("ignores a strip once the quota is met", () => {
		let state = awaitingStrip(1);
		state = runReducer(state, { type: "strip", configId: "eslint" });
		const afterQuota = runReducer(state, { type: "strip", configId: "ts" });
		expect(afterQuota).toBe(state);
	});

	it("ends the run when a peel emptied the build instead of climbing on", () => {
		let state = awaitingStrip(0);
		state = { ...state, build: { ...state.build, configs: [] } };
		state = runReducer(state, { type: "resume-climb" });
		expect(state.status).toBe("dead");
	});
});
