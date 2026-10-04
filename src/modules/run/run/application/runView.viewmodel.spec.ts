import { describe, expect, it } from "vitest";

import {
	createRun,
	type RunState,
	scheduleOf,
} from "~/modules/run/run/domain/run.model";
import { auditsForGate } from "~/modules/run/gate/domain/audit.model";
import {
	audited,
	carrying,
	handed,
} from "~/modules/run/run/domain/run.factory";
import { runReducer } from "~/modules/run/run/domain/runAction.model";
import { RunPoll } from "~/modules/run/run/domain/runPoll.model";
import { perAnswerPreviewFor } from "~/modules/run/build/domain/answerPayout.model";
import { buildModifiersFor } from "~/modules/run/build/domain/build.model";
import { buildSpaceOf } from "~/modules/run/build/domain/buildSpace.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	failPeelQuotaFor,
	peelConfigRangeFor,
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
	MAX_EXTENSIONS,
} from "~/modules/run/shop/domain/draft.model";
import {
	SLICE_WINDOW,
	roundToOneDecimal,
} from "~/modules/run/run/domain/rules.model";
import { toRunView } from "~/modules/run/run/application/runView.viewmodel";
import {
	ACCURACY_GAIN_PER_GATE,
	BASE_UNIT,
	accuracyMultiplierFor,
	floorAt,
	gateOutputOf,
	MULTIPLE_CREDIT,
	healthyAt,
	okAt,
	percentOf,
	runCoverageOf,
} from "~/modules/run/build/domain/coverageRatio.model";

const BASE_GAIN = BASE_UNIT;

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

const answeringWith = (
	configs: Config[],
	polls: RunPoll[] = [poll("q0"), poll("q1")]
) => {
	const created = createRun(polls, configs);
	let state: RunState = {
		...created,
		build: { ...created.build },
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

	it("hands the strip screen what the peel has recovered, zero before one runs", () => {
		expect(toRunView(answering()).peelRefundKb).toBe(0);
		expect(toRunView({ ...answering(), peelRefundKb: 128 }).peelRefundKb).toBe(
			128
		);
	});

	it("reveals the dealt polls' categories only to a build holding Prefetch", () => {
		expect(toRunView(answering()).upcomingCategories).toBeNull();
		expect(toRunView(answering()).nextGateCategories).toBeNull();
		expect(
			toRunView(answeringWith([CONFIGS.prefetch])).upcomingCategories
		).toEqual(["react", "react"]);
	});

	it("counts the remaining polls' options in play order, only for a v2 Prefetch", () => {
		const wide = (id: string): RunPoll => ({
			...poll(id),
			options: [
				...poll(id).options,
				{ id: `${id}-c`, label: "Maybe", correct: false },
			],
		});

		expect(toRunView(answering()).optionCountsThisGate).toBeNull();
		expect(
			toRunView(
				answeringWith(
					[{ ...CONFIGS.prefetch, level: 2 }],
					[poll("q0"), wide("q1")]
				)
			).optionCountsThisGate
		).toEqual([2, 3]);
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
			toRunView(answeringWith([CONFIGS.js, CONFIGS.linter])).atMinimumWidth
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
		expect(toRunView(answering()).gateTheme).toBe("gate-pallet");
		expect(toRunView({ ...answering(), gatesCleared: 11 }).gateTheme).toBe(
			"gate-indigo-elite"
		);
		expect(toRunView({ ...answering(), gatesCleared: 12 }).gateTheme).toBe(
			"gate-champion"
		);
	});

	it("hides the poll's category at the 404 gate and nowhere else", () => {
		const hidden = audited(answering(), 5, "not-found");
		const shown = audited(answering(), 4, "dependency-outage");
		expect(toRunView(hidden).categoryHidden).toBe(true);
		expect(toRunView(shown).categoryHidden).toBe(false);
	});

	it("presents every poll as a select-all at the 207 gate, whatever it really takes", () => {
		const hidden = audited(answering(), 5, "multi-status");
		expect(toRunView(hidden).poll?.answerType).toBe("multiple");
		expect(toRunView(answering()).poll?.answerType).toBe("single");
	});

	it("prices a multiple-choice poll as a single at the 207 gate", () => {
		const multi: RunPoll = {
			id: "m",
			category: "react",
			question: "Pick every hook",
			answerType: "multiple",
			options: [
				{ id: "m-a", label: "useState", correct: true },
				{ id: "m-b", label: "useEffect", correct: true },
				{ id: "m-c", label: "useBanjo", correct: false },
			],
		};
		const base = {
			...createRun([multi, poll("q1")], [CONFIGS.js]),
			status: "answering" as const,
		};

		expect(toRunView(base).gateStake.perAnswer.coveragePerCorrect).toBe(
			BASE_GAIN * MULTIPLE_CREDIT
		);
		expect(
			toRunView(audited(base, 5, "multi-status")).gateStake.perAnswer
				.coveragePerCorrect
		).toBe(BASE_GAIN);
	});

	it("drops the gate theme once the last gate is beaten", () => {
		expect(
			toRunView({ ...answering(), gatesCleared: 13 }).gateTheme
		).toBeUndefined();
	});
});

