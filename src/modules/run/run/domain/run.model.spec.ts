import { describe, expect, it } from "vitest";

import type { CategoryCode } from "~/shared/lib/categories";

import {
	type Config,
	upgradeStorageCost,
} from "~/modules/run/config/domain/config.model";
import {
	CONFIGS,
	CONFIG_LIST,
} from "~/modules/run/config/domain/configRoster.model";
import { auditsForGate } from "~/modules/run/gate/domain/audit.model";
import { toRunView } from "~/modules/run/run/application/runView.viewmodel";
import {
	EXTEND_FROM_GATE,
	extendCost,
	LOCK_COST_KB,
	LOCK_FROM_GATE,
	MAX_EXTENSIONS,
	offerCount,
} from "~/modules/run/shop/domain/draft.model";
import {
	BASE_SLOTS,
	MAX_SLOTS,
} from "~/modules/run/pipeline/domain/pipeline.model";
import {
	coverageDemandFor,
	FAUCET_CAP_KB,
	PIN_FROM_GATE,
	PIN_UNTIL_GATE,
	pinCostFor,
	GATE_COUNT,
	failStripsFor,
	SLICE_WINDOW,
	STORAGE_CAP_KB,
	STORAGE_PLANS,
	storagePlanFor,
	VICTORY_GATE,
} from "~/modules/run/run/domain/rules.model";
import {
	answerOutcome,
	canBuyPeek,
	createRun,
	pinAvailable,
	isShopLocked,
	lintApplies,
	lintFeeFor,
	isAwaitingTomorrow,
	pickBudgetFor,
	runReducer,
	RunPoll,
	RunState,
} from "~/modules/run/run/domain/run.model";

const poll = (
	id: string,
	correct: boolean,
	category: CategoryCode = "react"
): RunPoll => ({
	id,
	category,
	question: `Does ${id} beat Banjo?`,
	answerType: "single",
	options: [
		{ id: `${id}-a`, label: "Yes", correct },
		{ id: `${id}-b`, label: "No", correct: !correct },
	],
});

const pool = (size: number): RunPoll[] =>
	Array.from({ length: size }, (_, index) => poll(`kazooie-${index}`, true));

const handed = [
	CONFIGS.telemetry,
	CONFIGS.mooresLaw,
	CONFIGS.unitTests,
	CONFIGS.js,
	CONFIGS.ts,
	CONFIGS.css,
	CONFIGS.eslint,
	CONFIGS.coverageGain,
	CONFIGS.coldStart,
	CONFIGS.indexedDb,
	CONFIGS.codeCoverage,
];

const configIds = (state: RunState): string[] =>
	state.pipeline.configs.map((config) => config.id);

const answerWith = (state: RunState, correct: boolean): RunState => {
	const current = state.polls[state.currentIndex];
	const option = current.options.find(
		(candidate) => candidate.correct === correct
	);
	if (!option) throw new Error("no matching option");
	return runReducer(state, {
		type: "answer",
		optionIds: [option.id],
	});
};

const clearGate = (state: RunState): RunState => {
	let next = state;
	for (let i = 0; i < SLICE_WINDOW; i++) next = answerWith(next, true);
	return next;
};

/**
 * A run parked at `gate` holding `configCount` configs. Deep gates peel several
 * configs at once (ADR-037), so the three a start hands out cannot stand in for a
 * summit build; the roster is sliced rather than slotted, since the pipeline's
 * own slot rule is not what these tests are about.
 */
const atGateWithBuild = (gate: number, configCount: number): RunState => {
	const base = started(["js"]);
	const roster = Object.values(CONFIGS).slice(0, configCount);
	return {
		...base,
		gatesCleared: gate,
		pipeline: { ...base.pipeline, slots: configCount, configs: roster },
	};
};

/** A window answered wrong all the way through — the gate's verdict is a miss. */
const failGate = (state: RunState): RunState => {
	let next = state;
	for (let i = 0; i < SLICE_WINDOW; i++) next = answerWith(next, false);
	return next;
};

/**
 * The peel a missed gate owes, paid off the front of the pipeline, then the
 * resume that reopens the shop (ADR-037) — how a retry actually reaches the
 * polls again.
 */
const payPeel = (state: RunState): RunState => {
	let next = state;
	while (next.stripsRemaining > 0)
		next = runReducer(next, {
			type: "strip",
			configId: next.pipeline.configs[0].id,
		});
	return runReducer(next, { type: "resume-climb" });
};

// The climb only starts on a full pipeline, so the helper pads the requested
// configs with inert fillers: focus categories the react-only pool never
// serves and a linter that is never used — their checks skip, never judge.
const FILLER_IDS = ["ts", "css", "js", "eslint"];

const started = (slotIds: string[], size = 60): RunState => {
	let state = createRun(pool(size), handed);
	const fillers = FILLER_IDS.filter((id) => !slotIds.includes(id));
	for (const configId of [...slotIds, ...fillers].slice(0, BASE_SLOTS))
		state = runReducer(state, { type: "slot", configId });
	return runReducer(state, { type: "start" });
};

describe("configuring", () => {
	it("refuses to slot beyond the pipeline's slots", () => {
		let state = createRun(pool(60), handed);
		for (const id of ["js", "eslint", "coverage-gain", "cold-start"])
			state = runReducer(state, { type: "slot", configId: id });
		expect(state.pipeline.configs).toHaveLength(3);
	});
});

describe("starter stacks (ADR-026)", () => {
	// The spec's handed pool holds every "test-everything" member but lacks
	// "ship-it"'s .jsx — one stack to apply, one to refuse.
	const pickStack = (state: RunState, stackId: string): RunState =>
		runReducer(state, { type: "pick-stack", stackId });

	it("fills the whole pipeline with the stack and pulls its members from the pool", () => {
		const state = pickStack(createRun(pool(60), handed), "test-everything");
		expect(configIds(state)).toEqual(["js", "ts", "eslint"]);
		const availableIds = state.available.map((config) => config.id);
		expect(availableIds).not.toContain("js");
		expect(availableIds).not.toContain("ts");
		expect(availableIds).not.toContain("eslint");
	});

	it("replaces hand-slotted configs instead of stacking on top of them", () => {
		let state = createRun(pool(60), handed);
		state = runReducer(state, { type: "slot", configId: "css" });
		state = pickStack(state, "test-everything");
		expect(configIds(state)).toEqual(["js", "ts", "eslint"]);
		expect(state.available.map((config) => config.id)).toContain("css");
	});

	it("refuses the whole stack when a member was never handed to the run", () => {
		const before = createRun(pool(60), handed);
		const after = pickStack(before, "ship-it");
		expect(after).toBe(before);
	});

	it("ignores an unknown stack id", () => {
		const before = createRun(pool(60), handed);
		expect(pickStack(before, "team-rocket")).toBe(before);
	});

	it("only applies while configuring — a started run keeps its build", () => {
		const before = started(["js"]);
		expect(pickStack(before, "test-everything")).toBe(before);
	});

	it("makes the run startable in one pick", () => {
		let state = pickStack(createRun(pool(60), handed), "test-everything");
		state = runReducer(state, { type: "start" });
		expect(state.status).toBe("answering");
	});
});

describe("gates and rewards", () => {
	it("clears a gate into the reward screen and grants storage", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0); // gates count from 0
		expect(state.status).toBe("rewarding");
		expect(state.storage).toBe(32); // GATE_REWARD_KB × first gate × 5/5
	});

	it("pays the flat Unit Tests payout on top of the gate reward", () => {
		let state = started(["unit-tests", "js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.storage).toBe(64); // 32 gate + 32 Unit Tests flat
	});

	it("pays the cleared gate by its window, not the ceiling", () => {
		let state = started(["js"]); // every check skips — a 4/5 window still clears
		state = answerWith(state, false);
		for (let i = 0; i < SLICE_WINDOW - 1; i++) state = answerWith(state, true);
		expect(state.status).toBe("rewarding");
		expect(state.gateRewardKb).toBe(26); // 32 × 4/5, rounded
		expect(state.storage).toBe(26);
	});

	it("takes several rewards (upgrade + slot + draft) and stays until finish", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.status).toBe("rewarding");

		// Fund the shop: JS coverage for the focus upgrade, storage for the draft,
		// and total coverage past the slot-4 gate for the first extra slot.
		state = {
			...state,
			coverageByCategory: { js: 100 },
			coverage: 100,
			storage: 500,
		};
		state = runReducer(state, { type: "upgrade", configId: "js" });
		expect(state.pipeline.configs[0].level).toBe(2);
		expect(state.status).toBe("rewarding");

		// Width now claims itself automatically (ADR-025) rather than through a
		// shop action, so a widened pipeline is set up directly here.
		state = { ...state, pipeline: { ...state.pipeline, slots: 4 } };
		expect(state.pipeline.slots).toBe(4);
		expect(state.status).toBe("rewarding");

		const pick = state.draftOptions.find((config) => config.id !== "js")!;
		state = runReducer(state, { type: "draft", configId: pick.id });
		expect(state.pipeline.configs.map((config) => config.id)).toContain(
			pick.id
		);
		expect(state.status).toBe("rewarding");

		state = runReducer(state, { type: "finish-reward" });
		expect(state.status).toBe("answering");
	});

	// A Focus upgrade answers to both gates (ADR-039): coverage says it is earned,
	// KB says it is affordable, and neither stands in for the other.
	it("gates a Focus upgrade on category coverage AND its storage price", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true); // react polls → no JS coverage
		expect(state.status).toBe("rewarding");
		expect(state.storage).toBe(32); // the gate's reward, and the price is 64

		state = runReducer(state, { type: "upgrade", configId: "js" }); // needs 5% JS coverage
		expect(state.pipeline.configs[0].level ?? 1).toBe(1); // unearned

		const earned = { ...state, coverageByCategory: { js: 100 } };
		expect(runReducer(earned, { type: "upgrade", configId: "js" })).toBe(
			earned
		); // earned, still unaffordable

		const funded = { ...earned, storage: upgradeStorageCost(1) };
		const upgraded = runReducer(funded, { type: "upgrade", configId: "js" });
		expect(upgraded.pipeline.configs[0].level).toBe(2);
		expect(upgraded.storage).toBe(0); // the price was actually taken
	});

	it("upgrades Unit Tests for storage — the next level costs 32KB × level", () => {
		let state = started(["unit-tests", "js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.status).toBe("rewarding");
		expect(state.storage).toBe(64); // 32 gate + 32 Unit Tests flat

		state = runReducer(state, { type: "upgrade", configId: "unit-tests" });
		const unit = state.pipeline.configs.find((c) => c.id === "unit-tests")!;
		expect(unit.level).toBe(2);
		expect(state.storage).toBe(0); // L2 cost the full 64KB

		const broke = runReducer(state, {
			type: "upgrade",
			configId: "unit-tests",
		});
		expect(broke).toBe(state); // L3 costs 96KB — unaffordable, no-op
	});

	it("flags newly drafted configs and clears the flag on finish", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		// The pipeline starts full, so drafting needs a widened build first.
		state = {
			...state,
			storage: 500,
			coverage: 100,
			pipeline: { ...state.pipeline, slots: state.pipeline.slots + 1 },
		};

		const pick = state.draftOptions[0];
		state = runReducer(state, { type: "draft", configId: pick.id });
		expect(state.draftedThisGate).toEqual([pick.id]);

		state = runReducer(state, { type: "finish-reward" });
		expect(state.draftedThisGate).toEqual([]);
	});
});

