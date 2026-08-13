import { describe, expect, it } from "vitest";

import type { CategoryCode } from "~/shared/lib/categories";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	EXTEND_FROM_GATE,
	extendCost,
	LOCK_COST_KB,
	LOCK_FROM_GATE,
	MAX_EXTENSIONS,
	offerCount,
} from "~/modules/run/shop/domain/draft.model";
import { checkStatuses } from "~/modules/run/gate/domain/gate.model";
import {
	BASE_SLOTS,
	coverageToAddSlot,
	MAX_SLOTS,
} from "~/modules/run/pipeline/domain/pipeline.model";
import {
	FAUCET_CAP_KB,
	GATE_COUNT,
	isStakeFatal,
	minConfigsForGate,
	SLICE_WINDOW,
	STORAGE_CAP_KB,
	STORAGE_PLANS,
	storagePlanFor,
	VICTORY_GATE,
} from "~/modules/run/run/domain/rules.model";
import { toRunView } from "~/modules/run/run/application/runView.viewmodel";
import {
	answerOutcome,
	createRun,
	isAwaitingTomorrow,
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

// Meets a gate's width demand (ADR-027) by padding the build with reserves
// whose checks all pass on an all-correct react-only pool.
const RESERVES = [
	CONFIGS.coverageGain,
	CONFIGS.coldStart,
	CONFIGS.indexedDb,
	CONFIGS.codeCoverage,
	CONFIGS.agentsMd,
];

const widenedTo = (state: RunState, width: number): RunState => {
	const installedIds = new Set(configIds(state));
	const extras = RESERVES.filter(
		(config) => !installedIds.has(config.id)
	).slice(0, width - state.pipeline.configs.length);
	return {
		...state,
		pipeline: {
			...state.pipeline,
			slots: Math.max(state.pipeline.slots, width),
			configs: [...state.pipeline.configs, ...extras],
		},
	};
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

	it("gates a Focus upgrade on category coverage (not KB)", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true); // react polls → no JS coverage
		expect(state.status).toBe("rewarding");

		state = runReducer(state, { type: "upgrade", configId: "js" }); // needs 5% JS coverage
		expect(state.pipeline.configs[0].level ?? 1).toBe(1); // blocked

		state = { ...state, coverageByCategory: { js: 100 } };
		state = runReducer(state, { type: "upgrade", configId: "js" });
		expect(state.pipeline.configs[0].level).toBe(2); // now allowed, no KB spent
		expect(state.storage).toBe(32); // gate reward untouched by a free upgrade
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
	const shopping = (gatesCleared = 3, storage = 512): RunState => {
		let state = started(["eslint"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		return { ...state, gatesCleared, storage };
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

describe("automatic slot widening (ADR-025)", () => {
	it("does not widen below the coverage threshold", () => {
		let state = { ...started(["js"]), coverage: 2 };
		state = answerWith(state, false); // a miss only ever loses coverage
		expect(state.pipeline.slots).toBe(BASE_SLOTS);
		expect(state.justUnlockedSlots).toEqual([]);
	});

	it("widens automatically once total coverage meets the threshold", () => {
		let state = { ...started(["js"]), coverage: coverageToAddSlot(BASE_SLOTS) };
		state = answerWith(state, true); // a hit never loses coverage
		expect(state.pipeline.slots).toBe(BASE_SLOTS + 1);
		expect(state.justUnlockedSlots).toEqual([BASE_SLOTS + 1]);
	});

	it("holds the hard cap even with abundant coverage", () => {
		const base = started(["js"]);
		let state = {
			...base,
			coverage: 1000,
			pipeline: { ...base.pipeline, slots: MAX_SLOTS },
		};
		state = answerWith(state, true);
		expect(state.pipeline.slots).toBe(MAX_SLOTS);
	});
});

describe("check-configs on one pipeline", () => {
	it("fails when IndexedDB's 3-correct demand is unmet even though Correct passes", () => {
		let state = started(["indexed-db"]);
		for (let i = 0; i < 2; i++) state = answerWith(state, true); // Correct met (2 ≥ 1)
		for (let i = 0; i < 3; i++) state = answerWith(state, false); // 2 < 3 for IndexedDB
		expect(state.status).toBe("awaiting-strip");
	});

	it("passes a Cold Start check when the first answer is correct", () => {
		let state = started(["cold-start"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);
	});

	it("doubles the opening answer's coverage with Cold Start", () => {
		let state = started(["cold-start"]);
		state = answerWith(state, true);
		expect(state.coverage).toBe(2.2); // 1 × opener ×2 × streak 1.1
		state = answerWith(state, true);
		expect(state.coverage).toBe(3.4); // +1.2 — the doubling was opener-only
	});

	it("fails the gate on two consecutive misses with Code Coverage installed", () => {
		let state = started(["code-coverage"]);
		state = answerWith(state, true);
		state = answerWith(state, false);
		state = answerWith(state, false); // the double miss — unrecoverable
		state = answerWith(state, true);
		state = answerWith(state, true); // Correct met (3 ≥ 1), check still failed
		expect(state.status).toBe("awaiting-strip");
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

describe("linter mastery checks", () => {
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
		// ts/css masteries skip on the js-only pool — only ESLint's check judges.
		for (const configId of ["eslint", "ts", "css"])
			state = runReducer(state, { type: "slot", configId });
		state = runReducer(state, { type: "start" });
		return { ...state, storage: 100 };
	};

	it("clears a window that never linted, so the fee is never forced", () => {
		// ADR-022: forcing the lint makes an unaffordable window fatal, which is
		// the trap ADR-031 reversed. Competence is owed; spending is not.
		let state = lintableRun();
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);
	});

	it("charges the fee for a lint but demands nothing back for it", () => {
		let state = lintableRun();
		state = runReducer(state, { type: "lint-poll" });
		expect(state.storage).toBe(92); // -8KB lint fee
		state = answerWith(state, false); // the linted poll still missed
		for (let i = 0; i < 4; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0); // 4 correct js answers satisfy mastery
	});

	it("fails the gate when its category was drawn and nothing was answered right", () => {
		let state = lintableRun();
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, false);
		expect(state.status).toBe("awaiting-strip");
	});

	it("excuses the linter when no poll of its category turns up", () => {
		// The react-only pool never draws JS/TS, so ESLint's check is dormant
		// rather than dodged and a good window still clears. An unlucky draw must
		// never cost a gate; a decision must.
		let state = started(["eslint"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);
	});

	it("reads mastery, not lint usage, on the checklist row", () => {
		let state = lintableRun();
		state = answerWith(state, true);
		const row = checkStatuses(state.pipeline, state.window, 0).find(
			(check) => check.sourceConfigId === "eslint"
		);
		expect(row?.label).toBe("ESLint mastery");
		expect(row?.progress).toBe("1/1");
	});
});

describe("no build owes the gate nothing (ADR-022)", () => {
	// AGENTS.md used to carry no check at all, and on a react-only pool the two
	// linters are never offered a poll of their category. That build's checklist
	// was empty, so it passed vacuously and summited on 0/5 with every swatch.
	const freeloader = (size = GATE_COUNT * SLICE_WINDOW): RunState => {
		let state = createRun(pool(size), [
			CONFIGS.agentsMd,
			CONFIGS.eslint,
			CONFIGS.stylelint,
		]);
		for (const configId of ["agents-md", "eslint", "stylelint"])
			state = runReducer(state, { type: "slot", configId });
		return runReducer(state, { type: "start" });
	};

	it("refuses the clear when the build's one unconditional check is unmet", () => {
		let state = freeloader();
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, false);
		// The linters are excused by the draw; AGENTS.md is the row that judges.
		expect(
			checkStatuses(state.pipeline, state.window, 0).map((check) => [
				check.label,
				check.state,
			])
		).toEqual([
			["AGENTS.md", "failed"],
			["ESLint mastery", "skipped"],
			["Stylelint mastery", "skipped"],
		]);
		expect(state.status).toBe("awaiting-strip");
	});

	it("names the failed check in the log rather than just the gate", () => {
		let state = freeloader();
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, false);
		expect(state.log.at(-1)).toContain("Gate 0 failed: AGENTS.md");
	});

	it("never summits a build that answers nothing", () => {
		let state = freeloader();
		for (let gate = 0; gate < GATE_COUNT; gate++) {
			for (let i = 0; i < SLICE_WINDOW && state.status === "answering"; i++)
				state = answerWith(state, false);
			if (state.status === "rewarding")
				state = runReducer(state, { type: "finish-reward" });
		}
		expect(state.status).not.toBe("won");
		expect(state.gatesCleared).toBe(0);
	});

	it("clears on the single correct answer AGENTS.md asks for", () => {
		// A legendary's 256KB draft price is most of what it costs, so its check
		// is light. Light is not free: it is never excused by the draw.
		let state = freeloader(SLICE_WINDOW);
		state = answerWith(state, true);
		for (let i = 0; i < SLICE_WINDOW - 1; i++) state = answerWith(state, false);
		expect(state.clearedGate).toBe(0);
	});

	it("carries no gate-level correctness floor", () => {
		// Rejected in ADR-022: "get one right" is a config's check, not the gate's
		// rule. Three focus configs, none of their categories drawn, so every row
		// is excused and the gate demands nothing — which is the honest reading of
		// "the gate demands only what your build demands". Not exploitable: the
		// draw cannot be chosen, so this cannot be chained into a climb.
		let state = started(["ts", "css", "js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, false);
		expect(state.clearedGate).toBe(0);
	});

	it("leaves an unlucky focus build alone when it answered well", () => {
		let state = started(["ts", "css", "js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);
	});
});

describe("failure model", () => {
	it("demands a strip when a stocked pipeline misses", () => {
		let state = started(["unit-tests"]); // misses Unit Tests' correct demand
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, false);
		expect(state.status).toBe("awaiting-strip");
		expect(state.stripsRemaining).toBe(1);
	});

	it("holds after the drop quota is peeled until the player climbs on", () => {
		let state = started(["unit-tests", "eslint"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, false);
		state = runReducer(state, { type: "strip", configId: "eslint" });
		expect(state.status).toBe("awaiting-strip");
		expect(state.stripsRemaining).toBe(0);
		state = runReducer(state, { type: "resume-climb" });
		expect(state.status).toBe("answering");
		expect(configIds(state)).not.toContain("eslint");
		expect(state.pipeline.configs).toHaveLength(2);
	});

	it("ignores a strip once the quota is met", () => {
		let state = started(["unit-tests", "eslint"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, false);
		expect(state.status).toBe("awaiting-strip");
		state = runReducer(state, { type: "strip", configId: "eslint" });
		const afterQuota = runReducer(state, {
			type: "strip",
			configId: "ts",
		});
		expect(afterQuota).toBe(state);
	});

	it("ends the run when the peel quota takes the whole build", () => {
		// Gate 4 owes 3 peels (dropCount) and the starting build holds exactly 3.
		let state = { ...started(["unit-tests"]), gatesCleared: 4 };
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, false);
		expect(state.status).toBe("dead");
		expect(state.pipeline.configs).toHaveLength(3); // the run ends instead of peeling
	});

	it("leaves a config standing whenever the build outholds the quota", () => {
		let state = started(["unit-tests"]);
		state = {
			...state,
			gatesCleared: 4, // owes 3 peels
			pipeline: {
				...state.pipeline,
				slots: 4,
				configs: [...state.pipeline.configs, CONFIGS.coverageGain],
			},
		};
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, false);
		expect(state.status).toBe("awaiting-strip");
		expect(state.stripsRemaining).toBe(3);
		expect(state.stripsRemaining).toBeLessThan(state.pipeline.configs.length);
	});

	it("ends the run when a peel emptied the build instead of climbing on", () => {
		// Reachable only from a pre-ADR-021 snapshot, whose quota was capped at
		// what the build held; the guard keeps a bare build from ever climbing.
		let state = started(["unit-tests", "eslint"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, false);
		expect(state.status).toBe("awaiting-strip");
		// The post-peel state a legacy quota left behind: nothing owed, nothing held.
		state = {
			...state,
			stripsRemaining: 0,
			pipeline: { ...state.pipeline, configs: [] },
		};
		state = runReducer(state, { type: "resume-climb" });
		expect(state.status).toBe("dead");
	});

	// The receipt is the only warning a player gets before sudden death
	// (ADR-017), so what it predicts and what closeWindow does must not drift.
	it.each([0, 2, 4, 6, 8])(
		"kills the run at gate %i exactly when the receipt predicted it",
		(gate) => {
			const before = { ...started(["unit-tests"]), gatesCleared: gate };
			const view = toRunView(before);
			const receiptSaysFatal = isStakeFatal(
				view.stripsOnFailure,
				view.configs.length
			);

			let after = before;
			for (let i = 0; i < SLICE_WINDOW; i++) after = answerWith(after, false);

			expect(after.status === "dead").toBe(receiptSaysFatal);
		}
	);

	it("ends the run when a bare pipeline misses", () => {
		// Bareness is unreachable since ADR-021 — this guards runs snapshotted
		// before it, which can still resume with an emptied pipeline.
		let state = started(["js"]);
		state = { ...state, pipeline: { ...state.pipeline, configs: [] } };
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, false);
		expect(state.status).toBe("dead");
	});
});

describe("the gate's width demand (ADR-027) and the shop exit it blocks (ADR-031)", () => {
	// A shop standing before gate 4 (demand: 4 configs) on the starting three —
	// one config short, the state only a strip can produce for real.
	const shopBeforeGate4 = (): RunState => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		return { ...state, gatesCleared: 4 };
	};

	// The same shop with a free slot to install into — the repairable shape.
	const repairableShop = (): RunState => {
		const state = shopBeforeGate4();
		return { ...state, pipeline: { ...state.pipeline, slots: 4 } };
	};

	it("blocks the exit while an offer on the table is affordable", () => {
		const state = { ...repairableShop(), storage: 1000 };
		const blocked = runReducer(state, { type: "finish-reward" });
		expect(blocked).toBe(state);
	});

	it("blocks the exit while a rebuild could still surface an affordable offer", () => {
		const expensive = { ...CONFIGS.coverageGain, draftCost: 999 };
		const state = {
			...repairableShop(),
			storage: 36, // rebuildCost(0) 4KB + the cheapest possible draft 32KB
			draftOptions: [expensive],
		};
		const blocked = runReducer(state, { type: "finish-reward" });
		expect(blocked).toBe(state);
	});

	it("ends the run on the dead-end click once no repair can exist", () => {
		const expensive = { ...CONFIGS.coverageGain, draftCost: 999 };
		const state = {
			...repairableShop(),
			storage: 35, // one under the rebuild-plus-cheapest-draft bound
			draftOptions: [expensive],
		};
		const dead = runReducer(state, { type: "finish-reward" });
		expect(dead.status).toBe("dead");
		expect(dead.log.at(-1)).toBe(
			"Gate 4 demands 4 configs — the build holds 3 and the shop can't get it there. Run over."
		);
	});

	it("ends the run on the dead-end click when the demand outgrows the slots", () => {
		// 3 slots, 3 configs, demand 4: no storage can buy a slot, so the shop
		// cannot repair this build no matter how rich the run is.
		const state = { ...shopBeforeGate4(), storage: 1000 };
		const dead = runReducer(state, { type: "finish-reward" });
		expect(dead.status).toBe("dead");
	});

	it("admits a build that meets the demand exactly", () => {
		const state = runReducer(widenedTo(shopBeforeGate4(), 4), {
			type: "finish-reward",
		});
		expect(state.status).toBe("answering");
	});

	it("refuses the sell that would sink the build under the coming gate's demand", () => {
		const atDemand = widenedTo(shopBeforeGate4(), 4);
		const blocked = runReducer(atDemand, { type: "sell", configId: "js" });
		expect(blocked).toBe(atDemand);
	});

	it("still sells while the build is wider than the demand", () => {
		const above = widenedTo(shopBeforeGate4(), 5);
		const sold = runReducer(above, { type: "sell", configId: "js" });
		expect(sold.pipeline.configs).toHaveLength(4);
	});

	it("refuses the doorstep drop that would sink the build under the gate's demand", () => {
		let state = widenedTo(shopBeforeGate4(), 4);
		state = runReducer(state, { type: "finish-reward" });
		expect(state.status).toBe("answering");
		const blocked = runReducer(state, { type: "drop", configId: "js" });
		expect(blocked).toBe(state);
	});

	it("refuses any drop once the window has opened — a failing check cannot be shed mid-gate", () => {
		let state = widenedTo(shopBeforeGate4(), 5);
		state = runReducer(state, { type: "finish-reward" });
		state = answerWith(state, true);
		const blocked = runReducer(state, { type: "drop", configId: "js" });
		expect(blocked).toBe(state);
	});

	it("exempts the replay: a strip may sink the build under the demand, the next shop holds it", () => {
		let state = widenedTo(shopBeforeGate4(), 4); // js, ts, css, coverage-gain
		state = runReducer(state, { type: "finish-reward" });
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, false);
		expect(state.status).toBe("awaiting-strip"); // quota 3 < 4 installed

		for (const configId of ["js", "ts", "css"])
			state = runReducer(state, { type: "strip", configId });
		state = runReducer(state, { type: "resume-climb" });
		expect(state.status).toBe("answering"); // 1 config replays gate 4 legally

		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.status).toBe("rewarding"); // the replay cleared

		// The cheese DVTD-kokk stays closed, without the trap: the unrepaired
		// 1-config build cannot cruise past gate 5 on a one-line checklist —
		// its exit is blocked until the shop gets it back to the demand.
		const held = { ...state, storage: 1000 };
		expect(runReducer(held, { type: "finish-reward" })).toBe(held);
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

	it("locks after the strip repair when the day ends on a failed gate", () => {
		let state = started(["unit-tests"], SLICE_WINDOW);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, false);
		expect(state.status).toBe("awaiting-strip");
		state = runReducer(state, { type: "strip", configId: "unit-tests" });
		state = runReducer(state, { type: "resume-climb" });
		expect(state.status).toBe("answering");
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
	it("wins by clearing every gate, widening to meet each gate's demand", () => {
		// Depth is still paid for in checks (ADR-019), but a gate only admits a
		// build wide enough to survive its own stake (ADR-027) — the summit
		// demands 8 configs, so the starting three cannot carry a whole climb.
		let state = started(["js"], GATE_COUNT * SLICE_WINDOW);
		for (let gate = 0; gate < GATE_COUNT; gate++) {
			for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
			if (state.status === "rewarding") {
				state = widenedTo(state, minConfigsForGate(state.gatesCleared));
				state = runReducer(state, { type: "finish-reward" });
			}
		}
		expect(state.status).toBe("won");
		expect(state.clearedGate).toBe(VICTORY_GATE); // the last gate's number
		expect(state.gatesCleared).toBe(GATE_COUNT); // every gate banked
	});
});

describe("depth and width are independent (ADR-019)", () => {
	const clearGate = (state: RunState): RunState => {
		let next = state;
		for (let i = 0; i < SLICE_WINDOW; i++) next = answerWith(next, true);
		return next;
	};

	// Coverage far past every rung, so add-slot is never the blocker.
	const funded = (state: RunState): RunState => ({
		...state,
		coverage: 10_000,
	});

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

	it("widens automatically as width only, leaving the gate where it was", () => {
		let state = funded(started(["js"]));
		const before = state.gatesCleared;
		state = answerWith(state, true);

		// Coverage this abundant clears every rung on the ladder in one go.
		expect(state.pipeline.slots).toBe(MAX_SLOTS);
		expect(state.gatesCleared).toBe(before); // buying width buys no depth
	});

	it("leaves the slot ladder free to outlast the gate ladder", () => {
		// Nothing ties the two any more, so the ladder ends where tuning says.
		expect(coverageToAddSlot(MAX_SLOTS - 1)).toBeLessThan(Infinity);
		expect(coverageToAddSlot(MAX_SLOTS)).toBe(Infinity);
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
		expect(baseAt(0, false)).toBe(-0.5); // gate 1: -0.5 × 1
		expect(baseAt(1, false)).toBe(-1); // gate 2: -0.5 × 2
		expect(baseAt(4, false)).toBe(-2.5); // gate 5: -0.5 × 5
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
	it("bleeds coverage on a wrong answer, scaled by the reward multiplier", () => {
		const afterOneCorrect = answerWith(started(["js"]), true);
		expect(afterOneCorrect.coverage).toBe(1.1); // base 1 × streak-1 factor 1.1
		// Base pipeline multiplier is 1 → loss is the raw WRONG_COVERAGE_LOSS.
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
		const afterOneCorrect = answerWith(started(["js"]), true); // react 1
		const thenWrong = answerWith(afterOneCorrect, false); // react 1 → 0.5
		expect(thenWrong.coverage).toBe(
			Object.values(thenWrong.coverageByCategory).reduce(
				(sum, pct) => sum + pct,
				0
			)
		);
	});

	it("keeps the gate's coverage-gained tally gains-only", () => {
		// The coverage-gain check judges what you earned; the loss hits the
		// run's totals, not the gate window — no double punishment.
		const afterOneCorrect = answerWith(started(["js"]), true);
		const thenWrong = answerWith(afterOneCorrect, false);
		expect(thenWrong.window.coverageGained).toBe(1.1); // streak-1 earn, gains only
		expect(thenWrong.coverage).toBe(0.6); // 1.1 − 0.5 loss
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

	it("bills a failed window too — the subscription has teeth", () => {
		let state = started(["unit-tests", "js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		state = runReducer(state, { type: "change-plan", tier: 2 });
		state = runReducer(state, { type: "finish-reward" }); // storage 64
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, false);
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

	it("clears the bill report fields when the climb resumes after a strip", () => {
		let state = started(["unit-tests", "js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		state = runReducer(state, { type: "change-plan", tier: 2 });
		state = runReducer(state, { type: "finish-reward" });
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, false);
		state = runReducer(state, { type: "strip", configId: "unit-tests" });
		state = runReducer(state, { type: "resume-climb" });
		expect(state.gateBillKb).toBe(0);
		expect(state.planDowngraded).toBe(false);
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