describe("gateComplete", () => {
	const answerOne = (state: RunState): RunState => {
		const current = state.polls[state.currentIndex];

		return runReducer(state, {
			type: "answer",
			optionIds: [current.options[0].id],
		});
	};

	const opening = (): RunState =>
		answeringWith(
			[CONFIGS.js],
			Array.from({ length: 12 }, (_, index) => poll(`q${index}`))
		);

	it("stays false while the gate still has polls to ask", () => {
		let state = opening();
		for (let index = 0; index < SLICE_WINDOW - 1; index++)
			state = answerOne(state);

		expect(toRunView(state).gateComplete).toBe(false);
	});

	it("turns true on the answer that fills the window", () => {
		let state = opening();
		for (let index = 0; index < SLICE_WINDOW; index++) state = answerOne(state);

		expect(toRunView(state).gateComplete).toBe(true);
		expect(toRunView(state).gateStake.gateNumber).toBe(0);
	});

	it("falls back to false once the gate has closed", () => {
		let state = opening();
		for (let index = 0; index < SLICE_WINDOW; index++) state = answerOne(state);
		const closed = runReducer(state, { type: "close-gate" });

		expect(toRunView(closed).gateComplete).toBe(false);
		expect(toRunView(closed).gateStake.gateNumber).toBe(1);
	});
});