describe("selling in the shop", () => {
	const rewardingWith = (configId: string): RunState => {
		let state = started([configId]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		return state;
	};

	it("removes a sold config and refunds half its draft cost", () => {
		let state = { ...rewardingWith("eslint"), storage: 0 };
		state = runReducer(state, { type: "sell", configId: "eslint" });
		expect(configIds(state)).not.toContain("eslint");
		expect(state.storage).toBe(16); // common draft cost 32 → half
	});

	it("refuses to deinstall the only installed config", () => {
		const state = {
			...rewardingWith("eslint"),
			storage: 0,
		};
		const oneConfig = {
			...state,
			pipeline: { ...state.pipeline, configs: [CONFIGS.eslint] },
		};
		const blocked = runReducer(oneConfig, { type: "sell", configId: "eslint" });
		expect(blocked).toBe(oneConfig); // a bare build could never clear a gate
	});

	it("sells Unit Tests like any other config — nothing is locked anymore", () => {
		let state = started(["unit-tests", "js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		state = { ...state, storage: 0 };
		state = runReducer(state, { type: "sell", configId: "unit-tests" });
		expect(configIds(state)).not.toContain("unit-tests");
		expect(state.storage).toBe(16); // common draft cost 32 → half
	});
});

describe("shop controls (DVTD-5lt6)", () => {
	// A shop visit with storage to spend, at a gate deep enough for every control
	// to be staged in. `gatesCleared` is set directly because the controls read
	// the gate number, not the route that reached it.
	// The streak is pumped so `clearNextGate` outruns any gate's meter demand —
	// these tests are about the shop controls, not the score.
	const shopping = (gatesCleared = 3, storage = 512): RunState => {
		let state = started(["eslint"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		return { ...state, gatesCleared, storage, streak: 50 };
	};

	const offerIds = (state: RunState): string[] =>
		state.draftOptions.map((config) => config.id);

	const firstOffer = (state: RunState): string => state.draftOptions[0].id;

	const lockFirstOffer = (state: RunState): RunState =>
		runReducer(state, { type: "lock-offer", configId: firstOffer(state) });

	const clearNextGate = (state: RunState): RunState => {
		let cleared = runReducer(state, { type: "finish-reward" });
		for (let i = 0; i < SLICE_WINDOW; i++) cleared = answerWith(cleared, true);
		return cleared;
	};

	describe("lock", () => {
		it("charges the lock and records the held offer", () => {
			const state = shopping(3, 100);
			const held = firstOffer(state);
			const locked = lockFirstOffer(state);
			expect(locked.lockedOfferIds).toEqual([held]);
			expect(locked.storage).toBe(100 - LOCK_COST_KB);
		});

		it("holds the offer through a rebuild the player pays for", () => {
			const state = lockFirstOffer(shopping());
			const held = state.lockedOfferIds?.[0];
			const rebuilt = runReducer(state, { type: "rebuild-draft" });
			expect(offerIds(rebuilt)).toContain(held);
			expect(offerIds(rebuilt)[0]).toBe(held);
		});

		// The reason the lock costs anything: it reaches the next shop, where the
		// gate's payout has made the config affordable.
		it("still offers the held config at the next gate's shop", () => {
			const state = lockFirstOffer(shopping());
			const held = state.lockedOfferIds?.[0];
			const next = clearNextGate(state);
			expect(next.status).toBe("rewarding");
			expect(offerIds(next)).toContain(held);
			expect(next.lockedOfferIds).toEqual([held]);
		});

		it("spends the lock when the held config is installed", () => {
			const shop = lockFirstOffer(shopping());
			// Room to install into: the starting three slots are already full, and
			// `draft` refuses an offer with nowhere to go.
			const state = {
				...shop,
				pipeline: { ...shop.pipeline, slots: shop.pipeline.slots + 1 },
			};
			const held = state.lockedOfferIds?.[0] ?? "";
			const installed = runReducer(state, {
				type: "draft",
				configId: held,
			});
			expect(configIds(installed)).toContain(held);
			expect(installed.lockedOfferIds).toEqual([]);
		});

		it("refuses a second lock while one is held", () => {
			const state = lockFirstOffer(shopping());
			const second = runReducer(state, {
				type: "lock-offer",
				configId: state.draftOptions[1].id,
			});
			expect(second).toBe(state);
		});

		it("refuses a lock the run cannot pay for", () => {
			const broke = shopping(3, LOCK_COST_KB - 1);
			expect(lockFirstOffer(broke)).toBe(broke);
		});

		// Staged exposure: the opening shop teaches offers and upgrades only.
		it("is not offered before its gate", () => {
			const early = shopping(LOCK_FROM_GATE - 1);
			expect(lockFirstOffer(early)).toBe(early);
		});

		it("ignores an offer that is not on the table", () => {
			const state = shopping();
			expect(
				runReducer(state, { type: "lock-offer", configId: "team-rocket" })
			).toBe(state);
		});
	});

	describe("extend", () => {
		it("adds one offer to the current shop without disturbing the others", () => {
			const state = shopping(3, 200);
			const before = offerIds(state);
			const extended = runReducer(state, { type: "extend-offers" });
			expect(extended.storage).toBe(200 - extendCost(0));
			expect(offerIds(extended)).toHaveLength(before.length + 1);
			expect(offerIds(extended).slice(0, before.length)).toEqual(before);
		});

		it("offers the wider draft at every later shop too", () => {
			const state = runReducer(shopping(), { type: "extend-offers" });
			const next = clearNextGate(state);
			expect(next.extensionsBought).toBe(1);
			expect(offerIds(next)).toHaveLength(offerCount(1));
		});

		it("rebuilds into the wider draft", () => {
			const state = runReducer(shopping(), { type: "extend-offers" });
			const rebuilt = runReducer(state, { type: "rebuild-draft" });
			expect(offerIds(rebuilt)).toHaveLength(offerCount(1));
		});

		it("stops selling extensions once the run holds them all", () => {
			let state = shopping();
			for (let i = 0; i < MAX_EXTENSIONS; i++)
				state = runReducer(state, { type: "extend-offers" });
			expect(state.extensionsBought).toBe(MAX_EXTENSIONS);
			expect(runReducer(state, { type: "extend-offers" })).toBe(state);
		});

		it("refuses an extension the run cannot pay for", () => {
			const broke = shopping(3, extendCost(0) - 1);
			expect(runReducer(broke, { type: "extend-offers" })).toBe(broke);
		});

		it("is not offered before its gate", () => {
			const early = shopping(EXTEND_FROM_GATE - 1);
			expect(runReducer(early, { type: "extend-offers" })).toBe(early);
		});
	});

	// Rebuilds are the one control priced per visit, so its counter is the one
	// thing the walk to the next gate resets.
	it("resets rebuilds at the next shop but keeps locks and extensions", () => {
		let state = lockFirstOffer(shopping());
		state = runReducer(state, { type: "extend-offers" });
		state = runReducer(state, { type: "rebuild-draft" });
		expect(state.rebuildsUsed).toBe(1);

		const next = clearNextGate(state);
		expect(next.rebuildsUsed).toBe(0);
		expect(next.lockedOfferIds).toHaveLength(1);
		expect(next.extensionsBought).toBe(1);
	});
});

describe("dropping from the gate-prep screen", () => {
	it("drops an installed config while answering, no refund", () => {
		let state = { ...started(["eslint", "js"]), storage: 0 };
		state = runReducer(state, { type: "drop", configId: "eslint" });
		expect(configIds(state)).not.toContain("eslint");
		expect(state.storage).toBe(0); // drop() never refunds, unlike sell()
	});

	it("refuses to drop the only installed config while answering", () => {
		const state = started(["eslint"]);
		const oneConfig = {
			...state,
			pipeline: { ...state.pipeline, configs: [CONFIGS.eslint] },
		};
		const blocked = runReducer(oneConfig, { type: "drop", configId: "eslint" });
		expect(blocked).toBe(oneConfig); // a bare build could never clear a gate
	});

	it("ignores drop before the climb starts", () => {
		let state = createRun(pool(60), handed);
		state = runReducer(state, { type: "slot", configId: "js" });
		const blocked = runReducer(state, { type: "drop", configId: "js" });
		expect(blocked).toBe(state);
	});
});

describe("slots open on gates and coverage (ADR-041)", () => {
	it("widens on the answer that crosses a coverage threshold, mid-window", () => {
		let state = { ...started(["js"]), coverage: 1000 };
		state = answerWith(state, true);
		// Every coverage row at once: 60, 140, 240, 300 and 380.
		expect(state.pipeline.slots).toBe(BASE_SLOTS + 5);
		expect(state.justUnlockedSlots).toEqual([4, 5, 6, 7, 8]);
	});

	it("keeps a coverage-earned slot through the gate that then fails", () => {
		// The career total opens slots; the gate reads its own fresh meter and
		// fails this attempt anyway. Width earned on the way is not taken back.
		const state = clearGate({
			...started(["js"]),
			gatesCleared: 2,
			coverage: 500,
		});

		expect(state.status).toBe("awaiting-strip");
		expect(state.pipeline.slots).toBeGreaterThan(BASE_SLOTS);
	});

	it("grants no slot for the teaching gate, then one for clearing gate 1", () => {
		let state = clearGate(started(["js"], 2 * SLICE_WINDOW));
		expect(state.pipeline.slots).toBe(BASE_SLOTS);
		expect(state.justUnlockedSlots).toEqual([]);
		state = runReducer(state, { type: "finish-reward" });
		state = clearGate(state);
		expect(state.pipeline.slots).toBe(BASE_SLOTS + 1);
		expect(state.justUnlockedSlots).toEqual([BASE_SLOTS + 1]);
	});

	it("never shrinks a pipeline already wider than the grant", () => {
		const base = started(["js"], 2 * SLICE_WINDOW);
		let state = { ...base, pipeline: { ...base.pipeline, slots: MAX_SLOTS } };
		state = clearGate(state);
		state = runReducer(state, { type: "finish-reward" });
		state = clearGate(state);
		expect(state.pipeline.slots).toBe(MAX_SLOTS);
		expect(state.justUnlockedSlots).toEqual([]);
	});
});

describe("the gate's window meter (ADR-035)", () => {
	it("fails a perfect window whose meter sits under the gate's own demand", () => {
		// Gate 2 demands 25% and a from-zero perfect window at ×3 banks ~19.5%
		// — every gate is a fresh score, the run's career total never counts.
		const state = clearGate({
			...started(["js"]),
			gatesCleared: 2,
			coverage: 500,
		});
		expect(state.status).toBe("awaiting-strip");
		expect(state.gatesCleared).toBe(2);
		expect(state.log.at(-1)).toContain("Gate 2 failed");
	});

	it("resets the meter for the retry, keeping its answers for the review", () => {
		let state = clearGate({ ...started(["js"]), gatesCleared: 2 });
		expect(state.answeredThisGate).toHaveLength(SLICE_WINDOW);
		state = payPeel(state);
		expect(state.window.coverageGained).toBe(0);
		expect(state.window.answered).toBe(0);
		// The retry's own start is what clears the failed attempt's answers.
		state = runReducer(state, { type: "finish-reward" });
		expect(state.answeredThisGate).toEqual([]);
	});

	it("keeps the career coverage earned inside a failed attempt", () => {
		let state = { ...started(["js"]), gatesCleared: 2 };
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.coverage).toBeGreaterThan(0);
	});

	it("bleeds the meter on a wrong answer but floors it at 0", () => {
		let state = started(["js"]);
		state = answerWith(state, false);
		expect(state.window.coverageGained).toBe(0);
		state = answerWith(state, true);
		state = answerWith(state, false);
		// 1 correct at streak 1.1 = 1.1, minus a bleed of half an answer (0.5).
		expect(state.window.coverageGained).toBeCloseTo(0.6);
	});

	it("never advances a build that answers nothing — it peels until the run ends", () => {
		let state = started(["js"]);
		for (let attempt = 0; attempt < 10 && state.status !== "dead"; attempt++)
			state = runReducer(payPeel(failGate(state)), { type: "finish-reward" });
		expect(state.status).toBe("dead");
		expect(state.gatesCleared).toBe(0);
	});

	it("grades each attempt against its own gate's row of the demand table", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		// A perfect teaching window banks ~6% against gate 0's 3% — cleared.
		expect(state.clearedGate).toBe(0);
		expect(coverageDemandFor(0)).toBe(3);
	});
});

describe("enhancement configs on one pipeline", () => {
	it("doubles the opening answer's coverage with Cold Start", () => {
		let state = started(["cold-start"]);
		state = answerWith(state, true);
		expect(state.coverage).toBe(2.2); // 1 × opener ×2 × streak 1.1
		state = answerWith(state, true);
		expect(state.coverage).toBe(3.4); // +1.2 — the doubling was opener-only
	});

	it("stops the IndexedDB faucet at the per-run cap", () => {
		let state = started(["indexed-db"]);
		state = { ...state, faucetEarnedKb: FAUCET_CAP_KB - 4 };
		state = answerWith(state, true); // only 4KB of headroom left
		expect(state.storage).toBe(4);
		expect(state.faucetEarnedKb).toBe(FAUCET_CAP_KB);
		state = answerWith(state, true); // the faucet has run dry
		expect(state.storage).toBe(4);
	});
});

describe("the lint fee", () => {
	// Three options so the lint action applies (it needs >1 wrong option left).
	const lintablePoll = (id: string, correct: boolean): RunPoll => ({
		id,
		category: "js",
		question: `Does ${id} lint?`,
		answerType: "single",
		options: [
			{ id: `${id}-a`, label: "A", correct },
			{ id: `${id}-b`, label: "B", correct: false },
			{ id: `${id}-c`, label: "C", correct: !correct },
		],
	});

	const lintableRun = (): RunState => {
		let state = createRun(
			Array.from({ length: 10 }, (_, index) =>
				lintablePoll(`lintable-${index}`, true)
			),
			handed
		);
		for (const configId of ["eslint", "ts", "css"])
			state = runReducer(state, { type: "slot", configId });
		state = runReducer(state, { type: "start" });
		return { ...state, storage: 100 };
	};

	it("clears a window that never linted — the fee is a choice, never owed", () => {
		let state = lintableRun();
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);
	});

	it("doubles the fee at a Cost Overrun gate (ADR-038)", () => {
		const overrun: RunState = { ...lintableRun(), gatesCleared: 3 };
		expect(lintFeeFor(overrun)).toBe(16); // the 8KB rung, doubled
		expect(runReducer(overrun, { type: "lint-poll" }).storage).toBe(84);
	});

	it("takes the action away entirely at a Feature Freeze gate (ADR-038)", () => {
		const frozen: RunState = { ...lintableRun(), gatesCleared: 6 };
		expect(lintApplies(frozen)).toBe(false);
		expect(runReducer(frozen, { type: "lint-poll" })).toBe(frozen);
	});

	it("charges the fee for a lint but demands nothing back for it", () => {
		let state = lintableRun();
		state = runReducer(state, { type: "lint-poll" });
		expect(state.storage).toBe(92); // -8KB lint fee
		state = answerWith(state, false); // the linted poll still missed
		for (let i = 0; i < 4; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);
	});
});

describe(".length's pick budget", () => {
	// Two correct options out of three, so this poll alone costs 2 of the budget.
	const multiPoll = (id: string): RunPoll => ({
		id,
		category: "react",
		question: `Which of ${id} are Kanto towns?`,
		answerType: "multiple",
		options: [
			{ id: `${id}-a`, label: "Pewter", correct: true },
			{ id: `${id}-b`, label: "Viridian", correct: true },
			{ id: `${id}-c`, label: "Hyrule", correct: false },
		],
	});

	// One multi-answer poll in the first window: budget 6 across 5 polls, so the
	// window holds exactly one correct answer beyond one per poll.
	const mixedPool = (size = 60): RunPoll[] => [
		multiPoll("celadon"),
		...Array.from({ length: size - 1 }, (_, index) =>
			poll(`kazooie-${index}`, true)
		),
	];

	const counting = (polls: RunPoll[] = mixedPool()): RunState => {
		let state = createRun(polls, [...handed, CONFIGS.length]);
		for (const configId of ["length", "ts", "css"])
			state = runReducer(state, { type: "slot", configId });
		return runReducer(state, { type: "start" });
	};

	const answerIds = (state: RunState, ids: string[]): RunState =>
		runReducer(state, { type: "answer", optionIds: ids });

	const spendAll = (state: RunState): RunState =>
		answerIds(state, ["celadon-a", "celadon-b"]);

	it("fixes the budget from the window's polls when the run starts", () => {
		expect(counting().window.budget).toBe(6);
		expect(pickBudgetFor(mixedPool(), 0)).toBe(6);
	});

	// The same build with .length swapped for a linter the react-only pool never
	// serves, so any difference in the clear payout is .length's alone.
	const uncounted = (polls: RunPoll[] = mixedPool()): RunState => {
		let state = createRun(polls, handed);
		for (const configId of ["eslint", "ts", "css"])
			state = runReducer(state, { type: "slot", configId });
		return runReducer(state, { type: "start" });
	};

	// `.length` sells knowledge, not KB. It used to pay per extra pick as well,
	// which made a config bought for its reveal earn its keep on the ledger — and
	// left the reveal itself unbuilt on the screens that were meant to carry it.
	it("pays nothing for the count it reveals, even where extra picks are owed", () => {
		let state = spendAll(counting());
		for (let i = 0; i < SLICE_WINDOW - 1; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);

		let bare = spendAll(uncounted());
		for (let i = 0; i < SLICE_WINDOW - 1; i++) bare = answerWith(bare, true);
		expect(bare.clearedGate).toBe(0);
		expect(state.gateRewardKb).toBe(bare.gateRewardKb);
	});

	it("still clears when the multi-answer poll was hedged — no spend is owed (ADR-035)", () => {
		let state = answerIds(counting(), ["celadon-a"]);
		for (let i = 0; i < SLICE_WINDOW - 1; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);
	});

	it("refreshes the budget for the next gate off the polls it will serve", () => {
		let state = spendAll(counting());
		for (let i = 0; i < SLICE_WINDOW - 1; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);
		// The second window is all single-answer, so its budget is one per poll.
		expect(state.window.budget).toBe(5);
	});
});

describe("Telemetry peeks", () => {
	// ts/css masteries skip on the react-only pool, so Telemetry's is the only
	// check that judges this window.
	const peekingRun = (): RunState => ({
		...started(["telemetry"]),
		storage: 200,
	});

	const peek = (state: RunState): RunState =>
		runReducer(state, { type: "peek-poll" });

	it("charges 32KB and records the poll it bought", () => {
		const state = peek(peekingRun());
		expect(state.storage).toBe(168);
		expect(state.peekedPollIds).toEqual([state.polls[0].id]);
		expect(state.window.peeked).toBe(1);
	});

	it("doubles the fee for a second peek in the same gate", () => {
		let state = peek(peekingRun());
		state = answerWith(state, true);
		state = peek(state);
		expect(state.storage).toBe(104); // 200 - 32 - 64
	});

	it("refuses a second peek on the same poll — the split comes over once", () => {
		const bought = peek(peekingRun());
		expect(peek(bought)).toBe(bought);
	});

	it("refuses a peek no installed config sells", () => {
		const state = { ...started(["js"]), storage: 200 };
		expect(peek(state)).toBe(state);
	});

	it("refuses a peek the balance cannot cover", () => {
		const broke = { ...peekingRun(), storage: 31 };
		expect(peek(broke)).toBe(broke);
	});

	it("clears a window that never peeked — the fee is a choice, never owed (ADR-035)", () => {
		let state = peekingRun();
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);
		expect(state.status).toBe("rewarding");
	});

	it("does not care how a peeked poll was answered", () => {
		let state = peek(peekingRun());
		state = answerWith(state, false);
		for (let i = 0; i < SLICE_WINDOW - 1; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);
	});

	it("resets the ladder at the next gate, so a peek never gets permanently expensive", () => {
		let state = peek(peekingRun());
		state = answerWith(state, true);
		state = peek(state);
		for (let i = 0; i < SLICE_WINDOW - 1; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);
		expect(state.window.peeked).toBe(0);
	});

	it("refuses a peek on a balance under the first rung", () => {
		const state = { ...peekingRun(), storage: 31 };
		expect(canBuyPeek(state)).toBe(false);
	});

	it("keeps peeked polls for the whole run, so the split survives a later gate", () => {
		let state = peek(peekingRun());
		const peekedId = state.polls[0].id;
		state = answerWith(state, true);
		state = peek(state);
		for (let i = 0; i < SLICE_WINDOW - 1; i++) state = answerWith(state, true);
		expect(state.peekedPollIds).toContain(peekedId);
		expect(state.peekedPollIds).toHaveLength(2);
	});
});

describe("failure model (ADR-037: a miss peels, then re-runs the loop)", () => {
	it("owes the base peel at the gate it missed", () => {
		const state = failGate(started(["unit-tests"]));
		expect(state.status).toBe("awaiting-strip");
		expect(state.stripsRemaining).toBe(failStripsFor(0));
		expect(state.gatesCleared).toBe(0);
		// Which config goes is the player's decision, so nothing is taken yet.
		expect(state.pipeline.configs).toHaveLength(3);
	});

	it("sends the paid peel to the shop instead of straight back to the polls", () => {
		const state = payPeel(failGate(started(["unit-tests"])));
		expect(state.status).toBe("rewarding");
		expect(state.redoGate).toBe(0);
		expect(state.pipeline.configs).toHaveLength(2);
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
		const state = failGate(atGateWithBuild(11, 8));
		expect(state.status).toBe("awaiting-strip");
		expect(state.stripsRemaining).toBe(failStripsFor(11) + 1);
	});

	it("peels more of a deep build than a shallow one", () => {
		expect(failGate(atGateWithBuild(1, 8)).stripsRemaining).toBe(1);
		expect(failGate(atGateWithBuild(8, 8)).stripsRemaining).toBe(3);
	});

	it("ends the run when the peel takes the whole build", () => {
		const base = started(["unit-tests", "eslint"]);
		const state = failGate({
			...base,
			pipeline: {
				...base.pipeline,
				configs: base.pipeline.configs.slice(0, 1),
			},
		});
		expect(state.status).toBe("dead");
		expect(state.log.at(-1)).toContain("the build holds 1");
	});

	it("clears the redo flag on the clear that follows", () => {
		let state = payPeel(failGate(started(["js"])));
		expect(state.redoGate).toBe(0);
		state = clearGate(runReducer(state, { type: "finish-reward" }));
		expect(state.clearedGate).toBe(0);
		expect(state.redoGate).toBeUndefined();
	});

	it("ends the run when a bare pipeline misses — a bare retry would loop forever", () => {
		// Bareness is unreachable through play (the sell/drop floor holds at 1);
		// this guards legacy snapshots that resume with an emptied pipeline.
		let state = started(["js"]);
		state = { ...state, pipeline: { ...state.pipeline, configs: [] } };
		expect(failGate(state).status).toBe("dead");
	});

	it("refuses the sell that would empty the pipeline", () => {
		let state = started(["eslint"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		const oneConfig = {
			...state,
			pipeline: { ...state.pipeline, configs: [CONFIGS.eslint] },
		};
		expect(runReducer(oneConfig, { type: "sell", configId: "eslint" })).toBe(
			oneConfig
		);
	});
});

describe("the gate audits (ADR-035)", () => {
	// Marsh (gate 7) mirrors scoring; the streak stays keyed to true correctness.
	const atMarsh = (): RunState => ({ ...started(["js"]), gatesCleared: 7 });

	// The mirror flips the question, not the score (ADR-038): the two-option
	// polls this spec serves mirror into "pick the one wrong option", so the
	// wrong option IS the answer and everything downstream grades normally.
	it("pays the wrong option at the mirror, streak and all", () => {
		let state = answerWith(atMarsh(), false);
		// share 1 × gate ×8 × difficulty 1 × streak 1.1.
		expect(state.window.coverageGained).toBe(8.8);
		expect(state.streak).toBe(1);
		state = answerWith(state, false);
		expect(state.streak).toBe(2); // streaks build under the mirror now
	});

	it("bleeds the meter on the poll's own correct option", () => {
		let state: RunState = {
			...atMarsh(),
			coverage: 100,
			coverageByCategory: { react: 100 },
		};
		state = answerWith(state, true);
		// Mirrored, that pick is the wrong one: no earn, and the bleed fires —
		// half of what this gate pays per answer (0.5 × 8 = 4).
		expect(state.window.coverageGained).toBe(0);
		expect(state.coverage).toBe(96);
		expect(state.streak).toBe(0);
	});

	it("asks for every wrong option once a poll has more than one", () => {
		const base = started(["js"]);
		const poll: RunPoll = {
			id: "multi",
			category: "react",
			question: "Which are hooks?",
			answerType: "single",
			options: [
				{ id: "a", label: "useState", correct: true },
				{ id: "b", label: "componentDidMount", correct: false },
				{ id: "c", label: "render", correct: false },
			],
		};
		const state: RunState = {
			...base,
			gatesCleared: 7,
			polls: [poll, ...base.polls.slice(1)],
			currentIndex: 0,
		};
		const both = runReducer(state, {
			type: "answer",
			optionIds: ["b", "c"],
		});
		const half = runReducer(state, { type: "answer", optionIds: ["b"] });
		expect(both.answeredThisGate.at(-1)?.outcome).toBe("correct");
		// Half the wrong options is a partial, exactly as a half-answered
		// multi-answer poll would be off the mirror.
		expect(half.answeredThisGate.at(-1)?.outcome).toBe("partial");
		expect(both.window.coverageGained).toBeGreaterThan(
			half.window.coverageGained
		);
	});

	it("marks the mirrored expectation as the answer to beat", () => {
		const state = answerWith(atMarsh(), false);
		const answered = state.answeredThisGate.at(-1);
		// "No" is this pool's wrong option — mirrored, it is what the gate wanted.
		expect(answered?.correct).toEqual(["No"]);
	});

	it("leaks storage every poll at the volcano, more on a miss", () => {
		let state = { ...started(["js"]), gatesCleared: 9, storage: 100 };
		state = answerWith(state, true);
		expect(state.storage).toBe(84); // -16 a poll
		state = answerWith(state, false);
		expect(state.storage).toBe(52); // -32 on the miss
	});

	it("floors the leak at 0 — insolvency stays non-lethal (ADR-023)", () => {
		let state = { ...started(["js"]), gatesCleared: 9, storage: 10 };
		state = answerWith(state, true);
		expect(state.storage).toBe(0);
		expect(state.status).toBe("answering");
	});

	it("ends an Elite run whose build cannot pay the deepened peel", () => {
		const quota = failStripsFor(11) + 1;
		const state = failGate(atGateWithBuild(11, quota - 1));
		expect(state.status).toBe("dead");
		expect(state.log.at(-1)).toContain(`It peels ${quota}`);
	});

	it("refuses every shop write at a Read-only gate, and none elsewhere", () => {
		const base = started(["js"]);
		const shopping = (gatesCleared: number): RunState => ({
			...base,
			status: "rewarding",
			gatesCleared,
			storage: 1000,
			pipeline: { ...base.pipeline, slots: 4 },
			draftOptions: [CONFIGS.indexedDb],
		});
		const readOnly = shopping(5);
		expect(isShopLocked(readOnly)).toBe(true);
		expect(
			runReducer(readOnly, { type: "draft", configId: "indexed-db" })
		).toBe(readOnly);
		expect(runReducer(readOnly, { type: "change-plan", tier: 2 })).toBe(
			readOnly
		);
		expect(runReducer(readOnly, { type: "rebuild-draft" })).toBe(readOnly);

		const open = shopping(4);
		expect(isShopLocked(open)).toBe(false);
		expect(
			runReducer(open, { type: "draft", configId: "indexed-db" }).pipeline
				.configs
		).toHaveLength(4);
	});

	// Read-only shuts the till, not the door: the gate still has to be started,
	// and a build that needs shrinking to fit still can be.
	it("lets a Read-only run start its gate and drop a config", () => {
		const readOnly: RunState = {
			...started(["js"]),
			status: "rewarding",
			gatesCleared: 5,
		};
		expect(runReducer(readOnly, { type: "finish-reward" }).status).toBe(
			"answering"
		);
		expect(
			runReducer(readOnly, { type: "drop", configId: "js" }).pipeline.configs
		).toHaveLength(2);
	});

	it("takes one config offline at a Dependency Outage gate", () => {
		const outage = { ...started(["js"]), gatesCleared: 4 };
		const view = toRunView(outage);
		expect(view.offlineConfigs).toHaveLength(1);
		expect(outage.pipeline.configs).toContain(view.offlineConfigs[0].config);
		expect(view.offlineConfigs[0].audit).toBe("Dependency Outage");
	});

	it("moves the flake from poll to poll at a Flaky Build gate", () => {
		let state: RunState = { ...started(["js"]), gatesCleared: 8 };
		const seen = new Set<string>();
		for (let i = 0; i < SLICE_WINDOW - 1; i++) {
			seen.add(toRunView(state).offlineConfigs[0]?.config.id ?? "");
			state = answerWith(state, true);
		}
		expect(seen.size).toBeGreaterThan(1);
	});

	it("switches off the most-upgraded config at a Breaking Change gate", () => {
		const base = started(["js"]);
		const levelled: RunState = {
			...base,
			gatesCleared: 10,
			pipeline: {
				...base.pipeline,
				configs: base.pipeline.configs.map((config, index) =>
					index === 1 ? { ...config, level: 4 } : config
				),
			},
		};
		expect(toRunView(levelled).offlineConfigs[0]?.config.id).toBe(
			levelled.pipeline.configs[1].id
		);
	});

	it("keeps an offline config out of the answer it would have scored", () => {
		const base = started(["js"]);
		const build: RunState = {
			...base,
			gatesCleared: 4, // Dependency Outage
			pipeline: {
				...base.pipeline,
				slots: 5,
				configs: [
					...base.pipeline.configs,
					CONFIGS.agentsMd,
					CONFIGS.coverageGain,
				],
			},
		};
		const offlineId = toRunView(build).offlineConfigs[0]?.config.id;
		const bonuses = answerWith(build, true)
			.answeredThisGate.at(-1)
			?.coverageBreakdown?.configBonuses.map((bonus) => bonus.configId);
		expect(offlineId).toBeDefined();
		expect(bonuses).not.toContain(offlineId);
		// The rest of the build still pays, so this is a config going quiet
		// rather than the whole pipeline switching off.
		expect(bonuses?.length).toBeGreaterThan(0);
	});

	it("scores an answer past the clock as a miss, whatever was picked", () => {
		const timed = { ...started(["js"]), gatesCleared: 8 };
		const poll = timed.polls[timed.currentIndex];
		const rightOption = poll.options.find((option) => option.correct);
		const late = runReducer(timed, {
			type: "answer",
			optionIds: [rightOption?.id ?? ""],
			elapsedMs: 31_000,
		});
		expect(late.window.coverageGained).toBe(0);
		expect(late.window.correct).toBe(0);
		expect(late.streak).toBe(0);
		// The review still knows the answer was right, so "wrong" never reads as a
		// lie about what was picked.
		expect(late.answeredThisGate.at(-1)?.timedOut).toBe(true);
	});

	it("leaves an answer inside the clock alone", () => {
		const timed = { ...started(["js"]), gatesCleared: 8 };
		const poll = timed.polls[timed.currentIndex];
		const rightOption = poll.options.find((option) => option.correct);
		const inTime = runReducer(timed, {
			type: "answer",
			optionIds: [rightOption?.id ?? ""],
			elapsedMs: 29_000,
		});
		expect(inTime.window.coverageGained).toBeGreaterThan(0);
		expect(inTime.answeredThisGate.at(-1)?.timedOut).toBeUndefined();
	});

	it("frees the polls past the clocked ones", () => {
		let state: RunState = { ...started(["js"]), gatesCleared: 8 };
		for (let i = 0; i < 3; i++) state = answerWith(state, true);
		expect(toRunView(state).pollTimeLimitMs).toBeNull();
	});

	it("charges Marsh its full demand — the mirror no longer discounts it", () => {
		expect(toRunView(atMarsh()).gateStake.coverageDemand).toBe(
			coverageDemandFor(7)
		);
	});

	// `.length` reveals a number the player is about to spend, so at a mirrored
	// gate it has to count the wrong options — those are the picks being asked
	// for (ADR-038).
	it("counts the picks a mirrored window actually wants", () => {
		const threeOption = (id: string): RunPoll => ({
			id,
			category: "react",
			question: `${id}?`,
			answerType: "single",
			options: [
				{ id: `${id}-a`, label: "A", correct: true },
				{ id: `${id}-b`, label: "B", correct: false },
				{ id: `${id}-c`, label: "C", correct: false },
			],
		});
		const polls = Array.from({ length: 20 }, (_, index) =>
			threeOption(`three-${index}`)
		);
		let base = createRun(polls, [...handed, CONFIGS.length]);
		for (const configId of ["length", "js", "eslint"])
			base = runReducer(base, { type: "slot", configId });
		base = runReducer(base, { type: "start" });

		// One correct option per poll off the mirror, two wrong ones on it.
		expect(toRunView(base).correctAnswersThisGate).toBe(SLICE_WINDOW);
		expect(pickBudgetFor(polls, 0, true)).toBe(SLICE_WINDOW * 2);

		// A window belongs to the gate that opened it, so the mirrored count
		// arrives with the window — here, the one a missed mirror gate reopens.
		const reopened = runReducer(
			{
				...base,
				gatesCleared: 7,
				status: "awaiting-strip" as const,
				stripsRemaining: 0,
			},
			{ type: "resume-climb" }
		);
		expect(toRunView(reopened).correctAnswersThisGate).toBe(SLICE_WINDOW * 2);
	});

	it("Volkswagen CI suppresses the mirror — normal scoring, full demand", () => {
		const base = started(["js"]);
		let state: RunState = {
			...base,
			gatesCleared: 7,
			pipeline: {
				...base.pipeline,
				configs: [...base.pipeline.configs, CONFIGS.volkswagenCi],
			},
		};
		const view = toRunView(state);
		expect(view.gateStake.coverageDemand).toBe(coverageDemandFor(7));
		expect(view.gateStake.audits).toEqual([
			expect.objectContaining({ id: "mirrored", suppressed: true }),
		]);
		state = answerWith(state, true);
		expect(state.window.coverageGained).toBeGreaterThan(0); // no mirror
	});
});

describe("the git tag (ADR-036)", () => {
	const shopAt = (gatesCleared: number, storage = 1000): RunState => ({
		...started(["js"]),
		status: "rewarding",
		gatesCleared,
		storage,
	});

	it("plants the tag at the current gate and charges that gate's price", () => {
		const state = runReducer(shopAt(4), { type: "plant-pin" });
		expect(state.pinPlantedAtGate).toBe(4);
		expect(state.storage).toBe(1000 - pinCostFor(4));
		expect(state.log.at(-1)).toContain("git tag planted at gate 4");
	});

	// The price is the tag's worth: a checkpoint at gate 9 saves a week of
	// climbing where one at gate 4 saves an evening.
	it("charges more for a deeper checkpoint", () => {
		expect(pinCostFor(PIN_UNTIL_GATE)).toBeGreaterThan(
			pinCostFor(PIN_FROM_GATE)
		);
		const rows = [4, 5, 6, 7, 8, 9, 10].map(pinCostFor);
		expect(rows).toEqual([...rows].sort((a, b) => a - b));
		expect(runReducer(shopAt(9), { type: "plant-pin" }).storage).toBe(
			1000 - pinCostFor(9)
		);
	});

	it("sells no tag before gate 4", () => {
		const early = shopAt(3);
		expect(runReducer(early, { type: "plant-pin" })).toBe(early);
	});

	// Past gate 10 a rescue resumes a starter build into stacked audits and a
	// 4-config peel — a fortune spent on a death.
	it("stops selling past gate 10", () => {
		const deep = shopAt(PIN_UNTIL_GATE + 1);
		expect(runReducer(deep, { type: "plant-pin" })).toBe(deep);
		expect(pinAvailable(deep)).toBe(false);
		expect(pinAvailable(shopAt(PIN_UNTIL_GATE))).toBe(true);
	});

	it("refuses a tag the balance cannot cover", () => {
		const broke = shopAt(4, pinCostFor(4) - 1);
		expect(runReducer(broke, { type: "plant-pin" })).toBe(broke);
	});

	it("plants at most one tag per run", () => {
		const once = runReducer(shopAt(4), { type: "plant-pin" });
		const deeper = { ...once, gatesCleared: 6 };
		const again = runReducer(deeper, { type: "plant-pin" });
		expect(again).toBe(deeper); // refused — the tag stays where it was
		expect(again.pinPlantedAtGate).toBe(4);
	});

	it("starts a rescued run at the pinned gate, wider and with a stipend", () => {
		const state = createRun(pool(20), handed, 7);
		expect(state.gatesCleared).toBe(7);
		expect(state.startedAtGate).toBe(7);
		// Gate grants only: a rescued run starts on zero coverage (ADR-041).
		expect(state.pipeline.slots).toBe(BASE_SLOTS + 3);
		expect(state.storage).toBe(32 * 7);
		expect(state.coverage).toBe(0);
	});

	it("lets a rescued run start on the base three configs, not a full nine", () => {
		let state = createRun(pool(20), handed, 7);
		for (const configId of ["js", "ts", "css"])
			state = runReducer(state, { type: "slot", configId });
		state = runReducer(state, { type: "start" });
		expect(state.status).toBe("answering");
	});

	// One use per purchase: the tag is consumed on the start it rescues (see
	// consumePinnedGate), so the rescued run's shop sells it again from scratch.
	it("sells a rescued run another tag, at its own gate's price", () => {
		const rescued: RunState = {
			...createRun(pool(20), handed, 7),
			status: "rewarding",
			storage: 1000,
		};
		expect(rescued.pinPlantedAtGate).toBeUndefined();
		expect(pinAvailable(rescued)).toBe(true);
		const planted = runReducer(rescued, { type: "plant-pin" });
		expect(planted.pinPlantedAtGate).toBe(7);
		expect(planted.storage).toBe(1000 - pinCostFor(7));
	});

	it("changes nothing about an unpinned start", () => {
		const state = createRun(pool(20), handed);
		expect(state.gatesCleared).toBe(0);
		expect(state.startedAtGate).toBe(0);
		expect(state.storage).toBe(0);
		expect(state.pipeline.slots).toBe(BASE_SLOTS);
	});
});

describe("the strip plumbing (strip audits, DVTD-gre4)", () => {
	const awaitingStrip = (quota: number): RunState => {
		let state = started(["unit-tests", "eslint"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, false);
		return {
			...state,
			status: "awaiting-strip",
			stripsRemaining: quota,
		};
	};

	it("routes the peeled build through the shop before the replay", () => {
		let state = awaitingStrip(1);
		state = runReducer(state, { type: "strip", configId: "eslint" });
		expect(state.stripsRemaining).toBe(0);
		state = runReducer(state, { type: "resume-climb" });
		expect(state.status).toBe("rewarding");
		expect(state.redoGate).toBe(0);
		expect(configIds(state)).not.toContain("eslint");
		state = runReducer(state, { type: "finish-reward" });
		expect(state.status).toBe("answering");
		expect(state.gatesCleared).toBe(0); // the same gate again, not the next
	});

	it("ignores a strip once the quota is met", () => {
		let state = awaitingStrip(1);
		state = runReducer(state, { type: "strip", configId: "eslint" });
		const afterQuota = runReducer(state, { type: "strip", configId: "ts" });
		expect(afterQuota).toBe(state);
	});

	it("ends the run when a peel emptied the build instead of climbing on", () => {
		let state = awaitingStrip(0);
		state = { ...state, pipeline: { ...state.pipeline, configs: [] } };
		state = runReducer(state, { type: "resume-climb" });
		expect(state.status).toBe("dead");
	});
});

describe("the daily gate lock", () => {
	it("stays answering when the day's polls run out mid-window", () => {
		let state = started(["js"], 3); // stub segment: the window never fills
		for (let i = 0; i < 3; i++) state = answerWith(state, true);
		expect(state.status).toBe("answering");
		expect(isAwaitingTomorrow(state)).toBe(true);
	});

	it("ignores an answer while awaiting tomorrow's polls", () => {
		let state = started(["js"], 1);
		state = answerWith(state, true);
		const locked = runReducer(state, {
			type: "answer",
			optionIds: ["ghost"],
		});
		expect(locked).toBe(state);
	});

	it("unlocks once the next day's segment appends polls", () => {
		let state = started(["js"], 2);
		state = answerWith(state, true);
		state = answerWith(state, true);
		expect(isAwaitingTomorrow(state)).toBe(true);
		// The rollover appends outside the reducer (ADR-011); the lock is derived.
		const rolled = {
			...state,
			polls: [...state.polls, poll("tomorrow-0", true)],
		};
		expect(isAwaitingTomorrow(rolled)).toBe(false);
	});

	it("opens the shop, not the lock, when the gate clears on the day's last poll", () => {
		let state = started(["js"], SLICE_WINDOW);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.status).toBe("rewarding");
		expect(isAwaitingTomorrow(state)).toBe(false);
		state = runReducer(state, { type: "finish-reward" });
		expect(isAwaitingTomorrow(state)).toBe(true);
	});

	it("locks the retry behind tomorrow when the day ends on a failed gate", () => {
		let state = failGate(started(["unit-tests"], SLICE_WINDOW));
		// The peel and the shop still happen today — only the polls have to wait.
		expect(state.status).toBe("awaiting-strip");
		state = runReducer(payPeel(state), { type: "finish-reward" });
		expect(isAwaitingTomorrow(state)).toBe(true);
	});
});

describe("a two-polls-a-day player (ADR-014)", () => {
	const dayPolls = (day: number, count = SLICE_WINDOW): RunPoll[] =>
		Array.from({ length: count }, (_, index) =>
			poll(`day${day}-${index}`, true)
		);

	/**
	 * What a day boundary means to the engine: the rollover (which lives
	 * outside the reducer — ensureTodaysSegmentWith) drops the unplayed tail
	 * and appends tomorrow's segment. In a pure test that is one array
	 * operation; the reducer itself never learns the date changed.
	 */
	const nextDay = (
		state: RunState,
		tomorrow: readonly RunPoll[]
	): RunState => ({
		...state,
		polls: [...state.polls.slice(0, state.currentIndex), ...tomorrow],
	});

	it("carries a half-filled gate across the day boundary", () => {
		// Day 1: answer 2 of the day's 5 correctly, then stop for the day.
		let state = started(["js"], SLICE_WINDOW);
		state = answerWith(state, true);
		state = answerWith(state, true);

		state = nextDay(state, dayPolls(2));

		// The boundary changed the polls, not the climb: gate progress survives.
		expect(state.window.answered).toBe(2);
		expect(isAwaitingTomorrow(state)).toBe(false);

		// TODO(marciano): finish the scenario — you decide which invariants
		// matter. Candidates: the gate closes on day 2's third answer
		// (status / gatesCleared / a fresh window), streak and coverage
		// survive the boundary, and after day 2's remaining two polls the
		// lock engages with the next window already 2/5 in (the drift).
	});
});

describe("the summit", () => {
	it("wins by clearing every gate — playing the mirror wrong on purpose", () => {
		const base = started(["js"], GATE_COUNT * SLICE_WINDOW);
		// The mirror pays no streak, so Marsh and Elite demand a real multiplier
		// build: AGENTS.md ×2 with Coverage ×2 carries a perfect mirror window,
		// and enough width that Dependency Outage cannot take both.
		let state: RunState = {
			...base,
			pipeline: {
				...base.pipeline,
				slots: 6,
				configs: [
					...base.pipeline.configs,
					CONFIGS.agentsMd,
					CONFIGS.coverageGain,
					// Elite's mirror forces five wrong answers, so the Champion opens
					// on a cold streak: 340% off streakless multipliers alone lands two
					// points short, and this is what covers the gap.
					CONFIGS.codeCoverage,
				],
			},
		};
		for (let gate = 0; gate < GATE_COUNT; gate++) {
			const mirrored = auditsForGate(gate).some(
				(audit) => audit.id === "mirrored"
			);
			for (let i = 0; i < SLICE_WINDOW; i++)
				state = answerWith(state, !mirrored);
			if (state.status === "rewarding")
				state = runReducer(state, { type: "finish-reward" });
		}
		expect(state.status).toBe("won");
		expect(state.clearedGate).toBe(VICTORY_GATE); // the last gate's number
		expect(state.gatesCleared).toBe(GATE_COUNT); // every gate banked
	});
});

describe("depth and width are independent (ADR-019)", () => {
	it("advances the gate on a clear the starting three slots paid for", () => {
		const state = clearGate(started(["js"]));

		expect(state.status).toBe("rewarding");
		expect(state.gatesCleared).toBe(1); // the clear advanced it, nothing else
		expect(state.clearedGate).toBe(0); // and names the gate it beat
		expect(state.storage).toBe(32);
	});

	it("names the badge the clear earned in the log", () => {
		expect(clearGate(started(["js"])).log.at(-1)).toContain(
			"Pallet Swatch earned"
		);
	});

	it("keeps climbing regardless of how much width has auto-widened", () => {
		let state = started(["js"], 3 * SLICE_WINDOW);
		for (let gate = 0; gate < 3; gate++) {
			state = clearGate(state);
			if (state.status === "rewarding")
				state = runReducer(state, { type: "finish-reward" });
		}

		// Width auto-claims itself off coverage alone (ADR-025) and never blocks
		// or requires a clear, so depth just keeps advancing regardless of it.
		expect(state.gatesCleared).toBe(3);
		expect(state.pipeline.slots).toBeGreaterThanOrEqual(BASE_SLOTS);
	});

	it("pays a deeper gate more, so replaying shallow ones is never the ramp", () => {
		let state = clearGate(started(["js"], 2 * SLICE_WINDOW));
		const firstGate = state.gateRewardKb;
		state = runReducer(state, { type: "finish-reward" });
		state = clearGate(state);

		expect(state.gateRewardKb).toBeGreaterThan(firstGate ?? 0);
	});
});

describe("the starting pipeline", () => {
	it("starts with empty slots — nothing is pre-installed", () => {
		expect(configIds(createRun(pool(60), handed))).toEqual([]);
	});

	it("refuses to start until every slot is filled", () => {
		let state = createRun(pool(60), handed);
		state = runReducer(state, { type: "slot", configId: "js" });
		state = runReducer(state, { type: "slot", configId: "eslint" });
		const early = runReducer(state, { type: "start" });
		expect(early.status).toBe("configuring"); // 2 of 3 slots filled
		state = runReducer(state, { type: "slot", configId: "cold-start" });
		state = runReducer(state, { type: "start" });
		expect(state.status).toBe("answering");
	});

	it("unslots any config while configuring — Unit Tests included", () => {
		let state = createRun(pool(60), handed);
		state = runReducer(state, { type: "slot", configId: "unit-tests" });
		state = runReducer(state, { type: "unslot", configId: "unit-tests" });
		expect(configIds(state)).toEqual([]);
	});
});

describe("streak", () => {
	it("counts consecutive correct answers and resets on a wrong one", () => {
		let state = started(["js"]);
		state = answerWith(state, true);
		state = answerWith(state, true);
		expect(state.streak).toBe(2);
		state = answerWith(state, false);
		expect(state.streak).toBe(0);
	});

	it("survives a gate clear — it tracks the run, not the window", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);
		expect(state.window.answered).toBe(0); // window reset on clear
		expect(state.streak).toBe(SLICE_WINDOW); // streak carried over
	});

	it("scales each correct answer's coverage by the streak, applied last", () => {
		let state = started([]); // bare pipeline → base earn of 1 per correct
		state = answerWith(state, true);
		expect(state.answeredThisGate.at(-1)?.coverageEarned).toBe(1.1); // streak 1
		state = answerWith(state, true);
		expect(state.answeredThisGate.at(-1)?.coverageEarned).toBe(1.2); // streak 2
		expect(state.coverage).toBe(2.3); // 1.1 + 1.2
	});

	it("holds the streak (and its bonus) on a partial multi-answer pick", () => {
		const multi: RunPoll = {
			id: "multi",
			category: "react",
			question: "Pick the correct ones",
			answerType: "multiple",
			options: [
				{ id: "m-a", label: "A", correct: true },
				{ id: "m-b", label: "B", correct: true },
				{ id: "m-c", label: "C", correct: false },
			],
		};
		let state: RunState = {
			...createRun([poll("a", true), poll("b", true), multi], handed),
			status: "answering", // bare pipeline on purpose: base earn only
		};
		state = answerWith(state, true); // streak 1
		state = answerWith(state, true); // streak 2
		state = runReducer(state, { type: "answer", optionIds: ["m-a"] }); // partial
		expect(state.answeredThisGate.at(-1)?.outcome).toBe("partial");
		expect(state.streak).toBe(2); // held: not reset, not incremented
		expect(state.answeredThisGate.at(-1)?.coverageEarned).toBe(0.9); // 0.5 share × 1.5 difficulty (3-opt multiple) × 1.2 streak
	});

	it("earns no coverage and zeroes the streak on a wrong answer", () => {
		let state = started([]);
		state = answerWith(state, true); // streak 1
		state = answerWith(state, false);
		expect(state.streak).toBe(0);
		expect(state.answeredThisGate.at(-1)?.coverageEarned).toBe(0);
	});
});

describe("gate base multiplier", () => {
	// base is the correctness score before streak/config amplify it — it isolates
	// the gate factor from the streak bonus every correct answer also carries.
	const baseAt = (gatesCleared: number, correct: boolean): number | undefined =>
		answerWith(
			{ ...started([]), gatesCleared, streak: 0 },
			correct
		).answeredThisGate.at(-1)?.coverageBreakdown?.base;

	it("scales the correctness base by the gate number (gate 1 ×1, gate 2 ×2, …)", () => {
		expect(baseAt(0, true)).toBe(1); // gate 1
		expect(baseAt(1, true)).toBe(2); // gate 2
		expect(baseAt(2, true)).toBe(3); // gate 3
	});

	it("scales a wrong answer's loss by the gate too — risk cuts deeper as you climb", () => {
		expect(baseAt(0, false)).toBe(-0.5); // gate 1: half of the 1 it pays
		expect(baseAt(1, false)).toBe(-1); // gate 2: half of 2
		expect(baseAt(4, false)).toBe(-2.5); // gate 5: half of 5
	});
});

describe("economy", () => {
	it("earns storage from the IndexedDB faucet on correct answers only", () => {
		let state = started(["indexed-db"]);
		state = answerWith(state, true);
		expect(state.storage).toBe(8);
		state = answerWith(state, false);
		expect(state.storage).toBe(8);
	});

	it("lets a gate reward ride over the cap into the shop, forfeiting at climb-on", () => {
		// Overflow is spend-it-or-lose-it (DVTD-0h4n): the clamp waits for
		// "Climb on", so a rich gate buys a shopping spree above the ceiling.
		let state = { ...started(["js"]), storage: STORAGE_CAP_KB - 10 };
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);
		expect(state.storage).toBe(STORAGE_CAP_KB + 22); // 502 + 32, uncapped
		state = runReducer(state, { type: "finish-reward" });
		expect(state.storage).toBe(STORAGE_CAP_KB);
	});

	it("lets faucet income ride over the cap until climb-on", () => {
		let state = { ...started(["indexed-db"]), storage: STORAGE_CAP_KB - 3 };
		state = answerWith(state, true); // faucet pays the full 8KB, uncapped
		expect(state.storage).toBe(STORAGE_CAP_KB + 5);
	});

	it("gates the lint action behind a linter config", () => {
		// JS poll: ESLint covers JS/TS, so the lint action is unlocked; two wrong options remain for the manual lint.
		const triPoll: RunPoll = {
			id: "tri",
			category: "js",
			question: "Pick",
			answerType: "single",
			options: [
				{ id: "a", label: "A", correct: true },
				{ id: "b", label: "B", correct: false },
				{ id: "c", label: "C", correct: false },
				{ id: "d", label: "D", correct: false },
			],
		};
		const withLinter: RunState = {
			...createRun([triPoll], handed),
			status: "answering",
			storage: 100,
			pipeline: { id: "pipeline", slots: 3, configs: [CONFIGS.eslint] },
		};
		const linted = runReducer(withLinter, { type: "lint-poll" });
		expect(linted.storage).toBe(92); // first lint this poll costs 8KB
		expect(linted.manualDisabled).toHaveLength(1);

		const noLinter: RunState = {
			...createRun([triPoll], handed),
			status: "answering",
			storage: 100,
			pipeline: { id: "pipeline", slots: 3, configs: [CONFIGS.js] },
		};
		const unchanged = runReducer(noLinter, { type: "lint-poll" });
		expect(unchanged.storage).toBe(100);
	});

	it("doubles the lint cost with each use in the same poll", () => {
		// Four options (one correct) leave three wrong, so two lints apply in a row.
		const quadPoll: RunPoll = {
			id: "quad",
			category: "js",
			question: "Pick",
			answerType: "single",
			options: [
				{ id: "a", label: "A", correct: true },
				{ id: "b", label: "B", correct: false },
				{ id: "c", label: "C", correct: false },
				{ id: "d", label: "D", correct: false },
			],
		};
		const state: RunState = {
			...createRun([quadPoll], handed),
			status: "answering",
			storage: 100,
			pipeline: { id: "pipeline", slots: 3, configs: [CONFIGS.eslint] },
		};

		const once = runReducer(state, { type: "lint-poll" });
		expect(once.storage).toBe(92); // -8KB
		expect(once.log.at(-1)).toContain("-8KB");

		const twice = runReducer(once, { type: "lint-poll" });
		expect(twice.storage).toBe(76); // -16KB, the escalated price
		expect(twice.log.at(-1)).toContain("-16KB");
		expect(twice.manualDisabled).toHaveLength(2);
	});
});

