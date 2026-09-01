import { describe, expect, it } from "vitest";

import { createRun, type RunState } from "~/modules/run/run/domain/run.model";
import { runReducer } from "~/modules/run/run/domain/runAction.model";
import { RunPoll } from "~/modules/run/run/domain/runPoll.model";
import {
	occupiedSlots,
	perAnswerPreviewFor,
	buildModifiersFor,
} from "~/modules/run/build/domain/build.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	failPeelQuotaFor,
	peelShareFor,
} from "~/modules/run/gate/domain/gate.model";
import { billLedger } from "~/modules/run/config/domain/subscription.model";
import {
	type Config,
	draftCost,
} from "~/modules/run/config/domain/config.model";
import {
	EXTEND_FROM_GATE,
	extendCost,
	LOCK_FROM_GATE,
	MAX_EXTENSIONS,
} from "~/modules/run/shop/domain/draft.model";
import {
	BASE_SLOTS,
	MAX_SLOTS,
	SLICE_WINDOW,
	coverageDemandFor,
} from "~/modules/run/run/domain/rules.model";
import { toRunView } from "~/modules/run/run/application/runView.viewmodel";
import {
	correctOptionIdsFor,
	latestAnswerScore,
} from "~/modules/run/run/application/answerScore.viewmodel";

const poll = (id: string): RunPoll => ({
	id,
	category: "react",
	question: `${id}?`,
	answerType: "single",
	options: [
		{ id: `${id}-a`, label: "Yes", correct: true },
		{ id: `${id}-b`, label: "No", correct: false },
	],
});

const answering = () => ({
	...createRun([poll("q0"), poll("q1")], [CONFIGS.js]),
	status: "answering" as const,
});

const answeringWith = (configs: Config[]) => {
	const created = createRun([poll("q0"), poll("q1")], configs);
	let state: RunState = {
		...created,
		build: { ...created.build, slots: occupiedSlots(configs) },
	};
	for (const config of configs)
		state = runReducer(state, { type: "install", configId: config.id });
	return { ...state, status: "answering" as const };
};

