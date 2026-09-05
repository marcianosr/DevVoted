import { describe, expect, it } from "vitest";

import { type Config, minify } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { occupiedSlots } from "~/modules/run/build/domain/build.model";
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
		const state = failGate({ ...started(["unit-tests"]), gatesCleared: 1 });
		expect(state.status).toBe("awaiting-strip");
		expect(state.peelSlotsRemaining).toBe(Math.ceil(4 * failPeelShareFor(1)));
		expect(state.gatesCleared).toBe(1);
		expect(state.build.configs).toHaveLength(4);
	});

	it("owes nothing at the Pallet gate, and keeps the whole build (ADR-057)", () => {
		const state = failGate(started(["unit-tests"]));
		expect(state.status).toBe("awaiting-strip");
		expect(state.peelSlotsRemaining).toBe(0);
		expect(state.gatesCleared).toBe(0);
		expect(state.build.configs).toHaveLength(4);
		expect(state.log.at(-1)).toContain("takes nothing");
	});

	it("sends the paid peel to the shop instead of straight back to the polls", () => {
		const state = payPeel(
			failGate({ ...started(["unit-tests"]), gatesCleared: 1 })
		);
		expect(state.status).toBe("rewarding");
		expect(state.redoGate).toBe(1);
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
			gatesCleared: 1,
			build: {
				...base.build,
				configs: base.build.configs.slice(0, 1),
			},
		});
		expect(state.status).toBe("dead");
		expect(state.log.at(-1)).toContain("the build fills 1");
	});

	it("spares a one-config build at the Pallet gate (ADR-057)", () => {
		const base = started(["unit-tests", "eslint"]);
		const state = failGate({
			...base,
			build: { ...base.build, configs: base.build.configs.slice(0, 1) },
		});
		expect(state.status).toBe("awaiting-strip");
		expect(state.build.configs).toHaveLength(1);
	});

	it("clears the redo flag on the clear that follows", () => {
		let state = payPeel(failGate(started(["js"])));
		expect(state.redoGate).toBe(0);
		state = clearGate(runReducer(state, { type: "finish-reward" }));
		expect(state.clearedGate).toBe(0);
		expect(state.redoGate).toBeUndefined();
	});

	// Still fatal at the Pallet gate despite the waived peel: isPeelFatal is
	// `quota >= occupied`, and 0 >= 0. Narrowing it to `>` would strand the run.
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

describe("Garbage Collection (DVTD-2k9m: a dropped config pays its sell value)", () => {
	const collecting = (
		configs: readonly Config[],
		quota: number,
		storage = 0
	): RunState => {
		const base = started(["unit-tests", "eslint"]);
		return {
			...base,
			build: { ...base.build, slots: occupiedSlots(configs), configs },
			status: "awaiting-strip",
			peelSlotsRemaining: quota,
			storage,
		};
	};

	const drop = (state: RunState, configId: string): RunState =>
		runReducer(state, { type: "strip", configId });

	const GC = CONFIGS.garbageCollection;

	it("pays the dropped config's sell value into storage", () => {
		const state = drop(collecting([GC, CONFIGS.agentsMd], 8), "agents-md");
		expect(state.storage).toBe(128);
		expect(state.peelRefundKb).toBe(128);
	});

	it("pays nothing when no collector is installed", () => {
		const state = drop(
			collecting([CONFIGS.js, CONFIGS.agentsMd], 8),
			"agents-md"
		);
		expect(state.storage).toBe(0);
		expect(state.peelRefundKb ?? 0).toBe(0);
	});

	it("pays for its own removal", () => {
		const state = drop(
			collecting([GC, CONFIGS.agentsMd], 2),
			"garbage-collection"
		);
		expect(state.storage).toBe(32);
	});

	it("pays nothing for a config minified instead of dropped", () => {
		const state = runReducer(collecting([GC, CONFIGS.agentsMd], 4), {
			type: "minify",
			configId: "agents-md",
		});
		expect(state.peelSlotsRemaining).toBe(0);
		expect(state.storage).toBe(0);
		expect(state.peelRefundKb ?? 0).toBe(0);
	});

	// Sharp because addStorage re-clamps to the plan cap: an unguarded refund of 0
	// would burn the surplus on an action that never touched money.
	it("leaves an over-cap balance alone when a minify frees the slots", () => {
		const state = runReducer(collecting([GC, CONFIGS.agentsMd], 4, 400), {
			type: "minify",
			configId: "agents-md",
		});
		expect(state.storage).toBe(400);
	});

	it("halves the payout while it is minified", () => {
		const state = drop(
			collecting([minify(GC), CONFIGS.agentsMd], 8),
			"agents-md"
		);
		expect(state.storage).toBe(64);
	});

	it("pays nothing while WTFPL voids the warranty, its own removal included", () => {
		const build = [GC, CONFIGS.wtfpl, CONFIGS.agentsMd];
		expect(drop(collecting(build, 8), "agents-md").storage).toBe(0);
		expect(drop(collecting(build, 8), "wtfpl").storage).toBe(0);
	});

	it("pays half of Freemium's discounted price", () => {
		const state = drop(
			collecting([GC, CONFIGS.freemium, CONFIGS.agentsMd], 8),
			"agents-md"
		);
		expect(state.storage).toBe(64);
	});

	it("banks the total across a two-config peel, and clears it when the climb resumes", () => {
		let state = collecting([GC, CONFIGS.js, CONFIGS.ts, CONFIGS.css], 2);
		state = drop(state, "js");
		state = drop(state, "ts");
		expect(state.peelRefundKb).toBe(32);
		expect(state.storage).toBe(32);
		state = runReducer(state, { type: "resume-climb" });
		expect(state.peelRefundKb).toBe(0);
		expect(state.storage).toBe(32);
	});

	it("stops the refund at the storage plan's cap", () => {
		const state = drop(collecting([GC, CONFIGS.agentsMd], 8, 200), "agents-md");
		expect(state.storage).toBe(256);
	});

	it("names the recovered KB in the log", () => {
		const state = drop(collecting([GC, CONFIGS.agentsMd], 8), "agents-md");
		expect(state.log.at(-1)).toContain("+128KB collected");
	});

	it("leaves the log alone when nothing was collected", () => {
		const state = drop(
			collecting([CONFIGS.js, CONFIGS.agentsMd], 8),
			"agents-md"
		);
		expect(state.log.at(-1)).not.toContain("collected");
	});

	// A fatal miss returns "dead" before the awaiting-strip branch, so strip() is
	// unreachable and no peel refund can run on the miss that ends the run.
	it("pays nothing on a fatal miss, which never reaches the strip screen", () => {
		const base = started(["unit-tests", "eslint"]);
		const state = failGate({
			...base,
			gatesCleared: 1,
			build: { ...base.build, slots: 1, configs: [CONFIGS.js] },
		});
		expect(state.status).toBe("dead");
		expect(state.storage).toBe(0);
	});

	// isPeelFatal is `ceil(occupied * share) >= occupied` and share tops out at 0.5,
	// so only a one-slot build is ever fatal — the collector's own two always survive.
	it("cannot be in the build a peel kills", () => {
		const base = started(["unit-tests", "eslint"]);
		const state = failGate({
			...base,
			gatesCleared: 12,
			build: { ...base.build, slots: 2, configs: [GC] },
		});
		expect(state.status).toBe("awaiting-strip");
	});
});
