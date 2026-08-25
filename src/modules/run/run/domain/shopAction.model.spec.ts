import { describe, expect, it } from "vitest";

import {
	CONFIGS,
	CONFIG_LIST,
} from "~/modules/run/config/domain/configRoster.model";
import {
	EXTEND_FROM_GATE,
	extendCost,
	LOCK_COST_KB,
	LOCK_FROM_GATE,
	MAX_EXTENSIONS,
	offerCount,
} from "~/modules/run/shop/domain/draft.model";
import { BASE_SLOTS } from "~/modules/run/pipeline/domain/pipeline.model";
import {
	PIN_FROM_GATE,
	PIN_UNTIL_GATE,
	pinCostFor,
	SLICE_WINDOW,
	STORAGE_CAP_KB,
	STORAGE_PLANS,
	storagePlanFor,
} from "~/modules/run/run/domain/rules.model";
import { createRun, type RunState } from "~/modules/run/run/domain/run.model";
import { pinAvailable } from "~/modules/run/run/domain/shopAction.model";
import { runReducer } from "~/modules/run/run/domain/runAction.model";
import type { RunPoll } from "~/modules/run/run/domain/runPoll.model";
import {
	answerWith,
	clearGate,
	configIds,
	failGate,
	handed,
	payPeel,
	pool,
	started,
} from "~/modules/run/run/domain/run.factory";

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