describe("toRunView", () => {
	it("redacts option correctness from the current poll", () => {
		const view = toRunView(answering());
		expect(view.poll).not.toBeNull();
		for (const option of view.poll!.options) {
			expect("correct" in option).toBe(false);
		}
	});

	it("exposes only the current poll, never the upcoming ones", () => {
		expect(toRunView(answering()).poll?.id).toBe("q0");
	});

	it("reveals the dealt polls' categories only to a build holding Prefetch", () => {
		expect(toRunView(answering()).upcomingCategories).toBeNull();
		expect(toRunView(answering()).nextGateCategories).toBeNull();
		expect(
			toRunView(answeringWith([CONFIGS.prefetch])).upcomingCategories
		).toEqual(["react", "react"]);
	});

	it("caps Prefetch's reveal at this window and the next", () => {
		const pool = Array.from({ length: 12 }, (_, index) => poll(`q${index}`));
		const state = {
			...createRun(pool, [CONFIGS.prefetch]),
			status: "answering" as const,
			build: {
				...createRun(pool, [CONFIGS.prefetch]).build,
				configs: [CONFIGS.prefetch],
			},
		};
		const view = toRunView(state);
		expect(view.upcomingCategories).toHaveLength(5);
		expect(view.nextGateCategories).toHaveLength(5);
	});

	it("hides the poll when not answering", () => {
		const view = toRunView(createRun([poll("q0")], [CONFIGS.js]));
		expect(view.status).toBe("configuring");
		expect(view.poll).toBeNull();
	});

	it("derives everything the wired client needs without touching RunState", () => {
		const view = toRunView(answering());
		expect(view.disabledOptionIds).toEqual([]);
		expect(view.paidActions.lintCost).toBeGreaterThan(0);
		expect(view.shopControls.rebuildCost).toBeGreaterThan(0);
		expect(view.shopControls.canRebuild).toBe(false);
	});

	it("prices the peek and marks the poll once it is bought", () => {
		const installed = {
			...answeringWith([CONFIGS.telemetry]),
			storage: 200,
		};
		const offered = toRunView(installed);
		expect(offered.paidActions.canPeek).toBe(true);
		expect(offered.paidActions.peekReady).toBe(true);
		expect(offered.paidActions.peekCost).toBe(32);
		expect(offered.paidActions.peeker?.id).toBe("telemetry");
		expect(offered.currentPollPeeked).toBe(false);

		const bought = toRunView(runReducer(installed, { type: "peek-poll" }));
		expect(bought.currentPollPeeked).toBe(true);
		expect(bought.paidActions.canPeek).toBe(false);
		expect(bought.paidActions.peekCost).toBe(64);
	});

	it("offers no peek to a build without the config, and none it cannot afford", () => {
		const without = toRunView(answeringWith([CONFIGS.js]));
		expect(without.paidActions.canPeek).toBe(false);
		expect(without.paidActions.peeker).toBeNull();

		const broke = toRunView(answeringWith([CONFIGS.telemetry]));
		expect(broke.paidActions.canPeek).toBe(true);
		expect(broke.paidActions.peekReady).toBe(false);
	});

	it("surfaces the gate stats a screen needs", () => {
		const view = toRunView(answeringWith([CONFIGS.js]));
		expect(view.pollsPerGate).toBe(5);
		expect(view.victoryGate).toBeGreaterThan(0);
	});

	it("flags a one-config build so sell and drop refuse (ADR-035)", () => {
		expect(toRunView(answeringWith([CONFIGS.js])).atMinimumWidth).toBe(true);
		expect(
			toRunView(answeringWith([CONFIGS.js, CONFIGS.eslint])).atMinimumWidth
		).toBe(false);
	});

	it("keeps awaitingTomorrow off while a poll is on deck", () => {
		expect(toRunView(answering()).awaitingTomorrow).toBe(false);
	});

	it("raises awaitingTomorrow when answering with the day's polls exhausted", () => {
		const exhausted = { ...answering(), currentIndex: 2 };
		const view = toRunView(exhausted);
		expect(view.awaitingTomorrow).toBe(true);
		expect(view.poll).toBeNull();
	});

	it("keeps awaitingTomorrow off outside the answering status", () => {
		const configuring = createRun([], [CONFIGS.js]);
		expect(toRunView(configuring).awaitingTomorrow).toBe(false);
	});

	it("names the gate a clear beat, one behind the count it advanced", () => {
		const cleared = { ...answering(), gatesCleared: 3, clearedGate: 2 };
		expect(toRunView(cleared).gatePayout.clearedGateNumber).toBe(2);
	});

	it("falls back to gatesCleared for snapshots without clearedGate", () => {
		expect(
			toRunView({ ...answering(), gatesCleared: 2 }).gatePayout
				.clearedGateNumber
		).toBe(2);
	});

	it("themes the run after the gate being played", () => {
		expect(toRunView(answering()).gateTheme).toBe("pallet");
		expect(toRunView({ ...answering(), gatesCleared: 11 }).gateTheme).toBe(
			"elite"
		);
		expect(toRunView({ ...answering(), gatesCleared: 12 }).gateTheme).toBe(
			"champion"
		);
	});

	it("hides the poll's category at the 404 gate and nowhere else", () => {
		expect(toRunView({ ...answering(), gatesCleared: 5 }).categoryHidden).toBe(
			true
		);
		expect(toRunView({ ...answering(), gatesCleared: 4 }).categoryHidden).toBe(
			false
		);
	});

	it("drops the gate theme once the last gate is beaten", () => {
		expect(
			toRunView({ ...answering(), gatesCleared: 13 }).gateTheme
		).toBeUndefined();
	});
});