describe("answer judging", () => {
	const multiPoll = (): RunPoll => ({
		id: "m",
		category: "ts",
		question: "Which are TS utility types?",
		answerType: "multiple",
		options: [
			{ id: "a", label: "Partial", correct: true },
			{ id: "b", label: "Pick", correct: true },
			{ id: "c", label: "Banjo", correct: false },
		],
	});
	const answering = (): RunState => ({
		...createRun([multiPoll(), ...pool(5)], handed),
		status: "answering",
	});

	it("marks multiple-choice correct only for the exact correct set", () => {
		expect(
			runReducer(answering(), { type: "answer", optionIds: ["a", "b"] }).window
				.correct
		).toBe(1);
	});

	it("marks a subset of the correct set wrong", () => {
		expect(
			runReducer(answering(), { type: "answer", optionIds: ["a"] }).window
				.correct
		).toBe(0);
	});

	it("marks the correct set plus a wrong option wrong", () => {
		expect(
			runReducer(answering(), {
				type: "answer",
				optionIds: ["a", "b", "c"],
			}).window.correct
		).toBe(0);
	});

	const outcomeOf = (optionIds: string[]) =>
		runReducer(answering(), { type: "answer", optionIds }).answeredThisGate[0]
			.outcome;

	it("records the exact correct set as a correct outcome", () => {
		expect(outcomeOf(["a", "b"])).toBe("correct");
	});

	it("records a subset of the correct set as partial", () => {
		expect(outcomeOf(["a"])).toBe("partial");
	});

	it("records the correct set plus a wrong option as partial", () => {
		expect(outcomeOf(["a", "b", "c"])).toBe("partial");
	});

	it("records only-wrong picks as a wrong outcome, never partial", () => {
		expect(outcomeOf(["c"])).toBe("wrong");
	});

	it("earns half the coverage for demonstrating half the correct set", () => {
		const partial = runReducer(answering(), {
			type: "answer",
			optionIds: ["a"],
		});
		// 0.5 share × 1.5 difficulty (3-opt multiple) × 1.0 streak = 0.75, rounded to 0.8.
		expect(partial.coverage).toBe(0.8);
		expect(partial.answeredThisGate[0].coverageEarned).toBe(0.8);
	});

	it("pays more coverage for a multiple-choice poll than a single answered fully correct", () => {
		const singlePoll: RunPoll = {
			id: "s",
			category: "ts",
			question: "Which is a TS utility type?",
			answerType: "single",
			options: [
				{ id: "s-a", label: "Partial", correct: true },
				{ id: "s-b", label: "Banjo", correct: false },
				{ id: "s-c", label: "Kazooie", correct: false },
			],
		};
		const single = runReducer(
			{ ...createRun([singlePoll, ...pool(5)], handed), status: "answering" },
			{ type: "answer", optionIds: ["s-a"] }
		);
		const multiple = runReducer(answering(), {
			type: "answer",
			optionIds: ["a", "b"],
		});
		expect(multiple.answeredThisGate[0].coverageEarned ?? 0).toBeGreaterThan(
			single.answeredThisGate[0].coverageEarned ?? 0
		);
	});

	it("cancels a correct pick with a wrong one — nothing earned, loss applied", () => {
		// 1 right + 1 wrong of a 2-correct set → share 0 → the miss penalty bites.
		const cancelled = runReducer(answering(), {
			type: "answer",
			optionIds: ["a", "c"],
		});
		expect(cancelled.coverage).toBe(0);
		expect(cancelled.answeredThisGate[0].coverageEarned).toBe(0);
	});

	// Real pool data holds mismatched polls (DVTD-wrem audit, 2026-07-19):
	// the engine's contract for those shapes is pinned here.
	const shapedPoll = (
		answerType: RunPoll["answerType"],
		correctIds: readonly string[]
	): RunPoll => ({
		id: "shaped",
		category: "ts",
		question: "Which Kanto badge does Blaine hand out?",
		answerType,
		options: ["a", "b", "c"].map((id) => ({
			id,
			label: id,
			correct: correctIds.includes(id),
		})),
	});
	const answerShaped = (
		answerType: RunPoll["answerType"],
		correctIds: readonly string[],
		optionIds: string[]
	) =>
		runReducer(
			{
				...createRun([shapedPoll(answerType, correctIds), ...pool(5)], handed),
				status: "answering",
			},
			{ type: "answer", optionIds }
		);

	it("accepts any one of several correct options on a single-answer poll", () => {
		expect(answerShaped("single", ["a", "b"], ["b"]).window.correct).toBe(1);
	});

	it("demands the exact single option on a one-correct multiple poll — over-picking is partial", () => {
		expect(answerShaped("multiple", ["a"], ["a"]).window.correct).toBe(1);
		const overPicked = answerShaped("multiple", ["a"], ["a", "b"]);
		expect(overPicked.window.correct).toBe(0);
		expect(overPicked.answeredThisGate[0].outcome).toBe("partial");
	});

	it("can never be answered correctly when a poll has zero correct options", () => {
		// Unanswerable data must be filtered at supply — the engine stays strict.
		expect(answerShaped("single", [], ["a"]).window.correct).toBe(0);
		expect(answerShaped("single", [], ["a"]).answeredThisGate[0].outcome).toBe(
			"wrong"
		);
	});

	it("records a missed single-answer poll as wrong, never partial", () => {
		const singleMiss = runReducer(started(["js"]), {
			type: "answer",
			optionIds: ["kazooie-0-b"],
		});
		expect(singleMiss.answeredThisGate[0].outcome).toBe("wrong");
	});

	it("ignores an empty answer", () => {
		const before = answering();
		expect(runReducer(before, { type: "answer", optionIds: [] })).toBe(before);
	});
});

