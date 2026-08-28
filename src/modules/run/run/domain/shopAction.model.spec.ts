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
import {
	BASE_SPOTS,
	occupiedSpots,
} from "~/modules/run/pipeline/domain/pipeline.model";
import {
	PIN_FROM_GATE,
	PIN_UNTIL_GATE,
	pinCostFor,
	extraRentKb,
	SLICE_WINDOW,
	spotsHeldWith,
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
		expect(state.storage).toBe(16);
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
		expect(blocked).toBe(oneConfig);
	});

	it("sells Unit Tests like any other config — nothing is locked anymore", () => {
		let state = started(["unit-tests", "js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		state = { ...state, storage: 0 };
		state = runReducer(state, { type: "sell", configId: "unit-tests" });
		expect(configIds(state)).not.toContain("unit-tests");
		expect(state.storage).toBe(16);
	});
});

describe("shop controls (DVTD-5lt6)", () => {
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
			const state = {
				...shop,
				pipeline: { ...shop.pipeline, spots: shop.pipeline.spots + 1 },
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
		expect(state.storage).toBe(0);
	});

	it("refuses to drop the only installed config while answering", () => {
		const state = started(["eslint"]);
		const oneConfig = {
			...state,
			pipeline: { ...state.pipeline, configs: [CONFIGS.eslint] },
		};
		const blocked = runReducer(oneConfig, { type: "drop", configId: "eslint" });
		expect(blocked).toBe(oneConfig);
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
		expect(again).toBe(deeper);
		expect(again.pinPlantedAtGate).toBe(4);
	});

	it("starts a rescued run at the pinned gate with a stipend, on the free rung", () => {
		const state = createRun(pool(20), handed, 7);
		expect(state.gatesCleared).toBe(7);
		expect(state.startedAtGate).toBe(7);
		expect(state.pipeline.spots).toBe(spotsHeldWith(7));
		expect(state.storage).toBe(32 * 7);
		expect(state.coverage).toBe(0);
	});

	it("lets a rescued run start without filling every spot it opened with", () => {
		let state = createRun(pool(20), handed, 7);
		for (const configId of ["js", "ts", "css"])
			state = runReducer(state, { type: "slot", configId });
		state = runReducer(state, { type: "start" });
		expect(state.status).toBe("answering");
	});

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
		expect(state.pipeline.spots).toBe(BASE_SPOTS);
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

	it("keeps every KB a gate pays, however rich the run gets", () => {
		let state = { ...started(["js"]), storage: 2000 };
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.storage).toBe(2032);

		state = runReducer(state, { type: "finish-reward" });
		expect(state.storage).toBe(2032);
	});

	it("gates the lint action behind a linter config", () => {
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
			pipeline: { id: "pipeline", spots: 3, configs: [CONFIGS.eslint] },
		};
		const linted = runReducer(withLinter, { type: "lint-poll" });
		expect(linted.storage).toBe(92);
		expect(linted.manualDisabled).toHaveLength(1);

		const noLinter: RunState = {
			...createRun([triPoll], handed),
			status: "answering",
			storage: 100,
			pipeline: { id: "pipeline", spots: 3, configs: [CONFIGS.js] },
		};
		const unchanged = runReducer(noLinter, { type: "lint-poll" });
		expect(unchanged.storage).toBe(100);
	});

	it("doubles the lint cost with each use in the same poll", () => {
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
			pipeline: { id: "pipeline", spots: 3, configs: [CONFIGS.eslint] },
		};

		const once = runReducer(state, { type: "lint-poll" });
		expect(once.storage).toBe(92);
		expect(once.log.at(-1)).toContain("-8KB");

		const twice = runReducer(once, { type: "lint-poll" });
		expect(twice.storage).toBe(76);
		expect(twice.log.at(-1)).toContain("-16KB");
		expect(twice.manualDisabled).toHaveLength(2);
	});
});