describe("shop controls (DVTD-5lt6)", () => {
	const shopping = (gatesCleared: number, storage: number) => ({
		...answering(),
		gatesCleared,
		storage,
	});

	it("hides both new controls in the opening shop", () => {
		const view = toRunView(shopping(1, 512));
		expect(view.shopControls.lockAvailable).toBe(false);
		expect(view.shopControls.extendAvailable).toBe(false);
	});

	it("stages the lock in a gate before the extension", () => {
		expect(
			toRunView(shopping(LOCK_FROM_GATE, 512)).shopControls.lockAvailable
		).toBe(true);
		expect(
			toRunView(shopping(LOCK_FROM_GATE, 512)).shopControls.extendAvailable
		).toBe(false);
		expect(
			toRunView(shopping(EXTEND_FROM_GATE, 512)).shopControls.extendAvailable
		).toBe(true);
	});

	it("keeps showing a control the run cannot afford, unpressable", () => {
		const view = toRunView(shopping(EXTEND_FROM_GATE, 0));
		expect(view.shopControls.lockAvailable).toBe(true);
		expect(view.shopControls.canLock).toBe(false);
		expect(view.shopControls.extendAvailable).toBe(true);
		expect(view.shopControls.canExtend).toBe(false);
	});

	it("takes the lock off the table while one is held", () => {
		const view = toRunView({
			...shopping(EXTEND_FROM_GATE, 512),
			lockedOfferIds: ["eslint"],
		});
		expect(view.shopControls.lockAvailable).toBe(false);
		expect(view.shopControls.lockedOfferIds).toEqual(["eslint"]);
	});

	it("prices the next extension against the ones already bought", () => {
		const view = toRunView({
			...shopping(EXTEND_FROM_GATE, 512),
			extensionsBought: 1,
		});
		expect(view.shopControls.extendCost).toBe(extendCost(1));
	});

	it("stops offering extensions once the run holds them all", () => {
		const view = toRunView({
			...shopping(EXTEND_FROM_GATE, 512),
			extensionsBought: MAX_EXTENSIONS,
		});
		expect(view.shopControls.extendAvailable).toBe(false);
	});
});

describe("the slot deals in the shop (ADR-046)", () => {
	const shopping = (
		slots = BASE_SLOTS,
		storage = 0,
		slotsBought = slots - BASE_SLOTS
	) =>
		toRunView({
			...answering(),
			storage,
			slotsBought,
			build: { ...answering().build, slots },
		});

	it("quotes the opening slot at the ladder's first rung", () => {
		const { buy } = shopping(BASE_SLOTS, 500).slotDeals;
		expect(buy.costKb).toBe(16);
		expect(buy.makes).toBe(5);
		expect(buy.refusal).toBeUndefined();
	});

	it("quotes the next rung up once a slot is bought", () => {
		expect(shopping(BASE_SLOTS + 1, 500).slotDeals.buy.costKb).toBe(32);
		expect(shopping(BASE_SLOTS + 3, 500).slotDeals.buy.costKb).toBe(128);
	});

	it("names the shortfall rather than the price when the balance is short", () => {
		const { buy } = shopping(BASE_SLOTS, 10).slotDeals;
		expect(buy.refusal).toBe("Costs 16 KB, you have 10.");
		expect(buy.makes).toBeUndefined();
	});

	it("says the ladder is spent at the ceiling", () => {
		const { buy } = shopping(MAX_SLOTS, 100_000).slotDeals;
		expect(buy.costKb).toBeUndefined();
		expect(buy.refusal).toBe("Sold out — 24 slots is the ceiling.");
	});

	it("refuses to cash while the run is on the free four", () => {
		const { cash } = shopping(BASE_SLOTS, 500).slotDeals;
		expect(cash.costKb).toBeUndefined();
		expect(cash.refusal).toBe(
			"Nothing to cash — the first four slots are free."
		);
	});

	it("quotes the cash-out at the price of the slot still held", () => {
		const { cash } = shopping(BASE_SLOTS + 2, 500).slotDeals;
		expect(cash.costKb).toBe(32);
		expect(cash.makes).toBe(5);
	});

	it("refuses to cash a slot a config is standing in", () => {
		const packed = answeringWith([CONFIGS.agentsMd]);
		const view = toRunView({ ...packed, slotsBought: 4, storage: 500 });

		expect(view.slots).toBe(8);
		expect(view.slotsFree).toBe(0);
		expect(view.slotDeals.cash.refusal).toBe(
			"Every slot is filled — uninstall or minify first."
		);
	});
});