describe("coverage scoring", () => {
	// Priced off what a correct answer pays on THIS build, so stacking coverage
	// multipliers can no longer buy near-immunity to being wrong.
	it("bleeds coverage on a wrong answer, at half of what a right one pays", () => {
		const afterOneCorrect = answerWith(started(["js"]), true);
		expect(afterOneCorrect.coverage).toBe(1.1); // base 1 × streak-1 factor 1.1
		// .js multiplies nothing build-wide, so a correct answer pays 1 and a
		// wrong one costs 0.5.
		expect(answerWith(afterOneCorrect, false).coverage).toBe(0.6); // 1.1 − 0.5
	});

	it("never drags coverage below zero", () => {
		const wrongOnEmpty = answerWith(started(["js"]), false);
		expect(wrongOnEmpty.coverage).toBe(0);
		expect(wrongOnEmpty.coverageByCategory.react ?? 0).toBe(0);
	});

	it("costs nothing to be wrong in a category with no coverage yet", () => {
		// Marciano's bug report (2026-07-19): wrong CSS answer at CSS 0% must
		// not drain the total earned elsewhere — total stays Σ(categories).
		const jsRich: RunState = {
			...started(["js"]),
			coverage: 1,
			coverageByCategory: { js: 1 },
		};
		const wrongInUntouched = answerWith(jsRich, false); // current poll is react, at 0%
		expect(wrongInUntouched.coverage).toBe(1);
		expect(wrongInUntouched.coverageByCategory.js).toBe(1);
		expect(wrongInUntouched.coverageByCategory.react ?? 0).toBe(0);
	});

	it("keeps the total equal to the sum of the categories after a loss", () => {
		const afterOneCorrect = answerWith(started(["js"]), true); // react 1.1
		const thenWrong = answerWith(afterOneCorrect, false); // react 1.1 → 0.8
		expect(thenWrong.coverage).toBe(
			Object.values(thenWrong.coverageByCategory).reduce(
				(sum, pct) => sum + pct,
				0
			)
		);
	});

	it("bleeds the gate meter and the career total in step (ADR-035)", () => {
		// The meter is the gate's score, so the loss hits it too — a bad answer
		// costs the attempt exactly what it costs the run.
		const afterOneCorrect = answerWith(started(["js"]), true);
		const thenWrong = answerWith(afterOneCorrect, false);
		expect(thenWrong.window.coverageGained).toBe(0.6); // 1.1 − 0.5 loss
		expect(thenWrong.coverage).toBe(0.6);
	});
});