describe("extra spots in the shop (ADR-045)", () => {
	const inShop = (): RunState => clearGate(started(["js"], 12 * SLICE_WINDOW));

	const afterTwoClears = (): RunState => {
		let state = inShop();
		state = runReducer(state, { type: "finish-reward" });
		return clearGate(state);
	};

	const afterThreeClears = (): RunState => {
		let state = afterTwoClears();
		state = runReducer(state, { type: "finish-reward" });
		return clearGate(state);
	};

	it("opens every run on four spots, before it clears anything", () => {
		const state = createRun(pool(10), handed);
		expect(state.pipeline.spots).toBe(4);
		expect(state.extraSpots).toBeUndefined();
	});

	it("widens on the clear that crosses a rung's gate, paying nothing", () => {
		const state = clearGate(started(["js"], 4 * SLICE_WINDOW));
		expect(state.gatesCleared).toBe(1);
		expect(state.pipeline.spots).toBe(4);

		const wider = clearGate(runReducer(state, { type: "finish-reward" }));
		expect(wider.gatesCleared).toBe(2);
		expect(wider.pipeline.spots).toBe(8);
	});

	it("rents a step on top of the free width, charging nothing at the counter", () => {
		const state = { ...inShop(), storage: 200 };
		const rented = runReducer(state, { type: "set-extra-spots", spots: 1 });

		expect(rented.pipeline.spots).toBe(5);
		expect(rented.extraSpots).toBe(1);
		expect(rented.storage).toBe(200);
	});

	it("refuses a step this depth does not sell yet", () => {
		const state = { ...inShop(), storage: 5000 };
		expect(runReducer(state, { type: "set-extra-spots", spots: 2 })).toEqual(
			state
		);
		expect(runReducer(state, { type: "set-extra-spots", spots: 4 })).toEqual(
			state
		);
	});

	it("sells the deeper steps once the clears are in", () => {
		const state = { ...afterThreeClears(), gatesCleared: 6, storage: 500 };
		const rented = runReducer(state, { type: "set-extra-spots", spots: 3 });

		expect(rented.extraSpots).toBe(3);
		expect(extraRentKb(3)).toBe(24);
	});

	it("refuses a step whose rent the balance cannot cover", () => {
		const state = { ...inShop(), storage: 7 };
		expect(runReducer(state, { type: "set-extra-spots", spots: 1 })).toEqual(
			state
		);
	});

	it("drops back to none, cancelling the rent", () => {
		let state: RunState = { ...inShop(), storage: 200 };
		state = runReducer(state, { type: "set-extra-spots", spots: 1 });
		state = runReducer(state, { type: "set-extra-spots", spots: 0 });

		expect(state.extraSpots).toBe(0);
		expect(state.pipeline.spots).toBe(4);
	});

	it("bills the rent at the next clear, and again at the one after", () => {
		let state: RunState = { ...inShop(), storage: 200 };
		state = runReducer(state, { type: "set-extra-spots", spots: 1 });
		state = runReducer(state, { type: "finish-reward" });
		const cleared = clearGate(state);

		expect(cleared.spotRentKb).toBe(8);
		expect(cleared.extraSpots).toBe(1);
		expect(cleared.rentDefaulted).toBeUndefined();

		expect(cleared.pipeline.spots).toBe(9);
		const again = clearGate(runReducer(cleared, { type: "finish-reward" }));
		expect(again.spotRentKb).toBe(8);
	});

	it("reaches the top step once the ladder is fully open", () => {
		let state: RunState = {
			...afterTwoClears(),
			gatesCleared: 9,
			storage: 500,
		};
		state = runReducer(state, { type: "set-extra-spots", spots: 4 });

		expect(state.pipeline.spots).toBe(20);
		expect(extraRentKb(4)).toBe(32);
	});

	it("bills the whole step it stands on, and keeps billing it", () => {
		let state: RunState = { ...afterThreeClears(), storage: 500 };
		state = runReducer(state, { type: "set-extra-spots", spots: 2 });
		state = runReducer(state, { type: "finish-reward" });

		const cleared = clearGate(state);

		expect(cleared.spotRentKb).toBe(extraRentKb(2));
		expect(cleared.extraSpots).toBe(2);
	});

	it("keeps its scheduled width through a miss with an empty balance", () => {
		let state = { ...afterTwoClears(), storage: 0 };
		state = runReducer(state, { type: "finish-reward" });
		state = failGate(state);

		expect(state.pipeline.spots).toBe(8);
		expect(state.storage).toBe(0);
	});
});

describe("WTFPL's open shop", () => {
	const licensed = (): RunState => {
		let state = started(["eslint"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		return {
			...state,
			gatesCleared: 4,
			storage: 600,
			pipeline: {
				...state.pipeline,
				spots: occupiedSpots(state.pipeline.configs) + 8,
			},
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