describe("the storage plan in the shop (ADR-046)", () => {
	const onPlan = (storagePlan: number, storage = 0) =>
		toRunView({ ...answering(), storagePlan, storage });

	it("draws every plan, the free one included", () => {
		const { options } = onPlan(0).storagePlan;
		expect(options.map((plan) => plan.capKb)).toEqual([
			512, 768, 1024, 1536, 2560, 5120, 10240,
		]);
	});

	it("stands on the free cap before anything is bought", () => {
		const { capKb, perGateKb, options } = onPlan(0).storagePlan;
		expect(capKb).toBe(512);
		expect(perGateKb).toBe(0);
		expect(options[0].held).toBe(true);
	});

	it("reads the standing cap and bill off the plan the run is on", () => {
		const { capKb, perGateKb } = onPlan(2).storagePlan;
		expect(capKb).toBe(1024);
		expect(perGateKb).toBe(32);
	});

	it("warns what a downgrade burns, and nothing on the plans that would hold it", () => {
		const { options } = onPlan(4, 900).storagePlan;
		expect(options[0].burnsKb).toBe(900 - 512);
		expect(options[1].burnsKb).toBe(900 - 768);
		expect(options[2].burnsKb).toBe(0);
	});

	it("puts the plan on the recurring bill", () => {
		const line = onPlan(2, 500).gateStake.subscriptions.lines.find(
			(entry) => entry.id === "storage-plan"
		);
		expect(line?.label).toBe("1024KB storage plan");
		expect(line?.kb).toBe(32);
		expect(line?.billedOnMiss).toBe(false);
	});

	it("keeps the free plan off the bill entirely", () => {
		expect(
			onPlan(0, 500).gateStake.subscriptions.lines.map((entry) => entry.id)
		).not.toContain("storage-plan");
	});
});

describe("latestAnswerScore", () => {
	it("is null before any answer this gate", () => {
		expect(latestAnswerScore(toRunView(answering()))).toBeNull();
	});

	it("breaks a correct answer into base, streak, and total", () => {
		const state = runReducer(answering(), {
			type: "answer",
			optionIds: ["q0-a"],
		});
		expect(latestAnswerScore(toRunView(state))).toEqual({
			isCorrect: true,
			baseCoverage: 1,
			streakBonus: 0.1,
			configBonuses: [],
			earnedCoverage: 1.1,
		});
	});

	it("adds a chip for a coverage-affecting config and sums the total", () => {
		const state = runReducer(answeringWith([CONFIGS.agentsMd]), {
			type: "answer",
			optionIds: ["q0-a"],
		});
		expect(latestAnswerScore(toRunView(state))).toEqual({
			isCorrect: true,
			baseCoverage: 1,
			streakBonus: 0.2,
			configBonuses: [{ configId: "agents-md", value: 1 }],
			earnedCoverage: 2.2,
		});
	});

	it("reads a miss as a negative base and no bonuses", () => {
		const state = runReducer(answering(), {
			type: "answer",
			optionIds: ["q0-b"],
		});
		expect(latestAnswerScore(toRunView(state))).toEqual({
			isCorrect: false,
			baseCoverage: -0.5,
			streakBonus: 0,
			configBonuses: [],
			earnedCoverage: -0.5,
		});
	});

	it("omits the difficulty boost for a baseline single-choice poll", () => {
		const state = runReducer(answering(), {
			type: "answer",
			optionIds: ["q0-a"],
		});
		expect(latestAnswerScore(toRunView(state))?.difficulty).toBeUndefined();
	});

	it("surfaces the difficulty boost for a multiple-choice poll", () => {
		const multiPoll: RunPoll = {
			id: "q0",
			category: "react",
			question: "Pick both?",
			answerType: "multiple",
			options: [
				{ id: "q0-a", label: "A", correct: true },
				{ id: "q0-b", label: "B", correct: true },
				{ id: "q0-c", label: "C", correct: false },
			],
		};
		const state = runReducer(
			{
				...createRun([multiPoll, poll("q1")], [CONFIGS.js]),
				status: "answering" as const,
			},
			{ type: "answer", optionIds: ["q0-a", "q0-b"] }
		);
		expect(latestAnswerScore(toRunView(state))?.difficulty).toEqual({
			multiplier: 1.5,
			optionCount: 3,
			isMultiple: true,
		});
	});
});