describe("storage plan", () => {
	// Gate 0 cleared on the starting build: the shop is open, storage is 32.
	const inShop = (): RunState => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		return state;
	};

	it("starts every run on the free tier", () => {
		const state = createRun(pool(10), handed);
		expect(storagePlanFor(state.storagePlan)).toEqual(STORAGE_PLANS[0]);
	});

	it("reads a pre-plan snapshot as the free tier", () => {
		expect(storagePlanFor(undefined)).toEqual(STORAGE_PLANS[0]);
	});

	it("switches plans in the shop and clamps to the new cap at climb-on", () => {
		let state = runReducer(inShop(), { type: "change-plan", tier: 2 });
		state = { ...state, storage: 700 };
		state = runReducer(state, { type: "finish-reward" });
		expect(state.storage).toBe(640);
	});

	it("refuses a plan change outside the shop", () => {
		const answering = started(["js"]);
		expect(runReducer(answering, { type: "change-plan", tier: 2 })).toBe(
			answering
		);
	});

	it("refuses an unknown tier", () => {
		const shopping = inShop();
		expect(runReducer(shopping, { type: "change-plan", tier: 99 })).toBe(
			shopping
		);
	});

	// The wire carries a bare tier, so the ladder's gate staging (ADR-030) has to
	// hold in the reducer — the shop not drawing the row is not a rule.
	it("refuses a rung the run has not climbed to yet", () => {
		const shopping = inShop(); // one gate cleared
		const deepRung = STORAGE_PLANS.find((plan) => plan.fromGate > 1);
		expect(
			runReducer(shopping, { type: "change-plan", tier: deepRung?.tier ?? 0 })
		).toBe(shopping);
	});

	it("sells that same rung once the run is deep enough", () => {
		const deepRung = STORAGE_PLANS[STORAGE_PLANS.length - 1];
		const deep = { ...inShop(), gatesCleared: deepRung.fromGate };
		const switched = runReducer(deep, {
			type: "change-plan",
			tier: deepRung.tier,
		});
		expect(storagePlanFor(switched.storagePlan).capKb).toBe(deepRung.capKb);
	});

	it("bills a paid plan when a cleared window closes, before the payout lands", () => {
		let state = runReducer(inShop(), { type: "change-plan", tier: 2 });
		state = runReducer(state, { type: "finish-reward" });
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		// Gate 1 pays 32 × 2; the 8KB bill collects from the 32 carried in.
		expect(state.storage).toBe(32 - 8 + 64);
		expect(state.gateBillKb).toBe(8);
	});

	it("bills a failed window too — a missed gate pays the subscription anyway", () => {
		let state = clearGate(started(["unit-tests", "js"]));
		state = runReducer(state, { type: "change-plan", tier: 2 });
		state = runReducer(state, { type: "finish-reward" }); // storage 64
		state = failGate(state);
		expect(state.status).toBe("awaiting-strip");
		expect(state.storage).toBe(64 - 8);
		expect(state.gateBillKb).toBe(8);
	});

	it("auto-downgrades to the free tier when the bill can't be paid", () => {
		let state = runReducer(inShop(), { type: "change-plan", tier: 2 });
		state = runReducer(state, { type: "finish-reward" });
		state = { ...state, storage: 5 };
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(storagePlanFor(state.storagePlan).tier).toBe(1);
		expect(state.planDowngraded).toBe(true);
		// An unpayable bill is never partially collected: 5 rides into the payout.
		expect(state.storage).toBe(5 + 64);
	});

	it("burns storage above the new cap on a voluntary downgrade", () => {
		let state = runReducer(inShop(), { type: "change-plan", tier: 2 });
		state = { ...state, storage: 700 };
		state = runReducer(state, { type: "change-plan", tier: 1 });
		expect(state.storage).toBe(STORAGE_CAP_KB);
		expect(storagePlanFor(state.storagePlan).tier).toBe(1);
	});

	it("keeps billing every retry attempt of the same gate", () => {
		let state = clearGate(started(["unit-tests", "js"]));
		state = runReducer(state, { type: "change-plan", tier: 2 });
		state = runReducer(state, { type: "finish-reward" }); // storage 64
		state = failGate(state);
		expect(state.storage).toBe(64 - 8);
		state = failGate(runReducer(payPeel(state), { type: "finish-reward" }));
		expect(state.storage).toBe(64 - 16); // the second attempt billed too
	});
});