describe("shop controls (DVTD-5lt6)", () => {
	const shopping = (gatesCleared: number, storage: number) =>
		carrying({ ...answering(), gatesCleared, storage }, "extend", "pin");

	const withLocker = (state: RunState): RunState => ({
		...state,
		build: {
			...state.build,
			configs: [...state.build.configs, CONFIGS.yarnLock],
		},
	});

	it("hides both new controls in the opening shop", () => {
		const view = toRunView(shopping(1, 512));
		expect(view.shopControls.lockAvailable).toBe(false);
		expect(view.shopControls.extendAvailable).toBe(false);
	});

	it("offers the lock only while .lock is in the build", () => {
		expect(toRunView(shopping(1, 512)).shopControls.lockAvailable).toBe(false);
		expect(
			toRunView(withLocker(shopping(1, 512))).shopControls.lockAvailable
		).toBe(true);
	});

	it("stages the extension by gate", () => {
		expect(
			toRunView(shopping(EXTEND_FROM_GATE - 1, 512)).shopControls
				.extendAvailable
		).toBe(false);
		expect(
			toRunView(shopping(EXTEND_FROM_GATE, 512)).shopControls.extendAvailable
		).toBe(true);
	});

	it("keeps showing a control the run cannot afford, unpressable", () => {
		const view = toRunView(withLocker(shopping(EXTEND_FROM_GATE, 0)));
		expect(view.shopControls.lockAvailable).toBe(true);
		expect(view.shopControls.canLock).toBe(false);
		expect(view.shopControls.extendAvailable).toBe(true);
		expect(view.shopControls.canExtend).toBe(false);
	});

	it("keeps selling locks while offers are already held", () => {
		const view = toRunView({
			...withLocker(shopping(EXTEND_FROM_GATE, 512)),
			lockedOfferIds: ["linter"],
		});
		expect(view.shopControls.lockAvailable).toBe(true);
		expect(view.shopControls.lockedOfferIds).toEqual(["linter"]);
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

describe("the build space the shop reports (ADR-098)", () => {
	const holdingWeight = (weight: number) => {
		const base = answering();
		const filler = Array.from({ length: weight }, () => CONFIGS.strict);
		return toRunView({ ...base, build: { ...base.build, configs: filler } });
	};

	it("reports the rung the build sits in, not a rung anyone picked", () => {
		expect(holdingWeight(4).buildSpace.space).toBe(4);
		expect(holdingWeight(5).buildSpace.space).toBe(6);
		expect(holdingWeight(7).buildSpace.space).toBe(8);
	});

	it("reads the bill off that rung, so a weight short of one still pays it", () => {
		expect(holdingWeight(4).buildSpace.perGateKb).toBe(0);
		expect(holdingWeight(5).buildSpace.perGateKb).toBe(16);
		expect(holdingWeight(7).buildSpace.perGateKb).toBe(32);
	});

	it("carries no covered-space cap while the bill is being paid", () => {
		expect(holdingWeight(5).buildSpace.coveredSpace).toBeNull();
	});

	it("puts the space it holds on the recurring bill", () => {
		const line = holdingWeight(7).gateStake.subscriptions.lines.find(
			(entry) => entry.id === "build-space"
		);

		expect(line?.label).toBe("weight build space");
		expect(line?.weight).toBe(8);
		expect(line?.kb).toBe(32);
		expect(line?.billedOnMiss).toBe(false);
	});

	it("keeps the free rung off the bill entirely", () => {
		expect(
			holdingWeight(4).gateStake.subscriptions.lines.map((entry) => entry.id)
		).not.toContain("build-space");
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
		expect(toRunView(state).gateStake.perAnswer).toEqual(
			perAnswerPreviewFor(state.build.configs, {
				answeredBefore: state.window.answered,
			})
		);
	});
});

describe("the gate stake travels as one object", () => {
	it("collects what the coming gate demands and pays", () => {
		const state = {
			...answeringWith([CONFIGS.js, CONFIGS.linter, CONFIGS.agentsMd]),
			gatesCleared: 4,
		};
		const view = toRunView(state);

		expect(view.gateStake).toEqual({
			gateNumber: 4,
			pollsPerGate: SLICE_WINDOW,
			coverageLadder: {
				floor: roundToOneDecimal(percentOf(floorAt(4))),
				ok: roundToOneDecimal(percentOf(okAt(4))),
				healthy: roundToOneDecimal(percentOf(healthyAt(4))),
			},
			coverageHeld: state.window.unitsEarned,
			coverageAtOpen: roundToOneDecimal(
				percentOf(runCoverageOf(state.headStartUnits, 4))
			),
			audits: auditsForGate(4, scheduleOf(state)).map((audit) =>
				expect.objectContaining({ id: audit.id, suppressed: false })
			),
			peelSlotsOnFailure: failPeelQuotaFor(
				state.build.configs,
				4,
				scheduleOf(state)
			),
			peelConfigsOnFailure: peelConfigRangeFor(
				state.build.configs,
				failPeelQuotaFor(state.build.configs, 4, scheduleOf(state))
			),
			peelShareOnFailure: peelShareFor(
				state.build.configs,
				4,
				scheduleOf(state)
			),
			missIsFatal: false,
			missIsFree: false,
			subscriptions: billLedger({
				configs: state.build.configs,
				gate: 4,
				storageKb: state.storage,
				spaceWeight: buildSpaceOf(state).space,
				spaceBillKb: buildSpaceOf(state).upkeepKb,
			}),
			modifiers: buildModifiersFor(state.build.configs, 4),
			perAnswer: perAnswerPreviewFor(state.build.configs, {
				answeredBefore: state.window.answered,
			}),
			accuracy: {
				polls: [],
				pending: SLICE_WINDOW,
				available: null,
				guaranteed: 1,
				best: 1 + ACCURACY_GAIN_PER_GATE,
				carried: 0,
			},
		});
	});

	it("bills every subscribed config and the build space into one ledger", () => {
		const state = {
			...answeringWith([CONFIGS.js, CONFIGS.freemium]),
			gatesCleared: 2,
		};
		const { subscriptions } = toRunView(state).gateStake;

		expect(subscriptions.lines.map((line) => line.id)).toEqual([
			"freemium",
			"build-space",
		]);
		expect(subscriptions.onMissKb).toBe(0);
	});

	it("agrees with the flat fields the other screens still read", () => {
		const view = toRunView({ ...answeringWith([CONFIGS.js]), gatesCleared: 4 });
		expect(view.gateStake.gateNumber).toBe(view.gatesCleared);
	});

	it("reads the run's own units, never the career total, as coverageHeld", () => {
		const state = {
			...answeringWith([CONFIGS.js]),
			gatesCleared: 2,
			coverage: 300,
			window: {
				...answeringWith([CONFIGS.js]).window,
				unitsEarned: 2,
			},
		};
		expect(toRunView(state).gateStake.coverageHeld).toBe(33.3);
	});

	it("prices the peel deeper at a strip-audit gate", () => {
		const build = [CONFIGS.js, CONFIGS.indexedDb, CONFIGS.linter];
		const audited = { ...answeringWith(build), gatesCleared: 11 };
		const clean = { ...answeringWith(build), gatesCleared: 10 };
		expect(toRunView(audited).gateStake.peelShareOnFailure).toBeGreaterThan(
			toRunView(clean).gateStake.peelShareOnFailure
		);
	});

	it("marks the miss fatal once the peel would take the whole build", () => {
		const lastConfig = { ...answeringWith([CONFIGS.js]), gatesCleared: 1 };
		expect(toRunView(lastConfig).gateStake.missIsFatal).toBe(true);
		expect(
			toRunView({
				...answeringWith([CONFIGS.js, CONFIGS.linter]),
				gatesCleared: 1,
			}).gateStake.missIsFatal
		).toBe(false);
	});

	it("prices the Pallet gate's miss as free, and never fatal (ADR-057)", () => {
		const stake = toRunView(answeringWith([CONFIGS.js])).gateStake;

		expect(stake.peelSlotsOnFailure).toBe(0);
		expect(stake.missIsFree).toBe(true);
		expect(stake.missIsFatal).toBe(false);
	});

	it("never calls a bare build's miss free — it is still the end of the run", () => {
		const bare = answeringWith([CONFIGS.js]);
		const stake = toRunView({
			...bare,
			build: { ...bare.build, configs: [] },
		}).gateStake;

		expect(stake.missIsFree).toBe(false);
		expect(stake.missIsFatal).toBe(true);
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
		const onOffer = { ...answering(), draftOptions: [CONFIGS.linter] };
		const holdsLocker = (state: RunState): RunState => ({
			...state,
			build: {
				...state.build,
				configs: [...state.build.configs, CONFIGS.yarnLock],
			},
		});
		const armed = shopWith(holdsLocker(onOffer), 512);
		const bare = shopWith(onOffer, 512);
		const broke = shopWith(holdsLocker(onOffer), 0);
		const lock = { type: "lock-offer", configId: CONFIGS.linter.id } as const;

		expect(
			toRunView(armed).shopControls.lockAvailable &&
				toRunView(armed).shopControls.canLock
		).toBe(true);
		expect(runReducer(armed, lock).lockedOfferIds).toEqual([CONFIGS.linter.id]);

		expect(toRunView(bare).shopControls.lockAvailable).toBe(false);
		expect(runReducer(bare, lock).lockedOfferIds).toEqual([]);

		expect(toRunView(broke).shopControls.canLock).toBe(false);
		expect(runReducer(broke, lock).lockedOfferIds).toEqual([]);
	});

	it("offers the extension exactly when the reducer buys one", () => {
		const deep = carrying(
			shopWith({ ...answering(), gatesCleared: EXTEND_FROM_GATE }, 512),
			"extend"
		);
		const maxed = { ...deep, extensionsBought: MAX_EXTENSIONS };
		const broke = carrying(
			shopWith({ ...answering(), gatesCleared: EXTEND_FROM_GATE }, 0),
			"extend"
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
		return { ...base, build: { ...base.build } };
	};

	const shopping = (overrides: Partial<RunState> = {}): RunState => ({
		...roomy(),
		status: "rewarding",
		storage: 512,
		draftOptions: [CONFIGS.linter],
		...overrides,
	});

	const only = (state: RunState) => toRunView(state).offers[0];

	it("prices each offer and clears it for install when the run can pay", () => {
		const offer = only(shopping());
		expect(offer.config.id).toBe("linter");
		expect(offer.priceKb).toBe(draftCost(CONFIGS.linter));
		expect(offer.installable).toBe(true);
		expect(offer.refusal).toBeNull();
	});

	it("refuses an offer the run cannot afford, naming both numbers", () => {
		const offer = only(shopping({ storage: 8 }));
		expect(offer.installable).toBe(false);
		expect(offer.refusal).toEqual({
			reason: "too-expensive",
			priceKb: draftCost(CONFIGS.linter),
			storageKb: 8,
		});
	});

	it("no longer refuses for room below the top rung — it rents the rung above", () => {
		const full = answeringWith([CONFIGS.js]);
		const offer = only(
			shopping({
				...full,
				status: "rewarding",
				storage: 512,
				draftOptions: [CONFIGS.indexedDb],
			})
		);

		expect(offer.refusal).toBeNull();
		expect(offer.installable).toBe(true);
	});

	it("refuses for room at the top of the ladder, naming both numbers", () => {
		const full = answeringWith([CONFIGS.js]);
		const brimming = Array.from({ length: 4 }, () => CONFIGS.wtfpl);
		const offer = only(
			shopping({
				...full,
				status: "rewarding",
				storage: 512,
				build: { ...full.build, configs: brimming },
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
		const offer = only(shopping({ lockedOfferIds: ["linter"] }));
		expect(offer.locked).toBe(true);
		expect(offer.priceKb).toBe(draftCost(CONFIGS.linter));
	});

	it("previews what installing the offer would do to the build's payouts", () => {
		const state = shopping();
		const offer = only(state);
		const withIt = [...state.build.configs, CONFIGS.linter];
		expect(offer.preview).toEqual(buildModifiersFor(withIt, 0));
		expect(offer.previewPerAnswer).toEqual(
			perAnswerPreviewFor(withIt, { answeredBefore: state.window.answered })
		);
	});
});

describe("the opening build", () => {
	it("opens empty and unstartable, so the first pick is the player's", () => {
		const view = toRunView(createRun([poll("q0")], handed));

		expect(view.available).toEqual(handed);
		expect(view.configs).toEqual([]);
		expect(view.canStart).toBe(false);
	});
});

describe("the bill the shop reports with YAGNI held", () => {
	const holding = (...configs: Config[]) => {
		const base = answering();
		return toRunView({ ...base, build: { ...base.build, configs } });
	};

	const weightOf = (count: number) =>
		Array.from({ length: count }, () => CONFIGS.strict);

	it("reads the bill less the room the build is not using", () => {
		expect(holding(...weightOf(5)).buildSpace.perGateKb).toBe(16);
		expect(holding(CONFIGS.yagni, ...weightOf(4)).buildSpace.perGateKb).toBe(8);
	});

	it("carries the discounted figure onto the recurring bill", () => {
		const line = holding(
			CONFIGS.yagni,
			...weightOf(6)
		).gateStake.subscriptions.lines.find((entry) => entry.id === "build-space");

		expect(line?.label).toBe("weight build space");
		expect(line?.weight).toBe(8);
		expect(line?.kb).toBe(24);
	});
});

describe("Prefetch by version", () => {
	it("names the polls at v1 and seals their shape until v2", () => {
		const v1 = toRunView(answeringWith([CONFIGS.prefetch]));
		expect(v1.upcomingCategories).not.toBeNull();
		expect(v1.nextGateCategories).not.toBeNull();
		expect(v1.answerTypesThisGate).toBeNull();
		expect(v1.optionCountsThisGate).toBeNull();

		const v2 = toRunView(answeringWith([{ ...CONFIGS.prefetch, level: 2 }]));
		expect(v2.answerTypesThisGate).not.toBeNull();
		expect(v2.optionCountsThisGate).not.toBeNull();
	});

	it("states one answer type per poll at v2, in the order they are dealt", () => {
		const v2 = toRunView(answeringWith([{ ...CONFIGS.prefetch, level: 2 }]));

		expect(v2.answerTypesThisGate).toHaveLength(
			v2.optionCountsThisGate?.length ?? -1
		);
		expect(v2.answerTypesThisGate).toEqual(
			v2.answerTypesThisGate?.filter(
				(type) => type === "single" || type === "multiple"
			)
		);
	});

	it("seals a v2 Prefetch's shape under 510 Not Extended, which reads every config at v1", () => {
		const flattened = audited(
			answeringWith([{ ...CONFIGS.prefetch, level: 2 }]),
			3,
			"not-extended"
		);
		expect(toRunView(flattened).optionCountsThisGate).toBeNull();
		expect(toRunView(flattened).upcomingCategories).not.toBeNull();
	});
});

describe("npm audit", () => {
	it("names outage targets only to a build holding npm audit", () => {
		const bare = audited(
			answeringWith([CONFIGS.js, CONFIGS.cache]),
			4,
			"dependency-outage"
		);
		expect(toRunView(bare).outageTargets).toBeNull();

		const auditing = audited(
			answeringWith([CONFIGS.js, CONFIGS.cache, CONFIGS.npmAudit]),
			4,
			"dependency-outage"
		);
		const [target] = toRunView(auditing).outageTargets ?? [];
		expect(target.auditId).toBe("dependency-outage");
		expect(target.targets).toHaveLength(SLICE_WINDOW);
		expect(new Set(target.targets.map((names) => names.join())).size).toBe(1);
	});

	it("names the whole build on the first poll under 425 Too Early", () => {
		const early = audited(
			answeringWith([CONFIGS.js, CONFIGS.npmAudit]),
			4,
			"too-early"
		);
		const [target] = toRunView(early).outageTargets ?? [];
		expect(target.targets[0]).toEqual([".js", "npm audit"]);
		expect(target.targets.slice(1).every((names) => names.length === 0)).toBe(
			true
		);
	});
});

describe("the window's accuracy", () => {
	const multi = (id: string): RunPoll => ({
		id,
		category: "ts",
		question: `${id}?`,
		answerType: "multiple",
		options: [
			{ id: `${id}-a`, label: "Partial", correct: true },
			{ id: `${id}-b`, label: "Pick", correct: true },
			{ id: `${id}-c`, label: "Banjo", correct: false },
		],
	});
	const MIXED: RunPoll[] = [
		poll("q0"),
		multi("m1"),
		poll("q2"),
		multi("m3"),
		poll("q4"),
		poll("q5"),
	];
	const REBASE_V2 = { ...CONFIGS.gitRebase, level: 2 };
	const RIGHT_ANSWERS: readonly string[][] = [
		["q0-a"],
		["m1-a", "m1-b"],
		["q2-a"],
		["m3-a"],
		["q4-b"],
	];

	const answeredThrough = (state: RunState, count: number): RunState =>
		RIGHT_ANSWERS.slice(0, count).reduce(
			(next, optionIds) => runReducer(next, { type: "answer", optionIds }),
			state
		);

	it("withholds what the window offers while its mix is unseen, reading ×1 sure and one plus the gain at best", () => {
		const { accuracy } = toRunView(
			answeringWith([CONFIGS.js], MIXED)
		).gateStake;

		expect(accuracy).toEqual({
			polls: [],
			pending: SLICE_WINDOW,
			available: null,
			guaranteed: 1,
			best: 1 + ACCURACY_GAIN_PER_GATE,
			carried: 0,
		});
	});

	it("draws each answered poll by its credit and what it earned", () => {
		const state = answeredThrough(answeringWith([CONFIGS.js], MIXED), 2);

		expect(toRunView(state).gateStake.accuracy.polls).toEqual([
			{ credit: 1, earned: 1 },
			{ credit: 2, earned: 2 },
		]);
		expect(toRunView(state).gateStake.accuracy.pending).toBe(3);
	});

	it("states what the window offers once git rebase -i v2 names the mix", () => {
		const { accuracy } = toRunView(
			answeringWith([CONFIGS.js, REBASE_V2], MIXED)
		).gateStake;

		expect(accuracy.available).toBe(7);
		expect(accuracy.guaranteed).toBe(1);
		expect(accuracy.best).toBe(1 + ACCURACY_GAIN_PER_GATE);
	});

	it("meets the sure and the best multiplier once every poll is answered", () => {
		const state = answeredThrough(answeringWith([CONFIGS.js], MIXED), 5);
		const { accuracy } = toRunView(state).gateStake;

		expect(accuracy.available).toBe(7);
		const closing = accuracyMultiplierFor(0, { earned: 5, available: 7 });

		expect(accuracy.guaranteed).toBeCloseTo(closing);
		expect(accuracy.best).toBeCloseTo(closing);
	});

	it("reads the live coverage as the floor the window guarantees, every unseen poll a missed multiple", () => {
		const state = answeredThrough(answeringWith([CONFIGS.js], MIXED), 1);
		const floor = gateOutputOf(state.window.unitsEarned, state.accuracyBonus, {
			earned: state.window.accuracyEarned,
			available: state.window.accuracyAvailable + 4 * MULTIPLE_CREDIT,
		});

		expect(toRunView(state).gateStake.coverageHeld).toBe(
			roundToOneDecimal(percentOf(runCoverageOf(floor, state.gatesCleared)))
		);
	});
});