describe("correctOptionIdsFor", () => {
	it("maps the verdict back to option ids on the poll that was on screen", () => {
		const onScreen = toRunView(answering());
		const answered = toRunView(
			runReducer(answering(), { type: "answer", optionIds: ["q0-b"] })
		);
		expect(correctOptionIdsFor(onScreen.poll!, answered)).toEqual(["q0-a"]);
	});

	it("is empty when nothing has been answered", () => {
		const onScreen = toRunView(answering());
		expect(correctOptionIdsFor(onScreen.poll!, onScreen)).toEqual([]);
	});
});

describe("the view answers what screens used to re-derive (DVTD-z1ij)", () => {
	const configuringWith = (configs: Config[]) => {
		let state = createRun([poll("q0"), poll("q1")], configs);
		for (const config of configs)
			state = runReducer(state, { type: "install", configId: config.id });
		return state;
	};

	it("refuses canStart on a bare build, and the reducer agrees", () => {
		const bare = configuringWith([]);
		expect(toRunView(bare).canStart).toBe(false);
		expect(runReducer(bare, { type: "start" }).status).toBe("configuring");
	});

	it("offers canStart with slots to spare, and the reducer agrees", () => {
		const partial = configuringWith([CONFIGS.js, CONFIGS.ts]);
		expect(toRunView(partial).canStart).toBe(true);
		expect(runReducer(partial, { type: "start" }).status).toBe("answering");
	});

	it("reports isOver for both terminal statuses and no others", () => {
		const base = answering();
		expect(toRunView({ ...base, status: "won" }).isOver).toBe(true);
		expect(toRunView({ ...base, status: "dead" }).isOver).toBe(true);

		const live = ["configuring", "answering", "awaiting-strip", "rewarding"];
		for (const status of live)
			expect(toRunView({ ...base, status } as RunState).isOver).toBe(false);
	});

	it("hands modifiers over as one object rather than four loose fields", () => {
		const view = toRunView(answeringWith([CONFIGS.js]));
		expect(view.gateStake.modifiers).toEqual(
			buildModifiersFor(
				answeringWith([CONFIGS.js]).build.configs,
				answeringWith([CONFIGS.js]).gatesCleared
			)
		);
	});

	it("prices one answer so screens do not call the domain themselves", () => {
		const state = answeringWith([CONFIGS.js]);
		expect(toRunView(state).perAnswer).toEqual(
			perAnswerPreviewFor(state.build.configs, state.gatesCleared)
		);
	});
});