describe("answerOutcome grades the community board and the engine alike", () => {
	const enginePoll = {
		answerType: "multiple",
		options: [
			{ id: "a", correct: true },
			{ id: "b", correct: true },
			{ id: "c", correct: false },
		],
	} as const;

	// The board reads numeric DB ids out of a Set; the engine reads string ids
	// out of an array. Same poll, same picks, expressed in each side's shape.
	const boardPoll = {
		answerType: "multiple",
		options: [
			{ id: 1, correct: true },
			{ id: 2, correct: true },
			{ id: 3, correct: false },
		],
	} as const;

	const cases = [
		{ name: "the exact correct set", engine: ["a", "b"], board: [1, 2] },
		{ name: "half the correct set", engine: ["a"], board: [1] },
		{
			name: "the correct set plus a wrong pick",
			engine: ["a", "b", "c"],
			board: [1, 2, 3],
		},
		{ name: "only wrong picks", engine: ["c"], board: [3] },
	];

	cases.forEach(({ name, engine, board }) => {
		it(`agrees on ${name}`, () => {
			expect(answerOutcome(boardPoll, new Set(board))).toBe(
				answerOutcome(enginePoll, engine)
			);
		});
	});

	it("grades a single-answer poll on the correct pick, not on set equality", () => {
		// Malformed data (two correct options on a single-answer poll) is where the
		// board's old set-equality copy disagreed with the engine and called this wrong.
		const single = {
			answerType: "single",
			options: [
				{ id: 1, correct: true },
				{ id: 2, correct: true },
				{ id: 3, correct: false },
			],
		} as const;
		expect(answerOutcome(single, new Set([1]))).toBe("correct");
	});

	it("never calls a single-answer poll partial", () => {
		const single = {
			answerType: "single",
			options: [
				{ id: "a", correct: true },
				{ id: "b", correct: false },
			],
		} as const;
		expect(answerOutcome(single, ["b"])).toBe("wrong");
	});
});

