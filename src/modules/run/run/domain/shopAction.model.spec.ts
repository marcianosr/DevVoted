import { describe, expect, it } from "vitest";

import {
	type Config,
	draftCost,
	slotsOf,
} from "~/modules/run/config/domain/config.model";
import {
	CONFIGS,
	CONFIG_LIST,
} from "~/modules/run/config/domain/configRoster.model";
import {
	EXTEND_FROM_GATE,
	extendCost,
	LOCK_COST_KB,
	MAX_EXTENSIONS,
	offerCount,
} from "~/modules/run/shop/domain/draft.model";
import {
	hasRoomFor,
	occupiedSlots,
	spaceForBuild,
	upkeepForBuild,
} from "~/modules/run/build/domain/build.model";
import {
	BASE_SLOTS,
	PIN_FROM_GATE,
	PIN_UNTIL_GATE,
	SLICE_WINDOW,
	pinCostFor,
	streakMultiplier,
} from "~/modules/run/run/domain/rules.model";
import {
	createRun,
	overflowWeightOf,
	type RunState,
} from "~/modules/run/run/domain/run.model";
import { pinAvailable } from "~/modules/run/run/domain/shopAction.model";
import { runReducer } from "~/modules/run/run/domain/runAction.model";
import type { RunPoll } from "~/modules/run/run/domain/runPoll.model";
import {
	answerWith,
	clearGate,
	configIds,
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
			build: { ...state.build, configs: [CONFIGS.eslint] },
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

	it("counts each sale toward the shop's tally", () => {
		let state = started(["unit-tests", "js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		state = runReducer(state, { type: "sell", configId: "unit-tests" });
		expect(state.soldThisShop).toBe(1);
		state = runReducer(state, { type: "sell", configId: "js" });
		expect(state.soldThisShop).toBe(2);
	});

	it("resets the sale tally when the shop closes", () => {
		let state = rewardingWith("eslint");
		state = runReducer(state, { type: "sell", configId: "eslint" });
		state = runReducer(state, { type: "finish-reward" });
		expect(state.soldThisShop).toBe(0);
	});
});

describe("shop controls (DVTD-5lt6)", () => {
	const shopping = (gatesCleared = 3, storage = 512): RunState => {
		let state = started(["eslint"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		return { ...state, gatesCleared, storage, streak: 50 };
	};

	const lockerShopping = (gatesCleared = 3, storage = 512): RunState => {
		const base = shopping(gatesCleared, storage);
		return {
			...base,
			build: {
				...base.build,
				configs: [...base.build.configs, CONFIGS.yarnLock],
			},
		};
	};

	const offerIds = (state: RunState): string[] =>
		state.draftOptions.map((config) => config.id);

	const firstOffer = (state: RunState): string => state.draftOptions[0].id;

	/**
	 * The offer this build can actually take. Picking `draftOptions[0]` breaks
	 * every time the roster grows and reshuffles the seeded roll onto something
	 * too heavy or too dear for the fixture.
	 */
	const draftableOffer = (state: RunState): string =>
		[...state.draftOptions]
			.sort(
				(left, right) =>
					slotsOf(left) - slotsOf(right) || draftCost(left) - draftCost(right)
			)
			.find(
				(config) =>
					draftCost(config) <= state.storage &&
					hasRoomFor(state.build, slotsOf(config))
			)?.id ?? firstOffer(state);

	const lockFirstOffer = (state: RunState): RunState =>
		runReducer(state, { type: "lock-offer", configId: firstOffer(state) });

	const clearNextGate = (state: RunState): RunState => {
		let cleared = runReducer(state, { type: "finish-reward" });
		for (let i = 0; i < SLICE_WINDOW; i++) cleared = answerWith(cleared, true);
		return cleared;
	};

	describe("lock", () => {
		it("charges the lock and records the held offer", () => {
			const state = lockerShopping(3, 100);
			const held = firstOffer(state);
			const locked = lockFirstOffer(state);
			expect(locked.lockedOfferIds).toEqual([held]);
			expect(locked.storage).toBe(100 - LOCK_COST_KB);
		});

		it("refuses a lock while .lock is not in the build", () => {
			const bare = shopping();
			expect(lockFirstOffer(bare)).toBe(bare);
		});

		it("locks a second offer alongside the first, charging again", () => {
			const one = lockFirstOffer(lockerShopping(3, 100));
			const two = runReducer(one, {
				type: "lock-offer",
				configId: one.draftOptions[1].id,
			});
			expect(two.lockedOfferIds).toHaveLength(2);
			expect(two.storage).toBe(one.storage - LOCK_COST_KB);
		});

		it("holds the offer through a rebuild the player pays for", () => {
			const state = lockFirstOffer(lockerShopping());
			const held = state.lockedOfferIds?.[0];
			const rebuilt = runReducer(state, { type: "rebuild-draft" });
			expect(offerIds(rebuilt)).toContain(held);
			expect(offerIds(rebuilt)[0]).toBe(held);
		});

		it("still offers the held config at the next gate's shop", () => {
			const state = lockFirstOffer(lockerShopping());
			const held = state.lockedOfferIds?.[0];
			const next = clearNextGate(state);
			expect(next.status).toBe("rewarding");
			expect(offerIds(next)).toContain(held);
			expect(next.lockedOfferIds).toEqual([held]);
		});

		it("spends the lock when the held config is installed", () => {
			const roomy = lockerShopping();
			const state = runReducer(roomy, {
				type: "lock-offer",
				configId: draftableOffer(roomy),
			});
			const held = state.lockedOfferIds?.[0] ?? "";
			const installed = runReducer(state, {
				type: "draft",
				configId: held,
			});
			expect(configIds(installed)).toContain(held);
			expect(installed.lockedOfferIds).toEqual([]);
		});

		it("releases a held offer on demand, refunding nothing", () => {
			const state = lockFirstOffer(lockerShopping(3, 100));
			const held = state.lockedOfferIds?.[0] ?? "";
			const released = runReducer(state, {
				type: "unlock-offer",
				configId: held,
			});
			expect(released.lockedOfferIds).toEqual([]);
			expect(released.storage).toBe(100 - LOCK_COST_KB);
		});

		it("ignores a release of an offer that is not held", () => {
			const state = lockerShopping();
			expect(
				runReducer(state, { type: "unlock-offer", configId: firstOffer(state) })
			).toBe(state);
		});

		it("releases every lock when .lock is sold", () => {
			const state = lockFirstOffer(lockerShopping());
			const sold = runReducer(state, { type: "sell", configId: "yarn-lock" });
			expect(configIds(sold)).not.toContain("yarn-lock");
			expect(sold.lockedOfferIds).toEqual([]);
		});

		it("releases every lock when a gate peel strips .lock", () => {
			const locked = lockFirstOffer(lockerShopping());
			const peeling = {
				...locked,
				status: "awaiting-strip" as const,
				peelSlotsRemaining: 1,
			};
			const stripped = runReducer(peeling, {
				type: "strip",
				configIds: ["yarn-lock"],
			});
			expect(configIds(stripped)).not.toContain("yarn-lock");
			expect(stripped.lockedOfferIds).toEqual([]);
		});

		it("refuses a lock the run cannot pay for", () => {
			const broke = lockerShopping(3, LOCK_COST_KB - 1);
			expect(lockFirstOffer(broke)).toBe(broke);
		});

		it("ignores an offer that is not on the table", () => {
			const state = lockerShopping();
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
		let state = lockFirstOffer(lockerShopping());
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
			build: { ...state.build, configs: [CONFIGS.eslint] },
		};
		const blocked = runReducer(oneConfig, { type: "drop", configId: "eslint" });
		expect(blocked).toBe(oneConfig);
	});

	it("ignores drop before the climb starts", () => {
		let state = createRun(pool(60), handed);
		state = runReducer(state, { type: "install", configId: "js" });
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

	it("starts a rescued run at the pinned gate with a stipend, on the free four", () => {
		const state = createRun(pool(20), handed, 7);
		expect(state.gatesCleared).toBe(7);
		expect(state.startedAtGate).toBe(7);
		expect(spaceForBuild(state.build)).toBe(BASE_SLOTS);
		expect(state.storage).toBe(32 * 7);
		expect(state.coverage).toBe(0);
	});

	it("lets a rescued run start without filling every slot it opened with", () => {
		let state = createRun(pool(20), handed, 7);
		for (const configId of ["js", "ts", "css"])
			state = runReducer(state, { type: "install", configId });
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
		expect(spaceForBuild(state.build)).toBe(BASE_SLOTS);
	});
});

/** A flawless window fills the bar and its four streak steps spill into storage. */
const FLAWLESS_OVERFLOW_KB = 13;

describe("economy", () => {
	it("earns storage from the IndexedDB faucet on correct answers only", () => {
		let state = started(["indexed-db"]);
		state = answerWith(state, true);
		expect(state.storage).toBe(8);
		state = answerWith(state, false);
		expect(state.storage).toBe(8);
	});

	it("keeps the whole clear, because nothing caps a balance any more", () => {
		let state = { ...started(["js"]), storage: 2000 };
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);

		expect(state.storage).toBe(
			2000 + 32 * streakMultiplier(SLICE_WINDOW) + FLAWLESS_OVERFLOW_KB
		);
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
			build: { id: "build", configs: [CONFIGS.eslint] },
		};
		const linted = runReducer(withLinter, { type: "lint-poll" });
		expect(linted.storage).toBe(92);
		expect(linted.manualDisabled).toHaveLength(1);

		const noLinter: RunState = {
			...createRun([triPoll], handed),
			status: "answering",
			storage: 100,
			build: { id: "build", configs: [CONFIGS.js] },
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
			build: { id: "build", configs: [CONFIGS.eslint] },
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

describe("build space follows the build (ADR-098)", () => {
	const shopAfter = (gates: number): RunState => {
		let state: RunState = started(["js"], 12 * SLICE_WINDOW);
		for (let gate = 0; gate < gates; gate += 1) {
			state = clearGate(state);
			if (gate < gates - 1)
				state = runReducer(state, { type: "finish-reward" });
		}
		return state;
	};

	it("opens every run on four weight of free room", () => {
		const state = createRun(pool(10), handed);

		expect(spaceForBuild(state.build)).toBe(BASE_SLOTS);
		expect(upkeepForBuild(state.build)).toBe(0);
	});

	const grownBy = (state: RunState, ...configs: Config[]): RunState => ({
		...state,
		build: { ...state.build, configs: [...state.build.configs, ...configs] },
	});

	it("rents the next rung the moment the build grows past the free four", () => {
		const free = shopAfter(1);
		const grown = grownBy(free, CONFIGS.strict);

		expect(spaceForBuild(free.build)).toBe(BASE_SLOTS);
		expect(upkeepForBuild(free.build)).toBe(0);
		expect(spaceForBuild(grown.build)).toBe(6);
		expect(upkeepForBuild(grown.build)).toBe(16);
	});

	it("gives the room back when the build sheds the weight it rented for", () => {
		const grown = grownBy(shopAfter(1), CONFIGS.strict);
		const sold = runReducer(grown, { type: "sell", configId: "strict" });

		expect(spaceForBuild(grown.build)).toBe(6);
		expect(spaceForBuild(sold.build)).toBe(BASE_SLOTS);
		expect(upkeepForBuild(sold.build)).toBe(0);
	});

	it("charges nothing at the counter — the standing bill is the whole price", () => {
		const grown = grownBy({ ...shopAfter(2), storage: 300 }, CONFIGS.strict);

		expect(grown.storage).toBe(300);
		expect(upkeepForBuild(grown.build)).toBe(16);
	});

	it("bills the rung the build sits in at the close", () => {
		const held = grownBy({ ...shopAfter(2), storage: 500 }, CONFIGS.strict);
		const cleared = clearGate(runReducer(held, { type: "finish-reward" }));

		expect(cleared.upkeepBilledKb).toBe(16);
	});

	it("tallies every gate's upkeep, not just the one it last paid", () => {
		const held = grownBy({ ...shopAfter(2), storage: 500 }, CONFIGS.strict);
		const first = clearGate(runReducer(held, { type: "finish-reward" }));
		const second = clearGate(runReducer(first, { type: "finish-reward" }));

		expect(first.upkeepPaidKb).toBe(16);
		expect(second.upkeepPaidKb).toBe(32);
	});

	/**
	 * ADR-082 Decision 4's remedy with the rung derived: the run cannot be
	 * dropped to a cheaper rung, because the rung is its build — so the space the
	 * bill did cover becomes a cap, and the shop door holds it there.
	 */
	it("holds the run to the space its balance covered when the bill outruns it", () => {
		const heavy = grownBy(
			shopAfter(1),
			CONFIGS.agentsMd,
			CONFIGS.wtfpl,
			CONFIGS.dependabot
		);
		const cleared = clearGate({
			...runReducer(heavy, { type: "finish-reward" }),
			storage: 0,
		});

		expect(upkeepForBuild(heavy.build)).toBe(512);
		expect(cleared.upkeepBilledKb).toBe(256);
		expect(cleared.spaceDroppedTo).toBe(24);
		expect(overflowWeightOf(cleared)).toBe(4);
	});

	it("leaves no cap behind when the bill was paid in full", () => {
		const held = grownBy({ ...shopAfter(2), storage: 500 }, CONFIGS.strict);
		const cleared = clearGate(runReducer(held, { type: "finish-reward" }));

		expect(cleared.spaceDroppedTo).toBeUndefined();
		expect(overflowWeightOf(cleared)).toBe(0);
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
			draftOptions: [CONFIGS.wtfpl, ...state.draftOptions],
		};
	};

	const holding = (): RunState =>
		runReducer(licensed(), { type: "draft", configId: "wtfpl" });

	it("opens this visit's table to the whole catalog the moment it is drafted", () => {
		const state = holding();
		expect(state.storage).toBe(600 - 512);
		expect(state.draftOptions).toHaveLength(
			CONFIG_LIST.length - state.build.configs.length
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

	it("retires locking even while .lock is installed", () => {
		const base = holding();
		const state = {
			...base,
			build: {
				...base.build,
				configs: [...base.build.configs, CONFIGS.yarnLock],
			},
		};
		expect(
			runReducer(state, {
				type: "lock-offer",
				configId: state.draftOptions[0].id,
			})
		).toBe(state);
	});
});

describe("upgrade offers in the registry (ADR-053)", () => {
	const shopWith = (configId: string, storage: number): RunState => {
		const state = clearGate(started([configId]));
		return { ...state, storage };
	};

	const offering = (state: RunState, offer: Config): RunState => ({
		...state,
		draftOptions: [offer],
	});

	const levelOf = (state: RunState, configId: string) =>
		state.build.configs.find((config) => config.id === configId)?.level;

	it("levels the installed config instead of taking a second slot", () => {
		const state = offering(shopWith("js", 256), { ...CONFIGS.js, level: 2 });

		const bought = runReducer(state, { type: "draft", configId: "js" });

		expect(bought.build.configs).toHaveLength(state.build.configs.length);
		expect(levelOf(bought, "js")).toBe(2);
		expect(occupiedSlots(bought.build.configs)).toBe(
			occupiedSlots(state.build.configs)
		);
	});

	it("charges the registry price rather than the upgrade panel's", () => {
		const state = offering(shopWith("js", 256), { ...CONFIGS.js, level: 2 });

		const bought = runReducer(state, { type: "draft", configId: "js" });

		expect(state.storage - bought.storage).toBe(draftCost(CONFIGS.js));
	});

	it("swaps in a rolled jump of two rungs at the same registry price (ADR-097)", () => {
		const state = offering(shopWith("js", 256), { ...CONFIGS.js, level: 3 });

		const bought = runReducer(state, { type: "draft", configId: "js" });

		expect(levelOf(bought, "js")).toBe(3);
		expect(state.storage - bought.storage).toBe(draftCost(CONFIGS.js));
		expect(bought.build.configs).toHaveLength(state.build.configs.length);
	});

	it("asks for no category coverage, unlike the shop's Upgrade press", () => {
		const state = offering(shopWith("js", 256), { ...CONFIGS.js, level: 2 });

		expect(
			levelOf(runReducer(state, { type: "upgrade", configId: "js" }), "js")
		).toBeUndefined();
		expect(
			levelOf(runReducer(state, { type: "draft", configId: "js" }), "js")
		).toBe(2);
	});

	it("refuses an upgrade the balance cannot cover", () => {
		const state = offering(shopWith("js", 4), { ...CONFIGS.js, level: 2 });

		expect(runReducer(state, { type: "draft", configId: "js" })).toBe(state);
	});

	it("takes the bought upgrade out of the registry", () => {
		const state = offering(shopWith("js", 256), { ...CONFIGS.js, level: 2 });

		const bought = runReducer(state, { type: "draft", configId: "js" });

		expect(bought.draftOptions).toHaveLength(0);
	});
});

describe("finish-reward and the audit in hand (ADR-119)", () => {
	it("drops an offered audit the player never took, keeps the held one, and frees the repackage", () => {
		const shopping: RunState = {
			...clearGate(started(["js"])),
			heldAudit: { band: "perfect", gate: 0, payload: "not-found" },
			offeredAudit: { band: "healthy", gate: 1 },
			repackagedThisShop: true,
		};
		const climbing = runReducer(shopping, { type: "finish-reward" });
		expect(climbing.status).toBe("answering");
		expect(climbing.heldAudit).toEqual({
			band: "perfect",
			gate: 0,
			payload: "not-found",
		});
		expect(climbing.offeredAudit).toBeUndefined();
		expect(climbing.repackagedThisShop).toBeUndefined();
	});
});