describe("the gate stake travels as one object", () => {
	it("collects what the coming gate demands and pays", () => {
		const state = {
			...answeringWith([CONFIGS.js, CONFIGS.eslint, CONFIGS.agentsMd]),
			gatesCleared: 4,
		};
		const view = toRunView(state);

		expect(view.gateStake).toEqual({
			gateNumber: 4,
			pollsPerGate: SLICE_WINDOW,
			coverageDemand: coverageDemandFor(4),
			coverageHeld: state.window.coverageGained,
			audits: [
				expect.objectContaining({ id: "dependency-outage", suppressed: false }),
			],
			peelSlotsOnFailure: failPeelQuotaFor(state.build.configs, 4),
			peelShareOnFailure: peelShareFor(state.build.configs, 4),
			missIsFatal: false,
			subscriptions: billLedger({
				configs: state.build.configs,
				gate: 4,
				storageKb: state.storage,
			}),
			modifiers: buildModifiersFor(state.build.configs, 4),
			perAnswer: perAnswerPreviewFor(state.build.configs, 4),
		});
	});

	it("foreshadows the first audit while the gate runs clean", () => {
		const view = toRunView(answeringWith([CONFIGS.js]));
		expect(view.gateStake.upcomingAudit).toEqual({
			gateNumber: 3,
			name: "402 Payment Required",
			description: expect.stringContaining("paid action"),
		});
	});

	it("bills every subscribed config into one ledger, and no plan", () => {
		const state = {
			...answeringWith([CONFIGS.js, CONFIGS.freemium]),
			gatesCleared: 2,
		};
		const { subscriptions } = toRunView(state).gateStake;

		expect(subscriptions.lines.map((line) => [line.id, line.kb])).toEqual([
			["freemium", 32],
		]);
		expect(subscriptions.onMissKb).toBe(0);
	});

	it("agrees with the flat fields the other screens still read", () => {
		const view = toRunView({ ...answeringWith([CONFIGS.js]), gatesCleared: 4 });
		expect(view.gateStake.gateNumber).toBe(view.gatesCleared);
	});

	it("reads the window meter, not the career total, as coverageHeld (ADR-035)", () => {
		const state = {
			...answeringWith([CONFIGS.js]),
			coverage: 300,
			window: {
				...answeringWith([CONFIGS.js]).window,
				coverageGained: 7.5,
			},
		};
		expect(toRunView(state).gateStake.coverageHeld).toBe(7.5);
	});

	it("prices the peel deeper at a strip-audit gate", () => {
		const build = [CONFIGS.js, CONFIGS.indexedDb, CONFIGS.eslint];
		const audited = { ...answeringWith(build), gatesCleared: 11 };
		const clean = { ...answeringWith(build), gatesCleared: 10 };
		expect(toRunView(audited).gateStake.peelShareOnFailure).toBeGreaterThan(
			toRunView(clean).gateStake.peelShareOnFailure
		);
	});

	it("marks the miss fatal once the peel would take the whole build", () => {
		const lastConfig = answeringWith([CONFIGS.js]);
		expect(toRunView(lastConfig).gateStake.missIsFatal).toBe(true);
		expect(
			toRunView(answeringWith([CONFIGS.js, CONFIGS.eslint])).gateStake
				.missIsFatal
		).toBe(false);
	});
});

describe("the shop's controls answer to the reducer", () => {
	const shopWith = (state: RunState, storage: number): RunState => ({
		...state,
		status: "rewarding",
		storage,
	});

	it("offers a rebuild exactly when the reducer performs one", () => {
		const rich = shopWith(answering(), 512);
		const broke = shopWith(answering(), 0);

		expect(toRunView(rich).shopControls.canRebuild).toBe(true);
		expect(runReducer(rich, { type: "rebuild-draft" }).rebuildsUsed).toBe(1);

		expect(toRunView(broke).shopControls.canRebuild).toBe(false);
		expect(runReducer(broke, { type: "rebuild-draft" }).rebuildsUsed).toBe(0);
	});

	it("offers the lock exactly when the reducer takes one", () => {
		const onOffer = { ...answering(), draftOptions: [CONFIGS.eslint] };
		const deep = shopWith({ ...onOffer, gatesCleared: LOCK_FROM_GATE }, 512);
		const shallow = shopWith({ ...onOffer, gatesCleared: 0 }, 512);
		const broke = shopWith({ ...onOffer, gatesCleared: LOCK_FROM_GATE }, 0);
		const lock = { type: "lock-offer", configId: CONFIGS.eslint.id } as const;

		expect(
			toRunView(deep).shopControls.lockAvailable &&
				toRunView(deep).shopControls.canLock
		).toBe(true);
		expect(runReducer(deep, lock).lockedOfferIds).toEqual([CONFIGS.eslint.id]);

		expect(toRunView(shallow).shopControls.lockAvailable).toBe(false);
		expect(runReducer(shallow, lock).lockedOfferIds).toEqual([]);

		expect(toRunView(broke).shopControls.canLock).toBe(false);
		expect(runReducer(broke, lock).lockedOfferIds).toEqual([]);
	});

	it("offers the extension exactly when the reducer buys one", () => {
		const deep = shopWith(
			{ ...answering(), gatesCleared: EXTEND_FROM_GATE },
			512
		);
		const maxed = { ...deep, extensionsBought: MAX_EXTENSIONS };
		const broke = shopWith(
			{ ...answering(), gatesCleared: EXTEND_FROM_GATE },
			0
		);
		const extend = { type: "extend-offers" } as const;

		expect(
			toRunView(deep).shopControls.extendAvailable &&
				toRunView(deep).shopControls.canExtend
		).toBe(true);
		expect(runReducer(deep, extend).extensionsBought).toBe(1);

		expect(toRunView(maxed).shopControls.extendAvailable).toBe(false);
		expect(runReducer(maxed, extend).extensionsBought).toBe(MAX_EXTENSIONS);

		expect(toRunView(broke).shopControls.canExtend).toBe(false);
		expect(runReducer(broke, extend).extensionsBought).toBe(0);
	});

	it("flags the width floor exactly where the reducer refuses to shrink", () => {
		const onFloor: RunState = {
			...answeringWith([CONFIGS.js]),
			status: "rewarding",
			gatesCleared: 2,
		};
		const target = onFloor.build.configs[0].id;

		expect(toRunView(onFloor).atMinimumWidth).toBe(true);
		expect(
			runReducer(onFloor, { type: "sell", configId: target }).build.configs
		).toHaveLength(1);
		expect(
			runReducer(onFloor, { type: "drop", configId: target }).build.configs
		).toHaveLength(1);
	});
});