describe("Moore's Law", () => {
	const held = (state: RunState, storage: number): RunState => ({
		...state,
		storage,
	});
	const maxed = (state: RunState): RunState => ({
		...state,
		pipeline: {
			...state.pipeline,
			configs: state.pipeline.configs.map((config) =>
				config.id === "moores-law" ? { ...config, level: 5 } : config
			),
		},
	});
	const answerWholeWindow = (state: RunState): RunState => {
		let next = state;
		for (let i = 0; i < SLICE_WINDOW; i++) next = answerWith(next, true);
		return next;
	};

	it("pays 2% of the balance on top of the gate reward at L1", () => {
		const state = answerWholeWindow(held(started(["moores-law"]), 128));

		expect(state.status).toBe("rewarding");
		expect(state.interestThisGateKb).toBe(2); // 2% of 128, rounded down
		expect(state.gateRewardKb).toBe(32 + 2);
		expect(state.storage).toBe(128 + 34);
	});

	it("pays five times as much once maxed, on the same balance", () => {
		const state = answerWholeWindow(maxed(held(started(["moores-law"]), 512)));

		expect(state.interestThisGateKb).toBe(51); // 10% at L5
	});

	it("pays interest on any balance — the floor left with the checks (ADR-035)", () => {
		const state = answerWholeWindow(held(started(["moores-law"]), 31));

		expect(state.status).toBe("rewarding");
		expect(state.interestThisGateKb).toBe(0); // 2% of 31 floors to 0KB
	});

	it("upgrades for storage, spending the principal it then demands", () => {
		const shopping: RunState = {
			...held(started(["moores-law"]), 200),
			status: "rewarding",
		};
		const state = runReducer(shopping, {
			type: "upgrade",
			configId: "moores-law",
		});

		expect(state.storage).toBe(200 - 64); // 32KB × the level bought
		expect(
			state.pipeline.configs.find((config) => config.id === "moores-law")?.level
		).toBe(2);
	});

	// The free plan's 512KB cap burns everything above it when the shop closes
	// (ADR-023), so interest on a full balance is shop budget, not principal.
	it("cannot compound on a capped plan — the burn takes the interest back", () => {
		let state = answerWholeWindow(
			maxed(held(started(["moores-law"], 4 * SLICE_WINDOW), 512))
		);
		expect(state.storage).toBe(512 + 51 + 32);

		state = runReducer(state, { type: "finish-reward" });
		expect(state.storage).toBe(512);

		state = answerWholeWindow(state);
		expect(state.interestThisGateKb).toBe(51); // the same tenth, again
	});

	it("compounds once a bigger plan leaves the balance room to grow", () => {
		const onTier2: RunState = {
			...maxed(held(started(["moores-law"], 4 * SLICE_WINDOW), 512)),
			storagePlan: 2, // 640KB cap, billed 8KB a gate
		};
		let state = answerWholeWindow(onTier2);
		const first = state.interestThisGateKb ?? 0;
		state = runReducer(state, { type: "finish-reward" });
		state = answerWholeWindow(state);

		expect(first).toBe(50); // 10% of 504, the balance after the 8KB bill
		expect(state.interestThisGateKb).toBeGreaterThan(first);
	});
});

// Dependabot's merge is announced through `autoUpgradedConfigId` — the run log
// never shows in the live game (roll + pick behaviour lives in
// autoUpgrade.model.spec; here only the announcement's lifetime).
describe("Dependabot's merge announcement", () => {
	it("stays unset when nothing in the pipeline carries the axis", () => {
		const state = clearGate(started(["js"]));
		expect(state.autoUpgradedConfigId).toBeUndefined();
	});

	it("clears when the climb resumes, like the slot celebration", () => {
		const announced: RunState = {
			...clearGate(started(["js"])),
			autoUpgradedConfigId: "js",
		};
		const state = runReducer(announced, { type: "finish-reward" });
		expect(state.autoUpgradedConfigId).toBeUndefined();
	});
});

describe("WTFPL's open shop", () => {
	// A shop with the license on the table, a slot to install into, and enough
	// KB for it plus one paid control — so a refused control is refused by the
	// license, never by the balance. Gate 4 stages lock and extend in.
	const licensed = (): RunState => {
		let state = started(["eslint"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		return {
			...state,
			gatesCleared: 4,
			storage: 600,
			pipeline: { ...state.pipeline, slots: state.pipeline.slots + 1 },
			draftOptions: [CONFIGS.wtfpl, ...state.draftOptions],
		};
	};

	const holding = (): RunState =>
		runReducer(licensed(), { type: "draft", configId: "wtfpl" });

	it("opens this visit's table to the whole catalog the moment it is drafted", () => {
		const state = holding();
		expect(state.storage).toBe(600 - 512);
		expect(state.draftOptions).toHaveLength(
			CONFIG_LIST.length - state.pipeline.configs.length
		);
	});

	it("sells back for nothing — the sale removes it and refunds 0KB", () => {
		const sold = runReducer(holding(), { type: "sell", configId: "wtfpl" });
		expect(configIds(sold)).not.toContain("wtfpl");
		expect(sold.storage).toBe(600 - 512);
	});

	it("zeroes every other sale too while installed — no warranty on anything", () => {
		const sold = runReducer(holding(), { type: "sell", configId: "eslint" });
		expect(configIds(sold)).not.toContain("eslint");
		expect(sold.storage).toBe(600 - 512);
	});

	it("retires the paid shop controls — they sell slices of what the license grants", () => {
		const state = holding();
		expect(runReducer(state, { type: "rebuild-draft" })).toBe(state);
		expect(
			runReducer(state, {
				type: "lock-offer",
				configId: state.draftOptions[0].id,
			})
		).toBe(state);
		expect(runReducer(state, { type: "extend-offers" })).toBe(state);
	});
});

describe("Deprecated's decay", () => {
	const holdingDeprecated = (multiplier: number): RunState => {
		const base = started(["js"]);
		return {
			...base,
			pipeline: {
				...base.pipeline,
				slots: base.pipeline.configs.length + 1,
				configs: [
					...base.pipeline.configs,
					{ ...CONFIGS.deprecated, coverageMultiplier: multiplier },
				],
			},
		};
	};

	const deprecatedIn = (state: RunState) =>
		state.pipeline.configs.find((config) => config.id === "deprecated");

	it("fades ×3 to ×2.5 at the clear — the cleared gate scored at the full ×3", () => {
		const state = clearGate(holdingDeprecated(3));
		expect(deprecatedIn(state)?.coverageMultiplier).toBe(2.5);
		expect(state.deletedConfigs).toBeUndefined();
	});

	it("deletes it at ×1 and announces the deletion — the config is gone, only state can say so", () => {
		const state = clearGate(holdingDeprecated(1.5));
		expect(deprecatedIn(state)).toBeUndefined();
		expect(state.deletedConfigs).toEqual([
			{ ...CONFIGS.deprecated, coverageMultiplier: 1 },
		]);
	});

	it("does not fade on a failed gate — the redo already charges a peel", () => {
		const state = failGate(holdingDeprecated(3));
		expect(state.status).toBe("awaiting-strip");
		expect(deprecatedIn(state)?.coverageMultiplier).toBe(3);
	});

	it("clears the announcement when the climb resumes", () => {
		const announced = clearGate(holdingDeprecated(1.5));
		const state = runReducer(announced, { type: "finish-reward" });
		expect(state.deletedConfigs).toBeUndefined();
	});
});

describe("Freemium's subscription", () => {
	// The opening gate, the only depth a three-config build clears outright — the
	// bill's own ladder is priced in subscription.model.spec.ts, so these tests
	// vary the plan's price rather than the gate, and read the wiring.
	/** A plan no opening clear can cover, so insolvency is reachable at gate 0. */
	const unaffordablePlan: Config = { ...CONFIGS.freemium, subscriptionKb: 512 };

	const subscribed = (
		storage: number,
		plan: Config = CONFIGS.freemium
	): RunState => {
		const base = started(["js"]);
		return {
			...base,
			storage,
			pipeline: {
				...base.pipeline,
				slots: base.pipeline.configs.length + 1,
				configs: [...base.pipeline.configs, plan],
			},
		};
	};

	const freemiumIn = (state: RunState) =>
		state.pipeline.configs.find((config) => config.id === "freemium");

	it("bills 8KB at the first clear and keeps the plan installed", () => {
		const state = clearGate(subscribed(128));
		expect(state.subscriptionBillKb).toBe(8);
		expect(freemiumIn(state)).toBeDefined();
		expect(state.lapsedConfigs).toBeUndefined();
	});

	it("bills after the gate pays, so the clear itself can cover the plan", () => {
		// Nothing in hand walking in: a bill charged before the reward was credited
		// would lapse a plan this very clear paid for.
		const state = clearGate(subscribed(0));
		expect(state.subscriptionBillKb).toBe(8);
		expect(freemiumIn(state)).toBeDefined();
	});

	it("lapses the plan when the clear cannot cover the bill, and frees the slot", () => {
		const state = clearGate(subscribed(0, unaffordablePlan));
		expect(freemiumIn(state)).toBeUndefined();
		expect(state.lapsedConfigs).toHaveLength(1);
		expect(state.subscriptionBillKb).toBe(0);
		expect(state.pipeline.configs).toHaveLength(3);
	});

	it("does not bill a failed gate — the redo already charges a peel", () => {
		const state = failGate(subscribed(256));
		expect(state.status).toBe("awaiting-strip");
		expect(state.storage).toBe(256);
		expect(freemiumIn(state)).toBeDefined();
	});

	it("clears the bill and the lapse notice when the climb resumes", () => {
		const announced = clearGate(subscribed(0, unaffordablePlan));
		const state = runReducer(announced, { type: "finish-reward" });
		expect(state.lapsedConfigs).toBeUndefined();
		expect(state.subscriptionBillKb).toBe(0);
	});

	it("charges half price at the counter while it is installed", () => {
		const cleared = clearGate(subscribed(300));
		const shopping: RunState = {
			...cleared,
			draftOptions: [CONFIGS.agentsMd],
			pipeline: { ...cleared.pipeline, slots: 8 },
		};
		const drafted = runReducer(shopping, {
			type: "draft",
			configId: "agents-md",
		});
		expect(drafted.storage).toBe(shopping.storage - 128);
	});
});