describe("the view prices the shop's offers", () => {
	const roomy = (): RunState => {
		const base = answeringWith([CONFIGS.js]);
		return { ...base, build: { ...base.build, slots: BASE_SLOTS } };
	};

	const shopping = (overrides: Partial<RunState> = {}): RunState => ({
		...roomy(),
		status: "rewarding",
		storage: 512,
		draftOptions: [CONFIGS.eslint],
		...overrides,
	});

	const only = (state: RunState) => toRunView(state).offers[0];

	it("prices each offer and clears it for install when the run can pay", () => {
		const offer = only(shopping());
		expect(offer.config.id).toBe("eslint");
		expect(offer.priceKb).toBe(draftCost(CONFIGS.eslint));
		expect(offer.installable).toBe(true);
		expect(offer.refusal).toBeNull();
	});

	it("refuses an offer the run cannot afford, naming both numbers", () => {
		const offer = only(shopping({ storage: 8 }));
		expect(offer.installable).toBe(false);
		expect(offer.refusal).toEqual({
			reason: "too-expensive",
			priceKb: draftCost(CONFIGS.eslint),
			storageKb: 8,
		});
	});

	it("refuses an offer that will not fit, naming both numbers", () => {
		const full = answeringWith([CONFIGS.js]);
		const offer = only(
			shopping({
				...full,
				status: "rewarding",
				build: { ...full.build, slots: 1 },
				draftOptions: [CONFIGS.indexedDb],
			})
		);
		expect(offer.refusal).toEqual({
			reason: "no-room",
			slots: 2,
			freeSlots: 0,
		});
	});

	it("marks an offer already installed as owned and unbuyable", () => {
		const owned = only(shopping({ draftOptions: [CONFIGS.js] }));
		expect(owned.owned).toBe(true);
		expect(owned.installable).toBe(false);
	});

	it("marks a held offer without changing what it costs", () => {
		const offer = only(shopping({ lockedOfferIds: ["eslint"] }));
		expect(offer.locked).toBe(true);
		expect(offer.priceKb).toBe(draftCost(CONFIGS.eslint));
	});

	it("previews what installing the offer would do to the build's payouts", () => {
		const state = shopping();
		const offer = only(state);
		const withIt = [...state.build.configs, CONFIGS.eslint];
		expect(offer.preview).toEqual(buildModifiersFor(withIt, 0));
		expect(offer.previewPerAnswer).toEqual(
			perAnswerPreviewFor(withIt, state.gatesCleared)
		);
	});
});
